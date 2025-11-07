// ===== Farashoghl Quiz Bot — Final Robust Version =====
import express from "express";
import bodyParser from "body-parser";
import { Telegraf, Markup } from "telegraf";
import fs from "fs";
import path from "path";

// --------- ENV ----------
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHANNEL_ID = process.env.ADMIN_CHANNEL_ID; // -100...
const PUBLIC_URL = process.env.PUBLIC_URL; // https://...onrender.com
const DATA_DIR = process.env.DATA_DIR || "/var/data";

if (!BOT_TOKEN || !ADMIN_CHANNEL_ID || !PUBLIC_URL) {
  throw new Error("Set BOT_TOKEN, ADMIN_CHANNEL_ID, PUBLIC_URL env vars.");
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

// --------- STORAGE PATHS ----------
const FOLLOWUPS_PATH = path.join(DATA_DIR, "followups.json");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(FOLLOWUPS_PATH)) fs.writeFileSync(FOLLOWUPS_PATH, "[]", "utf8");

// --------- QUIZ CONTENT ----------
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
    giftFile:
      "https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
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
      "تست‌های استعدادیابی"
    ],
    giftFile:
      "https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
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
    giftFile:
      "https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  },
  {
    range: [0, 2],
    key: "raw",
    title: "🌱 الماس خام",
    badge: "💚 نشان سبز رشد",
    slogan: "هر قهرمانی از همین‌جا شروع کرده.",
    analysis:
      "اول راهی، اما تصمیم به تغییر یعنی شروع رشد. با آموزش پایه و مشاوره، بنیان محکمی بساز.",
    offers: ["کارگاه‌های پایه‌ای فراشغل", "تست‌های روانشناسی", "مشاوره هدف‌گذاری"],
    giftFile:
      "https://farashoghl.ir/wp-content/uploads/2025/09/razhaye_mamnoe_mashaghl.pdf"
  }
];

// --------- REPLIES ---------
const POSITIVE_REPLIES = [
  "🔥 آفرین! این دقیقا طرز فکر یک کارآفرینه.",
  "🚀 عالیه! همین ذهنیت مسیر موفقیتت رو می‌سازه.",
  "💡 فوق‌العاده! دید تو نسبت به رشد درسته.",
  "✨ همین طرز فکر باعث جهش توی مسیر شغلی میشه.",
  "👏 قهرمانانه پاسخ دادی! یه گام جلوتر از بقیه‌ای."
];
const NEGATIVE_REPLIES = [
  "🌱 نگران نباش، همینکه داری بهش فکر می‌کنی یعنی در مسیر رشدی.",
  "💭 خیلی‌ها از این نقطه شروع کردن؛ تو هم می‌تونی تغییر بدی.",
  "🧩 مهم اینه که بدونی هر باوری قابل تغییره.",
  "🌤 مسیر موفقیت از همین آگاهی شروع میشه.",
  "💬 هر قدم کوچیک، تو رو به رشد واقعی نزدیک‌تر می‌کنه."
];

// --------- STATE ----------
const userState = new Map();

function getTypeByScore(score) {
  return TYPES.find((t) => score >= t.range[0] && score <= t.range[1]);
}

// --------- QUIZ FLOW ----------
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
  const yesCb = `ans_yes_${st.index}`;
  const noCb = `ans_no_${st.index}`;

  return ctx.reply(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback("✅ بله", yesCb), Markup.button.callback("❌ خیر", noCb)]
    ])
  );
}

async function showResult(ctx) {
  const st = userState.get(ctx.from.id);
  if (!st) return;
  const type = getTypeByScore(st.score) || TYPES[3];
  st.typeKey = type.key;

  const header =
    `🎉 تموم شد!\n\nامتیاز تو: *${st.score}* از *${QUESTIONS.length}*` +
    `\nتیپ تو: *${type.title}*\n${type.badge}\n\n«${type.slogan}»\n\n${type.analysis}`;
  const offers = `\n\n💼 پیشنهاد ویژه برای تو:\n• ${type.offers.join("\n• ")}`;
  const askPhone =
    `\n\n🎁 هدیه اختصاصی و تحلیل کامل رو همین الان بگیر.\n` +
    `لطفاً شماره موبایل‌ت رو با دکمه زیر ارسال کن.`;

  await ctx.replyWithMarkdown(
    header + offers + askPhone,
    Markup.keyboard([Markup.button.contactRequest("📱 ارسال شماره موبایل")])
      .oneTime()
      .resize()
  );
  st.awaitingPhone = true;
}

