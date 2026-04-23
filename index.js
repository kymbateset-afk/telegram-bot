const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

bot.on("message", async (msg) => {
  try {
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
      const mode = userState[chatId]?.mode;

      if (mode === "📘 Перевод слов") {
        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{
            role: "user",
            content: `Дай 7-10 казахских слов по теме "${text}" с переводом и примером.`
          }]
        });

        bot.sendMessage(chatId, res.choices[0].message.content);
      }

      if (mode === "💬 Диалог") {
        userState[chatId].topic = text;
        userState[chatId].mode = "dialog";

        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{
            role: "user",
            content: `Начни простой диалог на казахском по теме "${text}".`
          }]
        });

        bot.sendMessage(chatId, res.choices[0].message.content);
      }

      return;
    }

    if (userState[chatId]?.mode === "dialog") {
      const topic = userState[chatId].topic;

      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Продолжи диалог на тему "${topic}". Исправь ошибки мягко. Ответ ученика: "${text}"`
        }]
      });

      bot.sendMessage(chatId, res.choices[0].message.content);
    }

  } catch (err) {
    console.log("ERROR:", err);
  }
});

// чтобы Railway не завершал процесс
setInterval(() => {}, 1000);
