/*
 * Kraina ksiazek crawler Node app
 */
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const crawler = require("./app/crawler.js");
const storage = require("./app/storage.js");
const db = require("./app/models");
//@@@development = true; production = false
db.sequelize.sync(  { force: false }  ); //!!! In development, you may need to drop existing tables and re-sync database.

/*
var book = {category: 6, title: 'test'};
storage.storeBook(book)
	.then(data => {
		console.log('ok');
	})
	.catch(err => {
		console.log(err);
	});
*/

const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Kraina ksiazek crawler application." });
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Kraina ksiazek crawler is running on port ${PORT}.`);
  crawler.run(true); 
});



