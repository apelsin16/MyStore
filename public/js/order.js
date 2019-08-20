document.querySelector('#form').onsubmit = function(event) {
    event.preventDefault();
    let username = document.querySelector('#username').value.trim();
    let phone = document.querySelector('#phone').value.trim();
    let email = document.querySelector('#email').value.trim();
    let address = document.querySelector('#address').value.trim();

    if (username == '' || phone == '' || email == ''|| address == '' ) {
        console.log('Не заполнены поля');

    }

    fetch('/finish-order', {
        method: "POST",
        body: JSON.stringify({
            username,
            email,
            address,
            phone,
            key: JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(function(response) {
        return response.text()
    })
    .then(function(body) {
        if(body == '1') {
            console.log(body);
        } else {
            console.log("Body not equally");
        }
    })
}