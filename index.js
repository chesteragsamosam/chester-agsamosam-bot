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

const userData = {}

function obj (ob) {
  return JSON.stringify(ob, null, 3)
}

function getData (id) {
  return userData[id]
}

const init = async () => {
  const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  console.log(res.data);
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userData[chatId] = { sum: 0, chatId }
  bot.sendMessage(chatId, 'Hello! I am ChesterAgsamosam Bot. Type /help for a list of commands.');
  bot.sendMessage(chatId, JSON.stringify(msg, null, 3))
  bot.sendMessage(chatId, `You Name is ${msg.from.first_name} and your username is @${msg.from.username}`)
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Available commands:\n/start - Start the bot\n/help - Display this help message');
});
bot.onText(/^(\/add)/, (msg) => {
  const chatId = msg.chat.id;
  const keyVals = msg.text.replace('/add ', '').split(' ')
  console.log(keyVals)
  keyVals.forEach(item => {
    const [a, b] = item.split('=')
    userData[chatId][a] = b
  })
  bot.sendMessage(chatId, obj(msg));
});

bot.onText(/\/get_data/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, obj(getData(chatId)));
});

bot.on('text', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;
  if (!userData[chatId]) userData[chatId] = {}
  await bot.sendMessage(chatId, `You said: ${messageText}`);
});

const app = express();
app.use(bodyParser.json());

app.post(URI, (req, res) => {
  // console.log(req.body);
  const chat_id = req.body.message.chat.id;
  const text = req.body.message.text;
  bot.sendMessage(chat_id, text);
  return res.send();
});

app.listen(process.env.PORT || 8080, async () => {
  console.log('app running on port', process.env.PORT || 8080);
  await init();
});
