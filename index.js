const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// ===== ТЕМЫ =====
const TOPICS = [
  [{ text: "🏫 Школа", callback_data: "school" }, { text: "👨‍👩‍👧 Семья", callback_data: "family" }],
  [{ text: "🌿 Природа", callback_data: "nature" }, { text: "🍎 Еда", callback_data: "food" }],
  [{ text: "🚀 Космос", callback_data: "space" }, { text: "🏙 Город", callback_data: "city" }]
];

// ===== СЛОВА (5 слов) =====
const WORDS = {
  school: ["мектеп — школа", "мұғалім — учитель", "оқушы — ученик", "сынып — класс", "кітап — книга"],
  family: ["ана — мама", "әке — папа", "аға — брат", "әпке — сестра", "отбасы — семья"],
  nature: ["ағаш — дерево", "гүл — цветок", "орман — лес", "өзен — река", "күн — солнце"],
  food: ["нан — хлеб", "су — вода", "ет — мясо", "алма — яблоко", "шай — чай"],
  space: ["ғарыш — космос", "ай — луна", "жұлдыз — звезда", "жер — земля", "ракета — ракета"],
  city: ["қала — город", "көше — улица", "үй — дом", "дүкен — магазин", "мектеп — школа"]
};

// ===== ТЕСТЫ =====
const TESTS = {
  school: [
    { q: "мектеп деген не?", o: ["A) школа","Б) вода","В) еда","Г) дом"], c: "A" },
    { q: "мұғалім деген не?", o: ["A) ученик","Б) учитель","В) книга","Г) дом"], c: "Б" }
  ],
  family: [
    { q: "ана деген не?", o: ["A) мама","Б) школа","В) вода","Г) дом"], c: "A" }
  ],
  food: [
    { q: "нан деген не?", o: ["A) хлеб","Б) вода","В) дом","Г) школа"], c: "A" }
  ],
  nature: [
    { q: "гүл деген не?", o: ["A) цветок","Б) дом","В) еда","Г) город"], c: "A" }
  ],
  space: [
    { q: "ай деген не?", o: ["A) солнце","Б) луна","В) вода","Г) дом"], c: "Б" }
  ],
  city: [
    { q: "қала деген не?", o: ["A) лес","Б) город","В) вода","Г) дом"], c: "Б" }
  ]
};

// ===== СООТВЕТСТВИЕ =====
const MATCH = {
  school: ["мектеп — школа", "кітап — книга"],
  family: ["ана — мама", "әке — папа"],
  food: ["нан — хлеб", "су — вода"],
  nature: ["ағаш — дерево", "гүл — цветок"],
  space: ["ай — луна", "жұлдыз — звезда"],
  city: ["қала — город", "үй — дом"]
};

// ===== ДИАЛОГ =====
const DIALOG = {
  school: ["Сәлем! Сен мектепке барасың ба?", "Қай сыныпта оқисың?", "Қай пәнді жақсы көресің?"],
  family: ["Сенің отбасың бар ма?", "Анаңның аты кім?", "Әкең не істейді?"],
  food: ["Сен не жейсің?", "Сен нан жейсің бе?", "Сен шай ішесің бе?"],
  nature: ["Сен табиғатты жақсы көресің бе?", "Сен орманға барасың ба?", "Сен гүл көрдің бе?"],
  space: ["Сен ғарышты білесің бе?", "Айды көрдің бе?", "Жұлдыздарды жақсы көресің бе?"],
  city: ["Сен қалада тұрасың ба?", "Қалада не бар?", "Сен дүкенге барасың ба?"]
};

// ===== ГРАММАТИКА =====
const GRAMMAR = {
  septek: "📘 Септік — сөздің өзгеруі\nМысал: мектепке, мектептен\n👉 Тапсырма: мектеп сөзін қолдан",
  noun: "📘 Зат есім — кто? что?\nМысал: бала, кітап\n👉 Тапсырма: 'кітап' аудар",
  verb: "📘 Етістік — действие\nМысал: бару, жүру\n👉 Тапсырма: 'жүру' деген не?"
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
          [{ text: "💬 Диалог", callback_data: "dialog" }],
          [{ text: "📚 Грамматика", callback_data: "grammar" }]
        ]
      }
    }
  );
});

// ===== ОБРАБОТКА КНОПОК =====
bot.on("callback_query", (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;

  userState[chatId] = userState[chatId] || {};

  // режим
  if (["words","test","match","dialog"].includes(data)) {
    userState[chatId].mode = data;

    bot.sendMessage(chatId, "Тақырып таңда👇", {
      reply_markup: { inline_keyboard: TOPICS }
    });
  }

  // грамматика
  if (data === "grammar") {
    bot.sendMessage(chatId, "Тақырып таңда👇", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Септік", callback_data: "septek" }],
          [{ text: "Зат есім", callback_data: "noun" }],
          [{ text: "Етістік", callback_data: "verb" }]
        ]
      }
    });
  }

  if (GRAMMAR[data]) {
    bot.sendMessage(chatId, GRAMMAR[data] + "\n\nЖарайсың! 👍");
  }

  // ===== ТЕМЫ =====
  if (WORDS[data]) {
    const mode = userState[chatId].mode;

    if (mode === "words") {
      bot.sendMessage(chatId,
        WORDS[data].join("\n") + "\n\nЖарайсың! 👍"
      );
    }

    if (mode === "test") {
      const t = TESTS[data];
      userState[chatId] = { test: t, step: 0, score: 0 };
      sendQuestion(chatId);
    }

    if (mode === "match") {
      bot.sendMessage(chatId,
        MATCH[data].join("\n") + "\n\nЖарайсың! 👍"
      );
    }

    if (mode === "dialog") {
      userState[chatId].dialog = data;
      userState[chatId].step = 0;
      bot.sendMessage(chatId, DIALOG[data][0]);
    }
  }

  // ===== ОТВЕТЫ ТЕСТА =====
  if (["A","Б","В","Г"].includes(data) && userState[chatId]?.test) {
    const s = userState[chatId];
    const qn = s.test[s.step];

    if (data === qn.c) {
      s.score++;
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, `Қате 😅 Дұрыс жауап: ${qn.c}`);
    }

    s.step++;

    if (s.step < s.test.length) {
      sendQuestion(chatId);
    } else {
      bot.sendMessage(chatId,
        `Нәтиже: ${s.score}/${s.test.length}\nЖарайсың! 👍`
      );
      delete userState[chatId];
    }
  }

  bot.answerCallbackQuery(q.id);
});

// ===== ДИАЛОГ =====
bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (userState[chatId]?.dialog) {
    const topic = userState[chatId].dialog;
    const step = ++userState[chatId].step;

    if (DIALOG[topic][step]) {
      bot.sendMessage(chatId, DIALOG[topic][step]);
    } else {
      bot.sendMessage(chatId, "Жарайсың! 👍 Диалог аяқталды 🎉");
      delete userState[chatId];
    }
  }
});

// ===== ФУНКЦИЯ ВОПРОСА =====
function sendQuestion(chatId) {
  const s = userState[chatId];
  const q = s.test[s.step];

  bot.sendMessage(chatId,
    q.q,
    {
      reply_markup: {
        inline_keyboard: q.o.map(opt => [
          { text: opt, callback_data: opt[0] }
        ])
      }
    }
  );
}
