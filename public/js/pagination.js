(function() {
if (window.document.URL == "http://localhost:3000/movies" || window.document.URL == "http://localhost:3000/movies/") {
    window.onscroll = function(ev) {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            getMovies();
        }
    };
}

    function getMovies() {
        const xhr = new XMLHttpRequest();
        const url = "http://localhost:3000/movies/pagination";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                processList(JSON.parse(xhr.responseText));
            }
        }
        xhr.send();
    }

    function processList(arr) {
        for(let i = 0, len = arr.length; i < len; i++) {
            let movie = arr[i];
            let div = createElement(movie);
            var container = document.querySelector('#gallery-container')
            container.appendChild(div);
        }
    }

    function createElement(movie) {
        // create div
        let div = document.createElement('div');
        if (movie.seen)
            div.setAttribute('class', 'col-lg-2 col-md-3 col-sm-4 col-xs-12 gallery-elem seen');
        else
            div.setAttribute('class', 'col-lg-2 col-md-3 col-sm-4 col-xs-12 gallery-elem');
        // create link
        let a = document.createElement('a');
        a.href = `/movies/single/${movie._id}`;

        let h1 = document.createElement('h1');
        h1.innerHTML = movie.title;
        div.appendChild(h1);
        let divImg = document.createElement('div');
        divImg.setAttribute('class', 'col-lg-12 col-md-12 col-sm-12 col-xs-12');

        let p = document.createElement('p');
        p.innerHTML = `IMDB: ${movie.rating} Year: ${movie.year}`;

        let img = document.createElement('img');
        img.src = movie.picture.banner;
        img.setAttribute('id', 'poster');
        img.setAttribute('alt', 'Invisible poster');
        divImg.appendChild(img);
        div.appendChild(a).appendChild(divImg).appendChild(p);
        return (div);
        // TO COMPLETE...
    }

   


})()