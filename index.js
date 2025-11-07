// ====== Farashoghl Quiz Bot (Final Clean Version) ======
import express from "express";
import bodyParser from "body-parser";
import { Telegraf, Markup } from "telegraf";

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID;
const PUBLIC_URL = process.env.PUBLIC_URL;

if (!BOT_TOKEN || !ADMIN_CHANNEL_ID || !PUBLIC_URL) {
  throw new Error("Set BOT_TOKEN, ADMIN_CHANNEL_ID, PUBLIC_URL env vars.");
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// ---------- QUIZ QUESTIONS ----------
const QUESTIONS = [
  "آیا دوست داری رئیس خودت باشی و به کسی پاسخ ندی؟",
  "آیا مدام دنبال فرصت‌های تازه برای درآمد هستی؟",
  "وقتی ایده‌ای داری، فوراً اقدام می‌کنی یا فقط تو ذهنت نگهش می‌داری؟ (اقدام‌گرایی)",
  "آیا مهارتی داری که بقیه حاضر باشن براش پول بدن؟",
  "از معرفی ایده یا محصولت به دیگران لذت می‌بری؟",
  "آیا حاضری چند ماه سخت کار کنی تا بعدش آزاد و ثروتمند بشی؟",
  "وقتی کاری رو شروع می‌کنی، تا تهش میری؟",
  "آیا معتقدید برای رشد سریع‌تر، کمک گرفتن از یک مربی (کوچ) ضروری است؟",
  "آیا فکر می‌کنید سرمایه اولیه کم، بهانه‌ای برای شروع نکردن نیست؟",
  "آیا به سرمایه‌گذاری روی خودت (یادگیری، زمان یا پول) ایمان داری؟"
];

// ---------- RESULT TYPES ----------
const TYPES = [
  { range:[8,10], key:"leader", title:"🦅 رهبر فرصت‌ها", badge:"🏆 نشان طلایی رهبری",
    slogan:"تو سازنده دنیای خودت هستی!",
    analysis:"تو ذهن و اراده‌ی یک کارآفرین واقعی داری. فقط با کوچ و استراتژی مسیرت رو متمرکز کن تا پروازت بلندتر بشه.",
    offers:["کارگاه جامع استادی مشاغل","کوچینگ اختصاصی کسب‌وکار","کارگاه بازاریابی و تبلیغات حرفه‌ای"],
    giftLink:"https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  },
  { range:[5,7], key:"seeker", title:"🔥 جستجوگر مسیر", badge:"💎 نشان نقره‌ای جستجو",
    slogan:"تو آماده‌ای، فقط نقشه می‌خوای!",
    analysis:"نیمه‌ی راه رو رفتی. استعداد و انگیزه داری؛ با یادگیری مسیرسازی، سرعت رشدت چند برابر میشه.",
    offers:["کارگاه رسالت و مسیریابی شغلی","کارگاه درآمدزایی از فضای مجازی","تست‌های استعدادیابی"],
    giftLink:"https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  },
  { range:[3,4], key:"designer", title:"🌿 طراح آینده", badge:"🧭 نشان برنزی مسیر",
    slogan:"فکر بزرگ داری، وقتشه عمل کنی!",
    analysis:"تحلیل‌گر و دقیق هستی، اما گیر نقشه می‌افتی. با کوچینگ انگیزشی و خودشناسی، جهش می‌کنی.",
    offers:["کارگاه کشف رسالت شغلی","کوچینگ انگیزشی","تست ارزش‌ها و شخصیت"],
    giftLink:"https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  },
  { range:[0,2], key:"raw", title:"🌱 الماس خام", badge:"💚 نشان سبز رشد",
    slogan:"هر قهرمانی از همین‌جا شروع کرده.",
    analysis:"اول راهی، اما تصمیم به تغییر یعنی شروع رشد. با آموزش پایه و مشاوره، بنیان محکمی بساز.",
    offers:["کارگاه‌های پایه‌ای فراشغل","تست‌های روانشناسی","مشاوره هدف‌گذاری"],
    giftLink:"https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  }
];

// ---------- MOTIVATIONAL RESPONSES ----------
const POSITIVE_REPLIES = [
  "🔥 آفرین! این دقیقا طرز فکر یک کارآفرینه.",
  "🚀 عالیه! همین ذهنیت مسیر موفقیتت رو می‌سازه.",
  "💡 فوق‌العاده! دید تو نسبت به رشد درسته.",
  "✨ همین طرز فکر باعث جهش توی مسیر شغلی میشه.",
  "👏 قهرمانانه پاسخ دادی! این یعنی یه گام جلوتر از بقیه‌ای."
];
const NEGATIVE_REPLIES = [
  "🌱 نگران نباش، همینکه داری بهش فکر می‌کنی یعنی در مسیر رشدی.",
  "💭 خیلی‌ها از این نقطه شروع کردن؛ تو هم می‌تونی تغییر بدی.",
  "🧩 مهم اینه که بدونی هر باوری قابل تغییره.",
  "🌤 مسیر موفقیت از همین آگاهی شروع میشه.",
  "💬 هر قدم کوچیک، تو رو به رشد واقعی نزدیک‌تر می‌کنه."
];

const userState = new Map();

// ---------- QUIZ FLOW ----------
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

// ---------- RESULT DISPLAY ----------
async function showResult(ctx) {
  const st = userState.get(ctx.from.id);
  if (!st) return;
  const type = getTypeByScore(st.score) || TYPES[3];
  st.typeKey = type.key;

  const header =
    `🎉 تموم شد!\n\nامتیاز تو: *${st.score}* از *${QUESTIONS.length}*` +
    `\nتیپ تو: *${type.title}*\n${type.badge}\n\n«${type.slogan}»\n\n${type.analysis}`;
  const offers = `\n\n💼 پیشنهاد ویژه برای تو:\n• ${type.offers.join("\n• ")}`;
  const askPhone = `\n\n🎁 هدیه اختصاصی و تحلیل کامل رو همین الان بگیر.\nلطفاً شماره موبایل‌ت رو با دکمه زیر ارسال کن.`;

  await ctx.replyWithMarkdown(header + offers + askPhone,
    Markup.keyboard([Markup.button.contactRequest("📱 ارسال شماره موبایل")])
      .oneTime().resize()
  );
  st.awaitingPhone = true;
}

// ---------- HANDLERS ----------
bot.start(async (ctx) => {
  await ctx.reply(
    "✨ خوش اومدی به تست «نقشه گنج درون تو»!\n" +
    "در کمتر از ۳ دقیقه می‌فهمی کدوم قهرمان مسیر شغلی درونت پنهان شده.\nآماده‌ای؟",
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

  const reply = isYes
    ? POSITIVE_REPLIES[Math.floor(Math.random() * POSITIVE_REPLIES.length)]
    : NEGATIVE_REPLIES[Math.floor(Math.random() * NEGATIVE_REPLIES.length)];

  await ctx.reply(reply);
  return askNext(ctx);
});

// ---------- CONTACT HANDLER ----------
bot.on("contact", async (ctx) => {
  const st = userState.get(ctx.from.id);
  if (!st) return ctx.reply("برای شروع /start رو بزن.");
  st.awaitingPhone = false;

  const phone = ctx.message.contact.phone_number;
  const type = getTypeByScore(st.score) || TYPES[3];
  const gifts =
    `🎁 هدیه اختصاصی تو آماده‌ی دانلوده:\n${type.giftLink}\n\n` +
    `📣 به جامعه فراشغل بپیوند:\nhttps://t.me/+RXtqgGDCVvE0MmE0`;

  await ctx.reply(`✅ دریافت شد! شماره‌ات ثبت شد: ${phone}`);
  await ctx.reply(gifts, Markup.inlineKeyboard([
    [Markup.button.url("🌐 ورود به سایت", "https://farashoghl.ir/")],
    [Markup.button.url("💬 ارتباط در واتساپ", "https://wa.me/989357820120")]
  ]));

  await ctx.reply(
    "دوست گرامی خوشحال هستم که این سنجش و تست را به پایان رساندی،\n" +
    "تا 5 روز منتظر هدایا و پیشنهادات خاص ما همینجا باش.\n\n" +
    "مرکز توانمندسازی، آموزش و مشاوره کارآفرینی فراشغل"
  );

  // ---- ارسال لید به کانال ادمین ----
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
  await ctx.telegram.sendMessage(ADMIN_CHANNEL_ID, lead, { disable_web_page_preview: true });

  // ---- زمان‌بندی پیام‌های بعدی ----
  scheduleFollowUps(ctx, u.id);
});

// ---------- FOLLOW-UP MESSAGES ----------
function scheduleFollowUps(ctx, userId) {
  const followUps = [
    { delay: 24 * 60 * 60 * 1000, text: "💫 تبریک قهرمان! امروز یه قدم بزرگ برای رشد و شناخت خودت برداشتی...\n👇 تست استعدادیابی شغلی:\nhttps://farashoghl.ir/product/job-test/" },
    { delay: 48 * 60 * 60 * 1000, text: "🎓 آموزش رایگان: کشف رسالت زندگی و مسیر شغلی 👇\nhttps://farashoghl.ir/product/kashfe-resalat/" },
    { delay: 72 * 60 * 60 * 1000, text: "🔍 تست استعدادیابی شغلی رو انجام بده و نتیجه‌اش رو برام بفرست تا تحلیلش رو بگم 👇\nhttps://farashoghl.ir/product/job-test/" },
    { delay: 96 * 60 * 60 * 1000, text: "🌟 یه نفر مثل تو از همین تست شروع کرد… الان مدرس و کارآفرینه!\nمشاهده کارگاه:\nhttps://farashoghl.ir/product/kashfe-resalat/" },
    { delay: 110 * 60 * 60 * 1000, text: "🚀 سلام قهرمان مسیرت!\nفقط تا ۴۸ ساعت برای تخفیف ۵۰٪ کارگاه فرصت داری 👇\nواتساپ: 09357820120" }
  ];
  followUps.forEach((f, i) => {
    setTimeout(() => {
      bot.telegram.sendMessage(userId, f.text, {
        disable_web_page_preview: true
      });
    }, f.delay);
  });
}

// ---------- WEBHOOK ----------
app.use(bodyParser.json());
app.use(bot.webhookCallback("/tg"));
bot.telegram.setWebhook(`${PUBLIC_URL}/tg`);

app.get("/", (req, res) => res.send("Farashoghl Quiz Bot is running."));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
