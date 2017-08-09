const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const index = require('./routes/index')
const users = require('./routes/users')
const movies = require('./routes/movies')
const hbs = require('express-handlebars')
const helpers = require('handlebars-helpers')
const compression = require('compression')
const fileUpload = require('express-fileupload')
const passport = require('passport')


const AuthClass = require('./models/oauth')
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const UserSchema = require('./models/mongoose/userSchema')

const sess = session({
    secret: 'hypertube42',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
})
const app = express()

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/',
    partialsDir: 'views/partials/'
}));
app.set('view engine', 'hbs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(fileUpload())

/** Enable compression of res bodies **/
app.use(compression({
    threshold: 1400,
    level: 8,
    memLevel: 3
}));

app.use(cookieParser())
app.use(sess)
app.use(passport.initialize())
app.use(passport.session())


app.use('/static', express.static(path.join(__dirname, 'public')))

app.use('/goinfre', express.static(path.resolve('/sgoinfre/goinfre/Perso/kyubi')))

app.use('/', index)
app.use('/users', users)
app.use('/movies', movies)


passport.serializeUser(function (user, done) {
    done(null, user);
})

passport.deserializeUser(function (id, done) {
    UserSchema.findOne({username: id})
        .then(User => {
            done(null, User);
        })
})

passport.use(new GoogleStrategy({
        clientID: "",
        clientSecret: "",
        callbackURL: "http://localhost:3000/users/auth/google/cb",
    },
    function (token, tokenSecret, profile, done) {
        let UserGoogle = {}
        UserGoogle.login = profile.id
        UserGoogle.first_name = profile.name.givenName
        UserGoogle.last_name = profile.name.familyName
        UserGoogle.image_url = profile.photos[0].value
        new AuthClass().logUser(UserGoogle)
            .then(retUserGoogle => {
                return done(null, retUserGoogle.user)
            })

    }
))

passport.use(new TwitterStrategy({
        consumerKey: "",
        consumerSecret: "",
        callbackURL: "http://localhost:3000/users/auth/twitter/cb"
    },
    function (token, tokenSecret, profile, done) {
        const name = profile.displayName.split(' ')
        let UserTwitter = {}
        UserTwitter.login = profile.id
        UserTwitter.first_name = name[1]
        UserTwitter.last_name = name[0]
        UserTwitter.image_url = profile.photos[0].value
        new AuthClass().logUser(UserTwitter)
            .then(retUserTwitter => {
                return done(null, retUserTwitter.user)
            })
    }
))

passport.use(new FacebookStrategy({
        clientID: "",
        clientSecret: "",
        callbackURL: "http://localhost:3000/users/auth/facebook/cb",
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
    function (accessToken, refreshToken, profile, done) {
        const name = profile.displayName.split(' ')
        let FacebookUser = {}
        FacebookUser.login = profile.id
        FacebookUser.first_name = name[0]
        FacebookUser.last_name = name[1]
        FacebookUser.image_url = profile.photos[0].value
        new AuthClass().logUser(FacebookUser)
            .then(retUserFacebook => {
                return done(null, retUserFacebook.user)
            })
    }
))

app.get('*', function (req, res) {
    res.render('error', {error: "4o4", error2: "Not Found"})
});

module.exports = app
