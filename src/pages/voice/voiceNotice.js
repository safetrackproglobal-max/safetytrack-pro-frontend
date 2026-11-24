// Notice a worker accepts before recording, filming or typing a report. Non-English text should be reviewed by native speakers.
export const VOICE_NOTICE_VERSION = '2026-11-24';
const KEY = 'wv:notice';
let memory = '';
export const voiceNoticeAccepted = () => {
  if (memory === VOICE_NOTICE_VERSION) return true;
  try { return localStorage.getItem(KEY) === VOICE_NOTICE_VERSION; } catch (e) { return false; }
};
export const acceptVoiceNotice = () => {
  memory = VOICE_NOTICE_VERSION;
  try { localStorage.setItem(KEY, VOICE_NOTICE_VERSION); } catch (e) { /* kept in memory */ }
};

const N = {
  en: ['Before you report', ['Danger now? Call the emergency number first.', 'Your voice, photo, video and text go to this company and are kept with the report.', 'AI translates and sorts your report. AI can make mistakes. People must check it.', 'We do not show your name if you choose anonymous. But your voice, face or details can still show who you are.', 'Film people only if it is safe and allowed.'], 'I understand and accept', 'Read more'],
  ar: ['قبل الإبلاغ', ['خطر الآن؟ اتصل برقم الطوارئ أولاً.', 'صوتك وصورتك والفيديو والنص تصل إلى هذه الشركة وتُحفظ مع البلاغ.', 'الذكاء الاصطناعي يترجم بلاغك ويصنفه. وقد يخطئ. يجب أن يراجعه أشخاص.', 'لا نعرض اسمك إذا اخترت مجهول. لكن صوتك أو وجهك أو التفاصيل قد تكشف هويتك.', 'صوّر الأشخاص فقط إذا كان ذلك آمناً ومسموحاً.'], 'فهمت وأوافق', 'اقرأ المزيد'],
  hi: ['रिपोर्ट करने से पहले', ['अभी खतरा है? पहले आपातकालीन नंबर पर कॉल करें।', 'आपकी आवाज़, फोटो, वीडियो और लिखी बात इस कंपनी को जाती है और रिपोर्ट के साथ रखी जाती है।', 'AI आपकी रिपोर्ट का अनुवाद और वर्गीकरण करता है। AI से गलती हो सकती है। लोगों को इसे जाँचना होगा।', 'गुमनाम चुनने पर हम आपका नाम नहीं दिखाते। फिर भी आवाज़, चेहरे या बातों से आपकी पहचान हो सकती है।', 'लोगों का वीडियो तभी लें जब यह सुरक्षित हो और अनुमति हो।'], 'मैं समझता/समझती हूँ और स्वीकार करता/करती हूँ', 'और पढ़ें'],
  ur: ['رپورٹ سے پہلے', ['ابھی خطرہ ہے؟ پہلے ایمرجنسی نمبر پر کال کریں۔', 'آپ کی آواز، تصویر، ویڈیو اور تحریر اس کمپنی کو جاتی ہے اور رپورٹ کے ساتھ محفوظ رہتی ہے۔', 'AI آپ کی رپورٹ کا ترجمہ اور درجہ بندی کرتا ہے۔ AI غلطی کر سکتا ہے۔ لوگوں کو اسے جانچنا ہوگا۔', 'گمنام چننے پر ہم آپ کا نام نہیں دکھاتے۔ پھر بھی آواز، چہرے یا تفصیل سے آپ پہچانے جا سکتے ہیں۔', 'لوگوں کی ویڈیو صرف تب بنائیں جب یہ محفوظ ہو اور اجازت ہو۔'], 'میں سمجھ گیا/گئی اور قبول کرتا/کرتی ہوں', 'مزید پڑھیں'],
  ne: ['रिपोर्ट गर्नु अघि', ['अहिले खतरा छ? पहिले आपतकालीन नम्बरमा फोन गर्नुहोस्।', 'तपाईंको आवाज, फोटो, भिडियो र लेखेको कुरा यो कम्पनीमा जान्छ र रिपोर्टसँगै राखिन्छ।', 'AI ले तपाईंको रिपोर्ट अनुवाद र वर्गीकरण गर्छ। AI ले गल्ती गर्न सक्छ। मानिसले जाँच्नुपर्छ।', 'गुमनाम छान्दा हामी तपाईंको नाम देखाउँदैनौं। तर आवाज, अनुहार वा विवरणले तपाईं को हो थाहा हुन सक्छ।', 'सुरक्षित र अनुमति भएमा मात्र मानिसको भिडियो खिच्नुहोस्।'], 'मैले बुझें र स्वीकार गर्छु', 'थप पढ्नुहोस्'],
  bn: ['রিপোর্ট করার আগে', ['এখন বিপদ? আগে জরুরি নম্বরে কল করুন।', 'আপনার কণ্ঠ, ছবি, ভিডিও ও লেখা এই কোম্পানির কাছে যায় এবং রিপোর্টের সাথে রাখা হয়।', 'AI আপনার রিপোর্ট অনুবাদ ও শ্রেণিবদ্ধ করে। AI ভুল করতে পারে। মানুষকে তা যাচাই করতে হবে।', 'বেনামী বেছে নিলে আমরা আপনার নাম দেখাই না। তবু কণ্ঠ, মুখ বা তথ্য থেকে আপনাকে চেনা যেতে পারে।', 'নিরাপদ ও অনুমতি থাকলেই মানুষের ভিডিও করুন।'], 'আমি বুঝেছি এবং মেনে নিচ্ছি', 'আরও পড়ুন'],
  ta: ['புகார் செய்வதற்கு முன்', ['இப்போது ஆபத்தா? முதலில் அவசர எண்ணை அழையுங்கள்.', 'உங்கள் குரல், படம், வீடியோ, எழுத்து இந்த நிறுவனத்திற்குச் செல்லும்; புகாருடன் சேமிக்கப்படும்.', 'AI உங்கள் புகாரை மொழிபெயர்த்து வகைப்படுத்தும். AI தவறு செய்யலாம். மனிதர்கள் சரிபார்க்க வேண்டும்.', 'அநாமதேயம் தேர்ந்தெடுத்தால் உங்கள் பெயரைக் காட்ட மாட்டோம். ஆனால் குரல், முகம் அல்லது விவரங்கள் உங்களை அடையாளம் காட்டலாம்.', 'பாதுகாப்பாகவும் அனுமதியுடனும் இருந்தால் மட்டும் மனிதர்களைப் படம் எடுங்கள்.'], 'புரிந்தது, ஏற்கிறேன்', 'மேலும் படிக்க'],
  ml: ['റിപ്പോർട്ട് ചെയ്യുന്നതിന് മുമ്പ്', ['ഇപ്പോൾ അപകടമുണ്ടോ? ആദ്യം അടിയന്തര നമ്പറിൽ വിളിക്കുക.', 'നിങ്ങളുടെ ശബ്ദം, ഫോട്ടോ, വീഡിയോ, എഴുത്ത് ഈ കമ്പനിക്ക് ലഭിക്കും; റിപ്പോർട്ടിനൊപ്പം സൂക്ഷിക്കും.', 'AI നിങ്ങളുടെ റിപ്പോർട്ട് വിവർത്തനം ചെയ്ത് തരംതിരിക്കും. AI-ക്ക് തെറ്റുപറ്റാം. ആളുകൾ പരിശോധിക്കണം.', 'അജ്ഞാതം തിരഞ്ഞെടുത്താൽ പേര് കാണിക്കില്ല. എന്നാൽ ശബ്ദം, മുഖം, വിവരങ്ങൾ എന്നിവയിൽ നിന്ന് നിങ്ങളെ തിരിച്ചറിയാം.', 'സുരക്ഷിതവും അനുവദനീയവുമെങ്കിൽ മാത്രം ആളുകളുടെ വീഡിയോ എടുക്കുക.'], 'മനസ്സിലായി, സമ്മതിക്കുന്നു', 'കൂടുതൽ വായിക്കുക'],
  tl: ['Bago mag-report', ['May panganib ngayon? Tumawag muna sa emergency number.', 'Ang boses, larawan, video at sulat mo ay mapupunta sa kumpanyang ito at itatago kasama ng report.', 'Isinasalin at inaayos ng AI ang report mo. Maaaring magkamali ang AI. Dapat itong suriin ng tao.', 'Hindi namin ipapakita ang pangalan mo kung hindi ka magpapakilala. Pero maaari kang makilala sa boses, mukha o detalye.', 'Kumuha lang ng video ng tao kung ligtas at pinapayagan.'], 'Naiintindihan ko at tinatanggap', 'Magbasa pa'],
  fr: ['Avant de signaler', ['Danger immédiat ? Appelez d’abord le numéro d’urgence.', 'Votre voix, vos photos, vidéos et textes sont envoyés à cette entreprise et gardés avec le signalement.', 'L’IA traduit et classe votre signalement. L’IA peut se tromper. Des personnes doivent vérifier.', 'En mode anonyme, votre nom n’est pas affiché. Mais votre voix, votre visage ou des détails peuvent vous identifier.', 'Ne filmez des personnes que si c’est sûr et permis.'], 'J’ai compris et j’accepte', 'En savoir plus'],
  sw: ['Kabla ya kuripoti', ['Hatari sasa? Piga nambari ya dharura kwanza.', 'Sauti, picha, video na maandishi yako yanatumwa kwa kampuni hii na kuhifadhiwa na ripoti.', 'AI hutafsiri na kupanga ripoti yako. AI inaweza kukosea. Watu lazima wakague.', 'Hatuonyeshi jina lako ukichagua bila jina. Lakini sauti, uso au maelezo yanaweza kukutambulisha.', 'Piga watu video tu ikiwa ni salama na inaruhusiwa.'], 'Nimeelewa na nakubali', 'Soma zaidi']
};
export const voiceNotice = (lang) => {
  const [title, points, accept, more] = N[lang] || N.en;
  return { title, points, accept, more };
};
