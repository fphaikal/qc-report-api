const cron = require('node-cron');
const db = require("../lib/db");

// Menghapus token dari database setiap hari pada jam 3 pagi
cron.schedule('0 3 * * *', () => {
  const sql = `DELETE FROM users WHERE token < NOW()`; // Contoh, sesuaikan dengan schema database Anda
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error deleting expired tokens:", err);
    } else {
      console.log("Expired tokens deleted");
    }
  });
});
