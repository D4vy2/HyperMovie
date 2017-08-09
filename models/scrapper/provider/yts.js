const request = require('request')
const asyncq = require('async-q')
const {maxWebRequest, webRequestTimeout} = require('../../../config/constants')
const MovieClass = require('../../movies')


class YTS {
    /**
     *
     * @param name ===> Provider
     */
    constructor(name) {

        this.name = name

        this.request = request.defaults({
            "headers": {
                "Content-Type": "application/json"
            },
            "baseUrl": "https://yts.ag/api/v2/list_movies.json",
            "timeout": webRequestTimeout * 1000
        })
    }

    /**
     *
     * @param retry
     * @returns {Promise} ===> total pages
     */
    getTotalPages(retry = true) {
        const url = "list_movies.json";
        return new Promise((resolve, reject) => {
            this.request(url, (err, res, body) => {
                if (err && retry) {
                    return resolve(this.getTotalPages(false))
                } else if (err) {
                    return reject(`YTS: ${err} with link: 'list_movies.json'`)
                } else if (!body || res.statusCode >= 400) {
                    return reject(`YTS: Could not find data on '${url}'.`)
                } else {
                    body = JSON.parse(body)
                    const totalPages = Math.ceil(body.data.movie_count / 50)
                    return resolve(totalPages)
                }
            })
        })
    }

    /**
     *
     * @param page
     * @param retry
     * @returns {Promise}
     */
    getOnePage(page, retry = true) {
        const url = `?limit=50&page=${page + 1}`
        return new Promise((resolve, reject) => {
            this.request(url, (err, res, body) => {
                if (err && retry) {
                    return resolve(this.getOnePage(page, false))
                } else if (err) {
                    return reject(`YTS: ${err} with link: '?limit=50&page=${page + 1}'`)
                } else if (!body || res.statusCode >= 400) {
                    return reject(`YTS: Could not find data on '${url}'.`)
                } else {
                    body = JSON.parse(body)
                    return resolve(this.formatPage(body.data.movies))
                }
            })
        })
    }

    /**
     * @param data ===========> See on bottom in com an element example
     * @returns {*}
     */
    formatPage(data) {
        return asyncq.each(data, movie => {
            if (movie && movie.torrents && movie.imdb_code) {
                const torrents = {}
                torrents["en"] = {}
                movie.torrents.map(torrent => {
                    if (torrent.quality !== "3D") {
                        torrents["en"][torrent.quality] = {
                            url: `magnet:?xt=urn:btih:${torrent.hash}&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://tracker.leechers-paradise.org:6969&tr=udp://p4p.arenabg.ch:1337&tr=udp://tracker.internetwarriors.net:1337`,
                            seed: torrent.seeds,
                            peer: torrent.peers,
                            size: torrent.size_bytes,
                            filesize: torrent.size,
                            provider: "YTS"
                        }
                    }
                })

                return {
                    _id: movie.imdb_code,
                    imdb_id: movie.imdb_code,
                    namesearch: movie.title.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '').toLowerCase(),
                    title:movie.title,
                    year:movie.year,
                    synopsis:movie.description_full,
                    rating:movie.rating,
                    picture: {
                        banner: movie.medium_cover_image,
                        back: movie.background_image_original,
                        poster: movie.small_cover_image
                    },
                    country:movie.language,
                    genres:movie.genres,
                    trailer:`https://youtube.com/embed/${movie.yt_trailer_code}`,
                    torrents
                }
            }

        })
    }

    /**
     *
     * @returns {Promise.<*>}
     */
    async getMovies() {
        // try {
            const totalPages = await this.getTotalPages()
            if (!totalPages)
                return console.log(`${this.name}: totalPages returned; '${totalPages}'`)
            let movies = []
            return await asyncq.timesSeries(totalPages, async page => {
                try {
                    // const onePage = await this.getOnePage(page)
                    // movies = movies.concat(onePage)
                    movies = movies.concat(await this.getOnePage(page))
                } catch (err) {
                    return console.log(err)
                }
            }).then(() => movies)
                .catch(() => console.log(`wwwwwwwwwwwwwwww`))
        // } catch (err) { return (err) }
    }

    /**
     *
     * @returns {Promise.<*>}
     */
    async parse() {
        // try {
            console.log(`${this.name}: Starting scraping...`)
            return await this.getMovies()
        // } catch (e) { return (e) }
    }


}

module.exports = YTS

