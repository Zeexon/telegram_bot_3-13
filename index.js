
const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const express = require('express');
const fs = require('fs');
const notion = require('./notion.js');
const namesData = notion.dbData

const app = express();
const port = 3000;

const axios = require('axios');

const API_KEY = '2f5f453f0819618f0e2c2c68';

const url = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/RUB`;


// app.use(bodyParser.json());

const webAppUrl = 'https://total-geek.ru'
const maxUserId = '@vidalrain'
let userCalcedPrice;
const poizon_img_path = './imgs/poizon.jpg'



let CNY_EXCHANGE_RATE;
const BACKUP_EX_RATE = () => {
    return 13.3
    
} 


function generateRefferalCode(){
    return Math.random().toString(36).substr(2,6)
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
    if(messageInCNY === 0){
        additionalAmount = 0;
    }
    else if (messageInCNY <= 10 && messageInCNY >= 1){
        additionalAmount = 20
    }
    else if(messageInCNY <= 50 && messageInCNY > 10) {
        additionalAmount = 500
    }
    else if(messageInCNY <= 200 && messageInCNY > 50){
        additionalAmount = 1500
    }
    else if (messageInCNY >= 200 && messageInCNY < 500) {
        additionalAmount = 3000 
    } 
    else if (messageInCNY >= 500 && messageInCNY <= 1000) {
        additionalAmount = 3500;
    } 
    else if (messageInCNY > 1000){
        additionalAmount = 3500;
    }

    return (parseFloat(messageInCNY * 13.3 ) + additionalAmount) ;
}

bot.onText(/\/start(.+)?/, (msg, match) => {
    const referralCode = match ? match[1] : null; // Check if match exists before accessing match[1]
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Привет, это Rain Zone Bot!\n\nЯ помогу подобрать одежду и рссчитать стоимость из RUB в CNY, выбери чем я могу тебе помочь!\n\nЕсли тебя интересует наш каталог товаров которые уже у нас в наличии, то жми кнопку "ОФОРМИТЬ ЗАКАЗ"\n\nЕсли ты хочешь заказать прямо с POIZON жми кнопку "РАССЧИТАТЬ СТОИМОСТЬ"\n\nЕсли у тебя еще нет POIZON, то жми "Что такое POIZON?"', {
        reply_markup: {
            keyboard : [
                [{text: '✅ ОФОРМИТЬ ЗАКАЗ 👟', web_app: {url: webAppUrl}}],
                [{ text: 'РАССЧИТАТЬ СТОИМОСТЬ'}],
                [{text: 'Что такое POIZON?'}],
            ]
        },
    });

    // bot.sendMessage(chatId, 'Хочешь получить скидку? Пригласи друзей', {
    //     reply_markup: {
    //         inline_keyboard: [
    //             [{ text: 'Ссылка для приглашения',  callback_data: 'invite-link'}],
    //         ],
    //     }
    // });
});




bot.on('message', async (msg) => {
    chatId = msg.chat.id;
    const text = msg.text;

    console.log('Received message from chat:', chatId);

    if(msg.text === 'getdata'){
        await notion.getData()
        let dataBotReplyArr = []
        namesData.map(item => dataBotReplyArr.push(item))
        const joinedString = dataBotReplyArr.join(' ')
        await bot.sendMessage(1147005801, joinedString)
    }

    if (calcFlag) {
        const message = msg.text;
        const messageNumber = CNYCalculation(message)
        userCalcedPrice = messageNumber.toFixed(0) + ' рублей'
        if(!isNaN(messageNumber)){
            await bot.sendMessage(chatId, messageNumber.toFixed(0)  + ' рублей');
            setTimeout(()=>{
                bot.sendMessage(chatId, 'Для оформления заказа перейди в чат к менеджеру @vidalrain 😉\n\nТвой RainZone!')
           },500)
        } else {
            await bot.sendMessage(chatId, 'Сумма не была введена')
        }
        


        await bot.sendMessage(5153645020, 'РАССЧИТАТЬ СТОИМОСТЬ "ЗАКАЗ"')
        await bot.sendMessage(5153645020, userCalcedPrice) //отправка суммы Максу
        await bot.sendMessage(5153645020, msg.from.username) //отправка тэга юзера рассчитывавшего суммы Максу
        try {
            const userTag = msg.from.username
            const notionResponse = await notion.create(userTag);
            await bot.sendMessage(1147005801, notionResponse.url)
        } catch(e){
            console.log('Error pushing data into database:', e)
        }
        calcFlag = false;
    }

    switch (text) {
        case 'РАССЧИТАТЬ СТОИМОСТЬ':
            await bot.sendMessage(msg.from.id, 'Введите сумму в юанях \u2192');
            await bot.sendMessage(msg.from.id, 'Например: 777')
            calcFlag = true;
            break;
        case 'Что такое POIZON?':
            await bot.sendMessage(msg.from.id, 'POIZON - китайский маркетплейс с дизайнерскими,\nбредовыми товарами, которые проходят проверку на\nоригинальность в несколько этапов. Риск получить\nподделку практически нулевой. В маркетплейсе есть\nкрупные streetwear бренды, представители люксового\nсегмента, официальные дистрибьюторы и перекупы', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Скачать для ANDROID', callback_data: 'ANDROID'}],
                        [{text: 'Скачать для IPHONE', callback_data: 'IPHONE'}]
                    ],
                }
            })
            fs.readFile(poizon_img_path, (err, img) => {
                if (err) {
                  console.error('Error reading image file:', err);
                  return;
                }
              
                // Send the image
                bot.sendPhoto(chatId, img)
                  .then(() => {
                    console.log('Image sent successfully.');
                  })
                  .catch((error) => {
                    console.error('Error sending image:', error);
                  });
              });

            POIZONFlag = true;

        default:
            break;
    }


    if(msg?.web_app_data?.data){
        try{
            const data = JSON.parse(msg?.web_app_data?.data)
            await  bot.sendMessage(chatId, 'Ваш заказ принят!')
            await bot.sendMessage(5153645020, 'ОФОРМЛЕНИЕ ЗАКАЗА С КАТАЛОГА')
            await bot.sendMessage(5153645020, data?.title)
            await bot.sendMessage(5153645020, data?.price)
            await bot.sendMessage(5153645020, msg.from.username)
            setTimeout(()=>{
                bot.sendMessage(chatId, data?.title)
            },200)
            setTimeout(()=>{
                bot.sendMessage(chatId, data?.price)
            },400)
            setTimeout(() => {
                 bot.sendMessage(chatId, 'Для оформления заказа перейди в чат к менеджеру @vidalrain 😉\n\nТвой RainZone!')
            }, 600);
        } catch (e) {
            console.log(e)
        }

    }
});

bot.on('callback_query',(callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    switch (data) {
        case 'invite-link':
            bot.sendMessage(chatId, 'In process')
            break
        default:
          bot.sendMessage(chatId, 'Unknown button clicked');
      }
})








