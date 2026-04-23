const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Режимы
const MODES = [
  ["📘 Перевод слов", "🧠 Тест"],
  ["📝 Составление", "🔄 Соответствие"],
  ["💬 Диалог"]
];

// Темы
const TOPICS = [
  ["🏫 Школа", "👨‍👩‍👧 Семья"],
  ["🌿 Природа", "🍎 Еда"],
  ["🚀 Космос", "🏙 Город"]
];

const userState = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Мен AI_Barvin_Til_Bot🇰🇿
Саған қазақ тілін қызықты, әрі тез үйренуге көмектесемін🙌
Дайын болсаң, «start» батырмасын бас!
Сәттілік!`,
  {
    reply_markup: {
      keyboard: MODES,
      resize_keyboard: true
    }
  });
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const allModes = MODES.flat();
  const allTopics = TOPICS.flat();

  if (allModes.includes(text)) {
    userState[chatId] = { mode: text };

    bot.sendMessage(chatId, "Тақырыпты таңда👇", {
      reply_markup: {
        keyboard: TOPICS,
        resize_keyboard: true
      }
    });
    return;
  }

  if (allTopics.includes(text)) {
    bot.sendMessage(chatId, `📚 Тақырып: ${text}`);
    return;
  }
});
