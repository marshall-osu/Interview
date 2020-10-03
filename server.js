var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');
var db = new splite3.Database('Db/files.db');

app.use(express.static(__dirname + '/public'));

// routes
app.listen(3000, function(){
    console.log("Server is running on port 3000");
});

app.get('/files', function(request, response){
    console.log('GET request recieved at /files');
    db.all('SELECT * FROM comments', function(err, rows){
        if(err){
            console.log('Error: ', err);
        } else {
            response.send(rows);
        }
    });
});

app.post('/files', function(request, response){
    console.log('POST request recieved at /files');
});

app.delete('/files', function(request, response){
    console.log('DELETE request recieved at /files')
});