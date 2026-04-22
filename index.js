import TelegramBot from "node-telegram-bot-api";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SYSTEM_PROMPT } from "./lib/system-prompt.js";
import { logger } from "./lib/logger.js";

const TOKEN = process.env["TELEGRAM_BOT_TOKEN"];

const chatConversationMap = new Map<number, number>();
const pendingModeMap = new Map<number, string>();

const MODES: Record<string, { label: string; buildCommand: (topic: string, topicEmoji: string) => string }> = {
  translate: {
    label: "📘 Перевод слов",
    buildCommand: (topic, emoji) =>
      `Запусти режим «Перевод слов» по теме «${topic}» ${emoji}. Дай мне 5–7 казахских слов из этой темы по одному. К каждому слову добавь транскрипцию и 1 простой пример. Жди мой перевод, хвали «Жарайсың! 👍», мягко исправляй ошибки. Веди счёт. Начни!`,
  },
  quiz: {
    label: "🧠 Тест",
    buildCommand: (topic, emoji) =>
      `Запусти режим «Тест» по теме «${topic}» ${emoji}. Задай ровно 5 вопросов с вариантами А/Б/В/Г. После каждого ответа объясняй. В конце покажи итог X/5. Начни!`,
  },
  sentences: {
    label: "📝 Составление",
    buildCommand: (topic, emoji) =>
      `Запусти режим «Составление предложений» по теме «${topic}» ${emoji}. Давай 3–4 казахских слова — я составляю предложение. Проверяй, показывай правильный вариант, объясняй порядок слов. Хвали «Жарайсың! 👍». Начни!`,
  },
  matching: {
    label: "🔄 Соответствие",
    buildCommand: (topic, emoji) =>
      `Запусти режим «Соответствие слов» по теме «${topic}» ${emoji}. Покажи 2 столбика: 5 казахских слов (1–5) и 5 переводов (А–Д). Я пишу пары: 1-В, 2-А... Проверяй, объясняй ошибки. Начни!`,
  },
  dialog: {
    label: "💬 Диалог",
    buildCommand: (topic, emoji) =>
      `Запусти режим «Диалог» по теме «${topic}» ${emoji}. Начни простой диалог на казахском — задавай короткие вопросы и давай перевод в скобках. Если я ошибусь — исправь мягко. Поддерживай разговор 4–6 реплик. Начни!`,
  },
};

const TOPICS = [
  { id: "school", emoji: "🏫", label: "Школа" },
  { id: "family", emoji: "👨‍👩‍👧", label: "Семья" },
  { id: "nature", emoji: "🌿", label: "Природа" },
  { id: "food",   emoji: "🍎", label: "Еда" },
  { id: "space",  emoji: "🚀", label: "Космос" },
  { id: "city",   emoji: "🏙", label: "Город" },
];

const EXTRAS: Record<string, { label: string; command: string }> = {
  grammar: {
    label: "📖 Объясни грамматику",
    command: `Объясни мне тему падежей в казахском языке (Септіктер) просто и понятно, как ученице 8 класса. Приведи примеры с забавными предложениями и составь таблицу для быстрого запоминания. Если я захочу другую грамматическую тему — напишу, объясни так же.`,
  },
  roleplay: {
    label: "🎭 Диалог в жизни",
    command: `Давай поиграем. Ты — продавец в кофейне в Астане, а я — покупатель. Помоги мне выбрать напиток и десерт на казахском языке. Начинай диалог, исправляй мои ошибки в скобках и продолжай общение. Используй разговорный казахский.`,
  },
  vocabulary: {
    label: "📚 Слова по теме",
    command: `Составь список из 15 самых полезных слов и фраз на тему «Технологии и будущее» на казахском языке. Для каждого слова дай транскрипцию, перевод и одно интересное предложение. В конце составь тест из 5 вопросов для самопроверки.`,
  },
  essay: {
    label: "✍️ Проверь мой текст",
    command: `Я напишу текст на казахском языке. Проверь его на грамматические ошибки, а затем перепиши так, чтобы он звучал красиво и по-казахски. Каждую правку объясняй кратко. Жди мой текст!`,
  },
};

const MODE_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "📘 Перевод слов", callback_data: "mode:translate" },
      { text: "🧠 Тест",         callback_data: "mode:quiz" },
    ],
    [
      { text: "📝 Составление",  callback_data: "mode:sentences" },
      { text: "🔄 Соответствие", callback_data: "mode:matching" },
    ],
    [
      { text: "💬 Диалог",       callback_data: "mode:dialog" },
    ],
    [
      { text: "📖 Грамматика",   callback_data: "extra:grammar" },
      { text: "🎭 Диалог в жизни", callback_data: "extra:roleplay" },
    ],
    [
      { text: "📚 Слова по теме", callback_data: "extra:vocabulary" },
      { text: "✍️ Проверь текст",  callback_data: "extra:essay" },
    ],
  ],
};

function buildTopicKeyboard(modeId: string) {
  return {
    inline_keyboard: [
      [
        { text: "🏫 Школа",      callback_data: `topic:${modeId}:school` },
        { text: "👨‍👩‍👧 Семья",  callback_data: `topic:${modeId}:family` },
      ],
      [
        { text: "🌿 Природа",    callback_data: `topic:${modeId}:nature` },
        { text: "🍎 Еда",        callback_data: `topic:${modeId}:food` },
      ],
      [
        { text: "🚀 Космос",     callback_data: `topic:${modeId}:space` },
        { text: "🏙 Город",      callback_data: `topic:${modeId}:city` },
      ],
    ],
  };
}

