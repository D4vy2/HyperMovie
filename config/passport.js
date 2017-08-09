const FacebookStrategy = require('passport-facebook')

const {facebookAuth, twitterAuth} = require('./auth')



const User = require('../models/mongoose/userSchema')


passport.use(new LocalStrategy)



passport.use(new FacebookStrategy({
        clientID: facebookAuth.clientID,
        clientSecret: facebookAuth.clientSecret,
        callbackURL: facebookAuth.callbackURL
    },

    function (token, refreshToken, profile, done) {
        console.log('herrre1')

        process.nextTick(() => {
            User.findOne({'facebook.id': profile.id})
                .then(user => {
                    if (user)
                        return done(null, user)
                    else {
                        let newUser = new User()
                        newUser.facebook.id = profile.id
                        newUser.facebook.token = token
                        newUser.facebook.name = `${profile.name.givenName} ${profile.name.familyName}`
                        newUser.facebook.email = profile.emails[0].value

                        newUser.save()
                            .then(() => {
                                return done(null, newUser)
                            })
                            .catch(e => {
                                throw e
                            })
                    }
                })
                .catch(e => {
                    return done(e)
                })
        })
    }))
