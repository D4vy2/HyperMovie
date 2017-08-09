const express = require('express')
const router = express.Router()
const passport = require('passport')
const {
    login,
    register,
    editInfo,
    activationAccount,
    sendResetInstruction,
    newPassword,
    registerWith42,
    showAllUsers,
    showOneUser,
} = require('../controllers/userController')
const got = require('got')

/* POST users listing. */
router.post('/register', register)
router.post('/login', login)
router.post('/edit', editInfo)
router.post('/newPassword', newPassword)
router.post('/sendResetInstruction', sendResetInstruction)
router.get('/show/all', showAllUsers)
router.get('/show/one/:id', showOneUser)
router.get('/auth/google', passport.authenticate('google', {scope: 'https://www.googleapis.com/auth/plus.login'}));
router.get('/auth/google/cb',
    passport.authenticate('google', {failureRedirect: '/login'}),
    (req, res) => {
        req.session.user = req.user
        res.redirect('/users/edit')
    })


router.get('/auth/facebook', passport.authenticate('facebook'))
router.get('/auth/facebook/cb',
    passport.authenticate('facebook', {failureRedirect: '/login'}),
    (req, res) => {
        req.session.user = req.user
        res.redirect('/users/edit')
    })

router.get('/auth/twitter', passport.authenticate('twitter'))

router.get('/auth/twitter/cb',
    passport.authenticate('twitter', {failureRedirect: '/login'}),
    (req, res) => {
        req.session.user = req.user
        res.redirect('/users/edit')
    })
router.get('/activation/:id/:token', activationAccount)
router.get('/oauth/42', registerWith42)


module.exports = router;