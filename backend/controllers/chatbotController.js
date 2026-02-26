import pool from "../config/db.js";

export const chatbotReply = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.json({ 
      reply: "Please type something.",
      found: false 
    });
  }

  const isUrdu = /[\u0600-\u06FF]/.test(message);
  console.log("🤖 Chatbot received:", message, "Urdu:", isUrdu);

  // Greetings - Quick responses without database
  const greetings = ["hi", "hello", "hey", "assalam", "salam", "assalamualaikum", "salamualikum"];
  if (greetings.some(g => message.toLowerCase().includes(g))) {
    return res.json({
      reply: isUrdu
        ? "السلام علیکم، میں Al Kissan Foods اسسٹنٹ ہوں۔ آپ کی کس طرح مدد کر سکتی ہوں؟"
        : "Hello! I am Al Kissan Foods Assistant. How can I help you?",
      found: true
    });
  }

  // Thank you responses
  const thanks = ["thank", "thanks", "shukria", "shukriya"];
  if (thanks.some(t => message.toLowerCase().includes(t))) {
    return res.json({
      reply: isUrdu
        ? "شکریہ! آپ کا دن اچھا گزرے۔ کسی اور مدد؟"
        : "Thank you! Have a great day. Any other help?",
      found: true
    });
  }

  // Bye responses
  const bye = ["bye", "goodbye", "allah hafiz", "khuda hafiz"];
  if (bye.some(b => message.toLowerCase().includes(b))) {
    return res.json({
      reply: isUrdu
        ? "اللہ حافظ! پھر ملیں گے۔"
        : "Goodbye! Take care. Visit again.",
      found: true
    });
  }

  try {
    // Check if table exists first
    const [tables] = await pool.query("SHOW TABLES LIKE 'chatbot_knowledge'");
    if (tables.length === 0) {
      console.log("⚠️ chatbot_knowledge table does not exist");
      return res.json({
        reply: isUrdu
          ? "معذرت، میں فی الحال جواب نہیں دے سکتی۔ براہِ کرم ہم سے کال یا واٹس ایپ پر رابطہ کریں۔"
          : "Sorry, I cannot answer right now. Please contact us via call or WhatsApp.",
        found: false
      });
    }

    // Fetch knowledge base
    const [rows] = await pool.query(
      "SELECT id, question, answer, answer_urdu, keywords, keywords_urdu, category FROM chatbot_knowledge WHERE is_answered = 1"
    );

    console.log(`📚 Fetched ${rows.length} knowledge entries`);

    if (rows.length === 0) {
      console.log("⚠️ No data in chatbot_knowledge table");
      return res.json({
        reply: isUrdu
          ? "معذرت، میں فی الحال جواب نہیں دے سکتی۔ براہِ کرم ہم سے کال یا واٹس ایپ پر رابطہ کریں۔"
          : "Sorry, I cannot answer right now. Please contact us via call or WhatsApp.",
        found: false
      });
    }

    let bestMatch = null;
    let matchedKeyword = "";
    let matchScore = 0;

    const searchWords = message.toLowerCase().split(" ").filter(w => w.length > 1);

    // Search in database
    for (const row of rows) {
      let score = 0;
      
      // Check in question
      if (row.question && row.question.toLowerCase().includes(message.toLowerCase())) {
        score += 10;
      }
      
      // Check in keywords
      const keywords = isUrdu
        ? (row.keywords_urdu ? row.keywords_urdu.toLowerCase().split(",").map(k => k.trim()) : [])
        : (row.keywords ? row.keywords.toLowerCase().split(",").map(k => k.trim()) : []);
      
      for (const keyword of keywords) {
        if (keyword && message.toLowerCase().includes(keyword)) {
          score += 5;
          matchedKeyword = keyword;
        }
      }
      
      // Check individual words
      for (const word of searchWords) {
        if (row.question && row.question.toLowerCase().includes(word)) {
          score += 2;
        }
        for (const keyword of keywords) {
          if (keyword.includes(word) || word.includes(keyword)) {
            score += 3;
          }
        }
      }

      if (score > matchScore) {
        matchScore = score;
        bestMatch = isUrdu ? (row.answer_urdu || row.answer) : row.answer;
      }
    }

    if (bestMatch && matchScore > 2) {
      console.log(`✅ Found match with score: ${matchScore}, keyword: "${matchedKeyword}"`);
      return res.json({ 
        reply: bestMatch,
        found: true
      });
    }

    // If no match found, try searching in category
    const categories = ["locations", "products", "pricing", "contact", "wholesale", "delivery", "payment"];
    for (const category of categories) {
      if (message.toLowerCase().includes(category) || category.includes(message.toLowerCase())) {
        const [categoryRows] = await pool.query(
          "SELECT answer, answer_urdu FROM chatbot_knowledge WHERE category = ? AND is_answered = 1 LIMIT 1",
          [category]
        );
        if (categoryRows.length > 0) {
          return res.json({
            reply: isUrdu ? (categoryRows[0].answer_urdu || categoryRows[0].answer) : categoryRows[0].answer,
            found: true
          });
        }
      }
    }

    // Fallback - no answer found
    console.log("❌ No answer found in database");
    return res.json({
      reply: isUrdu
        ? "معذرت، میں اس سوال کا جواب نہیں جانتی۔ براہِ کرم ہم سے کال یا واٹس ایپ پر رابطہ کریں۔"
        : "Sorry, I couldn't find an answer. Please contact our support or WhatsApp us.",
      found: false
    });

  } catch (error) {
    console.error("❌ Database error:", error);
    return res.status(500).json({ 
      reply: isUrdu
        ? "تکنیکی مسائل ہیں۔ براہِ کرم بعد میں try کریں۔"
        : "Technical issues. Please try again later.",
      found: false
    });
  }
};