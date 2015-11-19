var express = require('express');
var app = express();
var http = require('http');


function pgClient() {
    var pg = require('pg');
    var connectionString = process.env.DATABASE_URL || 'postgres://qa_hello:qa_hello_password@localhost:5432/qa_hello_db';
    var client = new pg.Client(connectionString);
    client.connect(function(err) { if(err) { console.log('DB connection error: ', err); }});
    return client;
}


function getDataFromDB(callback) {
    var client = pgClient();
    var query = pgClient().query("SELECT name FROM data ORDER BY name", function(err, result) {
        if(err){ callback(err); }
    });
    var names = '';
    query.on('row', function(row) {
        names += (((names == '') ? '' : ', ') + row['name']);
    });
    query.on('end', function() {
        callback(names);
    });
}

function getDataFromWeb(callback) {
    var options = {
      host: 'localhost',
      path: '/',
      port: '3000'
    };
    var req = http.request(options, function(response) {
        var data = ''
        response.on('data', function (chunk) { data += chunk; });
        response.on('end', function () { callback(data); });
    });
    req.on('error', function(err) { callback(err); });
    req.end();
}

app.use('/', function(req, res) {
    getDataFromDB(function(data_db) {
        getDataFromWeb(function(data_web) {
            res.send('<html><head><title>QA Hello</title></head><body><div id="db">'+data_db+'</div><div id="web">'+data_web+'</div></body></html>\n');
        });
    });
});

var port = 80;
app.listen(port, function() {
    console.log('listening on port ', port);
});
