const db = require("./models-OLD/index.js");
const AOL = db.AOL;

exports.storeFund = async (fund)=> {
    console.log('storage.storeFund');

    //Save fund in the database
    return await AOL.create(fund);  
}