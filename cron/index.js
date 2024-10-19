const cron = require('node-cron');
const db = require("../lib/db"); // Pastikan db menggunakan pool koneksi

// Menghapus token dari database setiap hari pada jam 3 pagi
cron.schedule('0 3 * * *', () => {
  const sql = `DELETE FROM users WHERE token < NOW()`; // Contoh, sesuaikan dengan schema database Anda

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return;
    }
    
    connection.query(sql, (err, result) => {
      if (err) {
        console.error("Error deleting expired tokens:", err);
      } else {
        console.log("Expired tokens deleted");
      }

      // Release the connection back to the pool
      connection.release();
    });
  });
});
