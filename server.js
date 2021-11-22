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



// GET request for NEIGHBORHOODS
app.get('/neighborhoods', (req, res) => {
    
    db.all('Select * FROM Neighborhoods ORDER BY Neighborhoods.neighborhood_number', (err, rows) => {
        if(err || rows.length === 0) {
            res.status(404).send("Error")
        } else {
            let response = '[\n'
            let count = 0;
            let length = rows.length;
            rows.every(rows => {
                if(count === length -1) {
                    response += '{';
                    response += '"id": ' + rows.neighborhood_number + ', ';
                    response += '"name": ' + '"' + rows.neighborhood_name + '"';
                    response += '}\n'
                    return false;
                }
                response += '{';
                response += '"id": ' + rows.neighborhood_number + ', ';
                response += '"name": ' + '"' + rows.neighborhood_name + '"';
                response += '},\n'
                count = count + 1;

                return true;
            });
            response += ']';
            res.status(200).type('json').send(response);
        }
    });
});



// GET request for INCIDENTS
app.get('/incidents', (req,res) => {
    db.all('SELECT * FROM Incidents ORDER BY Incidents.date_time DESC', (err, rows) => {
        if(err){
            res.status(404).send("Error: Unable to gather INCIDENT data");
        }
        else{
            if(rows.length ==0){
                res.status(404).send('Error: No results for query');
            }
            else{
                let response = '[\n';
                rows.forEach(row => {
                    response += '   {\n';
                    response += '       "case_number":"' + row.case_number + '",\n';
                    response += '       "date":"' + row.date_time.slice(0, 9) + '",\n';
                    response += '       "time":"' + row.date_time.slice(11, 23) + '",\n';
                    response += '       "code":"' + row.code + '",\n';
                    response += '       "incident":"' + row.incident + '",\n';
                    response += '       "police_grid":"' + row.police_grid + '",\n';
                    response += '       "neighborhood_number":"' + row.neighborhood_number + '",\n';
                    response += '       "block":"' + row.block + '",\n';
                    response += '   },\n'
                });
                response += ']';
                res.status(200).type('json').send(response);
            }
        }
    });
});

app.get('/codes', (req,res) => {
    db.all('SELECT * FROM Codes ORDER BY Codes.code DESC', (err, rows) => {
        if(err){
            res.status(404).send("Error: Unable to gather Codes data");
        }
        else {
            if(rows.length ==0){
                res.status(404).send('Error: No results for query');
            }
            else {
                let response = '[\n';
                rows.forEach(row => {
                    response += '  {"code": ' + row.code + ', "type": "' + row.incident_type + '"},';
                });
                response += '\n]';
                res.status(200).type('json').send(response);
            }
        }
    });
});
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});