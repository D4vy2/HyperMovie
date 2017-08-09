const torrentStream = require('torrent-stream')
const fs = require('fs')


//TODO Add method to update movie document { download: { time: New date, path:this.path } }
class Streamer {
    /**
     *
     * @param magnet
     */
    constructor(magnet){
        this.magnet = magnet
        this.path = '/sgoinfre/goinfre/Perso/kyubi'
    }

    /**
     *
      * @returns {Promise.<void>}
     */
    async ifDirDoesNotExist(){
        try{
            fs.accessSync(this.path)
        } catch (e) {
            fs.mkdirSync(this.path)
        }
    }

    /**
     *
     * @returns {Promise.<*>}
     * @constructor
     */
    async ExtractMagnetAndTrackers(){
        try{
            this.ifDirDoesNotExist()
            const Trackers = this.magnet.split(`&`)
            const Magnet = Trackers.shift()
            console.log('THIS PATH = ' + this.path);
            const opts = {
                connections: 100,
                uploads: 10,
                tmp: this.path,
                path: `${this.path}`,
                verify: true,
                dht: true,
                tracker: true,
                trackers: Trackers,
            }
            return await { magnet:Magnet, opts:opts }
        } catch (e) {
            return { message:`An error occured with the magnet ${this.magnet}` }
        }
    }
}

module.exports = Streamer


