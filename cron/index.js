const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/User'); // Pastikan User model Anda sesuai dengan schema MongoDB

// Konfigurasi transporter untuk Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Misalnya menggunakan Gmail
  auth: {
    user: process.env.EMAIL, // Ganti dengan email Anda
    pass: process.env.EMAIL_PASS   // Ganti dengan password atau app-specific password
  },
});

// Fungsi untuk mengirim email
const sendEmail = (subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL, // Ganti dengan email Anda
    to: 'abufahreza@gmail.com', // Ganti dengan email penerima
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// Menghapus token dari database setiap hari pada jam 3 pagi
cron.schedule('0 3 * * *', async () => {
  try {
    // Menghapus data yang token-nya expired
    const result = await User.deleteMany({ token: { $lt: new Date() } });

    // Kirim email jika berhasil
    const successMessage = `${result.deletedCount} expired tokens deleted.`;
    console.log(successMessage);
    sendEmail('Expired Tokens Deletion Success', successMessage);

  } catch (err) {
    // Kirim email jika gagal
    const errorMessage = `Error deleting expired tokens: ${err.message}`;
    console.error(errorMessage);
    sendEmail('Expired Tokens Deletion Failed', errorMessage);
  }
});
