const YTS = require('./provider/yts')
const ExtraTorrent = require('./provider/extraTorrent')
const {extraTorrentMovie} = require('../../config/constants')
const Parallel = require('async-parallel')
const asyncq = require('async-q')
const OmdbApi = require('./tools/omdb')
const MovieClass = require('../movies')

class Scraper {

    async scrapExtraTorrent() {
        return await Parallel.each(await new ExtraTorrent(extraTorrentMovie.name).parse(extraTorrentMovie), async item => {
            if (item._id) {
                try {
                    return await new MovieClass(item).AddMovieOrReturnIfExist()
                } catch (e) {
                    return console.log(`Error during Scrapping this Api ${e}`)
                }
            }
        }, {concurrency: 1000})
    }


    async scrapeYTS() {
        return await Parallel.each(await new YTS('YTS').parse(), async item => {
            if (item && item._id) {
                try {
                    const dataMovie = await new OmdbApi(item.title, item.year)
                    const movieFinal = await dataMovie.getOtherData(item._id ? item._id : item.imdb_id)
                    if(movieFinal && movieFinal.e === undefined){
                        item.director = movieFinal.director !== undefined ? movieFinal.director : undefined
                        item.production = movieFinal.production !== undefined ? movieFinal.production : undefined
                        item.actors = movieFinal.actors !== undefined ? movieFinal.actors : undefined
                    }
                    return await new MovieClass(item).AddMovieOrReturnIfExist()
                } catch (err) {
                    return console.log(err)
                }
            }
        }, {concurrency: 1000})
    }


    async scrape() {
        return await asyncq.parallel([
            this.scrapeYTS(),
            // this.scrapExtraTorrent()
        ])
    }
}

module.exports = Scraper