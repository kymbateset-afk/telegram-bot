const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// уровни
const LEVELS = {
  1: [
    { q: "нан деген не?", options: ["A) хлеб", "Б) вода", "В) дом"], correct: "A" },
    { q: "су деген не?", options: ["A) школа", "Б) вода", "В) мясо"], correct: "Б" }
  ],
  2: [
    { q: "мектеп деген не?", options: ["A) школа", "Б) еда", "В) лес"], correct: "A" }
  ]
};

// 🚀 старт
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  userState[chatId] = {
    level: 1,
    step: 0,
    score: 0
  };

  bot.sendMessage(chatId,
`Сәлем!👋🏻  
Duolingo режимі 🎮  

Бастаймыз!`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🚀 Начать", callback_data: "start_game" }]
        ]
      }
    }
  );
});

// 🚀 кнопки
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  const state = userState[chatId];

  // старт игры
  if (data === "start_game") {
    sendQuestion(chatId);
  }

  // ответ
  if (["A","Б","В"].includes(data)) {
    const q = LEVELS[state.level][state.step];

    if (data === q.correct) {
      state.score++;
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, `Қате 😅 Дұрыс жауап: ${q.correct}`);
    }

    state.step++;

    if (state.step < LEVELS[state.level].length) {
      sendQuestion(chatId);
    } else {
      bot.sendMessage(chatId,
`🎯 Уровень ${state.level} завершён!
⭐ Очки: ${state.score}/${LEVELS[state.level].length}`);

      state.level++;
      state.step = 0;
      state.score = 0;

      bot.sendMessage(chatId,
`➡️ Перейти на уровень ${state.level}?`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Дальше 🚀", callback_data: "start_game" }]
            ]
          }
        }
      );
    }
  }

  bot.answerCallbackQuery(query.id);
});

// 🚀 вопрос
function sendQuestion(chatId) {
  const state = userState[chatId];
  const q = LEVELS[state.level][state.step];

  bot.sendMessage(chatId,
`📘 Уровень ${state.level}

${q.q}`,
    {
      reply_markup: {
        inline_keyboard: q.options.map(opt => [
          { text: opt, callback_data: opt[0] }
        ])
      }
    }
  );
}
