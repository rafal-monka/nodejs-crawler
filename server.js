/*
 * Kraina ksiazek crawler Node app
 */
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
// const initDatabase = require('./config/database')

// const remotedb = require("./app/remotedb.js");
// const mongodb = require("./app/mongodb.js");

const crawler = require("./app/crawler.js");
// const storage = require("./app/storage.js");

// const kk_check_code = require("./app/kk_check_code.js");

// const vgcrawler = require("./app/vggallery-crawler.js");
// const vgstorage = require("./app/vggallery-storage.js");

//const aol = require("./app/analizy-online-crawler.js");
// const aol2 = require("./app/analizy-online-crawler2.js");

const mp3 = require("./app/my-free-music-crawler.js");

// const pimpmylashes = require("./app/pimpmylashes-crawler.js");
// const podocenter = require("./app/podocenter-crawler.js");
// const poznanpodolog = require("./app/poznan-podolog-crawler.js");

// const db = require("./app/models-NEW");

//@@@development = true; production = false
// db.sequelize.sync(  { force: false }  ); //!!! In development, you may need to drop existing tables and re-sync database.


const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Crawler application." });
});

app.get("/aol", (req, res) => {
    aol2.run_lists()
    res.json({ message: "Welcome to AOL Crawler application." });
});

app.get("/mp3scan", (req, res) => {
    mp3.run_scan()
    res.json({ message: "Welcome to my free music MP3 scan crawler application." });
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


//------------------------AOL
//aol.run_lists()

//mongo db
//initDatabase()

//------------------------------------- pimpmylashes
//pimpmylashes.update_properties()
//pimpmylashes.saveToFiles()
//return
//load data
// setTimeout(
//     ()=>pimpmylashes.run_lists(),
//     3000
// )


//------------------------------------- podocenter
// podocenter.run_lists()


//------------------------------------- poznan-podolog
//poznanpodolog.run_lists()



//kk_check_code.scan(); //
 
// remotedb.select();
// mongodb.test();

// vgcrawler.run_lists();
// vgcrawler.run_download();

// vgstorage.test();
// vgcrawler.testPage();
//crawler.run(true);
// crawler.runCount(); 


// vggalleryPictures.update({description: 'test'}, {
// 	where: { id: 44 }
//   })


