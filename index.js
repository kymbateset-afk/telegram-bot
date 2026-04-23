const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// темы
const TOPICS = [
  [{ text: "🏫 Школа", callback_data: "school" }, { text: "👨‍👩‍👧 Семья", callback_data: "family" }],
  [{ text: "🌿 Природа", callback_data: "nature" }, { text: "🍎 Еда", callback_data: "food" }]
];

// слова
const WORDS = {
  school: ["мектеп — школа", "мұғалім — учитель", "оқушы — ученик"],
  family: ["ана — мама", "әке — папа", "аға — брат"],
  food: ["нан — хлеб", "су — вода", "алма — яблоко"],
  nature: ["ағаш — дерево", "гүл — цветок", "күн — солнце"]
};

// грамматика
const GRAMMAR = {
  noun: "📘 Зат есім — это существительное\nПример: бала (ребёнок)\n👉 Задание: переведи 'мама'",
  verb: "📘 Етістік — это глагол\nПример: бару (идти)\n👉 Задание: что значит 'жүру'?"
};

// старт
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Қазақ тілін үйренейік 🚀`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📘 Перевод слов", callback_data: "words" }],
          [{ text: "🧠 Тест", callback_data: "test" }],
          [{ text: "🔄 Соответствие", callback_data: "match" }],
          [{ text: "💬 Диалог", callback_data: "dialog" }],
          [{ text: "📚 Грамматика", callback_data: "grammar" }]
        ]
      }
    }
  );
});


// обработка кнопок
bot.on("callback_query", (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;

  userState[chatId] = userState[chatId] || {};

  // выбор режима
  if (["words","test","match","dialog"].includes(data)) {
    userState[chatId].mode = data;

    bot.editMessageText("Тақырыпты таңда👇", {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: { inline_keyboard: TOPICS }
    });
  }

  // грамматика
  if (data === "grammar") {
    bot.editMessageText("Грамматика таңда👇", {
      chat_id: chatId,
      message_id: q.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: "Зат есім", callback_data: "noun" }],
          [{ text: "Етістік", callback_data: "verb" }]
        ]
      }
    });
  }

  if (GRAMMAR[data]) {
    bot.sendMessage(chatId, GRAMMAR[data]);
  }

  // темы
  if (WORDS[data]) {
    const mode = userState[chatId].mode;

    // перевод слов
    if (mode === "words") {
      bot.sendMessage(chatId,
        `📚 Слова:\n\n${WORDS[data].join("\n")}\n\nЖарайсың! 👍`
      );
    }

    // тест
    if (mode === "test") {
      userState[chatId].answer = "A";

      bot.sendMessage(chatId,
        `🧠 Вопрос:\nнан деген не?`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "A) хлеб", callback_data: "A" }],
              [{ text: "Б) вода", callback_data: "Б" }],
              [{ text: "В) дом", callback_data: "В" }],
              [{ text: "Г) школа", callback_data: "Г" }]
            ]
          }
        }
      );
    }

    // соответствие
    if (mode === "match") {
      bot.sendMessage(chatId,
`🔄 Сопоставь:

нан → ?
су → ?

A) вода
B) хлеб`
      );
    }

    // диалог
    if (mode === "dialog") {
      userState[chatId].dialog = true;

      bot.sendMessage(chatId,
        "Сәлем! Сен мектепке барасың ба?"
      );
    }
  }

  // проверка теста
  if (["A","Б","В","Г"].includes(data)) {
    if (data === userState[chatId].answer) {
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, "Қате 😅");
    }
  }

  bot.answerCallbackQuery(q.id);
});


// диалог
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (userState[chatId]?.dialog) {
    bot.sendMessage(chatId,
      "Жарайсың! 👍 Тағы жауап бер 😊"
    );
  }
});
