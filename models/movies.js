const MovieSchema = require('./mongoose/movieSchema')
const fs = require('fs')
const asyncq = require('async-q')

class Movie {

    constructor(movie) {
        this.movie = movie
    }

    async AddMovieOrReturnIfExist() {
        try {
            const ifExist = await MovieSchema.findOne({_id: this.movie._id}).exec()
            if (ifExist) {
                return this.movie
            } else {
                return await new MovieSchema(this.movie).save()
            }
        } catch (err) {
            return console.log(`error ${err} ocurred with this movie ${this.movie.id && this.movie.title}`)
        }
    }

    //TODO add req.params.page to calculate scip and limit scip = (nb elem) * page
    async ReturnAllMovies() {
        try {
            return await MovieSchema.find({}).limit(100).sort({rating: -1})
        } catch (e) {
            return e
        }
    }

    async ReturnRangeMovies(index) {
        try {
            return await MovieSchema.find({}).skip(index).limit(25).sort({rating: -1})
        } catch (e) {
            return e
        }
    }

    async ReturnOneMovie() {
        try {
            return await MovieSchema.findOne({_id: this.movie}).exec()
        } catch (e) {
            return e
        }
    }

    async ReturnSortedMovies() {
        try {
            const movie = this.movie.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/gi, '').toLowerCase()
            return await  MovieSchema.find({
                namesearch: {
                    $regex: movie,
                    $options: 'i'
                }
            }).limit(200).sort({namesearch: 1})
        } catch (e) {
            return e
        }
    }

    async searchAndReturn(value) {
        try {
            const query = {
                namesearch: value.replace(/([~!@#$%^&*()_+=`{}\[\]\|\\:;'<>,.\/? ])+/g, '').toLowerCase(),
            }
            return await MovieSchema.findOne(query).exec()
        } catch (e) {
            return e
        }
    }

    async addCommentToDb(comment, username) {
        if (comment.length < 100) {
            return await MovieSchema.updateOne({_id: this.movie},
                {
                    $addToSet: {
                        comment: {
                            username: username,
                            message: comment
                        }
                    }
                }).then(() => {
                return {error: `false`}
            }).catch(e => {
                return {error: `true`, message: `${e}`}
            })
        } else
            return {error: `true`, message: `Message too long `}
    }

    async updateLastViewed(path) {
        path = path.split('/')
        const pathtosave = path[0]
        return await MovieSchema.updateOne({_id: this.movie},
            {
                $set: {
                    last_view: Date.now(),
                    pathmovie: pathtosave
                }
            })
    }

    deleteFolder(path) {
        console.warn(path)
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach((file, index) => {
                console.log(file)
                const curPath = path + "/" + file
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolder(curPath)
                } else {
                    fs.unlinkSync(curPath)
                }
            })
            fs.rmdirSync(path)
        }
    }

    //TODO Verif path And rights for delete dir
    async deleteOldMovie() {
        const now = new Date
        MovieSchema.find({
            last_view: {$type: 9}
        }).then(res => {
            res.forEach(eachMov => {
                if ((now.getMonth() - eachMov.last_view.getMonth()) < 1) {
                    this.deleteFolder(`/sgoinfre/goinfre/Perso/kyubi/${eachMov.pathmovie}`)
                }
            })
        })
    }

    async findAllMyViewvedMovies(viewved){
        return await asyncq.concatSeries(viewved, async movie => {
            return await MovieSchema.findOne({_id:movie})
        })
    }
}

module.exports = Movie