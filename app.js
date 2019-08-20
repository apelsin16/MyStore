process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let express = require('express');
let mysql = require('mysql');
let app = express();
app.use(express.static('public'));


app.set("view engine", "pug");

app.use(express.json());

const nodemailer = require('nodemailer');

let con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '031215',
    database: 'market'
})

app.listen(3000, function() {
    console.log("serwer work on port 3000");
});

app.get('/', function (req, res) {
    let cat = new Promise(function (resolve, reject) {
        con.query('SELECT category FROM category',
            function (err, result) {
                if(err) return reject(err);
                resolve(result);
            }
        )
    })
    let laptop = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM goods WHERE category=1 ORDER BY RAND() LIMIT 3',
            function (err, result) {
                if (err) reject(err);
                resolve(result);
            }
        )
    })
    let phone = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM goods WHERE category=2 ORDER BY RAND() LIMIT 3',
            function (err, result) {
                if (err) reject(err);
                resolve(result);
            }
        )
    })
    Promise.all([cat, laptop, phone ]).then(function (value) {
        res.render('index', {
            cat: JSON.parse(JSON.stringify(value[0])),
            laptop: JSON.parse(JSON.stringify(value[1])),
            phone: JSON.parse(JSON.stringify(value[2]))
        })
    })
});

app.get('/cat', function (req, res) {
    console.log(req.query);
    let catId = req.query.id;


    let cat = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM category WHERE id='+catId,
                function (err, result) {
                    if (err) reject(err);
                    resolve(result);
                }
        )
    })

    let goods = new Promise(function(resolve, reject) {
        con.query(
            'SELECT * FROM goods WHERE category='+catId,
            function (err, result) {
                if (err) reject(err);
                resolve(result);
            }
        )
    })

    Promise.all([cat, goods]).then(function (value) {
        res.render('cat', {
            cat: JSON.parse(JSON.stringify(value[0])),
            goods: JSON.parse(JSON.stringify(value[1]))
        })
    })
})

app.get('/order', function (req, res) {
    res.render('order');
})

app.post('/finish-order', function(req, res) {
    console.log(req.body);
    if (req.body.key.length != 0){
        let key = Object.keys(req.body.key);
        console.log(key)
        con.query(
            'SELECT id, name, cost FROM goods WHERE id IN (' + key.join(',') + ')',
            function(err, result, fields) {
                if(err) throw err;
                console.log(result);
                sendMail(req.body, result).catch(console.error);
                console.log('1');
            }
        )
    } else {
        res.send('0');
    }
})

app.get('/goods', function (req, res) {
    con.query('SELECT * FROM goods WHERE id='+req.query.id, function (err, result, fields) {
        if (err) throw err;
        res.render('goods', { goods: JSON.parse(JSON.stringify(result))});
    })
})

app.post('/get-category-list', function (req, res) {
    con.query('SELECT id, category FROM category', function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    })
})

app.post('/get-goods-info', function (req, res) {
    if(req.body.key.length != 0) {


    con.query('SELECT id, name, cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function (err, result, fields) {
        if (err) throw err;
        let goods = {};
        for ( let i = 0; i < result.length; i++) {
            goods[result[i]['id']] = result[i];
        }
        res.json(goods);
    })
    } else {
       res.send('0');
    }
})

async function sendMail(data, result) {
    let res = `<h2>Order in MyStore</h2>`;
    let total = 0;
    for (let i = 0; i < result.length; i++){
        res += `<p>${result[i]['name']} - ${data.key[result[i]['id']]} - ${result[i]['cost']*data.key[result[i]['id']] }грн</p>`
        total = result[i]['cost']*data.key[result[i]['id']];        
    }
    res += 'br';
    res += `<p>${total}</p>`;
    res += 'br'+`<p>Username: ${data.username}</p>` ;
    res += 'br'+`<p>Phone: ${data.phone}</p>` ;
    res += 'br'+`<p>Email: ${data.email}</p>` ;
    res += 'br'+`<p>Address: ${data.address}</p>` ;
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass // generated ethereal password
        }
    });
    let myOptions = {
        from: '"MyStore" <apelsin16@gmail.com>', // sender address
        to: data.email, // list of receivers
        subject: 'Order ✔', // Subject line
        text: "Order", // plain text body
        html: res // html body
    }
    let info = await transporter.sendMail(myOptions);
    console.log("MessageSent: %s", info.messageId);
    console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info));
}


