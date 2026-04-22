const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Темы
const topics = [
  "Школа",
  "Семья",
  "Природа",
  "Еда",
  "Космос",
  "Город"
];

// Кнопки
const keyboard = {
  reply_markup: {
    keyboard: topics.map(t => [t]),
    resize_keyboard: true
  }
};

// Старт
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Сәлем! 👋\nВыбери тему:",
    keyboard
  );
});

// Обработка выбора темы
bot.on('message', (msg) => {
  const text = msg.text;

  if (topics.includes(text)) {
    bot.sendMessage(
      msg.chat.id,
      `Ты выбрал тему: ${text} 📚\nСкоро начнем обучение!`
    );
  }
});
