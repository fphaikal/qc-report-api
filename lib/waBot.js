// waBot.js
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

let client;

const initializeWhatsAppBot = () => {
  if (!client) {
    client = new Client({
      authStrategy: new LocalAuth({
        dataPath: 'fph'
      }),
      puppeteer: {
        headless: true,
      },
    });

    client.on('ready', () => {
      console.log('WhatsApp Client is ready!');
    });

    client.on('qr', qr => {
      qrcode.generate(qr, { small: true });
    });

    client.on('message_create', async msg => {
      if (msg.body === '!ping') {
        client.sendMessage(msg.from, 'pong');
      }
    });

    client.initialize();
  }
  return client;
};

module.exports = { initializeWhatsAppBot };
