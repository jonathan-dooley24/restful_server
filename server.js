// Built-in Node.js modules
let fs = require('fs');
let path = require('path');
// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');
let cors = require('cors');

const { json } = require('express');

let db_filename = path.join(__dirname, 'stpaul_crime.sqlite3');
let app = express();
let port = 8000;

app.use(cors());
app.use(express.json());

// Open database
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {       //READWRITE!
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
            if(err || rows.length === 0){
                res.status(404).send("Error: Unable to gather Codes data");
            }
            else {
                res.status(200).type('json').send(rows);
            }
        });
    }
    else{ //for no extra options for codes added, default route handled here
        db.all("SELECT * FROM Codes ORDER BY Codes.code", (err, rows) => {
            if(err || rows.length === 0){
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
    if(req.query.id){ //extra option for neighborhood id handled here
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
    let sql = "SELECT case_number, date(date_time) AS date, time(date_time) AS time, code, incident, police_grid, neighborhood_number, block FROM Incidents WHERE ";
    let options = [];
    if(req.query.start_date){ //extra option for start date
        if(options.length > 0){//use options.length to know whether to add 'AND' to sql query
            sql += " AND "
        }
        let start = req.query.start_date + "T00:00:00"; //looks like 2019-11-24T00:00:00
        sql += "date_time>=?";
        options.push(start);
    }
    if(req.query.end_date){ //extra option for end date
        if(options.length > 0){
            sql += " AND "
        }
        let end = req.query.end_date + "T23:59:59";
        sql += "date_time<=?";
        options.push(end);
    }
    if(req.query.code){ //extra option for codes
        if(options.length > 0){
            sql += " AND "
        }
        let codes = req.query.code.split(",");
        sql += "code IN (";
        for(let i = 0; i < codes.length; i++){
            options.push(parseInt(codes[i]));
            if(i == codes.length-1){
                sql += "?";
            }
            else{
                sql += "?, ";
            }
        }
        sql+= ")";
    }
    if(req.query.neighborhood){ //extra option for neighborhoods handled here
        if(options.length > 0){
            sql += " AND "
        }
        let hoods = req.query.neighborhood.split(",");
        sql += "neighborhood_number IN (";
        for(let i = 0; i < hoods.length; i++){
            options.push(parseInt(hoods[i]));
            if(i == hoods.length-1){
                sql += "?";
            }
            else{
                sql += "?, ";
            }
        }
        sql+= ")";
    }
    if(req.query.grid){ //extra option for police grids handled here
        if(options.length > 0){
            sql += " AND "
        }
        let grids = req.query.grid.split(",");
        sql += "police_grid IN (";
        for(let i = 0; i < grids.length; i++){
            options.push(parseInt(grids[i]));
            if(i == grids.length-1){
                sql += "?";
            }
            else{
                sql += "?, ";
            }
        }
        sql+= ")";
    }
    if(req.query.limit && req.query.limit != 0){ //extra option for limit handled here
        sql += " LIMIT " + req.query.limit;
    }
    //add sorting/ordering
    sql += " ORDER BY Incidents.date_time DESC"

    //db query for case where some parameters included in GET
    if(options.length > 0){
        db.all(sql, options, (err, rows) => {
            if(err) {
                res.status(500).send("Error: invalid incident query")
            } else {
                res.status(200).type('json').send(rows);
            }
        });
    }
    else{ //case handling for no optional parameters included in GET
        db.all("SELECT * FROM Incidents ORDER BY Incidents.date_time DESC", (err, rows) => {
            if(err || rows.length === 0) {
                res.status(500).send("Error: invalid incident query")
            } else {
                res.status(200).type('json').send(rows);
            }
        });
    }
});

app.put("/new-incident", (req, res) => {
    if(!req.body.case_number || !req.body.date || !req.body.time || !req.body.code || !req.body.incident || !req.body.police_grid || !req.body.neighborhood_number || !req.body.block){
        res.status(500).send("Error: Missing arguments. Double-check case_number, date, time, code, incident, police_grid, neighborhood_number, and block");
    }
    else{
        let sql = "INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES (?, ?, ?, ?, ?, ?, ?)";
        let values = [req.body.case_number, (req.body.date + "T" + req.body.time), parseInt(req.body.code), req.body.incident, parseInt(req.body.police_grid), parseInt(req.body.neighborhood_number), req.body.block];
        db.run(sql, values, (err) => {
            if(err){
                res.status(500).send("Error: invalid insertion into Incidents table. Please ensure that case_number is unique.");
            }
        });
    }
});

//Delete by code
app.delete('/remove-incident', (req,res) => {
    if(req.body.case_number){
        let case_number = req.body.case_number;
        let sql = "SELECT * FROM Incidents WHERE case_number=" + case_number;
        db.all(sql, (err, rows) => {
            if(err || rows.length === 0){
                res.status(500).send("Error: Case Number " + case_number + " not avaible to delete");
            }
            else {
                db.run("DELETE FROM Incidents WHERE case_number=" + case_number, (err, rows) => {
                    if(err){
                        res.status(500).send("Error: Case Number " + case_number + " not avaible to delete");
                    }
                    else {
                        db.all(sql, (err, rows) => {
                            if(rows.length === 0){
                                res.status(200).send("Successful: Case Number " + case_number + " was deleted");
                            }
                            else {
                                res.status(500).send("Error: Case Number " + case_number + " not deleted");
                            }
                        });
                    }
                });

            }
        });
    }
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});