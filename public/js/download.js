let btnWatch = document.querySelector('#download');
let player = document.querySelector('#player');
var torrent = document.querySelector('#torrent');
const loader = document.querySelector('#loader');
const imdb = document.querySelector('#idMovie');
const imb = $('.idMovie').val()

// Start to download
btnWatch.addEventListener('click', function (e) {
    if (!torrent.innerHTML || torrent.innerHTML == "")
      return;
    btnWatch.style.display = "none"
    loader.style.display = "inline";
    hideQuality(quality);
    download();
    e.preventDefault();
}, false);

function download() {
    const xhr = new XMLHttpRequest();
    const url = "http://localhost:3000/movies/download";
    const params = `torrent=${torrent.innerHTML}&imdb=${imdb.innerHTML}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // path.value = '/goinfre/' + xhr.responseText;
            loader.style.display = "none";
            // player.style.display = "block";
            let url = window.location.href.split('/').pop();
            player.src = `/movies/single/${url}/stream`;
            player.load();
            player.play();
            console.log('response sent')
        }
    }
    xhr.send(params);
}

function hideQuality(arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
        quality[i].style.display = "none";
    }
}

var quality = document.querySelectorAll('.quality');
for (let i = 0, len = quality.length; i < len; i++) {
    let elem = quality[i];
    elem.style.transition = '0.6s'
    elem.style.borderColor = "white";
    elem.addEventListener('click', (e) => {
        btnWatch.style.display = "inline";
        for (let i = 0, len = quality.length; i < len; i++) {
            quality[i].style.borderColor = "white";
            quality[i].style.color = "white";
            torrent.innerHTML = "";
        }
        elem.style.color = "lightskyblue";
        elem.style.borderColor = "lightskyblue";
        torrent.innerHTML = elem.nextElementSibling.innerHTML;
    })
    }
