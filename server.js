const express = require('express')
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 8085;
const bcrypt = require('bcrypt')
const saltRounds = 10;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const path = require('path');
const app = express();
const session = require('express-session'); // @beapen
const cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
function isEmpty(strIn) {
    if (strIn === undefined) {
      return true;
    } else if (strIn == null) {
      return true;
    } else if (strIn == "") {
      return true;
    } else {
      return false;
    }
}
require('dotenv').config();

// app.get('/', function(req,res){
//     res.send("Welcome to EHealth typingDNA App");
// });

app.post('/register', function(req, res){
    // check to make sure none of the fields are empty
    if( isEmpty(req.body.name)  || isEmpty(req.body.email) || isEmpty(req.body.company_name) || isEmpty(req.body.original_pattern) || isEmpty(req.body.password) ){
        return res.json({
            'status' : false,
            'message' : 'All fields are required'
        });
    }
    // any other intendend checks
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        let db = new sqlite3.Database("./database/ehealthApp.db");
        let sql = `INSERT INTO users(name,email,company_name, original_pattern, password) VALUES('${
          req.body.name
        }','${req.body.email}','${req.body.company_name}','${req.body.original_pattern}','${hash}')`;
        db.run(sql, function(err) {
          if (err) {
            throw err;
          } else {
            return res.json({
              status: true,
              message: "User Created"
            });
          }
        });
        db.close();
    });
});

app.get("/", function(req, res) {
  res.render('login', { error: false });
});

app.get("/register", function(req, res) {
  res.render('register', { error: false });
});
app.post("/", function(req, res) {
    let db = new sqlite3.Database("./database/ehealthApp.db");
    let sql = `SELECT * from users where email='${req.body.email}'`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      db.close();
      if (rows.length == 0) {
        return res.json({
          status: false,
          message: "Sorry, wrong email"
        });
      }
      let user = rows[0];
      let authenticated = bcrypt.compareSync(req.body.password, user.password);
      delete user.password;
      if (authenticated) {

        // typingdna starts
        var https = require('https');
        var querystring = require('querystring');
        var base_url = 'api.typingdna.com';
        var apiKey = process.env.APIKEY;
        var apiSecret = process.env.APISECRET;
        var data = {
            tp1 : user.original_pattern,
            tp2 : req.body.original_pattern,
            quality : 2,
        }

        console.log(data);

        var options = {
            hostname : base_url,
            port : 443,
            path : '/match',
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
                'Authorization': 'Basic ' + new Buffer(apiKey + ':' + apiSecret).toString('base64'),
            },
        };

        var responseData = '';
        var req2= https.request(options, function(res2) {
            res2.on('data', function(chunk) {
                responseData += chunk;
                typingdata = JSON.parse(responseData);
                var today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                var yyyy = today.getFullYear();

                today = mm + '/' + dd + '/' + yyyy;
                // create invoice
                let db = new sqlite3.Database("./database/ehealthApp.db");
                let sql = `INSERT INTO patterns(entry_date ,user_email, compare_pattern,net_score) VALUES(
                '${today}',
                '${req.body.email}',
                '${req.body.original_pattern}',
                ${typingdata.net_score}
                )`;
                db.serialize(function() {
                    db.run(sql, function(err) {
                      if (err) {
                        throw err;
                      }
                    });
                });
            });

            res2.on('end', function() {
                console.log(JSON.parse(responseData));
            });
        });

        req2.on('error', function(e) {
            console.error(e);
        });
        req2.write(
            querystring.stringify(data)
        );
        req2.end();
        // typingdna ends
        return res.json({
          status: true,
          user: user,
          compare: req.body.original_pattern,
          response: responseData
        });
      }else{
        return res.json({
          status: false,
          message: "Wrong Password, please retry"
        });
      }
    });
});



app.get("/patterns/user/:user_email", multipartMiddleware, function(req, res) {
    let db = new sqlite3.Database("./database/ehealthApp.db");
    let sql = `SELECT * FROM patterns WHERE user_email='${req.params.user_email}'`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      return res.json({
        status: true,
        patterns: rows
      });
    });
});

app.listen(PORT, function(){
    console.log(`App running on localhost:${PORT}`);
});