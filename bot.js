// index.js
import express from "express";
import { Telegraf, Markup } from "telegraf";
import fetch from "node-fetch";

const BOT_TOKEN = "8265835382:AAHMn_jkdDyBvjjZ_dx9nvzr5RdzPnoOqzw";
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID;
const PUBLIC_URL = process.env.PUBLIC_URL;

if (!BOT_TOKEN || !ADMIN_CHANNEL_ID || !PUBLIC_URL) {
  throw new Error("Set BOT_TOKEN, ADMIN_CHANNEL_ID, PUBLIC_URL env vars.");
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

const QUESTIONS = [
  "آیا دوست داری رئیس خودت باشی و به کسی پاسخ ندی؟",
  "آیا مدام دنبال فرصت‌های تازه برای درآمد هستی؟",
  "وقتی ایده‌ای داری، فوراً اقدام می‌کنی یا فقط تو ذهنت نگهش می‌داری؟ (اقدام‌گرایی)",
  "آیا مهارتی داری که بقیه حاضر باشن براش پول بدن؟",
  "از معرفی ایده یا محصولت به دیگران لذت می‌بری؟",
  "آیا حاضری چند ماه سخت کار کنی تا بعدش آزاد و ثروتمند بشی؟",
  "وقتی کاری رو شروع می‌کنی، تا تهش میری؟",
  "کسی هست که از تصمیم شغلی‌ت حمایت کنه؟ (روحی/مالی)",
  "باورت اینه که «حق با مشتریه»؟",
  "آیا به سرمایه‌گذاری روی خودت (یادگیری، زمان یا پول) ایمان داری؟"
];

const GIFT_LINK = "https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf";
const CHANNEL_LINK = "https://t.me/+RXtqgGDCVvE0MmE0";

const TYPES = [
  {
    range: [8, 10],
    key: "leader",
    title: "🦅 رهبر فرصت‌ها",
    badge: "🏆 نشان طلایی رهبری",
    slogan: "تو سازنده دنیای خودت هستی!",
    analysis:
      "تو ذهن و اراده‌ی یک کارآفرین واقعی داری. فقط با کوچ و استراتژی مسیرت رو متمرکز کن تا پروازت بلندتر بشه.",
    offers: [
      "کارگاه جامع استادی مشاغل",
      "کوچینگ اختصاصی کسب‌وکار",
      "کارگاه بازاریابی و تبلیغات حرفه‌ای"
    ],
    giftLink: GIFT_LINK,
  },
  {
    range: [5, 7],
    key: "seeker",
    title: "🔥 جستجوگر مسیر",
    badge: "💎 نشان نقره‌ای جستجو",
    slogan: "تو آماده‌ای، فقط نقشه می‌خوای!",
    analysis:
      "نیمه‌ی راه رو رفتی. استعداد و انگیزه داری؛ با یادگیری مسیرسازی، سرعت رشدت چند برابر میشه.",
    offers: [
      "کارگاه رسالت و مسیریابی شغلی",
      "کارگاه درآمدزایی از فضای مجازی",
      "تست‌های استعدادیابی (کلیفتون، هالند، گاردنر...)"
    ],
    giftLink: GIFT_LINK,
  },
  {
    range: [3, 4],
    key: "designer",
    title: "🌿 طراح آینده",
    badge: "🧭 نشان برنزی مسیر",
    slogan: "فکر بزرگ داری، وقتشه عمل کنی!",
    analysis:
      "تحلیل‌گر و دقیق هستی، اما گیرِ نقشه می‌افتی. با کوچینگ انگیزشی و خودشناسی، جهش می‌کنی.",
    offers: [
      "کارگاه کشف رسالت شغلی",
      "کوچینگ انگیزشی",
      "تست ارزش‌ها و شخصیت"
    ],
    giftLink: GIFT_LINK,
  },
  {
    range: [0, 2],
    key: "raw",
    title: "🌱 الماس خام",
    badge: "💚 نشان سبز رشد",
    slogan: "هر قهرمانی از همین‌جا شروع کرده.",
    analysis:
      "اول راهی، اما تصمیم به تغییر یعنی شروع رشد. با آموزش پایه و مشاوره، بنیان محکمی بساز.",
    offers: [
      "کارگاه‌های پایه‌ای فراشغل",
      "تست‌های روانشناسی",
      "مشاوره هدف‌گذاری"
    ],
    giftLink: GIFT_LINK,
  }
];

const userState = new Map();

function getTypeByScore(score) {
  return TYPES.find(t => score >= t.range[0] && score <= t.range[1]);
}

function startQuiz(ctx) {
  userState.set(ctx.from.id, { index: 0, score: 0, answers: [] });
  return askNext(ctx);
}

function askNext(ctx) {
  const st = userState.get(ctx.from.id);
  if (!st) return ctx.reply("برای شروع /start رو بزن.");
  if (st.index >= QUESTIONS.length) return showResult(ctx);
  const qNum = st.index + 1;
  const text = `سؤال ${qNum} از ${QUESTIONS.length}\n\n${QUESTIONS[st.index]}`;
  return ctx.reply(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ بله", "ans_yes"), Markup.button.callback("❌ خیر", "ans_no")]
    ])
  );
}

