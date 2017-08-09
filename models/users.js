const UserSchema = require('./mongoose/userSchema')

/** Used to generate token **/
const crypto = require('crypto')
const base64 = require('base64url')
/** End helpers token generation **/

/** Hash Algorithm fror passwords **/
const argon2 = require('argon2')

/** Stmp protocol using nodemailer and Mailtrap.io **/
const Mailer = require('../helpers/email')


/** HTTP simple request **/
const axios = require('axios')

/** All Regex for input verifications **/
const {
    protectEntry,
    regexName,
    regexUsername,
    regexPassword,
    regexEmail
} = require('../helpers/verifInput')
/** End Regex **/

const optionsArgon2 = {
    timeCost: 4, memoryCost: 13, parallelism: 2, type: argon2.argon2d
}


const Picture = require('./picture')
/** Opt for Argon2 for optimisation use more memory, work on 2 threads **/
const {projectionWithNewDocument, allUsersProjection} = require('../config/constants')


class User {

    constructor(data) {
        this.data = data
    }

    controlInput(int) {
        if (int === 1) {
            return (regexName(this.data.firstname)
            && regexName(this.data.lastname)
            && regexEmail(this.data.email)
            && regexUsername(this.data.username)
            && regexPassword(this.data.password)
            && this.data.password === this.data.confirmPassword)
        } else if (int === 2) {
            return (regexUsername(this.data.username)
            && regexPassword(this.data.password))
        } else if (int === 3) {
            return (regexName(this.data.firstname)
            || regexName(this.data.lastname)
            || regexEmail(this.data.email))
        }

    }

    async FindUserOrCreate(picture) {
        const path = await new Picture(picture).createPicture()
        if (this.controlInput(1) === true && path !== false) {
            let user = await UserSchema.findOne({
                $or: [
                    {username: this.data.username},
                    {mail: this.data.email}
                ]
            })
            if (user) {
                return {
                    title: 'Hypertube',
                    message: `Sorry the ${this.data.username} or ${this.data.email} are already taken`,
                    type: `register`,
                    value: `ko`
                }
            } else {
                const passHashedWithArgon = await argon2.hash(this.data.password, await argon2.generateSalt(32), optionsArgon2)
                let token = base64(crypto.randomBytes(42))
                const newUser = new UserSchema({
                    username: protectEntry(this.data.username),
                    password: passHashedWithArgon,
                    tokenRegisterEmail: token,
                    validationWithEmail: false,
                    mail: this.data.email,
                    firstname: protectEntry(this.data.firstname),
                    lastname: protectEntry(this.data.lastname),
                    picture: path
                })
                let UserSaved = await newUser.save()
                new Mailer('register', {id: UserSaved._id, token: token, email: this.data.email}).SendEmail()
                return {title: 'Hypertube', message: "sucess, now valid your email", type: 'entryPoint', value: `ok`}
            }
        } else {
            return {title: 'Hypertube', message: `Invalid Input ..`, type: `register`, value: `ko`}
        }
    }

    async LogInOrRedirect() {
        if (this.controlInput(2)) {
            let user = await UserSchema.findOne({
                $and: [
                    {username: this.data.username},
                    {validationWithEmail: true}
                ]
            })
            if (user) {
                try {
                    if (await argon2.verify(user.password, this.data.password))
                        return {
                            user: user,
                            message: `Hello ${this.data.username} very happy to see you`,
                            title: `Hypertube`,
                            status: `ok`
                        }
                    else
                        return {type: `login`, message: `Your Pass is not same please retry`, title: `Hypertube`}
                } catch (err) {
                    return {type: `login`, message: `An Internal Error Occured please try later`, title: `Hypertube`}
                }
            } else return {
                type: `login`,
                message: `${this.data.username} not found or account nor validate`,
                title: `Hpertube`
            }
        } else return {type: `login`, message: `Entry not conform`, title: `Hypertube`}
    }

