/** Constants used to create db connection **/
const { dbHosts, dbName, Promise } = require('./constants')
const mongoose = require('mongoose')

/** Add own Promise because mongoose Promise is now depreciated **/
mongoose.Promise = Promise
mongoose.connect(`mongodb://${dbHosts.join(",")}/${dbName}`, {
    db: {
        native_parser: true
    }
})
let _db = mongoose.connection

_db.on('error', err => {
    console.log(`DB Connection error : ${err}`)
}).once('open', () => {
    console.log(`DB Connection on ${dbName} successed `)
})

module.exports = mongoose
