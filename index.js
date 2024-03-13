//CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT CLIENT


const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const express = require('express')
const app = express()

const token = config.get('TELEGRAM_TOKEN');
let calcFlag = false;
let findItemFlag = false;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Привет, это Rain Zone Bot!\nПомогу подобрать одежду и рассчитать стоимость из RUB в CNY, выбери, чем я могу тебе помочь!\nPS: Если тебя интересует наш полный каталог, то жми зеленую кнопку "САЙТ" ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Рассчитать стоимость RUB --> CNY', callback_data: 'calc' }],
                    [{ text: 'Найти конкретный товар по наименованию и цене',callback_data: 'find_item'}],
                    [{ text: 'Сделать заказ (зная наименование товара)',callback_data: 'offer_item'}]
                ]
            }
        });

    }
    if(findItemFlag){
        await bot.sendMessage(msg.from.id, 'Sorry this feature is still in process');
        findItemFlag = false;
    }
    if (calcFlag) {
        // Use msg.text instead of ctx.message.text
        const message = msg.text;
        const messageNumber = parseFloat(message) / 12.75;
        // Use bot.sendMessage instead of ctx.reply
        await bot.sendMessage(chatId, messageNumber.toFixed(2) + ' CNY');
        calcFlag = false;
    }
});

app.get('/getChatId', (req,res) => {
    res.json({chatId})
})

bot.on('callback_query', async (msg) => {
    const buttonData = msg.data; // Use msg.data instead of msg.callbackQuery.data

    switch (buttonData) {
        case 'calc':
            // Use bot.sendMessage instead of ctx.reply
            await bot.sendMessage(msg.from.id, 'Введите сумму в RUB \u2192');
            await bot.sendMessage(msg.from.id, 'Формула здесь-->');
            calcFlag = true;
            break;
        case 'find_item':
            await bot.sendMessage(msg.from.id, 'Введите конкретное наименование товара или его стоимость');
            findItemFlag = true;
            break;
        default:
            // Handle other cases or do nothing
            break;
    }

    // Use bot.answerCallbackQuery instead of ctx.answerCbQuery
    await bot.answerCallbackQuery(msg.id);
});
