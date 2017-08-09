

const facebookAuth = {
    'clientID'      : '',
    'clientSecret'  : '',
    'callbackURL'   : 'http://localhost:3000/users/facebook/cb'
}

const twitterAuth = {
    'consumerKey'       : 'your-consumer-key-here',
    'consumerSecret'    : 'your-client-secret-here',
    'callbackURL'       : 'http://localhost:3000/users/twitter/cb'
}

const googleAuth = {
    key:``

}

const Auth42 = {
    grant_type: 'authorization_code',
    client_id: '',
    client_secret: '',
    code: ``,
    redirect_uri: 'http://localhost:3000/users/oauth/42'
}

module.exports = {
    facebookAuth,
    twitterAuth,
    Auth42
}
