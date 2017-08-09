(function() {
    var commentMsg = document.querySelector('#comment-msg');
    var commentInput = document.querySelector('#comment-input');
    var escape = document.createElement('textarea');
    var btnComment = document.querySelector('#buttonComment');

    btnComment.addEventListener('click', (e) => {
        let comment = document.querySelector('#comment-input').value;
        if (!comment || comment == "" || comment == undefined) {
            e.preventDefault();
        } else if (comment.length > 100) {
            let input = document.querySelector('#comment-input')
            input.value = ""
            input.placeholder = "Max 100 characters"
            e.preventDefault();
        } else {
            addComment();
        }
        e.preventDefault();
    })

    function escapeHTML(html) {
        escape.textContent = html;
        return escape.innerHTML;
    }

    window.onload = function (e) {
        commentMsg.scrollTop = commentMsg.scrollHeight;
        e.preventDefault();
    }

    function addComment() {
        const idMovie = $("#idMovie").text()
        const comment = $("#comment-input").val()
        axios.post(`/movies/single/:${idMovie}/comment`, {
            imdb: idMovie,
            comment: comment
        }).then((res) => {
            $("#comment-msg").
                append(`<li class="msg-content">${res.data.username}: ${escapeHTML(comment)}</li>`);
            commentInput.value = "";
            commentInput.focus();
            commentMsg.scrollTop = commentMsg.scrollHeight;
            console.log(res)
        })
    }
})()