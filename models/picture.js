const fs = require('fs')
const streamifier = require('streamifier')
const crypto = require('crypto')
const base64 = require('base64url')
const fileType = require('file-type')


class Picture {
    constructor(picture) {
        this.picture = picture
        this.path = './public/uploads'
    }

    checkDir() {
        try {
            fs.accessSync(this.path)
        } catch (e) {
            fs.mkdirSync(this.path)
        }
    }

    async createPath() {
        return await (`${this.path}/${Date.now()}-${base64(await crypto.randomBytes(22))}-${this.picture.name}`)
    }

    async createPicture() {
        try {
            this.checkDir()
            const mime = fileType(this.picture.data)
            if (mime.mime !== null && mime.mime === 'image/jpeg' || mime.mime === 'image/png' || mime.mime === 'image/jpg')
                return await streamifier.createReadStream(this.picture.data)
                    .pipe(fs.createWriteStream(await this.createPath()))
                    .path
                    .replace('.\/public\/uploads\/', '')
            else return false
        }catch (e) {
            return false
        }
    }
}

module.exports = Picture