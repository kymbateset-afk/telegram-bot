const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// 📌 СТАРТ
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Мен AI_Barvin_Til_Bot🇰🇿
Қазақ тілін бірге үйренейік 🚀

Режимді таңда 👇`,
  {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "📘 Перевод слов", callback_data: "words" },
          { text: "🧠 Тест", callback_data: "test" }
        ],
        [
          { text: "📝 Составление", callback_data: "compose" },
          { text: "🔄 Соответствие", callback_data: "match" }
        ],
        [
          { text: "💬 Диалог", callback_data: "dialog" }
        ]
      ]
    }
  });
});


// 📌 КНОПКИ
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // выбор режима
  if (["words","test","compose","match","dialog"].includes(data)) {
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
            { text: "🌿 Природа", callback_data: "nature" },
            { text: "🍎 Еда", callback_data: "food" }
          ],
          [
            { text: "🚀 Космос", callback_data: "space" },
            { text: "🏙 Город", callback_data: "city" }
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
    bot.editMessageText("Режимді таңда 👇", {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📘 Перевод слов", callback_data: "words" },
            { text: "🧠 Тест", callback_data: "test" }
          ],
          [
            { text: "📝 Составление", callback_data: "compose" },
            { text: "🔄 Соответствие", callback_data: "match" }
          ],
          [
            { text: "💬 Диалог", callback_data: "dialog" }
          ]
        ]
      }
    });
  }

  // темы
  const WORDS = {
    school: ["мектеп — школа", "мұғалім — учитель"],
    family: ["ана — мама", "әке — папа"],
    food: ["нан — хлеб", "су — вода"],
    nature: ["ағаш — дерево", "гүл — цветок"],
    space: ["ай — луна", "жұлдыз — звезда"],
    city: ["қала — город", "үй — дом"]
  };

  const state = userState[chatId];

  if (WORDS[data] && state) {

    // 📘 СЛОВА
    if (state.mode === "words") {
      bot.editMessageText(
        `📚 Слова:\n\n${WORDS[data].join("\n")}`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "back" }]]
          }
        }
      );
    }

    // 🧠 ТЕСТ
    if (state.mode === "test") {
      bot.editMessageText(
        `🧠 Вопрос:\n\n"нан" деген не?\n\nA) хлеб\nБ) вода\nВ) дом`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [
              [{ text: "A", callback_data: "A" }],
              [{ text: "Б", callback_data: "Б" }],
              [{ text: "В", callback_data: "В" }],
              [{ text: "⬅️ Назад", callback_data: "back" }]
            ]
          }
        }
      );
    }

    // 💬 ДИАЛОГ
    if (state.mode === "dialog") {
      bot.editMessageText(
        `💬 Диалог:\n\nСәлем! Сен осы тақырыпты жақсы көресің бе?`,
        {
          chat_id: chatId,
          message_id: query.message.message_id,
          reply_markup: {
            inline_keyboard: [[{ text: "⬅️ Назад", callback_data: "back" }]]
          }
        }
      );
    }
  }

  bot.answerCallbackQuery(query.id);
});
