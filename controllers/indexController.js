/**
 *
 * All this module are used in the Index Routew
 * Only render views
 * Logout function
 *
 */
const MovieClass = require('../models/movies')
const Scrap = require('../models/scrapper/scrapper')


module.exports = {

    async login (req, res, next)  {
            try {
                const ifMovies = await new MovieClass().ReturnAllMovies()
                if (ifMovies.length < 1) {
                    new Scrap()
                        .scrape()
                        .then((ret) => {
                        })
                }

            } catch (e) {
                next(e)
        }
        if (req.session.user === undefined) {
            res.render('login')
        } else {
            res.render('gallery', {user: req.session.user})
        }
    },

    index: (req, res) => {
        if (req.session.user)
            res.redirect('/movies')
        else
            res.redirect('/login')
    },

    register: (req, res) => {
        if (req.session.user)
            res.redirect('/movies')
        else
            res.render('register')
    },

    logout: (req, res) => {
        if (req.session.user) {
            req.session.destroy(err => {
                if (!err) {
                    res.redirect('/')
                }
            })
        } else
            res.redirect('/')
    },

    forget: (req, res) => {
        if (req.session.user)
            res.redirect('/movies')
        else {
            res.render('forget')
        }
    },

    resetPass: (req, res) => {
        if(req.session.user){
            return res.redirect('/')
        }
        let {id, token} = req.params
        id = id.substr(1)
        token = token.substr(1)
        res.render('new', {
            title: 'Hypertube',
            IdToken: {
                id: id,
                token: token
            }
        })
    },

    async edit(req, res) {
        if (!req.session.user || req.session.user === undefined)
            res.redirect('/login');
        else {
            res.render('edit', {
                user: req.session.user,
                type: "type",
                movieListViewed: await new MovieClass().findAllMyViewvedMovies(req.session.user.viewved)
            })
        }
    }


}