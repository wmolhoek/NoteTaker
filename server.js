const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get("/api/notes", (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        res.send(JSON.parse(data))
    });
});

app.post("/api/notes", (req, res) => {
    //grab new note to write
    const newNote = req.body;
    //get the file
    const db = fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        //parse the JSON
        const dbJson = JSON.parse(data);
        const lastNote = Object.values(dbJson[dbJson.length - 1]);
        const val = parseInt(lastNote[2]) + 1;
        //build new object
        const newID = { id: val };
        const fullNote = Object.assign(newNote, newID);
        //add the new content to the file
        dbJson.push(fullNote);
        //convert content back to a string
        const dbStr = JSON.stringify(dbJson);
        //write the content back to the file
        fs.writeFile('./db/db.json', dbStr, err => {
            if (err) throw err;
            res.send(JSON.parse(dbStr));
        });
    });
});

app.delete("/api/notes/:id", (req, res) => {
    //get the file
    const db = fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) throw err;
        //parse the JSON
        const dbJson = JSON.parse(data);
        //find the note with req.params.id and splice it
        dbJson.forEach((element, index) => {
            if (parseInt(element.id) === parseInt(req.params.id)){
                dbJson.splice(index, 1);
            }
        });
        //convert content back to a string
        const dbStr = JSON.stringify(dbJson);
        //write the content back to the file
        fs.writeFile('./db/db.json', dbStr, err => {
            if (err) throw err;
            res.send(JSON.parse(dbStr));
        });
    });

});

app.listen(PORT, () => {
    console.log("App listening on PORT " + PORT);
});