// --------- ACTION HANDLER (anti double click) ----------
bot.action(/ans_(yes|no)_(\d+)/, async (ctx) => {
  await ctx.answerCbQuery();
  const st = userState.get(ctx.from.id);
  if (!st) return;

  const isYes = ctx.match[1] === "yes";
  const qIdx = Number(ctx.match[2]);

  // کلیک روی پیام قدیمی را نادیده بگیر و کیبوردش را خالی کن
  if (qIdx !== st.index) {
    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch (e) {}
    return;
  }

  st.answers.push(isYes ? "بله" : "خیر");
  if (isYes) st.score += 1;
  st.index += 1;

  // غیرفعال‌سازی دکمه‌های همین سؤال
  try {
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
  } catch (e) {}

  const reply = isYes
    ? POSITIVE_REPLIES[Math.floor(Math.random() * POSITIVE_REPLIES.length)]
    : NEGATIVE_REPLIES[Math.floor(Math.random() * NEGATIVE_REPLIES.length)];
  await ctx.reply(reply);

  return askNext(ctx);
});

// --------- START ----------
bot.start(async (ctx) => {
  await ctx.reply(
    "✨ خوش اومدی به تست «نقشه گنج درون تو»!\n" +
      "در کمتر از ۳ دقیقه می‌فهمی کدوم قهرمان مسیر شغلی درونت پنهان شده.\nآماده‌ای؟",
    Markup.inlineKeyboard([
      [Markup.button.callback("بله، شروع کنیم! ▶️", "start_quiz")]
    ])
  );
});

bot.action("start_quiz", async (ctx) => {
  await ctx.answerCbQuery();
  await startQuiz(ctx);
});

// --------- CONTACT ----------
bot.on("contact", async (ctx) => {
  const st = userState.get(ctx.from.id);
  if (!st) return ctx.reply("برای شروع /start رو بزن.");
  st.awaitingPhone = false;

  const phone = ctx.message.contact.phone_number;
  const type = getTypeByScore(st.score) || TYPES[3];

  await ctx.reply(`✅ دریافت شد! شماره‌ات ثبت شد: ${phone}`);
  // هدیه
  try {
    await ctx.replyWithDocument({ url: type.giftFile, filename: "Farashoghl_Gift.pdf" });
  } catch (err) {
    await ctx.reply("❗️ارسال مستقیم فایل ممکن نشد. لینک دانلود:\n" + type.giftFile);
  }

  // لینک‌ها + دکمه‌ها
  await ctx.reply(
    `📣 به جامعه فراشغل بپیوند:\nhttps://t.me/+RXtqgGDCVvE0MmE0`,
    Markup.inlineKeyboard([
      [Markup.button.url("🌐 ورود به سایت", "https://farashoghl.ir/")],
      [Markup.button.url("💬 پیام در واتساپ", "https://wa.me/989357820120")]
    ])
  );

  // پیام ۵ روز
  await ctx.reply(
    "دوست گرامی خوشحال هستم که این سنجش و تست را به پایان رساندی،\n" +
      "تا 5 روز منتظر هدایا و پیشنهادات خاص ما همینجا باش.\n\n" +
      "مرکز توانمندسازی، آموزش و مشاوره کارآفرینی فراشغل"
  );

  // لید به کانال ادمین
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

  // صف فالوآپ‌های ۵ روزه (پایدار روی دیسک)
  queueFollowupsForUser(u.id);
});

// اگر کاربر شماره را متنی فرستاد (وب/دسکتاپ) — دلخواه: می‌تونی اضافه کنی.
// bot.on("text", ...)

