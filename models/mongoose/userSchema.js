
const mongoose = require('../../config/mongoose')

const userSchema = mongoose.Schema({
    username : {
        type: String,
    },
    tokenRegisterEmail: String,
    password:{
        type: String,
    },
    validationWithEmail: Boolean,
    mail: {
        type: String,
    },
    firstname:{
        type: String,
    },
    lastname: {
        type: String,
    },
    picture : {
        type: String,
    },
    facebook : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    viewved: {
        type: Array
    },
    auth42 : {
        picture: String,
        isauth: {
            type: Boolean,
            default: false
        }
    },
    language: {
        type:String,
        default:'en'
    }
})
//TODO Add viewved
const User = mongoose.model('User', userSchema)

module.exports = User
