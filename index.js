
const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const express = require('express');


const app = express();
const port = 3000;

const axios = require('axios');

const API_KEY = '2f5f453f0819618f0e2c2c68';

const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/RUB`;


// app.use(bodyParser.json());

const webAppUrl = 'https://total-geek.ru'
const maxUserId = '@vidalrain'
let userCalcedPrice;





let CNY_EXCHANGE_RATE;
const BACKUP_EX_RATE = () => {
    if(CNY_EXCHANGE_RATE === undefined){
        return 12.75
    } else {
        return CNY_EXCHANGE_RATE
    }
    
} 


axios.get(url)
    .then(response => {
        console.log(response.data);
        CNY_EXCHANGE_RATE = response.data.conversion_rates.CNY
        console.log(CNY_EXCHANGE_RATE)
    })
    .catch(error => {
        console.error('Error fetching data:', error.message);
    });



const token = config.get('TELEGRAM_TOKEN');
let chatId;
let calcFlag = false;
let POIZONFlag = false;

const bot = new TelegramBot(token, { polling: true });
let additionalAmount = 0;

function CNYCalculation(message) {
    let messageInCNY = message


    if (messageInCNY > 200 && messageInCNY < 500) {
        additionalAmount = 3000 
    } else if (messageInCNY >= 500 && messageInCNY < 1000) {
        additionalAmount = 4000 
    }

    return (parseFloat(messageInCNY / BACKUP_EX_RATE() ) + additionalAmount) ;
}



bot.on('message', async (msg) => {
    chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message from chat:', chatId);

    if (calcFlag) {
        const message = msg.text;
        const messageNumber = CNYCalculation(message)
        userCalcedPrice = messageNumber.toFixed(2) + ' рублей'
        await bot.sendMessage(chatId, messageNumber.toFixed(2) + ' рублей');
        setTimeout(()=>{
             bot.sendMessage(chatId, 'Для оформления заказа перейди в чат к менеджеру @vidalrain 😉\n\n Твой RainZone!')
        },500)
        await bot.sendMessage(5153645020, userCalcedPrice) //отправка суммы Максу
        await bot.sendMessage(5153645020, msg.from.username) //отправка тэга юзера рассчитывавшего суммы Максу
        calcFlag = false;
    }

    switch (text) {
        case 'РАССЧИТАТЬ СТОИМОСТЬ':
            await bot.sendMessage(msg.from.id, 'Введите сумму в юанях \u2192');
            calcFlag = true;
            break;
        case 'Нет POIZON / Что такое POIZON?':
            await bot.sendMessage(msg.from.id, 'Помогу тебе с установкой POIZON\n\n1️⃣ Для начала перейди по ссылке https://h5.dewu.com/\n\n2️⃣ Сканируем QR-code\n\n3️⃣ В открывшемся окне выбираем "Перейти на сайт"\n\n4️⃣ Далее нажимаем и скачиваем приложение\n\n5️⃣ После установки Play Market заходим в него ( если не переместило автоматически ). После чего загрузка должна начаться автоматически ( если этого не произошло вбить в поисковую строку "dewu" и скачать POIZON самостоятельно\n\n Для iOS и Android туториал аналогичен')
            POIZONFlag = true;
        default:
            break;
    }

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Привет, это Rain Zone Bot!\n\nЯ помогу подобрать одежду и рссчитать стоимость из RUB в CNY, выбери чем я могу тебе помочь!\n\nЕсли тебя интересует наш каталог товаров которые уже у нас в наличии, то жми кнопку "ОФОРМИТЬ ЗАКАЗ"\n\nЕсли ты хочешь заказать прямо с POIZON жми кнопку "РАССЧИТАТЬ СТОИМОСТЬ"\n\nP.S:Если не нашёл какой-то товар в разделе "ОФОРМИТЬ ЗАКАЗ", жми "РАССЧИТАТЬ СТОИМОСТЬ"', {
            reply_markup: {
                inline_keyboard: [

                ],
                keyboard : [
                    [{text: '✅ ОФОРМИТЬ ЗАКАЗ 👟', web_app: {url: webAppUrl}}],
                    [{ text: 'РАССЧИТАТЬ СТОИМОСТЬ'}],
                    [{text: 'Нет POIZON / Что такое POIZON?'}]
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



