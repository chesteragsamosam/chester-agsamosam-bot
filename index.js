require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const bot = new TelegramBot(TOKEN, { polling: true });

let sum = 0

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  // sum = 0
  bot.sendMessage(chatId, 'Hello! I am your Chester Agsamosam Bot. Type /help for a list of commands.');
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Available commands:\n/start - Start the bot\n/help - Display this help message');
});

bot.on('text', async (msg) => {
  console.log(msg)
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (!isNaN(Number(messageText))) {
    sum += Number(messageText)
    await bot.sendMessage(chatId, `The sum is ${sum}`);
  } else {
    // Echo the received message
    await bot.sendMessage(chatId, `You said: ${messageText}`);
  }
});

const app = express();
app.use(bodyParser.json());

app.post(URI, (req, res) => {
  console.log(req.body);
  const chat_id = req.body.message.chat.id;
  const text = req.body.message.text;
  bot.sendMessage(chat_id, text);
  return res.send();
});

app.listen(process.env.PORT || 8080, async () => {
  console.log('app running on port', process.env.PORT || 8080);
  await init();
});
