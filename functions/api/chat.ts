/**
 * Cloudflare Pages Function: /api/chat
 * 
 * Handles AI Chat Assistant queries using a local knowledge base.
 * Since Workers cannot read the local filesystem at runtime, the 
 * knowledge base entries are bundled directly into this function.
 */

interface Env {}

interface ChatPayload {
  message: string;
}

// Bundled knowledge base entries from knowledge.json
const KNOWLEDGE_ENTRIES = [
  { "question": "What does IEEE stand for?", "answer": "IEEE stands for Institute of Electrical and Electronics Engineers." },
  { "question": "Is IEEE a non-profit organisation?", "answer": "Yes, IEEE is a non-profit organisation dedicated to advancing technology for the benefit of humanity." },
  { "question": "When was IEEE established?", "answer": "IEEE was established in 1963 through the merger of AIEE and IRE." },
  { "question": "What is the mission of IEEE?", "answer": "The mission of IEEE is to foster technological innovation and excellence for the benefit of humanity." },
  { "question": "How many members does IEEE have worldwide?", "answer": "IEEE has over 533,000 members across more than 160 countries worldwide." },
  { "question": "Which region does India belong to in IEEE?", "answer": "India falls under IEEE Region 10, also known as the Asia-Pacific Region." },
  { "question": "What is IEEE Region 10?", "answer": "IEEE Region 10 is the Asia-Pacific region that promotes collaboration and technological activities across countries in Asia and the Pacific." },
  { "question": "What is a Student Branch in IEEE?", "answer": "A Student Branch is a university-based unit that enables students to engage in technical, professional, and networking activities under IEEE." },
  { "question": "What is the motto of IEEE SOU SB?", "answer": "The motto of IEEE SOU SB is 360° development focusing on both inner and outer growth of students." },
  { "question": "What is IEEE SPS?", "answer": "IEEE SPS (Signal Processing Society) focuses on processing and analyzing signals such as audio, images, and data." },
  { "question": "What is IEEE CS?", "answer": "IEEE CS stands for IEEE Computer Society, focusing on computing technologies like software, AI, cybersecurity, and data science." },
  { "question": "What is IEEE WIE?", "answer": "IEEE WIE stands for Women in Engineering, promoting the participation and advancement of women in technology." },
  { "question": "What is IEEE SIGHT?", "answer": "IEEE SIGHT is the Special Interest Group on Humanitarian Technology that works on solving real-world social problems." },
  { "question": "How can I join a society in IEEE SOU SB?", "answer": "You can join by enrolling through IEEE membership or contacting the student branch coordinators." },
  { "question": "What are the main executive roles in IEEE SOU SB?", "answer": "The main roles include Chair, Vice Chair, Secretary, Treasurer, and Webmaster." },
  { "question": "What does the Chair do?", "answer": "The Chair leads the branch and ensures all activities align with IEEE goals." },
  { "question": "What does the Treasurer do?", "answer": "The Treasurer manages finances, budgeting, and expense tracking." },
  { "question": "What committees exist in IEEE SOU SB?", "answer": "Committees include Content, Creative, Curation, Management, Outreach, and Technical." },
  { "question": "What does the Technical Committee do?", "answer": "The Technical Committee works on projects, workshops, and skill development in technical domains." },
  { "question": "What is 360° development?", "answer": "360° development refers to overall growth including both personal (inner) and professional (outer) development." },
  { "question": "What is inner development?", "answer": "Inner development focuses on communication, confidence, leadership, and mindset." },
  { "question": "What is outer development?", "answer": "Outer development focuses on technical, practical, and professional skills." },
  { "question": "What is IEEE Xplore?", "answer": "IEEE Xplore is a digital library providing access to research papers, journals, and conference proceedings." },
  { "question": "What is IEEE Xtreme?", "answer": "IEEE Xtreme is a global 24-hour programming competition for students." },
  { "question": "What is IEEE Collabratec?", "answer": "IEEE Collabratec is a professional networking platform for IEEE members." },
  { "question": "What is IEEE DataPort?", "answer": "IEEE DataPort is a platform for sharing and accessing research datasets." },
  { "question": "Does IEEE provide research opportunities?", "answer": "Yes, IEEE provides research opportunities through projects, conferences, and collaborations." },
  { "question": "How can I get involved in research?", "answer": "You can join the Technical Committee, participate in projects, and collaborate with mentors." },
  { "question": "Does IEEE offer mentorship?", "answer": "Yes, IEEE SOU SB provides mentorship support through structured programs." },
  { "question": "Who is a mentor?", "answer": "A mentor is an experienced senior who guides students in technical and personal growth." },
  { "question": "What is Paramshavak?", "answer": "Paramshavak is a supercomputing facility at Silver Oak University used for advanced research and computation." },
  { "question": "Where is Paramshavak located?", "answer": "Paramshavak is located at E-Block, 8th Floor, EA-801, Silver Oak University." },
  { "question": "Can students use Paramshavak?", "answer": "Yes, students can use Paramshavak with proper approval and guidance." },
  { "question": "What kind of research can be done using Paramshavak?", "answer": "Research includes AI/ML, data analysis, simulations, and other computational projects." },
  { "question": "How many events has IEEE SOU SB conducted?", "answer": "IEEE SOU SB has conducted over 300 events since its establishment." },
  { "question": "How many members does IEEE SOU SB have?", "answer": "IEEE SOU SB currently has over 170 members." },
  { "question": "How many awards has IEEE SOU SB received?", "answer": "IEEE SOU SB has secured 25+ awards since 2017." }
];

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let payload: ChatPayload;
  try {
    payload = (await request.json()) as ChatPayload;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { message } = payload;
  if (!message) {
    return new Response(
      JSON.stringify({ error: "Message is required." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Lexical matching logic
  const msgLower = message.toLowerCase().trim();
  const rawWords = msgLower.replace(/[^\w\s]/g, '').split(/\s+/);

  const stopWords = new Set([
     "what", "is", "the", "a", "an", "are", "of", "to", "in", "for", "on", "with",
     "as", "by", "at", "you", "who", "how", "can", "i", "do", "we", "us", "me", "my", "your"
  ]);
  const words = rawWords.filter((w: string) => w.length >= 2 && !stopWords.has(w));

  const scoredEntries = KNOWLEDGE_ENTRIES.map((entry: any) => {
    let score = 0;
    const qLower = (entry.question || "").toLowerCase();
    const aLower = (entry.answer || "").toLowerCase();

    const qPlain = qLower.replace(/[^\w\s]/g, '').trim();
    const msgPlain = msgLower.replace(/[^\w\s]/g, '').trim();

    // Exact substring match for the question gets a massive score boost
    if (qPlain && msgPlain && (msgPlain.includes(qPlain) || qPlain.includes(msgPlain))) {
      score += 20;
    }

    words.forEach((word: string) => {
      const regex = new RegExp('\\b' + word + '\\b', 'i');
      if (regex.test(qLower)) score += 3;
      else if (regex.test(aLower)) score += 1;
    });

    return { ...entry, score };
  });

  const topMatches = scoredEntries.sort((a: any, b: any) => b.score - a.score);

  if (topMatches.length > 0 && topMatches[0].score >= 3) {
    return new Response(
      JSON.stringify({ reply: topMatches[0].answer }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Fallback
  const fallbackReply = "I'm sorry, I don't have the exact answer to that right now.\n\nHere are some quick links:\n• [About](/about)\n• [Contact](/contact)\n• [Events](/events)";
  return new Response(
    JSON.stringify({ reply: fallbackReply }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};
