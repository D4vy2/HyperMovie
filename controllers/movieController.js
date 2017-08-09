const Scrap = require('../models/scrapper/scrapper')
const torrentStream = require('torrent-stream')
const MovieClass = require('../models/movies')
const Streamer = require('../models/streamer')
const Subtitles = require('../models/subtitles')
var pump = require('pump');
var helpers = require('../helpers/filter.js');
const UserClass = require('../models/users')
const asyncq = require('async-q')
const http = require('http');
const fs = require('fs');
let path = require('path');


module.exports = {

    ScrapMovie: (req, res, next) => {
        try {
            const scrap = new Scrap()
            scrap.scrape()
            res.redirect('/movies')
        } catch (e) {
            next(e)
        }

    },

    findAndReturn: (req, res, next) => {
        try {
            const SearchMovie = new MovieClass()
            SearchMovie.searchAndReturn(req.body.search)
                .then(ifExist => {
                    if (!ifExist || ifExist == null) {
                        return res.render('movie', {
                            movie: ifExist,
                            type: 'One',
                            empty: true
                            // url: url
                        })
                    }
                    return res.render('movie', {
                        movie: ifExist,
                        type: 'One',
                        // url: url
                    })
                })
        } catch (e) {
            return next(e)
        }
    },

    async check(userViewved, ListMovie) {
        return await asyncq.concatSeries(ListMovie, async movie => {
            if (userViewved && userViewved.length > 0) {
                userViewved.map(myImdb => {
                    if (myImdb && myImdb === movie._id) {
                        movie.seen = true
                    }
                })
            }
            return movie
        })
    },

    async GalleryMovie (req, res, next)  {
        try {
            if (req.session.user) {
                req.session.page = 75;
                new MovieClass()
                    .ReturnAllMovies()
                    .then(async List => {
                        const FinalList = await module.exports.check(req.session.user.viewved, List)
                        return res.render('gallery', {
                            movies: FinalList,
                            user: req.session.user,
                            type: 'Gallery'
                        })
                    })
            } else {
                res.redirect('/')
            }
        } catch (e) {
            next(e)
        }
    },

    GetRemainingMovies: (req, res, next) => {
        try {
            if (req.session.user) {
                req.session.page += 25;
                new MovieClass()
                    .ReturnRangeMovies(req.session.page)
                    .then(async List => {
                        const FinalList = await module.exports.check(req.session.user.viewved, List)
                        res.send(FinalList);
                    })
            } else {
                res.redirect('/')
            }
        } catch (e) {
            next(e)
        }
    },

    SingleMovie: (req, res, next) => {
        try {
            if (req.session.user) {
                new MovieClass(req.params.idMovie)
                    .ReturnOneMovie()
                    .then((ifExist) => {
                        if(ifExist){
                            return res.render('movie', {
                                movie: ifExist,
                                type: 'One',
                                user: req.session.user,
                            })
                        }else{
                            res.redirect('/movies')
                        }

                    })
            } else res.redirect('/')

        } catch (e) {
            next(e)
        }
    },

    async SortAndReturnAll(req, res, next) {
        console.log(req.body.search)
        if (req.body.search === "" || !req.body.search || req.body.search === undefined) {
            return res.render('gallery', {
                empty: true,
                type: 'Gallery'
            })
        }
        new MovieClass(req.body.search)
            .ReturnSortedMovies()
            .then(async List => {
                if (!List || List === undefined || List.length === 0) {
                    return res.render('gallery', {
                        empty: true,
                        movies: List,
                        // type: 'Gallery'
                    })
                } else {
                    const FinalList = await module.exports.check(req.session.user.viewved, List)
                    req.session.searchResult = FinalList;
                    return res.render('gallery', {
                        movies: FinalList,
                        search: req.body.search
                        // type: 'Gallery'
                    })
                }
            })
    },

    SortAll(req, res, next){
        var arr = req.session.searchResult;
        if (arr) {
            if (req.body.sort === "rating") {
                arr.sort(function (a, b) {
                    return parseFloat(b.rating) - parseFloat(a.rating);
                });
                return res.render('gallery', {movies: arr})
            } else if (req.body.sort === "name") {
                arr.sort(function (a, b) {
                    if (a.namesearch > b.namesearch)
                        return (1);
                    else
                        return (-1);
                })
                return res.render('gallery', {movies: arr})
            } else if (req.body.sort === "date") {
                arr.sort(function (a, b) {
                    return parseFloat(b.year) - parseFloat(a.year);
                });
                return res.render('gallery', {movies: arr})
            }
            else {
                return res.render('gallery', {
                    empty: true,
                    type: 'Gallery'
                })
            }
        } else {
            return res.render('gallery', {
                empty: true,
            })
        }
    },

    FilterAll(req, res, next){
        var arr = req.session.searchResult;
        var newArr = [];
        if (req.body.filterName) {
            let newArr = helpers.filterName(arr, req.body.filterName);
            if (newArr.length > 0)
                return res.render('gallery', {movies: newArr});
        } else if (req.body.filterGenre) {
            let newArr = helpers.filterGenre(arr, req.body.filterGenre);
            if (newArr.length > 0)
                return res.render('gallery', {movies: newArr});
        } else if (req.body.filterRating) {
            let newArr = helpers.filterRating(arr, req.body.filterRating);
            if (newArr.length > 0)
                return res.render('gallery', {movies: newArr});
        } else if (req.body.filterDate) {
            let newArr = helpers.filterDate(arr, req.body.filterDate);
            if (newArr.length > 0)
                return res.render('gallery', {movies: newArr});
        } else {
            console.log('Aucun filtre');
        }
        return res.render('gallery', {
            movies: arr,
            empty: true,
            msg: "Sorry, we can't find any movie with this filter"
        });
    },

    async SaveComment (req, res) {
        try {
            if (req.session.user) {
                let userName
                if (req.session.user.auth42.isauth === true)
                    userName = req.session.user.firstname
                else
                    userName = req.session.user.username
                if ((await new MovieClass(req.body.imdb)
                        .addCommentToDb(req.body.comment, userName)
                        .error !== `true`)) {
                    return res.send({username: userName})
                } else return res.send({error: `true`})
            } else res.redirect('/')
        } catch (e) {
            console.log(`Error ${e} during add comment ${req.body.comment} for movie ${req.body.imdb}`)
        }
    },

    async FindSubtitles (req, res, next){
        try {
            console.log(req.body)
            new Subtitles(req.body).FIndSubtitles(req.session)
                .then((sub) => console.log(`${sub}     Subtitles correctly added`))
        } catch (e) {
            next(e)
        }
    },

    async DownloadAndStartStream (req, res, next)  {
        try {
            console.log(req.body)
            if (req.session.user && req.body.torrent && req.body.imdb) {
                const newSession = await new UserClass(req.session.user._id ? req.session.user._id : req.session.user.id).updateMyView(req.body.imdb)
                req.session.user = newSession
                // if(!req.body.torrent)
                //     return res.redirect('/movies')
                const streamer = new Streamer(req.body.torrent)
                const optsTorrentStream = await streamer.ExtractMagnetAndTrackers()
                const engine = torrentStream(optsTorrentStream.magnet, optsTorrentStream.opts)
                var movie = "";
                new Subtitles(req.body.imdb).FIndSubtitles(req.session.user.language)
                await engine.on('ready', () => {
                    console.log('Engine READY');
                    engine.files.forEach(file => {
                        if (file.name.split('.').pop() === 'mp4') {
                            movie = file;
                            req.session.path = file.path
                            new MovieClass(req.body.imdb).updateLastViewed(file.path)
                            var stream = file.createReadStream()
                            // stream.on('data', (buffer) => {
                            //     console.log(`buffer available length =` + buffer.length);
                            // })
                            stream.on('close', () => {
                                console.log(`\nStream CLOSED!\n`);
                            })
                            stream.on('end', () => {
                                console.log(`\nStream ENDED!\n`);
                            })
                            stream.on('error', (err) => {
                                console.log(`\nStream Error: + ${err}\n`);
                            })
                        }
                    })
                })
                engine.on('download', function () {
                    var total = movie.length
                    var buffer = engine.swarm.downloaded
                    var progress = Math.round(100 * buffer / total);
                    console.log(`${movie.name} - downloading: ${progress}%`);
                    if (progress >= 8)
                        res.send();
                })
                engine.on('idle', () => {

                    console.log('Download finished');
                    res.end()
                })
            } else res.redirect('/')
        } catch (e) {
            next(e)
        }
    },

    startStream: (req, res) => {
        if (req.session.user && req.session.path) {
            console.log('============  Start Streaming  ============')
            var file = '/sgoinfre/goinfre/Perso/kyubi/' + req.session.path;
            var stream = fs.createReadStream(path.resolve(file));
            pump(stream, res);
            stream.on('close', () => console.log('Stream closed!'))
            stream.on('error', (err) => console.log('\n============ IMPOSSIBLE TO CREATE STREAM ============ ' + err + '\n'))
            stream.on('end', () => console.log('Stream end!'))
        }else res.redirect('/')

    },

    removeOld: (req, res, next) => {
        try {
            if (req.session.user) {
                new MovieClass()
                    .deleteOldMovie()
                    .then(() => console.log('All movies purged'))
            }
            res.redirect('/')
        } catch (e) {
            next(e)
        }

    }
}