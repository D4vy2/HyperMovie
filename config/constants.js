/**
 * Here All the constants we can need for this projet
 *
**/

/** Const to params request to Scrap Api **/
const maxWebRequest = 2
const webRequestTimeout = 2


/** MONGOOSE const **/
const dbHosts = ["localhost"]

const dbName = "hypertube"

const Promise = global.Promise
/** Prjection For UserSchema Mongoose**/
const projectionWithNewDocument = {
    projection: {
        password: 0,
        tokenRegisterEmail: 0
    },
    new: true
}
/** End Mongoose const**/

const extraTorrentMovie =     {
    name: "ExtraTorrent",
    query: {with_words: "x264 yify brrip"}
}


const allUsersProjection = {
    projection: {
        password: 0,
        tokenRegisterEmail: 0,
        viewved: 0,
        validationWithEmail: 0
    }
}

// {name: "ETRG BRRip", query: {with_words: "etrg x264 brrip"}},
    // {name: "ETRG BluRay", query: {with_words: "etrg x264 bluray"}},
    // {name: "YIFY", query: {with_words: "ettv"}}


/** Api Key for 42 **/
const AxiosOAuth42 = {
    grant_type: 'authorization_code',
    client_id: '',
    client_secret: '',
    code: ``,
    redirect_uri: 'http://localhost:3000/users/oauth/42'
}

module.exports =  {
    dbHosts,
    dbName,
    Promise,
    maxWebRequest,
    webRequestTimeout,
    projectionWithNewDocument,
    AxiosOAuth42,
    extraTorrentMovie,
    allUsersProjection
}

