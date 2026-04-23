const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const userState = {};


// 🚀 СТАРТ
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Мен AI_Barvin_Til_Bot🇰🇿

Қазақ тілін үйренейік 🚀`,
  {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📘 Перевод слов", callback_data: "words" },
          { text: "🧠 Тест", callback_data: "test" }
        ],
        [
          { text: "💬 Диалог", callback_data: "dialog" }
        ]
      ]
    }
  });
});


// 🚀 КНОПКИ
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // выбор режима
  if (["words","test","dialog"].includes(data)) {
    userState[chatId] = { mode: data };

    bot.editMessageText("Тақырыпты таңда 👇", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🏫 Школа", callback_data: "school" },
            { text: "👨‍👩‍👧 Семья", callback_data: "family" }
          ],
          [
            { text: "🍎 Еда", callback_data: "food" },
            { text: "🌿 Природа", callback_data: "nature" }
          ],
          [
            { text: "⬅️ Назад", callback_data: "back" }
          ]
        ]
      }
    });
  }

  // назад
  if (data === "back") {
    bot.sendMessage(chatId, "Режимді таңда 👇", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📘 Перевод слов", callback_data: "words" },
            { text: "🧠 Тест", callback_data: "test" }
          ],
          [
            { text: "💬 Диалог", callback_data: "dialog" }
          ]
        ]
      }
    });
  }

  const state = userState[chatId];

  // 📘 СЛОВА (AI)
  if (state?.mode === "words") {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Дай 7 слов на казахском по теме "${data}" с переводом`
      }]
    });

    bot.sendMessage(chatId, res.choices[0].message.content);
  }

  // 🧠 ТЕСТ
  if (state?.mode === "test") {
    userState[chatId].answer = "A";

    bot.sendMessage(chatId,
`🧠 Вопрос:

"нан" деген не?`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "A) хлеб", callback_data: "A" }],
          [{ text: "Б) вода", callback_data: "Б" }],
          [{ text: "В) дом", callback_data: "В" }]
        ]
      }
    });
  }

  // проверка теста
  if (["A","Б","В"].includes(data)) {
    if (data === userState[chatId].answer) {
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, "Қате 😅");
    }
  }

  // 💬 ДИАЛОГ (AI)
  if (state?.mode === "dialog") {
    userState[chatId].dialog = true;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Начни простой диалог на казахском по теме "${data}"`
      }]
    });

    bot.sendMessage(chatId, res.choices[0].message.content);
  }

  bot.answerCallbackQuery(query.id);
});


// 💬 ПРОДОЛЖЕНИЕ ДИАЛОГА
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (userState[chatId]?.dialog) {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: `Ответь ученику на казахском: ${msg.text}`
      }]
    });

    bot.sendMessage(chatId, res.choices[0].message.content);
  }
});
