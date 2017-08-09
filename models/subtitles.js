const yifiSub = require('yifysubtitles')
const fs = require('fs')


class Subtitles {

    constructor(imdb) {
        this.imdb = imdb
    }


    async FIndSubtitles(lang) {
        const basePath = '/sgoinfre/goinfre/Perso/kyubi/Subtitles'
        yifiSub(this.imdb, {path: basePath, langs: ['en', lang]})
            .then(res => {
                res.forEach(sub => {
                    const pathRet = `${basePath}/${this.imdb}-${sub.langShort}.${sub.path.split('.').pop()}`
                    fs.rename(sub.path, pathRet, e => {
                        if (e) console.log(e)
                    })
                })
            })
    }
}

module.exports = Subtitles
