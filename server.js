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
app.get('/codes/:code', (req,res) => {
    db.all('SELECT * FROM Codes WHERE code=? ORDER BY Codes.code', [req.params.code], (err, rows) => {
        if(err){
            res.status(404).send("Error: Unable to gather Codes data");
        }
        else {
            res.status(200).type('json').send(rows);
        }
    });
});

// GET request for NEIGHBORHOODS
app.get('/neighborhoods', (req, res) => {
    
    db.all('Select * FROM Neighborhoods ORDER BY Neighborhoods.neighborhood_number', (err, rows) => {
        if(err || rows.length === 0) {
            res.status(500).send("Error")
        } else {
            res.status(200).type('json').send(rows);
        }
    });
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