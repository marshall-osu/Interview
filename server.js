//delete from html form
const methodOverride = require('method-override');
//file reading
const formidable = require('formidable');
const path = require('path');
//express
const express = require('express');
const app = express();
//using flash messages
const cookie = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
//sqlite database
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('Db/files.db');
//helper methods (sourced)
const helpers = require('./helpers');
//csv editing
const csv = require('fast-csv');
//general file editing
const fs = require('fs');
const { report } = require('process');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//setting up everything else
app.use(cookie('p1a2s3s4w5o6r7d8'));
app.use(session({
    secret: 'p1a2s3s4w5o6r7d8',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000}}));
app.use(flash());
app.use(methodOverride('_method'))
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//writes to csv for updates
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

//reads in csv and puts anything not into the database into it
let counter = 0;
let csvStream = csv.parseFile("Documents.csv", { headers: true })
    .on("data", function(record){
        csvStream.pause();
        db.all('SELECT * FROM files WHERE name = ? AND path = ? AND category = ?', [record.Name, record.Path, record.Category], function(err, rows){
            if(rows.length == 0){
                db.run('INSERT INTO files VALUES (?,?,?)', [record.Name, record.Path, record.Category]);
            }
            if(err){
                console.log('Error: ' + err);
            }
            console.log(record.Name + ", " + record.Path + ", " + record.Category);
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
    db.all('SELECT * FROM files ORDER BY name', function(err, rows){
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
        db.all('SELECT * FROM files WHERE path = ?', [`.\\Docs\\${fields.category}\\${files.file.name}`], function(err, rows){
            if(rows.length == 0) {
            var oldpath = files.file.path;
            var newpath = `.\\public\\Docs\\${fields.category}\\${files.file.name}`;
            var htmlpath = `.\\Docs\\${fields.category}\\${files.file.name}`;
            if(!fs.existsSync(`.\\public\\Docs\\${fields.category}`)){
                fs.mkdirSync(`.\\public\\Docs\\${fields.category}`)
            }

            //Source : https://stackoverflow.com/questions/37153666/error-exdev-cross-device-link-not-permitted-rename-tmp-on-ubuntu-16-04-lts
            fs.readFile(oldpath, function (err, data) {
                if (err) throw err;
                console.log('File read!');
    
                // Write the file
                fs.writeFile(newpath, data, function (err) {
                    if (err) throw err;
                    console.log('File written!');
                });

                db.run('INSERT INTO files VALUES (?,?,?)', [fields.filename, htmlpath, fields.category], function(err){
                    if(err){
                        console.log("Error: " + err);
                    } else {
                        rewrite();
                    }
                });
    
                // Delete the file
                fs.unlink(oldpath, function (err) {
                    if (err) throw err;
                    console.log('File deleted!');
                });

                req.flash('success', 'File successfully uploaded');
                res.redirect('/');
            });
            } else {
                req.flash('failure', 'Error uploading file!');
                res.redirect('/');
            } 
        });
    });   
});

app.delete('/', function(req, res){
    db.all('SELECT * FROM files WHERE path = ?', [req.query.path], function(err, rows){
        if(err){
            console.log('Error: ' + err);
        }
        if(rows.length > 0){
            console.log('DELETE request recieved at /files')
            db.run('DELETE FROM files WHERE path = ?', [req.query.path]), function(err){
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
            var folder = `public\\Docs\\${rows[0].category}`;
            if(fs.readdirSync(folder).length == 0){
                fs.rmdirSync(folder);
            }
            req.flash('success', 'File successfully deleted');
            res.redirect('/');
        } else {
            req.flash('failure', 'Error deleting file!');
            res.redirect('/');
        }
    })
    
});

