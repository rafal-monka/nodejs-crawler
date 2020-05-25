/*
 * Kraina ksiazek crawler Node app
 */
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const crawler = require("./app/crawler.js");
const storage = require("./app/storage.js");

const vgcrawler = require("./app/vggallery-crawler.js");
const vgstorage = require("./app/vggallery-storage.js");

const db = require("./app/models");

//@@@development = true; production = false
db.sequelize.sync(  { force: false }  ); //!!! In development, you may need to drop existing tables and re-sync database.


const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Crawler application." });
});

app.get("/test/", (req, res) => {
    let http = require('http');
    let fs = require('fs');

    fs.readFile('./app/download/test.html', null, function (error, data) {
        if (error) {
            res.writeHead(404);
            res.write('Whoops! File not found!');
        } else {
			res.writeHead(200, {
				'Content-Type': 'text/html'
			});
			res.write(data);
        }
        res.end();
    });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Crawler is running on port ${PORT}.`);
});


vgcrawler.run_lists();
// vgcrawler.run_download();

// vgstorage.test();
// vgcrawler.testPage();
// crawler.run(true);
// crawler.runCount(); 


// vggalleryPictures.update({description: 'test'}, {
// 	where: { id: 44 }
//   })


