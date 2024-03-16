
const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const express = require('express');
const fs = require('fs')
const app = express();
const webAppUrl = 'https://total-geek.ru'
const rublePhotoPath = './imgs/ruble_image.jpg'
const rublePhoto = fs.readFileSync(rublePhotoPath)
const CNYPhotoPath = './imgs/CNYimg.jpg'
const CNYPhoto = fs.readFileSync(CNYPhotoPath)

const token = config.get('TELEGRAM_TOKEN');
let chatId;
let calcFlag = false;

const bot = new TelegramBot(token, { polling: true });

function CNYCalculation(message) {
    let messageInCNY = message / 12.75
    let additionalAmount = 0;

    if (messageInCNY > 200 && messageInCNY < 500) {
        additionalAmount = 3000 / 12.75;
    } else if (messageInCNY >= 500 && messageInCNY < 1000) {
        additionalAmount = 4000 / 12.75;
    }

    return (parseFloat(messageInCNY + additionalAmount)) ;
}


bot.on('message', async (msg) => {
    chatId = msg.chat.id;
    const text = msg.text;

    if (calcFlag) {
        const message = msg.text;
        const messageNumber = CNYCalculation(message)
        await bot.sendPhoto(chatId, CNYPhoto)
        await bot.sendMessage(chatId, messageNumber.toFixed(2) + ' CNY');
        calcFlag = false;
    }

    switch (text) {
        case 'ЗАКАЗАТЬ С POIZON':
            await bot.sendMessage(msg.from.id, 'Введите сумму в RUB \u2192');
            await bot.sendPhoto(msg.from.id, rublePhoto)
            await bot.sendMessage(msg.from.id, 'Формула здесь-->');
            calcFlag = true;
            break;
        default:
            break;
    }

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Привет, это Rain Zone Bot!\nПомогу подобрать одежду и рассчитать стоимость из RUB в CNY, выбери, чем я могу тебе помочь!\nPS: Если тебя интересует наш каталог товаров которые уже у нас в наличии, то жми большую кнопку "ОФОРМИТЬ ЗАКАЗ" внизу экрана \n Елси ты хочешь заказать прямо с  POIZON жми кнопку "ЗАКАЗАТЬ С POIZON"', {
            reply_markup: {
                inline_keyboard: [

                ],
                keyboard : [
                    [{text: '✅ ОФОРМИТЬ ЗАКАЗ 👟', web_app: {url: webAppUrl}}],
                    [{ text: 'ЗАКАЗАТЬ С POIZON'}],
                ]
            },
        });

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



