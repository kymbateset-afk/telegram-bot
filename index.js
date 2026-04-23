const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const MODES = [
  ["📘 Перевод слов", "🧠 Тест"],
  ["📝 Составление", "🔄 Соответствие"],
  ["💬 Диалог"]
];

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
Режимді таңда 👇`,
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

  // выбор режима
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

  // выбор темы
  if (allTopics.includes(text)) {
    const mode = userState[chatId]?.mode;

    if (mode === "📘 Перевод слов") {
      bot.sendMessage(chatId,
`📚 Тақырып: ${text}

мектеп — школа (Мен мектепке барамын)
мұғалім — учитель (Мұғалім сабақ береді)
оқушы — ученик (Мен оқушымын)
кітап — книга (Мен кітап оқимын)
сынып — класс (Бұл сынып үлкен)

Жарайсың! 👍`);
    }

    if (mode === "🧠 Тест") {
      bot.sendMessage(chatId,
`🧠 Тест:

1. "мектеп" деген не?
A) школа  
Б) вода  
В) еда  
Г) космос`);
    }

    if (mode === "📝 Составление") {
      bot.sendMessage(chatId,
`📝 Сөздер:
мектеп, мен, барамын

Сөйлем құрастыр 👇`);
    }

    if (mode === "🔄 Соответствие") {
      bot.sendMessage(chatId,
`🔄 Сәйкестендір:

1) мектеп  
2) кітап  

A) книга  
B) школа  

Жауап бер (1-B, 2-A)`);
    }

    if (mode === "💬 Диалог") {
      bot.sendMessage(chatId,
`💬 Диалог:

Сәлем! Сен мектепке барасың ба?`);
    }

    return;
  }
});
