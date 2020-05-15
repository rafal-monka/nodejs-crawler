const dbConfig = require("../config/db-config");
const db = require("./models");
const Books = db.books;

exports.test = ()=> {
    console.log('storage.test');
    try {
        //connect to the database
        let pool = dbConfig.getConnectionPool();         
        pool.query("SELECT NOW() as czas, count(*) from books", [], function(error, data, fields) {
            if (error) throw error;    
            const results = JSON.parse(JSON.stringify(data));
            console.log("results", results);            
        });
    } catch (e) {
        console.log(e.toString());
    }  
}

exports.storeBook = async (book)=> {
    //console.log('storage.storeBook');

    //Save book in the database
    return await Books.create(book);  
}