require('dotenv').config();
const mysql = require("mysql2");

const dbConnectionPool = () => {
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

module.exports = {
    getConnectionPool: dbConnectionPool,
    DB_HOST: process.env.DB_HOST,
    options: {
        port: process.env.DB_PORT
    },
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,    
    dialect: "mysql",
    dialectOptions: { 
      charset: "utf8", 
      collate: "utf8_polish_ci" 
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };