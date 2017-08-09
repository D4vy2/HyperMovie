(function() {
    var formTarget = document.querySelector('#form-target');
    var targetBtn = document.querySelector('#target');
    var searchBtn = document.querySelector('#search-btn');

    targetBtn.addEventListener('click', (e) => {
        let inputSearch = document.querySelector('#searchInput').value.trim();
        if (!inputSearch || inputSearch === undefined || inputSearch === "") {
            e.preventDefault();
        } else if (inputSearch.length > 100) {
            document.querySelector('#searchInput').placeholder = "30 characteres max";
            document.querySelector('#searchInput').value = "";
            e.preventDefault();
        } else {
            document.querySelector('#target-input').value = inputSearch;
            formTarget.submit();
        }
    }, false)

    searchBtn.addEventListener('click', (e) => {
        let inputSearch = document.querySelector('#searchInput').value.trim();
        if (!inputSearch || inputSearch === undefined || inputSearch === "" || inputSearch.length < 3 || inputSearch.length > 30) {
            document.querySelector('#searchInput').style.border = "3px solid salmon";
            document.querySelector('#searchInput').placeholder = "3 - 30 characters";
            document.querySelector('#searchInput').value = "";
            e.preventDefault();
        }
    }, false)
})()
