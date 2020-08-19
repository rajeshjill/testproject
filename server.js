var express = require("express")
var bodyParser = require("body-parser")
var morgan = require("morgan")
var nodetaskRouter = require('./routes/nodetask'); //router folder

var app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(nodetaskRouter);


app.use(function(req, res, next) {
    var err = new Error("not found");
    err.status(404);
    next(err)
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        err: {
            msg: "Oops somthing wrong in your Api"
        }
    })
})

//port listen
app.listen(3000, () => {
    console.log("server connected on port 3000 :...")
})