/** Exemple of Elem Movie from YTS**/
// { id: 6306,
//     url: 'https://yts.ag/movie/billy-lynns-long-halftime-walk-2016',
//     imdb_code: 'tt2513074',
//     title: 'Billy Lynn\'s Long Halftime Walk',
//     title_english: 'Billy Lynn\'s Long Halftime Walk',
//     title_long: 'Billy Lynn\'s Long Halftime Walk (2016)',
//     slug: 'billy-lynns-long-halftime-walk-2016',
//     year: 2016,
//     rating: 6.3,
//     runtime: 113,
//     genres: [ 'Drama', 'War' ],
//     summary: 'Two-time Academy Award® winner Ang Lee brings his extraordinary vision to Billy Lynn\'s Long Halftime Walk, based on the widely-acclaimed, bestselling novel. The film is told from the point of view of 19-year-old private Billy Lynn (newcomer Joe Alwyn) who, along with his fellow soldiers in Bravo Squad, becomes a hero after a harrowing Iraq battle and is brought home temporarily for a victory tour. Through flashbacks, culminating at the spectacular halftime show of the Thanksgiving Day football game, the film reveals what really happened to the squad - contrasting the realities of the war with America\'s perceptions. The film also stars Kristen Stewart, Chris Tucker, Garrett Hedlund, with Vin Diesel, and Steve Martin. Lee used new technology, shooting at an ultra-high frame rate for the first time in film history, to create an immersive digital experience helping him dramatize war in a way never seen before. Lee directed and produced the film, from a screenplay by Jean-Christophe ...',
//     description_full: 'Two-time Academy Award® winner Ang Lee brings his extraordinary vision to Billy Lynn\'s Long Halftime Walk, based on the widely-acclaimed, bestselling novel. The film is told from the point of view of 19-year-old private Billy Lynn (newcomer Joe Alwyn) who, along with his fellow soldiers in Bravo Squad, becomes a hero after a harrowing Iraq battle and is brought home temporarily for a victory tour. Through flashbacks, culminating at the spectacular halftime show of the Thanksgiving Day football game, the film reveals what really happened to the squad - contrasting the realities of the war with America\'s perceptions. The film also stars Kristen Stewart, Chris Tucker, Garrett Hedlund, with Vin Diesel, and Steve Martin. Lee used new technology, shooting at an ultra-high frame rate for the first time in film history, to create an immersive digital experience helping him dramatize war in a way never seen before. Lee directed and produced the film, from a screenplay by Jean-Christophe ...',
//     synopsis: 'Two-time Academy Award® winner Ang Lee brings his extraordinary vision to Billy Lynn\'s Long Halftime Walk, based on the widely-acclaimed, bestselling novel. The film is told from the point of view of 19-year-old private Billy Lynn (newcomer Joe Alwyn) who, along with his fellow soldiers in Bravo Squad, becomes a hero after a harrowing Iraq battle and is brought home temporarily for a victory tour. Through flashbacks, culminating at the spectacular halftime show of the Thanksgiving Day football game, the film reveals what really happened to the squad - contrasting the realities of the war with America\'s perceptions. The film also stars Kristen Stewart, Chris Tucker, Garrett Hedlund, with Vin Diesel, and Steve Martin. Lee used new technology, shooting at an ultra-high frame rate for the first time in film history, to create an immersive digital experience helping him dramatize war in a way never seen before. Lee directed and produced the film, from a screenplay by Jean-Christophe ...',
//     yt_trailer_code: 'mUULFJ_I048',
//     language: 'English',
//     mpa_rating: 'R',
//     background_image: 'https://yts.ag/assets/images/movies/billy_lynns_long_halftime_walk_2016/background.jpg',
//     background_image_original: 'https://yts.ag/assets/images/movies/billy_lynns_long_halftime_walk_2016/background.jpg',
//     small_cover_image: 'https://yts.ag/assets/images/movies/billy_lynns_long_halftime_walk_2016/small-cover.jpg',
//     medium_cover_image: 'https://yts.ag/assets/images/movies/billy_lynns_long_halftime_walk_2016/medium-cover.jpg',
//     large_cover_image: 'https://yts.ag/assets/images/movies/billy_lynns_long_halftime_walk_2016/large-cover.jpg',
//     state: 'ok',
//     torrents:
//     [ { url: 'https://yts.ag/torrent/download/1BB153AB43041B8A85D6CFF9F0F6AEDFDAEEC4B6',
//         hash: '1BB153AB43041B8A85D6CFF9F0F6AEDFDAEEC4B6',
//         quality: '3D',
//         seeds: 24,
//         peers: 7,
//         size: '1.72 GB',
//         size_bytes: 1846835937,
//         date_uploaded: '2017-02-28 20:49:28',
//         date_uploaded_unix: 1488332968 },
//         { url: 'https://yts.ag/torrent/download/EB8724DD41839DA4D3E7A9D3191FD6443F34C6B1',
//             hash: 'EB8724DD41839DA4D3E7A9D3191FD6443F34C6B1',
//             quality: '720p',
//             seeds: 226,
//             peers: 19,
//             size: '829.3 MB',
//             size_bytes: 869584077,
//             date_uploaded: '2017-01-28 23:29:35',
//             date_uploaded_unix: 1485664175 },
//         { url: 'https://yts.ag/torrent/download/51D634C2CF4AA5E1A232A511596C43B477425B07',
//             hash: '51D634C2CF4AA5E1A232A511596C43B477425B07',
//             quality: '1080p',
//             seeds: 197,
//             peers: 18,
//             size: '1.72 GB',
//             size_bytes: 1846835937,
//             date_uploaded: '2017-01-29 03:23:23',
//             date_uploaded_unix: 1485678203 } ],
//         date_uploaded: '2017-01-28 23:29:35',
//     date_uploaded_unix: 1485664175 }