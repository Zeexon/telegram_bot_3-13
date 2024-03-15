
const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const express = require('express');
const app = express();
const webAppUrl = 'https://total-geek.ru'

const token = config.get('TELEGRAM_TOKEN');
let chatId;
let calcFlag = false;
let findItemFlag = false;
let orderButtonData = {title:'',price:''}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
    chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        case 'Рассчитать RUB --> CNY':
            await bot.sendMessage(msg.from.id, 'Введите сумму в RUB \u2192');
            await bot.sendMessage(msg.from.id, 'Формула здесь-->');
            calcFlag = true;
            break;
        default:
            break;
    }

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Привет, это Rain Zone Bot!\nПомогу подобрать одежду и рассчитать стоимость из RUB в CNY, выбери, чем я могу тебе помочь!\nPS: Если тебя интересует наш полный каталог, то жми большую кнопку "ОФОРМИТЬ ЗАКАЗ" внизу экрана', {
            reply_markup: {
                inline_keyboard: [

                ],
                keyboard : [
                    [{text: '✅ ОФОРМИТЬ ЗАКАЗ 👟', web_app: {url: webAppUrl}}],
                    [{ text: 'Рассчитать RUB --> CNY'}],
                ]
            },
        });

    }
    if(findItemFlag){
        await bot.sendMessage(msg.from.id, 'Sorry this feature is still in process');
        findItemFlag = false;
    }
    if (calcFlag) {
        const message = msg.text;
        const messageNumber = parseFloat(message) / 12.75;
        await bot.sendMessage(chatId, messageNumber.toFixed(2) + ' CNY');
        calcFlag = false;
    }
    if(msg?.web_app_data?.data){
        try{
            const data = JSON.parse(msg?.web_app_data?.data)
            await  bot.sendMessage(chatId, 'Спасибо за обратную связь')
            await  bot.sendMessage(chatId, data?.title)
            await  bot.sendMessage(chatId, data?.price)
        } catch (e) {
            console.log(e)
        }

    }
});

app.get('/getChatId', (req,res) => {
    res.json({chatId})
})

app.post('/inmess', (req, res) => {
    const { title, price } = req.body;
    orderButtonData = {title:title, price:price}

    bot.sendMessage(chatId, `Received data:\nTitle: ${title}\nPrice: ${price}`)
    .then(() => {
      console.log('Message sent successfully');
      res.json({ success: true });
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    });

  
    console.log('Received data from the website:', { title, price });
  
    res.json({ success: true });
});

// bot.on('callback_query', async (msg) => {
//     const buttonData = msg.data; 

    // switch (buttonData) {
    //     case 'calc':
    //         await bot.sendMessage(msg.from.id, 'Введите сумму в RUB \u2192');
    //         await bot.sendMessage(msg.from.id, 'Формула здесь-->');
    //         calcFlag = true;
    //         break;
    //     case 'find_item':
    //         await bot.sendMessage(msg.from.id, 'Введите конкретное наименование товара или его стоимость');
    //         findItemFlag = true;
    //         break;
    //     default:
    //         break;
    // }

//     await bot.answerCallbackQuery(msg.id);
// });
