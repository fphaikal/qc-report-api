require('dotenv').config(); // Pastikan .env dimuat
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../models/UserModel');

// Konfigurasi transporter untuk Nodemailer
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL, // Email Anda
    pass: process.env.EMAIL_PASS, // App Password dari Gmail
  },
  logger: true, // Aktifkan logging untuk debug
  debug: true,  // Aktifkan debug
});

// Fungsi untuk mengirim email
const sendEmail = (subject, message) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: 'abufahreza@gmail.com',
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
cron.schedule('15 10 * * *', async () => {
  try {
    const result = await User.deleteMany({ token: { $lt: new Date() } });

    const successMessage = `${result.deletedCount} expired tokens deleted.`;
    console.log(successMessage);
    sendEmail('Expired Tokens Deletion Success', successMessage);

  } catch (err) {
    const errorMessage = `Error deleting expired tokens: ${err.message}`;
    console.error(errorMessage);
    sendEmail('Expired Tokens Deletion Failed', errorMessage);
  }
});

// Uji koneksi email
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP Connection Successful');
  }
});
