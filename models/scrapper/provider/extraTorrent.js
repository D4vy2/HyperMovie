const {Website} = require('extratorrent-api')
const asyncq = require('async-q')
const {maxWebRequest} = require('../../../config/constants')
const MovieClass = require('../../movies')
const OmdbApi = require('../tools/omdb')


class ExtraTorrent {

    constructor(name) {
        this.name = name
    }

    async formatData(torrent) {
        const regex = /(.*).(\d{4})\D+(\d{3,4}p)/i
        const movie = {}
        try {
            let movieTitle = torrent.title.match(regex)[1].trim().toLowerCase()
            const quality = torrent.title.match(regex)[3] !== null ?  torrent.title.match(regex)[3] : undefined
            const year = torrent.title.match(regex)[2]
            const language = torrent.language
            const size = torrent.size ? torrent.size : torrent.fileSize
            const dataMovie = new OmdbApi(movieTitle, year)
            const news = await dataMovie.getMovieData()
            movie.picture = {}
            movie.torrents = {}
            movie.quality = quality
            movie.year = year
            movie.language = language
            movie.torrents['en'] = {}
            movie.torrents['en'][quality] = {
                url: torrent.magnet ? torrent.magnet : torrent.torrent_link,
                seed: torrent.seeds ? torrent.seeds : 0,
                peer: torrent.peers ? torrent.peers : 0,
                size: size,
                provider: this.name
            }
            movie.title = news.Title
            movie._id = news.imdbID
            movie.imdb_id = news.imdbID
            movie.synopsis = news.Plot
            movie.rating = news.imdbRating !== "N/A" ? news.imdbRating : 0
            movie.trailer = null//news.trailer !== undefined ? news.trailer.replace(`watch?v=`, `embed/`) : undefined
            movie.genres = news.Genre
            movie.picture.banner = news.Poster
            movie.namesearch = news.Title.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '').toLowerCase()
            return movie
        } catch (e) {
            return e
        }
    }


    async getMovieData(torrents) {
        try {
            const movies = []
            await asyncq.eachSeries(torrents, async torrent => {
                if (torrent) {
                    const movie = await this.formatData(torrent)
                    if (movie) {
                        movies.push(movie)
                    }
                }
            })
            return movies
        } catch (e) {
            return e
        }
    }

    async getAllTorrents(TotalPages, provider, content) {
        try {
            let torrents = []
            await asyncq.timesSeries(TotalPages, async page => {
                console.log(`${this.name}: Starting searching ${this.name} on page ${page + 1} out of ${TotalPages}`)
                if (provider.query.page)
                    provider.query.page = page + 1
                // const extraSearch = await content.search(provider.query)
                torrents = torrents.concat(await content.search(provider.query))
                // torrents = torrents.concat(extraSearch.results)
            })
            return torrents
        } catch (e) {
            return e
        }
    }

    async getMovies(provider) {
        try {
            const contentProvider = new Website()
            const content = await contentProvider.search(provider.query)
            const TotalPages = content.total_pages
            console.warn(TotalPages)
            return await this.getMovieData(await this.getAllTorrents(TotalPages, provider, contentProvider))
        } catch (e) {
            console.warn(`Error ${e} during requesting ExtraTorrent Website..`)
        }
    }


    async parse(provider) {
        try {
            console.log(`${this.name}: Starting scraping...`)
            provider.query.category = `movies`
            provider.query.page = 1
            return await this.getMovies(provider)

        } catch (e) {
            return {error: `Error ${e} during Scrapping ExtraTorrent`}
        }


    }
}

module.exports = ExtraTorrent

/** OMDB result
 { Title: 'Dracula: The Impaler',
  Year: '2013',
  Rated: 'N/A',
  Released: '31 Oct 2013',
  Runtime: '86 min',
  Genre: 'Action, Horror, Thriller',
  Director: 'Derek Hockenbrough',
  Writer: 'Diana Angelson, Daniel Anghelcev, Derek Hockenbrough, Steve Snyder',
  Actors: 'Diana Angelson, Christian Gehring, Christina Collard, Teo Celigo',
  Plot: 'Seven high-school friends begin their Euro-trip at the actual castle of Vlad the Impaler where he supposedly sold his soul to the devil over 500 years earlier, but the decrepit castle\'s past envelopes them in a bloody ritual.',
  Language: 'English',
  Country: 'USA',
  Awards: '1 win & 1 nomination.',
  Poster: 'https://images-na.ssl-images-amazon.com/images/M/MV5BMTY0NDYxNjAxMF5BMl5BanBnXkFtZTgwODY4ODI1MTE@._V1_SX300.jpg',
  Ratings: [ { Source: 'Internet Movie Database', Value: '3.5/10' } ],
  Metascore: 'N/A',
  imdbRating: '3.5',
  imdbVotes: '598',
  imdbID: 'tt2543202',
  Type: 'movie',
  DVD: '02 Sep 2014',
  BoxOffice: 'N/A',
  Production: 'Midnight Releasing',
  Website: 'http://www.theimpalermovie.com/',
  Response: 'True' }

  **/