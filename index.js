import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, CallbackQueryHandler, ContextTypes, MessageHandler, filters

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

# Токен бота (использовать осторожно!)
TELEGRAM_TOKEN = "8377374383:AAEshDX55M6WF5ZQR0yRv1sJXr7JoSjfUiA"

# Темы
topics = ['Школа', 'Еда', 'Природа', 'Семья', 'Космос', 'Город']

# Функции
functions = [
    'Перевод', 'Тест', 'Грамматика', 'Соответствие', 'Диалог', 'Составление',
    'Сложная грамматика', 'Тренировка диалога', 'Расширение словарного запаса', 'Проверка эссе'
]

# Хранение состояния пользователя
user_state = {}

def build_keyboard(options):
    keyboard = [[InlineKeyboardButton(opt, callback_data=opt)] for opt in options]
    return InlineKeyboardMarkup(keyboard)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Привет! Я помогу тебе изучать казахский язык. Выбери функцию:",
        reply_markup=build_keyboard(functions)
    )

async def handle_function(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    function = query.data
    user_state[query.from_user.id] = {'function': function}
    await query.message.reply_text(
        f"Вы выбрали функцию: {function}. Теперь выбери тему:",
        reply_markup=build_keyboard(topics)
    )

async def handle_topic(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    topic = query.data
    user_state[query.from_user.id]['topic'] = topic
    function = user_state[query.from_user.id]['function']
    await query.message.reply_text(f"Функция: {function}, Тема: {topic}")

    if function == 'Перевод':
        await query.message.reply_text("Напиши слово или фразу для перевода.")
    elif function == 'Тест':
        await query.message.reply_text(f"Начнем тест по теме {topic}.")
    elif function == 'Грамматика':
        await query.message.reply_text(f"Объясняем грамматику по теме {topic}.")
    elif function == 'Сложная грамматика':
        await query.message.reply_text(f"Объяснение сложной грамматики по теме {topic} с примерами и таблицами.")
    elif function == 'Тренировка диалога':
        await query.message.reply_text(f"Начнем диалог на тему {topic}. Я буду исправлять ошибки.")
    elif function == 'Расширение словарного запаса':
        await query.message.reply_text(f"Составляем список новых слов и мини-тест по теме {topic}.")
    elif function == 'Проверка эссе':
        await query.message.reply_text(f"Отправьте текст на казахском для проверки и улучшения стиля.")

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.message.from_user.id
    if user_id not in user_state:
        await update.message.reply_text("Сначала выбери функцию через /start")
        return
    function = user_state[user_id]['function']
    topic = user_state[user_id]['topic']
    text = update.message.text

    if function == 'Перевод':
        await update.message.reply_text(f"Перевод '{text}' на казахский: [пример перевода]")
    elif function in ['Грамматика', 'Сложная грамматика']:
        await update.message.reply_text(f"Объяснение грамматики для '{text}' по теме {topic}")
    elif function == 'Тренировка диалога':
        await update.message.reply_text(f"Продолжаем диалог на тему {topic}: [пример]")
    elif function == 'Расширение словарного запаса':
        await update.message.reply_text(f"Слова и мини-тест по теме {topic}: [пример]")
    elif function == 'Проверка эссе':
        await update.message.reply_text(f"Проверка текста: '{text}' [пример исправлений]")
    else:
        await update.message.reply_text(f"Вы выбрали '{text}' для функции {function}")

if __name__ == '__main__':
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle_function, pattern='^(' + '|'.join(functions) + ')$'))
    app.add_handler(CallbackQueryHandler(handle_topic, pattern='^(' + '|'.join(topics) + ')$'))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    app.run_polling()