    async newPassword() {
        if (this.data.password === this.data.confirmPassword && regexPassword(this.data.password)) {
            try {
                let user = await UserSchema.findOne({
                    $and: [
                        {_id: this.data.id},
                        {tokenRegisterEmail: String(this.data.token)}
                    ]
                })
                if (user) {
                    try {
                        const passHashedWithArgon = await argon2.hash(this.data.password, await argon2.generateSalt(32), optionsArgon2)
                        UserSchema.updateOne({_id: this.data.id}, {$set: {password: passHashedWithArgon}}, projectionWithNewDocument)
                            .then(() => {
                                return {
                                    title: 'Hypertube',
                                    message: "Your password is modified with sucess, Log You now",
                                    type: 'login'
                                }
                            })
                    } catch (e) {
                        return {title: 'Hypertube', message: "An error occurred when updating ...", type: 'entryPoint'}
                    }
                }
            } catch (e) {
                return {title: 'Hypertube', message: "Wrong Passport...", type: 'entryPoint'}
            }
        }
    }

    async EditMyInfo(id, picture, isAuth) {
        let query = {}
        if (picture !== false) {
            const pic = await new Picture(picture).createPicture()
            if (pic !== false)
                query.picture = pic
        }
        if ((this.controlInput(3)) || picture !== false || (this.data.lang !== undefined && this.data.lang !== '')) {

            const lang = this.data.lang.substr(0, 2).toLowerCase()
            this.data.firstname !== '' ? query.firstname = protectEntry(this.data.firstname) : undefined
            this.data.lastname !== '' ? query.lastname = protectEntry(this.data.lastname) : undefined
            this.data.email !== '' ? query.mail = this.data.email : undefined
            this.data.lang !== '' ? query.language = lang : undefined
            (query.picture !== false) ? query.picture : undefined
            if (query && id) {
                try {
                    const user = await UserSchema.findOneAndUpdate({_id: id}, query, projectionWithNewDocument)
                    if (user) {
                        return {
                            user: user,
                            type: `ok`,
                            message: `${ query.language || query.firstname || query.lastname || query.mail } Modification do with sucess`
                        }
                    } else
                        return {type: 'Error User', message: `Error Can't modify now your informations`}
                } catch (e) {
                    return {type: `Error Internal`, message: `An Internal Error Occured Sorry please try later`}
                }
            }
        }
    }


    async SetAccountToTrue() {
        if (this.data.id !== '' && this.data.token !== '') {
            try {
                let user = await UserSchema.findOne({
                    $and: [
                        {_id: this.data.id.substr(1)},
                        {tokenRegisterEmail: this.data.token.substr(1)}, //TODO Test if String Or Not.....
                        {validationWithEmail: false}
                    ]
                })
                console.warn(user)
                if (user) {
                    try {
                        let userTrue = await UserSchema.updateOne({
                                _id: this.data.id.substr(1)
                            },
                            {
                                $set: {
                                    validationWithEmail: true,
                                }
                            }, projectionWithNewDocument)
                        if (userTrue) {
                            return {
                                user: userTrue,
                                message: "Hey your account is now valid",
                                type: `Nice`
                            }
                        }
                    } catch (e) {
                        return {type: `Update Error`, message: `An Error Occured during Update`}
                    }
                }

            } catch (e) {
                return {type: `User Error`, message: `User Not Found`}
            }
        }
    }

    async SendReset() {
        if (regexEmail(this.data.email)) {
            try {
                let user = await UserSchema.findOne({mail: this.data.email})
                if (user) {
                    try {
                        new Mailer('resetPass', {
                            id: user._id,
                            token: user.tokenRegisterEmail,
                            email: this.data.email
                        }).SendEmail()
                        return {
                            title: `Hypertube`,
                            type: `entryPoint`,
                            status: `True`,
                            message: `Instruction for reset pass are sent to ${this.data.email}`
                        }
                    } catch (e) {
                        return {
                            title: `Hypertube`,
                            type: `entryPoint`,
                            status: `False`,
                            message: `The email ${this.data.email} doesn't match`
                        }
                    }
                }
            } catch (e) {
                return {
                    title: `Hypertube`,
                    type: `entryPoint`,
                    status: `False`,
                    message: `An Error Occured... try Later`
                }
            }
        }
    }

    async updateMyView(imdb) {
        return await UserSchema.findOneAndUpdate({_id: this.data},
            {
                $addToSet: {
                    viewved: imdb
                }
            }, projectionWithNewDocument)
    }

    async showAll() {
        return await UserSchema.find({})
    }

    async showOne() {
        return await UserSchema.find({_id: this.data.id})
    }

}

module.exports = User