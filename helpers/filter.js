exports.filterDate = (arr, intervalStr) => {
    var newArr = [];
    if (intervalStr && intervalStr != undefined && intervalStr != "") {
        var interval = intervalStr.split('-');
    }
    if (arr) {
    for(let i = 0, len = arr.length; i < len; i++) {
            let elem = arr[i];
            if (elem.year && elem.year != undefined) {
                if (elem.year >= parseInt(interval[0]) && elem.year <= parseInt(interval[1]))
                    newArr.push(elem);
            }
        }
    }
    return (newArr);
}

exports.filterRating = (arr, intervalStr) => {
    var newArr = [];
    if (intervalStr && intervalStr != undefined && intervalStr != "") {
        var interval = intervalStr.split('-');
    }
    if (arr) {
        for(let i = 0, len = arr.length; i < len; i++) {
            let elem = arr[i];
            if (elem.rating && elem.rating != undefined) {
                if (elem.rating >= parseFloat(interval[0]) && elem.rating <= parseFloat(interval[1]))
                    newArr.push(elem);
            }
        }
    }
    return (newArr);
}

exports.filterName = (arr, intervalStr) => {
    var newArr = [];
    if (intervalStr && intervalStr != undefined && intervalStr != "") {
        var interval = intervalStr.split('-');
    }
    if (arr) {
        for(let i = 0, len = arr.length; i < len; i++) {
            let elem = arr[i];
            if (elem.title && elem.title != undefined) {
                if (elem.title.charAt(0).toLowerCase() >= interval[0] && elem.title.charAt(0).toLowerCase() <= interval[1])
                    newArr.push(elem);
            }
        }
    }
    return (newArr)
}

exports.filterGenre = (arr, genre) => {
    var newArr = [];
    if (arr) {
        if (genre && genre != undefined && genre != "") {
            for(let i = 0, len = arr.length; i < len; i++) {
                let elem = arr[i];
                let genres = elem.genres;
                if (genres.indexOf(genre) != -1)
                        newArr.push(elem);
            }
        }
    }
    return (newArr)
}