const dbConfig = require("../config/db-config");
const db = require("./models");
const vggalleryPictures = db.vggallery;

exports.select = async ()=> {
    console.log('storage.select');
    try {
        //connect to the database
        let pool = dbConfig.getConnectionPool();         
        await pool.promise().query("SELECT * FROM `vggalleries` where id in (1,126,190)", [], function(error, data, fields) {
            if (error) throw error;    
            const results = JSON.parse(JSON.stringify(data));
            //console.log("results", results);  
            return results;          
        });
    } catch (e) {
        console.log(e.toString());
    }  
}

exports.storeVggalleryPicture = async (picture)=> {
    //console.log('storage.storeBook');

    //Save book in the database
    return await vggalleryPictures.create(picture);  
}