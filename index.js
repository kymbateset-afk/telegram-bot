const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Режимы
const MODES = [
  ["📘 Перевод слов", "🧠 Тест"],
  ["📝 Составление", "🔄 Соответствие"],
  ["💬 Диалог"]
];

// Темы
const TOPICS = [
  ["🏫 Школа", "👨‍👩‍👧 Семья"],
  ["🌿 Природа", "🍎 Еда"],
  ["🚀 Космос", "🏙 Город"]
];

// Состояние пользователя
const userState = {};

// Приветствие
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const text = `Сәлем!👋🏻
Мен AI_Barvin_Til_Bot🇰🇿
Саған қазақ тілін қызықты, әрі тез үйренуге көмектесемін🙌
Дайын болсаң, «start» батырмасын бас!
Сәттілік!`;

  bot.sendMessage(chatId, text, {
    reply_markup: {
      keyboard: MODES,
      resize_keyboard: true
    }
  });
});

// Выбор режима
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const allModesFlat = MODES.flat();

  // Если выбрали режим
  if (allModesFlat.includes(text)) {
    userState[chatId] = { mode: text };

    bot.sendMessage(chatId, "Тақырыпты таңда👇", {
      reply_markup: {
        keyboard: TOPICS,
        resize_keyboard: true
      }
    });
    return;
  }

  const allTopicsFlat = TOPICS.flat();

  // Если выбрали тему
  if (allTopicsFlat.includes(text)) {
    if (!userState[chatId]) return;

    const mode = userState[chatId].mode;
    const topic = text;

    userState[chatId].topic = topic;

    // 📘 ПЕРЕВОД СЛОВ
    if (mode === "📘 Перевод слов") {
      bot.sendMessage(chatId,
        `📚 Тақырып: ${topic}

нан — хлеб (Мен нан жеймін)
су — вода (Мен су ішемін)
ет — мясо (Мен ет жеймін)

Жарайсың! 👍`
      );
    }

    // 🧠 ТЕСТ
    else if (mode === "🧠 Тест") {
      userState[chatId].testStep = 0;
      userState[chatId].score = 0;

      bot.sendMessage(chatId,
        `🧠 Тест бастаймыз!

1. "су" деген не?
A) хлеб  
Б) вода  
В) мясо  
Г) школа`
      );
    }

    // 📝 СОСТАВЛЕНИЕ
    else if (mode === "📝 Составление") {
      bot.sendMessage(chatId,
        `📝 Сөздер:
нан, су, мен

Сөйлем құрастыр 👇`
      );
    }

    // 🔄 СООТВЕТСТВИЕ
    else if (mode === "🔄 Соответствие") {
      bot.sendMessage(chatId,
        `🔄 Сәйкестендір:

1) нан  
2) су  

A) вода  
B) хлеб  

Жауап бер (мысалы: 1-B, 2-A)`
      );
    }

    // 💬 ДИАЛОГ
    else if (mode === "💬 Диалог") {
      userState[chatId].dialogStep = 1;

      bot.sendMessage(chatId,
        `💬 Диалог бастаймыз!

Сәлем! Сен қай сыныпта оқисың?`
      );
    }

    return;
  }

  // === ОБРАБОТКА ТЕСТА ===
  if (userState[chatId]?.mode === "🧠 Тест") {
    const state = userState[chatId];

    if (state.testStep === 0) {
      if (text.toLowerCase().includes("б")) {
        state.score++;
        bot.sendMessage(chatId, "Дұрыс! 👍");
      } else {
        bot.sendMessage(chatId, "Қате 😅 Дұрыс жауап: Б (вода)");
      }

      bot.sendMessage(chatId,
        `2. "нан" деген не?
A) хлеб  
Б) вода  
В) мясо  
Г) школа`
      );

      state.testStep = 1;
      return;
    }

    if (state.testStep === 1) {
      if (text.toLowerCase().includes("a")) {
        state.score++;
        bot.sendMessage(chatId, "Дұрыс! 👍");
      } else {
        bot.sendMessage(chatId, "Қате 😅 Дұрыс жауап: A (хлеб)");
      }

      bot.sendMessage(chatId,
        `🎯 Нәтиже: ${state.score}/2

Жарайсың! 👍`
      );

      delete userState[chatId];
      return;
    }
  }

  // === СОСТАВЛЕНИЕ ===
  if (userState[chatId]?.mode === "📝 Составление") {
    bot.sendMessage(chatId,
      `Жақсы! 👍

Дұрыс нұсқа:
👉 Мен нан жеймін және су ішемін

Жарайсың! 😊`
    );
    delete userState[chatId];
    return;
  }

  // === СООТВЕТСТВИЕ ===
  if (userState[chatId]?.mode === "🔄 Соответствие") {
    bot.sendMessage(chatId,
      `Дұрыс жауап:
1-B  
2-A  

Жарайсың! 👍`
    );
    delete userState[chatId];
    return;
  }

  // === ДИАЛОГ ===
  if (userState[chatId]?.mode === "💬 Диалог") {
    const step = userState[chatId].dialogStep;

    if (step === 1) {
      bot.sendMessage(chatId,
        `Жақсы! 👍

Сен мектепті жақсы көресің бе?`
      );
      userState[chatId].dialogStep = 2;
      return;
    }

    if (step === 2) {
      bot.sendMessage(chatId,
        `Керемет! 😊

Қай пәнді жақсы көресің?`
      );
      userState[chatId].dialogStep = 3;
      return;
    }

    if (step === 3) {
      bot.sendMessage(chatId,
        `Жарайсың! 👍

Диалог аяқталды 🎉`
      );
      delete userState[chatId];
      return;
    }
  }
});
