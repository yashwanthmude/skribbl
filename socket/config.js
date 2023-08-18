const mysql = require("mysql2");
const config=mysql.createConnection({
    host: "sql6.freesqldatabase.com",
    user: "sql6454415",
    password: "2Hn5ZTiawD",
    database: 'sql6454415',
    // options:{
    //     trustServerCertificate: true,
    //     trustConnection : false,
    //     enableArithAbort: true,
    //     instancename: 'SQLEXPRESS'
    // },
    port: 3306
});

// config.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//   });
module.exports = config;