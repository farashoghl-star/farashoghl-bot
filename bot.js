const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// گرفتن توکن از متغیر محیطی
const token = process.env.BOT_TOKEN;
const adminChannelId = process.env.ADMIN_CHANNEL_ID;
const publicUrl = process.env.PUBLIC_URL;

// ایجاد بات
const bot = new TelegramBot(token, { polling: false });

// تنظیم وب‌هوک
bot.setWebHook(`${publicUrl}/bot${token}`);

// مسیر دریافت پیام‌ها از تلگرام
app.post(`/bot${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// روت اصلی برای چک کردن سلامت سرویس
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// مدیریت پیام‌ها
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text === '/start') {
    bot.sendMessage(chatId, 'سلام! به بات فراشغل خوش آمدید. لطفا شماره خود را ارسال کنید.');
  } else {
    // ذخیره اطلاعات در کانال
    bot.sendMessage(adminChannelId, `لید جدید:\nشماره: ${text}\nChat ID: ${chatId}`);
    bot.sendMessage(chatId, 'متشکرم! همکاران ما به زودی با شما تماس می‌گیرند.');
  }
});

// راه‌اندازی سرور
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Bot server is running on port ${port}`);
});
