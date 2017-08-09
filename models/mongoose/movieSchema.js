/**
 * Created by rberthie on 4/24/17.
 */
const mongoose = require('mongoose')

const Movie = new mongoose.Schema({
    _id: {
        type: String,
        required: true,

        index: {
            unique: true
        }
    },
    namesearch: String,
    imdb_id: String,
    title: String,
    year: String,
    synopsis: String,
    rating: Number,
    picture: {
        banner: String,
        back: String,
        poster: String,
    },
    country: String,
    genres: [],
    trailer: {
        type: String,
        default: null
    },
    torrents: {},
    last_view: {
        type:Date,
        default:null
    },
    comment: [
    {
        username: String,
        message:String,
    }
    ],
    director: String,
    actors: String,
    production: {
        type: String,
        default:null
    },
    seen: {
        type:Boolean,
        default: false
    },
    pathmovie:{
        type:String,
        default:null
    }
})

const MovieSchema = mongoose.model('Movie', Movie)

module.exports = MovieSchema