var methodOverride = require('method-override');
var formidable = require('formidable');
var path = require('path');
var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('Db/files.db');
var helpers = require('./helpers');
var csv = require('fast-csv');
var fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


app.use(methodOverride('_method'))
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const rewrite = function(){
    const csvWriter = createCsvWriter({
        path: 'Documents.csv',
        header: [
          {id: 'name', title: 'Name'},
          {id: 'path', title: 'Path'},
          {id: 'category', title: 'Category'},
        ]
      });
    db.all('SELECT * FROM files', function(err, rows){
        if(err){
            console.log('Error: ' + err);
        } else {
            csvWriter.writeRecords(rows);
        }
    })
    
}

let counter = 0;
let csvStream = csv.parseFile("./Documents.csv", { headers: true })
    .on("data", function(record){
        csvStream.pause();
        db.all('SELECT * FROM files WHERE name = ? AND path = ? AND category = ?', [record.Name, record.Path, record.Category], function(err, rows){
            if(!rows){
                db.run('INSERT INTO files VALUES (?,?,?)', [record.Name, record.Path, record.Category]);
            }
            if(err){
                console.log('Error: ' + err);
            }
        })
        
        csvStream.resume();
    })

    // routes

app.get('/', function (request, response){
    response.render('File-Viewer.html');
});

app.listen(app.get('port'), function(){
    console.log("Server is running on port " + app.get('port') );
}).on("end", function(){
    console.log("Csv read done");
}).on("error", function(err){
    console.log('Error: ' + err);
});

app.get('/files', function(request, response){
    console.log('GET request recieved at /files');
    db.all('SELECT * FROM files', function(err, rows){
        if(err){
            console.log('Error: ', err);
        } else {
            response.send(rows);
        }
    });
});


app.post('/', function(req, res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        db.all('SELECT * FROM files WHERE name = ?', [fields.filename], function(err, rows){
            if(rows.length == 0) {
            var oldpath = files.file.path;
            var newpath = `\\public\\Docs\\${files.file.name}`;
            var htmlpath = `\\Docs\\${files.file.name}`;
           
            //Source : https://stackabuse.com/handling-file-uploads-in-node-js-with-expres-and-multer/ 
            //From here:
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.send(`<p>You have uploaded this file: ${files.file.name}<p><a href="./">Homepage</a>`);
                //To here
                
                console.log('POST request recieved at /files');
                //send file deal with it on the insert
                db.run('INSERT INTO files VALUES (?,?,?)', [fields.filename, htmlpath, fields.category], function(err){
                if(err){
                    console.log("Error: " + err);
                } else {
                    rewrite();
                }
                });
            });
            } else {
                res.send(`<p>You already have a file with this name: ${fields.filename}, please pick a different name<p><a href="./">Homepage</a>`);
            } 
        });
    });   
});

app.delete('/', function(req, res){
    db.all('SELECT * FROM files WHERE name = ?', [req.query.name], function(err, rows){
        if(err){
            console.log('Error: ' + err);
        }
        if(rows.length > 0){
            console.log('DELETE request recieved at /files')
            db.run('DELETE FROM files WHERE name = ?', [req.query.name]), function(err){
                if(err){
                  console.log("Error: " + err);
                }
            }
            rewrite();
            fs.unlink('public\\' + rows[0].path, function(err){
                if(err){
                    console.log("Error: "+ err);
                }
            })
            res.redirect(303, "./");
        } else {
            res.send("Didn't work try again, i =" + request.query.name + ", rows = " + rows);
        }
    })
    
});

