const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://user1:rafal@cluster0-ehwmc.mongodb.net/test?retryWrites=true&w=majority"; 

exports.test = () => {
    console.log('mongo.test');
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect(err => {
        if (err) throw err;
        const collection = client.db("memory").collection("words");
        // perform actions on the collection object
        console.log('collection.count()');
        collection.countDocuments( function(err,countData){
            client.close();
            if (err) throw err;
            console.log('countData', countData);            
        })
    });
}


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://user1:<password>@cluster0-ehwmc.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });
