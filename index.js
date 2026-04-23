const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// ===== ДАННЫЕ =====

const TOPICS = [
  [{ text: "🏫 Школа", callback_data: "school" }, { text: "👨‍👩‍👧 Семья", callback_data: "family" }],
  [{ text: "🌿 Природа", callback_data: "nature" }, { text: "🍎 Еда", callback_data: "food" }],
  [{ text: "🚀 Космос", callback_data: "space" }, { text: "🏙 Город", callback_data: "city" }]
];

const WORDS = {
  school: ["мектеп — школа","мұғалім — учитель","оқушы — ученик","сынып — класс","кітап — книга"],
  family: ["ана — мама","әке — папа","аға — брат","әпке — сестра","отбасы — семья"],
  nature: ["ағаш — дерево","гүл — цветок","орман — лес","өзен — река","күн — солнце"],
  food: ["нан — хлеб","су — вода","ет — мясо","алма — яблоко","шай — чай"],
  space: ["ғарыш — космос","ай — луна","жұлдыз — звезда","жер — земля","ракета — ракета"],
  city: ["қала — город","көше — улица","үй — дом","дүкен — магазин","мектеп — школа"]
};

const TESTS = {
  school: [
    { q: "мектеп деген не?", o: ["A) школа","Б) вода","В) еда","Г) дом"], c: "A" },
    { q: "мұғалім деген не?", o: ["A) ученик","Б) учитель","В) книга","Г) дом"], c: "Б" }
  ],

  family: [
    { q: "ана деген не?", o: ["A) мама","Б) школа","В) вода","Г) дом"], c: "A" },
    { q: "әке деген не?", o: ["A) папа","Б) город","В) книга","Г) еда"], c: "A" }
  ],

  food: [
    { q: "нан деген не?", o: ["A) хлеб","Б) вода","В) дом","Г) школа"], c: "A" },
    { q: "су деген не?", o: ["A) вода","Б) хлеб","В) дом","Г) школа"], c: "A" }
  ],

  nature: [
    { q: "гүл деген не?", o: ["A) цветок","Б) дом","В) еда","Г) школа"], c: "A" },
    { q: "ағаш деген не?", o: ["A) дерево","Б) вода","В) дом","Г) книга"], c: "A" }
  ],

  space: [
    { q: "ай деген не?", o: ["A) солнце","Б) луна","В) вода","Г) дом"], c: "Б" },
    { q: "жұлдыз деген не?", o: ["A) звезда","Б) дом","В) еда","Г) школа"], c: "A" }
  ],

  city: [
    { q: "қала деген не?", o: ["A) лес","Б) город","В) вода","Г) дом"], c: "Б" },
    { q: "көше деген не?", o: ["A) улица","Б) дом","В) школа","Г) вода"], c: "A" }
  ]
};

const MATCH = {
  school: {
    left: ["мектеп", "кітап"],
    right: ["школа", "книга"],
    correct: ["A", "B"]
  },

  family: {
    left: ["ана", "әке"],
    right: ["мама", "папа"],
    correct: ["A", "B"]
  },

  food: {
    left: ["нан", "су"],
    right: ["хлеб", "вода"],
    correct: ["A", "B"]
  },

  nature: {
    left: ["гүл", "ағаш"],
    right: ["цветок", "дерево"],
    correct: ["A", "B"]
  },

  space: {
    left: ["ай", "жұлдыз"],
    right: ["луна", "звезда"],
    correct: ["A", "B"]
  },

  city: {
    left: ["қала", "көше"],
    right: ["город", "улица"],
    correct: ["A", "B"]
  }
};

const DIALOG = {
  school: [
    "Сәлем! Сен мектепке барасың ба?",
    "Қай сыныпта оқисың?",
    "Қай пәнді жақсы көресің?",
    "Сен үй тапсырмасын орындайсың ба?",
    "Жарайсың! 👍"
  ],

  family: [
    "Сенің отбасың бар ма?",
    "Анаңның аты кім?",
    "Әкең не істейді?",
    "Сен отбасыңды жақсы көресің бе?",
    "Жарайсың! 👍"
  ],

  nature: [
    "Сен табиғатты жақсы көресің бе?",
    "Сен орманға барасың ба?",
    "Сен гүл көрдің бе?",
    "Сен табиғатты қорғайсың ба?",
    "Жарайсың! 👍"
  ],

  food: [
    "Сен қандай тамақты жақсы көресің?",
    "Сен нан жейсің бе?",
    "Сен су ішесің бе?",
    "Сен алма жейсің бе?",
    "Жарайсың! 👍"
  ],

  space: [
    "Сен ғарышты білесің бе?",
    "Айды көрдің бе?",
    "Жұлдыздарды жақсы көресің бе?",
    "Ғарыш қызық па?",
    "Жарайсың! 👍"
  ],

  city: [
    "Сен қалада тұрасың ба?",
    "Қалада не бар?",
    "Сен дүкенге барасың ба?",
    "Сен қалада серуендейсің бе?",
    "Жарайсың! 👍"
  ]
};

// ===== СТАРТ =====

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Қазақ тілін үйренейік 🚀`,
  {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📘 Слова", callback_data: "words" }],
        [{ text: "🧠 Тест", callback_data: "test" }],
        [{ text: "🔄 Соответствие", callback_data: "match" }],
        [{ text: "💬 Диалог", callback_data: "dialog" }]
      ]
    }
  });
});

// ===== CALLBACK =====

bot.on("callback_query", (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;

  if (!userState[chatId]) userState[chatId] = {};

  const state = userState[chatId];

  // ===== ПРОВЕРКА ТЕСТА (ВСЕГДА ПЕРВАЯ) =====
  if (["A","Б","В","Г"].includes(data) && state.test) {
    const qn = state.test[state.step];

    if (data === qn.c) {
      state.score++;
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, `Қате 😅 Дұрыс жауап: ${qn.c}`);
    }

    state.step++;

    if (state.step < state.test.length) {
      sendQuestion(chatId);
    } else {
      bot.sendMessage(chatId, `Нәтиже: ${state.score}/${state.test.length}`);
      delete userState[chatId];
    }

    bot.answerCallbackQuery(q.id);
    return;
  }

  // ===== РЕЖИМ =====
  if (["words","test","match","dialog"].includes(data)) {
    state.mode = data;

    bot.sendMessage(chatId, "Тақырып таңда👇", {
      reply_markup: { inline_keyboard: TOPICS }
    });

    bot.answerCallbackQuery(q.id);
    return;
  }

  // ===== ТЕМЫ =====
  if (WORDS[data]) {

    // СБРОС СТАРОГО СОСТОЯНИЯ
    state.test = null;
    state.dialog = null;

    // 📘 СЛОВА
    if (state.mode === "words") {
      bot.sendMessage(chatId, WORDS[data].join("\n") + "\n\nЖарайсың! 👍");
      bot.answerCallbackQuery(q.id);
      return;
    }

    // 🧠 ТЕСТ
    if (state.mode === "test") {
      state.test = TESTS[data] || [];
      state.step = 0;
      state.score = 0;

      if (!state.test.length) {
        bot.sendMessage(chatId, "Бұл тақырыпта тест жоқ");
        bot.answerCallbackQuery(q.id);
        return;
      }

      sendQuestion(chatId);
      bot.answerCallbackQuery(q.id);
      return;
    }

    // 🔄 СООТВЕТСТВИЕ
    if (state.mode === "match") {
      bot.sendMessage(chatId, (MATCH[data] || []).join("\n") + "\n\nЖарайсың! 👍");
      bot.answerCallbackQuery(q.id);
      return;
    }

    // 💬 ДИАЛОГ
    if (state.mode === "dialog") {
      state.dialog = data;
      state.step = 0;

      bot.sendMessage(chatId, DIALOG[data][0]);
      bot.answerCallbackQuery(q.id);
      return;
    }
  }

  bot.answerCallbackQuery(q.id);
});

// ===== ДИАЛОГ =====

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const state = userState[chatId];

  if (state?.dialog) {
    const topic = state.dialog;
    state.step++;

    if (DIALOG[topic][state.step]) {
      bot.sendMessage(chatId, DIALOG[topic][state.step]);
    } else {
      bot.sendMessage(chatId, "Жарайсың! 👍 Диалог аяқталды 🎉");
      delete userState[chatId];
    }
  }
});

// ===== ВОПРОС =====

function sendQuestion(chatId) {
  const s = userState[chatId];
  const q = s.test[s.step];

  bot.sendMessage(chatId, q.q, {
    reply_markup: {
      inline_keyboard: q.o.map(opt => [
        { text: opt, callback_data: opt[0] }
      ])
    }
  });
}
