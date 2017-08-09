const UserSchema = require('./mongoose/userSchema')

const {Auth42} = require('../config/auth')

const axios = require('axios')

class OAuth {

    constructor() {

    }

    async logUser(user) {
        return await UserSchema.findOne({
            $or: [
                {username: user.login},
                // {mail: user.email}
            ]
        }).then(async UserExist => {
            if (UserExist !== null)
                return await {
                    error: `false`,
                    message: `hey ${user.login} happy to see you`,
                    type: `exist`,
                    user: UserExist
                }
            else return await new UserSchema({
                username: user.login,
                mail: user.email,
                firstname: user.first_name,
                lastname: user.last_name,
                auth42: {
                    picture: user.image_url,
                    isauth: true,
                }
            }).save()
                .then(UserNew => {
                    return {
                        error: `false`,
                        message: `Hey ${user.login} nice to meet you, enjoy your experience`,
                        type: `new`,
                        user: UserNew
                    }
                }).catch(e => {
                    return {error: `true`, message: `Error ${e} during saving data to Db`}
                })
        }).catch(e => {
            return {error: `true`, message: `Error ${e} during saving data to Db`}
        })
    }

    async oauth42Reqquest(querycode) {
        const url = `https://api.intra.42.fr/oauth/token`
        if (querycode) {
            Auth42.code = querycode
            const response = await axios.post(url, Auth42)
            if (response.data) {
                const urlForData = `https://api.intra.42.fr/v2/me`
                const datafrom42 = await axios.get(urlForData, {
                    headers: {'Authorization': `${response.data.token_type} ${response.data.access_token}`}
                })
                if (datafrom42) {
                    return await this.logUser(datafrom42.data)
                }
            }
        }
    }
}

module.exports = OAuth