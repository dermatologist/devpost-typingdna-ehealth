const express = require('express')
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 8085;
const bcrypt = require('bcrypt')
const saltRounds = 10;
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// function isEmpty(strIn) {
//     if (strIn === undefined) {
//       return true;
//     } else if (strIn == null) {
//       return true;
//     } else if (strIn == "") {
//       return true;
//     } else {
//       return false;
//     }
// }

app.get('/', function(req,res){
    res.send("Welcome to EHealth typingDNA App");
});

app.post('/register', function(req, res){
    // check to make sure none of the fields are empty
    if( isEmpty(req.body.name)  || isEmpty(req.body.email) || isEmpty(req.body.company_name) || isEmpty(req.body.password) ){
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
        }','${req.body.email}','${req.body.company_name}','${hash}')`;
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

app.post("/login", function(req, res) {
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
        return res.json({
          status: true,
          user: user
        });
      }
      return res.json({
        status: false,
        message: "Wrong Password, please retry"
      });
    });
});

app.post("/patterns", multipartMiddleware, function(req, res) {
    // validate data
    if (isEmpty(req.body.name)) {
      return res.json({
        status: false,
        message: "Pattern needs a name"
      });
    }
    // perform other checks
    // create invoice
    let db = new sqlite3.Database("./database/ehealthApp.db");
    let sql = `INSERT INTO patterns(name,user_id,compare_pattern,net_score) VALUES(
    '${req.body.name}',
    '${req.body.user_id}',
    0
    )`;
    db.serialize(function() {
        db.run(sql, function(err) {
          if (err) {
            throw err;
          }
          return res.json({
            status: true,
            message: "Record created"
            });
        });
    });
});

app.get("/patterns/user/:user_id", multipartMiddleware, function(req, res) {
    let db = new sqlite3.Database("./database/ehealthApp.db");
    let sql = `SELECT * FROM patterns WHERE user_id='${req.params.user_id}'`;
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