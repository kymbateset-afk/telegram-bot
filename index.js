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

// слова
const WORDS = {
  "🏫 Школа": ["мектеп — школа", "мұғалім — учитель", "оқушы — ученик"],
  "👨‍👩‍👧 Семья": ["ана — мама", "әке — папа", "отбасы — семья"],
  "🍎 Еда": ["нан — хлеб", "су — вода", "алма — яблоко"],
  "🌿 Природа": ["ағаш — дерево", "гүл — цветок", "күн — солнце"],
  "🚀 Космос": ["ғарыш — космос", "ай — луна", "жұлдыз — звезда"],
  "🏙 Город": ["қала — город", "көше — улица", "үй — дом"]
};

// тесты
const TESTS = {
  "🏫 Школа": [
    { q: "мектеп деген не?", a: "A", options: ["A) школа", "Б) вода", "В) еда"] },
    { q: "мұғалім деген не?", a: "Б", options: ["A) ученик", "Б) учитель", "В) книга"] }
  ],
  "👨‍👩‍👧 Семья": [
    { q: "ана деген не?", a: "A", options: ["A) мама", "Б) папа", "В) школа"] }
  ]
};

// старт
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`Сәлем!👋🏻
Мен AI_Barvin_Til_Bot🇰🇿
Саған қазақ тілін үйренуге көмектесемін🙌
Режимді таңда 👇`,
  {
    reply_markup: {
      keyboard: MODES,
      resize_keyboard: true
    }
  });
});

// обработка сообщений
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const modes = MODES.flat();
  const topics = TOPICS.flat();

  // выбор режима
  if (modes.includes(text)) {
    userState[chatId] = { mode: text };

    bot.sendMessage(chatId, "Тақырыпты таңда👇", {
      reply_markup: {
        keyboard: TOPICS,
        resize_keyboard: true
      }
    });
    return;
  }

  // проверка теста
  if (userState[chatId]?.mode === "🧠 Тест" && userState[chatId].test) {
    const state = userState[chatId];
    const q = state.test[state.step];

    if (text.toUpperCase().includes(q.a)) {
      state.score++;
      bot.sendMessage(chatId, "Дұрыс! 👍");
    } else {
      bot.sendMessage(chatId, `Қате 😅 Дұрыс жауап: ${q.a}`);
    }

    state.step++;

    if (state.step < state.test.length) {
      sendQuestion(chatId);
    } else {
      bot.sendMessage(chatId, `🎯 Нәтиже: ${state.score}/${state.test.length}`);
      delete userState[chatId];
    }
    return;
  }

  // выбор темы
  if (topics.includes(text)) {
    const mode = userState[chatId]?.mode;

    // слова
    if (mode === "📘 Перевод слов") {
      const words = WORDS[text] || ["Сөздер жоқ"];
      bot.sendMessage(chatId, words.join("\n"));
    }

    // тест
    if (mode === "🧠 Тест") {
      const test = TESTS[text];
      if (!test) {
        bot.sendMessage(chatId, "Бұл тақырыпта тест жоқ");
        return;
      }

      userState[chatId].test = test;
      userState[chatId].step = 0;
      userState[chatId].score = 0;

      sendQuestion(chatId);
    }

    // составление
    if (mode === "📝 Составление") {
      bot.sendMessage(chatId, "Сөздер: мен, барамын, мектеп");
    }

    // соответствие
    if (mode === "🔄 Соответствие") {
      bot.sendMessage(chatId, "1 мектеп - A школа");
    }

    // диалог
    if (mode === "💬 Диалог") {
      userState[chatId].dialog = 1;
      bot.sendMessage(chatId, "Сәлем! Сен мектепке барасың ба?");
    }

    return;
  }

  // диалог
  if (userState[chatId]?.dialog) {
    bot.sendMessage(chatId, "Жарайсың! 👍 Тағы жауап бер 😊");
    return;
  }
});

// функция вопроса
function sendQuestion(chatId) {
  const state = userState[chatId];
  const q = state.test[state.step];

  bot.sendMessage(chatId,
    `${q.q}\n\n${q.options.join("\n")}`
  );
}
