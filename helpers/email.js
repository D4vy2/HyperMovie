/**
 * Created by rberthie on 4/23/17.
 */
const nodeMailer = require('nodemailer')

const transporter = nodeMailer.createTransport({
    // host: 'google',
    // port: 2525,
    service:"Gmail",
    auth: {
        user: '',
        pass: ''
    }
})

class Mailer {
    /**
     *
     * @param type
     * @param data
     */
    constructor(type, data){

        this.data = data
        this.type = type

    }

    /**
     *
     * @returns {{from: string, to: *, subject: string, html: string}} ===> message Object
     */
    createMessage(){
        let subject = ``
        let path = `http://localhost:3000/`

        if(this.type === `resetPass`){
            subject = "✔ Let's go to reset your pass"
            path += `resetPassword/:${this.data.id}/:${this.data.token}`
            
        }else{
            subject = "✔ Let's go to validate your account"
            path += `users/activation/:${this.data.id}/:${this.data.token}`
        }
        return {
            from:`Hypertube register <noreply@hypertube-app.42.fr>`,
            to: this.data.email,
            subject:subject,
            html:`<p>Follow <a href="${path}" target="_blank">this link</a> to acess your account</p>`
        }
    }

    /**
     *
     * @returns {Promise.<void>}
     * @constructor
     */
    async SendEmail(){
        try {
            const message = this.createMessage()
            transporter.verify(() => {
                transporter.sendMail(message, (err, info) => {
                    // console.log(`Message ${info.messageId}, sent with response ${info.response}!`)
                    transporter.close()
                })
            })
        }catch (e) {
            console.log(`An error occured when sending mail retry later`)
        }
    }
}

module.exports = Mailer
