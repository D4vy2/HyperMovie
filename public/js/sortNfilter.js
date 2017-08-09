(function () {
    var formSort = document.querySelector('#form-sort');
    var formFilter = document.querySelector('#form-filter');
    var filterName = document.querySelector('#filterName');
    var filterYear = document.querySelector('#filterYear');
    var filterGenre = document.querySelector('#filterGenre');
    var filterRating = document.querySelector('#filterRating');
    var selectSortBy = document.querySelector('#sort');

    selectSortBy.addEventListener('change', function (ev) {
        formSort.submit();
    })
    filterName.addEventListener('change', function (ev) {
        formFilter.submit();
    })
    filterDate.addEventListener('change', function (ev) {
        formFilter.submit();
    })
    filterGenre.addEventListener('change', function (ev) {
        formFilter.submit();
    })
    filterRating.addEventListener('change', function (ev) {
        formFilter.submit();
    })
})()