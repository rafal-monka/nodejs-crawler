require('dotenv').config();
const mysql = require("mysql2");

const getConnectionPool = () => {
    var pool = mysql.createPool({
      connectionLimit : 3,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    return pool;
  }

  const getConnectionPoolRemote = () => {
    var pool = mysql.createPool({
      connectionLimit : 3,
      host: 'mysql.cloudaccess.host',
      port: 3306,
      user: 'mexugnth',
      password: 'Qs447hn2m-Z(AS',
      database: 'mexugnth'
    });
    return pool;
  }

exports.select = ()=> {
    console.log('remotedb.select');
    try {
        //connect to the database
        let pool = getConnectionPoolRemote();    
        console.log('remotedb.select.getConnectionPool');     
        pool.query("SELECT NOW() as czas, t.* from test t", [], function(error, data, fields) {
            if (error) throw error;    
            const results = JSON.parse(JSON.stringify(data));
            console.log("results", results);  
            return results;          
        });
    } catch (e) {
        console.log(e.toString());
    }  
}

