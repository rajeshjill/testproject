var express = require("express")
var bodyParser = require("body-parser")
var mysql = require('mysql') // npm install mysql
var config = require("../config/dbconfig.json")
var jwt = require("jsonwebtoken")


var router = express.Router()

router.use(express.json());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


//connection for mysql
var connection = mysql.createConnection({
    host: config.localhost,
    user: config.username,
    password: config.password,
    database: config.database,
});
connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

//jwt with node
router.post('/testjwt', function(req, res) {
    console.log("req for jwt is", req.body)
    jwt.sign({ name: req.body.name }, 'my_secret_key', function(err, token) {
        if (err) {
            console.log("err---in jwt", err)
        } else {
            res.json({ "token is": token });
        }
    });
});

//jwt verify 
router.get('/nodejwtverify', ensureToken, function(req, res) {
    jwt.verify(req.token, 'my_secret_key', function(err, tokenData) {
        if (err) {
            console.log("err---in jwt", err)
            res.sendStatus(403);
        } else {
            res.json({ "tokenData is": tokenData });
        }
    });
});

function ensureToken(req, res, next) {
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader != "undefined") {
        var bearer = bearerHeader.split(" ");
        var bearerToken = bearer[1];
        req.token = bearerToken;
        console.log("req.token--", req.token)
        next();
    } else {
        res.sendStatus(403);
    }
}
//end jwt verify


//show all data's
router.get('/node', async(req, res) => {
    try {
        var queryString = "SELECT * FROM nodetask";
        connection.query(queryString, function(err, rows, fields) {
            if (err) {
                res.sendStatus(403)
            } else {
                console.log("rows->", rows);
                res.json(rows);
            }
        })
    } catch (err) {
        console.log("err handing")
        res.send('Error get' + err);
    }
})

//add new data to table in database
router.post('/add_new', async(req, res) => {
    try {
        const firstname = req.body.fname;
        const lastname = req.body.lname;
        const queryString = "INSERT INTO nodetask( firstname , lastname) VALUES(?,?)";
        connection.query(queryString, [firstname, lastname], function(err, data, fields) {
            if (err) {
                res.sendStatus(403)
            } else {;
                console.log("rows->", data.insertId);
                res.json(data);
            }
        })
    } catch (err) {
        res.send('Error get' + err);
    }
});

//get table data by id
router.get('/node/:id', async(req, res) => {
    try {
        const id = req.params.id
        var queryString = "SELECT * FROM nodetask WHERE id = ?";
        connection.query(queryString, [id], function(err, rows, fields) {
            if (err) {
                res.sendStatus(403)
            } else {
                if (rows.length == 0) {
                    res.json({
                        err: {
                            msg: "Oops somthing wrong in your Api"
                        }
                    })

                } else {
                    console.log("rows->", rows);
                    res.json(rows);
                }
            }
        })
    } catch (err) {
        res.send('Error get' + err);
    }
});



//update record by id
router.put('/node/update/:id', function(req, res) {
    var id = req.params.id;
    var fname = req.body.firstname;
    var lname = req.body.lastname;
    var queryString = "UPDATE nodetask SET firstname = ? , lastname= ? WHERE id = ?";
    connection.query(queryString, [fname, lname, id], function(err, rows, fields) {
        if (err) {
            res.sendStatus(403)
        } else {
            console.log("rows->", rows);
            res.json(rows);
        }
    })
});

//delete table row by name
router.delete('/node/:name', function(req, res) {
    const name = req.params.name
    console.log("name is -----> ", name)
    var queryString = "DELETE from nodetask WHERE firstname = ?";
    connection.query(queryString, [name], function(err, rows, fields) {
        if (err) {
            res.sendStatus(403)
        } else {;
            console.log("rows->", rows);
            res.json(rows);
        }
    })
});

module.exports = router;