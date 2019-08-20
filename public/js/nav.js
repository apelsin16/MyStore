document.querySelector('.close-nav').onclick = closeNav;
document.querySelector('.show-nav').onclick = showNav;

function showNav() {
    document.querySelector('.site-nav').style.left = '0';
}

function closeNav() {
    document.querySelector('.site-nav').style.left = '-300px';
}

function getCategoryList() {
    fetch('/get-category-list', {
        method: 'POST'
    })
    .then(function(response){
        return response.text();
    })
    .then(function (body) {
         showCategoryList(JSON.parse(body));
    })
}

function showCategoryList(data) {
    let out = '<ul><li><a href="/">Main</a></li>';
    for (let i = 0; i < data.length; i++ ) {
        out += `<li><a href="/cat?id=${data[i]['id']}">${data[i]['category']}</a></li>`;
    }
    out += '</ul>';
    document.querySelector('#category-list').innerHTML = out;
}

getCategoryList();
