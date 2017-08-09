const express = require('express')
const app = express.Router()

const { ScrapMovie,
        GalleryMovie,
        GetRemainingMovies,
        SingleMovie,
        DownloadAndStartStream,
        FindSubtitles,
        findAndReturn,
        SaveComment,
        SortAndReturnAll,
        SortAll,
        FilterAll,
        startStream,
        removeOld} = require('../controllers/movieController')


app.get('/', GalleryMovie)
app.post('/pagination', GetRemainingMovies)
app.get('/torrent/update', ScrapMovie)
// app.post('/subtitle/get', FindSubtitles)
app.get('/single/:idMovie', SingleMovie)
app.post('/single/:idMovie/comment', SaveComment)
app.post('/single/:idMovie/subtitles', FindSubtitles)
app.post('/download', DownloadAndStartStream)
app.post('/search', findAndReturn)
app.post('/search/all', SortAndReturnAll)
app.post('/search/sort', SortAll)
app.post('/search/filter', FilterAll)
app.get('/single/:idMovie/stream', startStream)
app.get('/remove', removeOld)



module.exports = app