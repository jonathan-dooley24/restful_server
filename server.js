// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
const { json } = require('express');
//const { send } = require('process');

let db_filename = path.join(__dirname, 'stpaul_crime.sqlite3');

let app = express();
let port = 8000;

// Open usenergy.sqlite3 database
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);
    }
});

// GET request for CODES
app.get('/codes', (req,res) => {
    if(req.query.code){ //extra option for codes handled here
        let codes = req.query.code.split(",");
        let sql = "SELECT * FROM Codes WHERE code IN (";
        let code_values = [];
        for(let i = 0; i < codes.length; i++){
            code_values.push(parseInt(codes[i]));
            if(i == codes.length-1){
                sql += "?";
            }
            else{
                sql += "?, ";
            }
        }
        sql += ") ORDER BY Codes.code";
        db.all(sql, code_values, (err, rows) => {
            if(err){
                res.status(404).send("Error: Unable to gather Codes data");
            }
            else {
                res.status(200).type('json').send(rows);
            }
        });
    }
    else{ //for no extra options for codes added, default route handled here
        db.all("SELECT * FROM Codes ORDER BY Codes.code", (err, rows) => {
            if(err){
                res.status(500).send("Error: Unable to gather Codes data");
            }
            else {
                res.status(200).type('json').send(rows);
            }
        });
    }
});

// GET request for NEIGHBORHOODS
app.get('/neighborhoods', (req, res) => {
    console.log(req.query.id);
    if(req.query.id){ //extra option for neighborhood id handled here
        console.log("we in")
        let ids = req.query.id.split(",");
        let sql = "SELECT * FROM Neighborhoods WHERE neighborhood_number IN (";
        let id_values = [];
        for(let i = 0; i < ids.length; i++){
            id_values.push(parseInt(ids[i]));
            if(i == ids.length-1){
                sql += "?";
            }
            else{
                sql += "?, ";
            }
        }

        sql += ") ORDER BY Neighborhoods.neighborhood_number";
        db.all(sql, id_values, (err, rows) => {
            if(err || rows.length === 0) {
                res.status(500).send("Error: invalid neighborhood")
            } else {
                res.status(200).type('json').send(rows);
            }
        });
    } else {
        db.all('Select * FROM Neighborhoods Order By Neighborhoods.neighborhood_number', (err, rows) => {
            if(err || rows.length === 0) {
                res.status(500).send("Error")
            } else {
                res.status(200).type('json').send(rows);
            }
        });
    }
});

// GET request for INCIDENTS
app.get('/incidents', (req,res) => {
    db.all('SELECT * FROM Incidents ORDER BY Incidents.date_time DESC', (err, rows) => {
        if(err || rows.length === 0) {
            res.status(500).send("Error")
        }
        else{
            res.status(200).type('json').send(rows);
        }
    });
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});