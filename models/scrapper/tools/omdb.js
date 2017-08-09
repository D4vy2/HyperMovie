
const got = require('got')

// const api_key = 'e4dc8866'
//

class OMDB {

    constructor(name, year){
        this.name = name
        this.year = year
    }

    async _get(url, query){
        try{
            const body =  await got(url, query)
            return JSON.parse(body.body)
        } catch (e) {
            // console.log(`Error ${e} during requesting OMDB API`)
        }
    }

    async getOtherData(imdb){
        try{
            const body = await this._get(`http://www.omdbapi.com/?i=${imdb}&apikey=747f4553`)
            if(body){
                return {
                    director: (body.Director !== undefined && body.Director !== '') ? body.Director : `N/A`,
                    production: (body.Production !== undefined && body.Production !== '') ? body.Production : `N/A`,
                    actors: (body.Actors !== undefined && body.Actors !== '') ? body.Actors : `N/A`
                }
            }else
                return {e:"No Data Found"}
        } catch (e) {
            return (e)
            // console.log(`No data found with this ${imdb} ,, Error : ${e}`)
        }

    }

    async getMovieData(){
        return await this._get(`http://www.omdbapi.com/?t=${this.name}&type=movie&year=${this.year}`)

    }
}

module.exports = OMDB
