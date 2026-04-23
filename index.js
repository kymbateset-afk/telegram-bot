const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const userState = {};

// режимы
const MODES = [
  ["📘 Перевод слов", "🧠 Тест"],
  ["📝 Составление", "🔄 Соответствие"],
  ["💬 Диалог"]
];

// темы
const TOPICS = [
  ["🏫 Школа", "👨‍👩‍👧 Семья"],
  ["🌿 Природа", "🍎 Еда"],
  ["🚀 Космос", "🏙 Город"]
];

// слова по темам
const WORDS = {
  "🏫 Школа": [
    "мектеп — школа",
    "мұғалім — учитель",
    "оқушы — ученик",
    "сынып — класс",
    "кітап — книга"
  ],
  "👨‍👩‍👧 Семья": [
    "ана — мама",
    "әке — папа",
    "аға — брат",
    "әпке — сестра",
    "отбасы — семья"
  ],
  "🍎 Еда": [
    "нан — хлеб",
    "су — вода",
    "ет — мясо",
    "алма — яблоко",
    "шай — чай"
  ],
  "🌿 Природа": [
    "ағаш — дерево",
    "гүл — цветок",
    "орман — лес",
    "өзен — река",
    "күн — солнце"
  ],
  "🚀 Космос": [
    "ғарыш — космос",
    "жұлдыз — звезда",
    "ай — луна",
    "жер — земля",
    "ракета — ракета"
  ],
  "🏙 Город": [
    "қала — город",
    "көше — улица",
    "үй — дом",
    "дүкен — магазин",
    "мектеп — школа"
  ]
};

// тесты
const TESTS = {
  "🏫 Школа": [
    {
      question: "мектеп деген не?",
      options: ["A) школа", "Б) вода", "В) еда", "Г) космос"],
      correct: "A"
    },
    {
      question: "мұғалім деген не?",
      options: ["A) ученик", "Б) учитель", "В) книга", "Г) дом"],
      correct: "Б"
    }
  ]
};

// старт
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

// основной обработчик
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

  // === ПРОВЕРКА ТЕСТА ===
  if (userState[chatId]?.mode === "🧠 Тест" && userState[chatId].questions) {
    const state = userState[chatId];
    const q = state.questions[state.testStep];

    const answer = text.toUpperCase();

    if (answer.includes(q.correct)) {
      state.score++;
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, `Қате 😅 Дұрыс жауап: ${q.correct}`);
    }

    state.testStep++;

    if (state.testStep < state.questions.length) {
      sendQuestion(chatId);
    } else {
      bot.sendMessage(chatId,
        `🎯 Нәтиже: ${state.score}/${state.questions.length}\nЖарайсың! 👍`
      );
      delete userState[chatId];
    }

    return;
  }

  // выбор темы
  if (allTopics.includes(text)) {
    const mode = userState[chatId]?.mode;

    // 📘 слова
    if (mode === "📘 Перевод слов") {
      const words = WORDS[text] || [];

      bot.sendMessage(chatId,
        `📚 Тақырып: ${text}\n\n` + words.join("\n") + "\n\nЖарайсың! 👍"
      );
    }

    // 🧠 тест
    if (mode === "🧠 Тест") {
      userState[chatId].testStep = 0;
      userState[chatId].score = 0;
      userState[chatId].questions = TESTS[text];

      sendQuestion(chatId);
    }

    // 📝 составление
    if (mode === "📝 Составление") {
      bot.sendMessage(chatId,
`📝 Сөздер:
мен, мектеп, барамын

Сөйлем құрастыр 👇`);
    }

    // 🔄 соответствие
    if (mode === "🔄 Соответствие") {
      bot.sendMessage(chatId,
`🔄 Сәйкестендір:

1) мектеп  
2) кітап  

A) книга  
B) школа  

Жауап бер (1-B, 2-A)`);
    }

    // 💬 диалог
    if (mode === "💬 Диалог") {
      userState[chatId].dialogStep = 1;

      bot.sendMessage(chatId,
`💬 Диалог:

Сәлем! Сен мектепке барасың ба?`);
    }

    return;
  }

  // 💬 диалог продолжение
  if (userState[chatId]?.mode === "💬 Диалог") {
    const step = userState[chatId].dialogStep;

    if (step === 1) {
      bot.sendMessage(chatId, "Жақсы 👍 Сен қай сыныпта оқисың?");
      userState[chatId].dialogStep = 2;
      return;
    }

    if (step === 2) {
      bot.sendMessage(chatId, "Керемет 😊 Қай пәнді жақсы көресің?");
      userState[chatId].dialogStep = 3;
      return;
    }

    if (step === 3) {
      bot.sendMessage(chatId, "Жарайсың! 👍 Диалог аяқталды 🎉");
      delete userState[chatId];
      return;
    }
  }
});

// функция вопроса
function sendQuestion(chatId) {
  const state = userState[chatId];
  const q = state.questions[state.testStep];

  bot.sendMessage(chatId,
    `🧠 Вопрос ${state.testStep + 1}:\n${q.question}\n\n${q.options.join("\n")}`
  );
}
