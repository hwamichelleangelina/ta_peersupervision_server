const mysql = require('mysql2');

// Koneksi ke MySQL
const mysqlConn = mysql.createConnection({
    host: 'bmxbqqk9rwqua9c5j7co-mysql.services.clever-cloud.com',
    user: 'u8gsfi6oxjcwhcws',
    password: 'OJiRLKJQbv2ZNILo7qZs',
    database: 'bmxbqqk9rwqua9c5j7co'
})

mysqlConn.connect(function (error) {
    if (error) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to MySQL database: peersupervision.');
    }

  // Jalankan perintah ALTER TABLE
  const query = `ALTER TABLE \`peersupervision\`.\`psusers\` 
                 CHANGE COLUMN \`psuadded\` \`psuadded\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error('An error occurred while executing the query:', error.stack);
      return;
    }
    console.log('Table altered successfully:', results);
  });

  // Jalankan perintah ALTER TABLE
  const bkuserquery = `ALTER TABLE \`peersupervision\`.\`bkusers\` 
                 CHANGE COLUMN \`bkuadded\` \`bkuadded\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`;

  connection.query(bkuserquery, (error, results, fields) => {
    if (error) {
      console.error('An error occurred while executing the query:', error.stack);
      return;
    }
    console.log('Table altered successfully:', results);
  });

  // Jalankan perintah ALTER TABLE
  const laporanquery = `ALTER TABLE \`peersupervision\`.\`laporan\` 
                 CHANGE COLUMN \`laporanadded\` \`laporanadded\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`;

  connection.query(laporanquery, (error, results, fields) => {
    if (error) {
      console.error('An error occurred while executing the query:', error.stack);
      return;
    }
    console.log('Table altered successfully:', results);
  });

  // Jalankan perintah ALTER TABLE
  const jadwalquery = `ALTER TABLE \`peersupervision\`.\`jadwal\` 
                 CHANGE COLUMN \`jadwaladded\` \`jadwaladded\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`;

  connection.query(jadwalquery, (error, results, fields) => {
    if (error) {
      console.error('An error occurred while executing the query:', error.stack);
      return;
    }
    console.log('Table altered successfully:', results);
  });

  // Jalankan perintah ALTER TABLE
  const dampinganquery = `ALTER TABLE \`peersupervision\`.\`dampingan\` 
                 CHANGE COLUMN \`dampinganadded\` \`dampinganadded\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP;`;

  connection.query(query, (error, results, fields) => {
    if (error) {
      console.error('An error occurred while executing the query:', error.stack);
      return;
    }
    console.log('Table altered successfully:', results);
  });

  // Tutup koneksi
  connection.end();
});

module.exports = mysqlConn;