async function showResult(ctx) {
  const st = userState.get(ctx.from.id);
  if (!st) return;
  const type = getTypeByScore(st.score) || TYPES[3];
  st.typeKey = type.key;

  const header = `🎉 تموم شد!\n\nامتیاز تو: *${st.score}* از *${QUESTIONS.length}*\nتیپ تو: *${type.title}*\n${type.badge}\n\n«${type.slogan}»\n\n${type.analysis}`;
  const offers = `\n\n💼 پیشنهاد ویژه برای تو:\n• ${type.offers.join("\n• ")}`;
  const askPhone = `\n\n🎁 هدیه اختصاصی و تحلیل کامل رو همین الان بگیر.\nلطفاً شماره موبایل‌ت رو با دکمه زیر ارسال کن.`;

  await ctx.replyWithMarkdown(header + offers + askPhone,
    Markup.keyboard([
      Markup.button.contactRequest("📱 ارسال شماره موبایل")
    ]).oneTime().resize()
  );
}

bot.start(async (ctx) => {
  await ctx.reply(
    "✨ خوش اومدی به تست «نقشه گنج درون تو»!\nدر کمتر از ۳ دقیقه می‌فهمی کدوم قهرمان مسیر شغلی درونت پنهان شده.\nآماده‌ای؟",
    Markup.inlineKeyboard([[Markup.button.callback("بله، شروع کنیم! ▶️", "start_quiz")]])
  );
});

bot.action("start_quiz", async (ctx) => {
  await ctx.answerCbQuery();
  await startQuiz(ctx);
});

bot.action(["ans_yes","ans_no"], async (ctx) => {
  await ctx.answerCbQuery();
  const st = userState.get(ctx.from.id);
  if (!st) return ctx.reply("برای شروع /start رو بزن.");

  const isYes = ctx.match[0] === "ans_yes";
  st.answers.push(isYes ? "بله" : "خیر");
  if (isYes) st.score += 1;
  st.index += 1;

  const micro = isYes
    ? "✅ درست مثل کارآفرین‌ها فکر می‌کنی!"
    : "🌱 اشکالی نداره، همه از یه جایی شروع می‌کنن.";

  await ctx.reply(micro);
  return askNext(ctx);
});

bot.on("contact", async (ctx) => {
  const st = userState.get(ctx.from.id);
  if (!st) return ctx.reply("برای شروع /start رو بزن.");
  const phone = ctx.message.contact.phone_number;
  st.phone = phone;

  const type = getTypeByScore(st.score) || TYPES[3];
  const gifts = `🎁 هدیه اختصاصی تو آماده‌ی دانلوده:\n${type.giftLink}\n\n📣 به جامعه فراشغل بپیوند:\n${CHANNEL_LINK}`;

  await ctx.reply(`✅ دریافت شد! شماره‌ات ثبت شد: ${phone}`);
  await ctx.reply(gifts);

  const u = ctx.from;
  const lead = [
    "📥 لید جدید «نقشه گنج»:",
    `نام: ${u.first_name || ""} ${u.last_name || ""}`.trim(),
    `یوزرنیم: @${u.username || "—"}`,
    `ID: ${u.id}`,
    `امتیاز: ${st.score}/${QUESTIONS.length}`,
    `تیپ: ${type.title}`,
    `موبایل: ${phone}`,
    `پاسخ‌ها: ${st.answers.join(", ")}`
  ].join("\n");

  await ctx.telegram.sendMessage(