// --------- FOLLOWUPS QUEUE (disk-persistent) ----------
function readFollowups() {
  try {
    const raw = fs.readFileSync(FOLLOWUPS_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function writeFollowups(arr) {
  fs.writeFileSync(FOLLOWUPS_PATH, JSON.stringify(arr), "utf8");
}
function queueFollowupsForUser(userId) {
  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const items = [
    {
      step: 1,
      dueAt: now + 1 * DAY,
      text:
        "💫 تبریک قهرمان! امروز یه قدم بزرگ برای رشد و شناخت خودت برداشتی، حالا موقعش هست که یک تست استعدادیابی حرفه ای برای کشف مسیر شغلیت انجام بدی، یادت نره انتخاب درست، اولین قدم در مسیر موفقیت شغلی هستش...\n" +
        "👇 تست استعدادیابی شغلی:\nhttps://farashoghl.ir/product/job-test/"
    },
    {
      step: 2,
      dueAt: now + 2 * DAY,
      text:
        "🎓 «خیلیا بعد از تست ازم می‌پرسن از کجا شروع کنم؟ 👇 این آموزش رایگان " مسیریابی شغلی و کشف رسالت زندگی " دقیقاً برای توست!»  👇\n" +
        "https://farashoghl.ir/product/kashfe-resalat/"
    },
    {
      step: 3,
      dueAt: now + 3 * DAY,
      text:
        "🔍 «می‌خوای دقیق بدونی تو چه زمینه‌ای استعداد داری؟ تست استعدادیابی تخصصی شغلی رو برات ارسال می‌کنم، حتماً الان انجام بده و برام نتیجه را ارسال کن تا تحلیلش را برات ارسال کنم. موفقیت با همین قدم‌ها شروع میشه ...» 👇\n" +
        "https://farashoghl.ir/product/job-test/"
    },
    {
      step: 4,
      dueAt: now + 4 * DAY,
      text:
        "🌟 «یه نفر مثل تو از همین تستی که برات ارسال کردم، شروع کرد… الان مدرس و کارآفرینه! اگه دوست داری این مسیر را تخصصی ادامه بدی و جلوی هدر رفت زمان و هزینه‌ها را داشته باشی، پیشنهاد می‌کنم، کارگاه مسیریابی شغلی و کشف رسالت زندگی را تهیه کن. راستی رفیق اگه از لحاظ مالی در تهیه این کارگاه مشکل داشتی به پشتیبانی در واتساپ پیام بده تا شرایط ویژه‌ای برات ارائه کنی. دیگه چی از این بهتر، با خیال راحت آینده و مسیر زندگی و شغلیت را همین امروز بساز ....»!\n" +
        "مشاهده کارگاه:\nhttps://farashoghl.ir/product/kashfe-resalat/"
    },
    {
      step: 5,
      dueAt: now + 5 * DAY,
      text:
        "🚀 سلام قهرمان،  برای جهش واقعی آماده‌ هستی؟ !\n" +
        "فقط تا ۴۸ ساعت برای تخفیف ۵۰٪ کارگاه فرصت داری 👇\n" +
        "برای مشاوره و دریافت شرایط ویژه پیام در واتساپ: 09357820120"
    }
  ].map((x) => ({ userId, sent: false, ...x }));

  const all = readFollowups();
  all.push(...items);
  writeFollowups(all);
}

// Dispatcher: هر ۵ دقیقه هرچه موعدش رسیده بفرست
setInterval(async () => {
  const all = readFollowups();
  const now = Date.now();
  let changed = false;

  for (const item of all) {
    if (!item.sent && item.dueAt <= now) {
      try {
        await bot.telegram.sendMessage(item.userId, item.text, {
          disable_web_page_preview: true
        });
        item.sent = true;
        changed = true;
      } catch (e) {
        console.error("followup send error:", e.message);
        // اگر خطا (مثلاً بلاک)، یک ساعت بعد دوباره تلاش کن
        item.dueAt = now + 60 * 60 * 1000;
        changed = true;
      }
    }
  }
  if (changed) writeFollowups(all);
}, 5 * 60 * 1000);

// --------- Keep-Alive (کاهش احتمال Sleep) ----------
setInterval(() => {
  // Node 18+ has global fetch
  fetch(`${PUBLIC_URL}/`)
    .then(() => {})
    .catch(() => {});
}, 4 * 60 * 1000);

// --------- WEBHOOK ----------
app.use(bodyParser.json());

// لاگ ساده برای دیباگ ورودی‌های تلگرام (اختیاری)
// app.post("/tg", (req,res,next)=>{ console.log("Incoming update"); next(); });

app.use(bot.webhookCallback("/tg"));
await bot.telegram.setWebhook(`${PUBLIC_URL}/tg`);

app.get("/", (req, res) => res.send("Farashoghl Quiz Bot is running."));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port", port));