async function getOrCreateConversation(chatId: number, userName: string): Promise<number> {
  const existing = chatConversationMap.get(chatId);
  if (existing) return existing;
  const [conv] = await db
    .insert(conversations)
    .values({ title: `Telegram: ${userName}` })
    .returning();
  chatConversationMap.set(chatId, conv.id);
  return conv.id;
}

async function resetConversation(chatId: number, userName: string): Promise<number> {
  const [conv] = await db
    .insert(conversations)
    .values({ title: `Telegram: ${userName}` })
    .returning();
  chatConversationMap.set(chatId, conv.id);
  return conv.id;
}

async function replyWithAI(bot: TelegramBot, chatId: number, conversationId: number, userText: string): Promise<void> {
  const existingMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt);

  await db.insert(messages).values({ conversationId, role: "user", content: userText });

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: SYSTEM_PROMPT },
    ...existingMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: userText },
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 8192,
    messages: chatMessages,
    stream: true,
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) fullResponse += content;
  }

  await db.insert(messages).values({ conversationId, role: "assistant", content: fullResponse });

  await bot.sendMessage(chatId, fullResponse, {
    parse_mode: "Markdown",
    reply_markup: MODE_KEYBOARD,
  });
}

export function startTelegramBot(): void {
  if (!TOKEN) {
    logger.warn("TELEGRAM_BOT_TOKEN not set — Telegram bot disabled");
    return;
  }

  const bot = new TelegramBot(TOKEN, { polling: true });
  logger.info("Telegram bot started (polling)");

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name ?? msg.from?.username ?? "друг";
    try {
      await resetConversation(chatId, userName);
      const greeting =
        `Сәлем, ${userName}! 👋🏻\n` +
        `Мен AI\\_Barvin\\_Til\\_Bot 🇰🇿\n` +
        `Саған қазақ тілін қызықты, әрі тез үйренуге көмектесемін 🙌\n\n` +
        `Выбери режим обучения:`;
      await bot.sendMessage(chatId, greeting, {
        parse_mode: "Markdown",
        reply_markup: MODE_KEYBOARD,
      });
    } catch (err) {
      logger.error({ err, chatId }, "Telegram /start error");
    }
  });

  bot.onText(/\/new/, async (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from?.first_name ?? msg.from?.username ?? "друг";
    try {
      await resetConversation(chatId, userName);
      await bot.sendMessage(chatId, "✅ Новый чат начат! Выбери режим:", {
        reply_markup: MODE_KEYBOARD,
      });
    } catch (err) {
      logger.error({ err, chatId }, "Telegram /new error");
    }
  });

  bot.on("callback_query", async (query) => {
    const chatId = query.message?.chat.id;
    const data = query.data;
    if (!chatId || !data) return;

    const userName = query.from.first_name ?? query.from.username ?? "друг";

    try {
      await bot.answerCallbackQuery(query.id);

      if (data.startsWith("mode:")) {
        const modeId = data.replace("mode:", "");
        const mode = MODES[modeId];
        if (!mode) return;

        pendingModeMap.set(chatId, modeId);
        await bot.sendMessage(chatId, `*${mode.label}* — выбери тему:`, {
          parse_mode: "Markdown",
          reply_markup: buildTopicKeyboard(modeId),
        });
      } else if (data.startsWith("topic:")) {
        const [, modeId, topicId] = data.split(":");
        const mode = MODES[modeId];
        const topic = TOPICS.find((t) => t.id === topicId);
        if (!mode || !topic) return;

        await bot.sendChatAction(chatId, "typing");
        const conversationId = await getOrCreateConversation(chatId, userName);
        const command = mode.buildCommand(topic.label, topic.emoji);
        await replyWithAI(bot, chatId, conversationId, command);
      } else if (data.startsWith("extra:")) {
        const extraId = data.replace("extra:", "");
        const extra = EXTRAS[extraId];
        if (!extra) return;

        await bot.sendChatAction(chatId, "typing");
        const conversationId = await getOrCreateConversation(chatId, userName);
        await replyWithAI(bot, chatId, conversationId, extra.command);
      }
    } catch (err) {
      logger.error({ err, chatId }, "Telegram callback_query error");
      await bot.sendMessage(chatId, "Упс, что-то пошло не так 😅 Попробуй ещё раз!", {
        reply_markup: MODE_KEYBOARD,
      });
    }
  });

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith("/")) return;

    const userName = msg.from?.first_name ?? msg.from?.username ?? "друг";

    try {
      await bot.sendChatAction(chatId, "typing");
      const conversationId = await getOrCreateConversation(chatId, userName);
      await replyWithAI(bot, chatId, conversationId, text);
    } catch (err) {
      logger.error({ err, chatId }, "Telegram message error");
      await bot.sendMessage(chatId, "Упс, что-то пошло не так 😅 Попробуй ещё раз!");
    }
  });

  bot.on("polling_error", (err) => {
    logger.error({ err }, "Telegram polling error");
  });
}
