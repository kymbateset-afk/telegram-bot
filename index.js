if (allTopics.includes(text)) {
    userState[chatId].topic = text;

    // Генерация слов по теме через OpenAI
    const prompt = `Составь список из 7-10 полезных слов на тему "${text}" на казахском языке. Для каждого слова приведи короткий пример предложения.`;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300
        });

        const wordsList = response.data.choices[0].message.content;
        bot.sendMessage(chatId, `📚 Тема: ${text}\nВот список слов и примеры:\n${wordsList}\n\nТеперь можешь писать слова или фразы для перевода, диалога или других функций.`);

    } catch (err) {
        console.error(err);
        bot.sendMessage(chatId, "Ошибка AI при генерации слов. Попробуй снова.");
    }

    return;
}
