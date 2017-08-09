/**
 *
 *  All this modules are using in the route users
 *  All function to create and modify your account
 *
 **/

const UserClass = require('../models/users')
const oauth = require('../models/oauth')
const {
    regexName,
    regexUsername,
    regexEmail
} = require('../helpers/verifInput')

module.exports = {

    register: (req, res, next) => {
        try {
            new UserClass(req.body)
                .FindUserOrCreate(req.files.photo)
                .then(userSaved => {
                    if (userSaved.value !== `ko`)
                        res.redirect('/login')
                        // return res.render('index', userSaved)
                    else res.redirect('/register')
                })
        } catch (e) {
            res.redirect('/login')
        }

    },

    login: (req, res, next) => {
        new UserClass(req.body)
            .LogInOrRedirect()
            .then(UserLog => {
                if (UserLog.status === `ok`) {
                    req.session.user = UserLog.user
                    res.redirect('/movies')
                } else {
                    res.redirect('/')
                }
            })
            .catch(e => next(e))
    },


    editInfo: (req, res, next) => {
        let isAuth = false
        let ifPic = false
        if(req.body.firstname && req.body.firstname.length > 20)
            return res.redirect('/users/edit')
        if(req.body.lastname && req.body.lastname.length > 20)
            return res.redirect('/users/edit')
        if (req.session.user.auth42.isauth === true)
            isAuth = true
        if (req.files.photo !== undefined && req.files.photo.name !== '')
            ifPic = req.files.photo
        new UserClass(req.body)
            .EditMyInfo(req.session.user._id, ifPic, isAuth)
            .then(UserUpdate => {
                if (UserUpdate && UserUpdate.type !== undefined && UserUpdate.type === `ok`)
                    req.session.user = UserUpdate.user
                return (res.redirect('/users/edit'))
            })
            .catch(e => next(e))
    },

    activationAccount: (req, res, next) => {
        new UserClass(req.params)
            .SetAccountToTrue()
            .then(UserAct => {
                res.redirect('/')
            })
            .catch(e => next(e))
    },

    sendResetInstruction: (req, res, next) => {         //TODO Error when invaid input... Ok when empty
        new UserClass(req.body)
            .SendReset()
            .then(ifSent => {
                return res.render('index', ifSent)
            })
            .catch(e => next(e))
    },

    newPassword: (req, res, next) => {
        new UserClass(req.body)
            .newPassword()
            .then(newPass => {
                res.redirect('/')
            })
            .catch(e => next(e))
    },

    registerWith42: (req, res, next) => {
        try {
            new oauth()
                .oauth42Reqquest(req.query.code)
                .then(UserOAuth => {
                    if (UserOAuth.user !== '' && UserOAuth.error === `false`)
                        req.session.user = UserOAuth.user
                    return res.redirect('/users/edit')
                })
        } catch (e) {
            next(e)
        }
    },


    showAllUsers: (req, res) => {
        try {
            if(req.session.user){
              new UserClass()
                  .showAll()
                  .then(Users => {
                      return res.render('users', {
                          user:req.session.user,
                          users:Users,
                          type:`All`
                      })
                  })
            }else {
              return res.redirect('/')
            }

        } catch (e) {
            next(e)
        }
    },

    showOneUser: (req, res) => {
        try {
            new UserClass(req.params)
                .showOne()
                .then(User => {
                    return res.render('user', {
                        user:req.session.user,
                        users:User[0]
                    })
                })
        } catch (e) {
            next(e)
        }
    },
}
