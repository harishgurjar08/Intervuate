import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: "AIzaSyA5HT1qrgnDLhiVE3UpXlFesKhyqYGSAeo", // ⚠️ avoid exposing in frontend for production
});

// Generate Interview Questions
export async function getInterviewPlan({ company, jobDesc, experience, resumeText, interviewType }) {
  const prompt = `
You are a senior hiring manager at ${company}. Conduct a ${interviewType === "practice" ? "practice" : "technical"} interview for this candidate.

Candidate Experience: ${experience}
Candidate Resume: ${resumeText}
Job Description: ${jobDesc}

Instructions:
- Generate exactly 8 concise, one-line questions (technical or behavioral) tailored to this candidate.
- Base questions on the candidate's resume, job description, and experience.
- Avoid long explanations. Only provide numbered questions 1-8.
- For practice interview, keep questions simple and educational.
`;

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [prompt],
    config: { temperature: 0.7 },
  });

  const text = response.candidates[0].content.parts[0].text;
  return text
    .split("\n")
    .map(q => q.trim())
    .filter(q => q && /^\d+\./.test(q));
}

// Get Feedback for each answer
/**
 * Generates feedback, scores, and the next question based on interview context.
 * * @param {string} currentQuestion - The question the user just answered.
 * @param {string} userAnswer - The user's spoken/typed response.
 * @param {Array} chatHistory - Array of previous message objects.
 * @param {string} interviewType - "practice" or "company".
 * @param {string} resumeText - (Optional) The text content of the user's resume.
 * @param {string} targetCompany - (Optional) Name of the company (e.g., "Google", "Startup").
 */
export async function getFeedback(
  currentQuestion,
  userAnswer,
  chatHistory,
  interviewType,
  resumeText = "No resume provided",
  targetCompany = "General Tech Company"
) {
  const isCompanyMode = interviewType === "company";

  const systemInstruction = `
ROLE: You are an expert Technical Interviewer AI.
MODE: ${isCompanyMode ? "🔴 REAL COMPANY INTERVIEW (Strict)" : "🟢 PRACTICE MODE (Educational)"}
TARGET COMPANY: ${targetCompany}
CANDIDATE RESUME: "${resumeText}..."

---------------------------
RULES FOR RESPONSE FIELDS
---------------------------

FEEDBACK FIELD:
${isCompanyMode
  ? `
  - DO NOT give advice, teaching, or any evaluation.
  - DO NOT reveal scores, analysis, or improvement tips.
  - The text must be neutral and minimal (e.g., "Response recorded.", "Thank you. Let's proceed.").
  - If you generate any feedback text longer than 10 words, replace it with "Response recorded."
  `
  : `
  - Provide detailed constructive teaching feedback.
  - Identify missing concepts or misunderstandings.
  - Encourage the candidate with examples or improvements.
  `
}

NEXT QUESTION FIELD:
${isCompanyMode
  ? `
  - Ask a new question based on ${targetCompany}'s stack or work culture.
  - Keep it professional, high difficulty, and concise (1–2 lines max).
  `
  : `
  - Start with easier questions and increase difficulty as chatHistory grows.
  - Base on resume topics or general fundamentals if empty.
  `
}

SCORE & ANALYSIS FIELD:
- Score: Integer between 0–100.
- Analysis: Short technical note justifying score.
  `;

  const prompt = `
${systemInstruction}

CHAT HISTORY: ${JSON.stringify(chatHistory, null, 2)}

CURRENT QUESTION: "${currentQuestion}"
CANDIDATE ANSWER: "${userAnswer}"

OUTPUT FORMAT (MUST BE VALID JSON):
{
  "feedback": "string",
  "score": number,
  "analysis": "string",
  "next_question": "string"
}
`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      config: {
        temperature: 0.6,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
    });

    const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    let result;

    try {
      result = JSON.parse(raw);
    } catch {
      console.warn("Invalid JSON — raw output:", raw);
      result = {};
    }

    // ✅ Enforce strict company-mode post-filtering
    if (isCompanyMode) {
      result.feedback = "Response recorded.";
    }

    return {
      feedback: result.feedback || "Response recorded.",
      score: typeof result.score === "number" ? result.score : 0,
      analysis: result.analysis || "No analysis provided.",
      next_question: result.next_question || "Let's continue with the next question.",
    };
  } catch (err) {
    console.error("AI Feedback Error:", err);
    return {
      feedback: isCompanyMode
        ? "Response recorded."
        : "Good attempt, but I couldn't analyze the details due to a system error.",
      score: 0,
      analysis: "System Error",
      next_question: "Could you elaborate on your last point?",
    };
  }
}


// Evaluate entire interview
export async function evaluateInterview(chatHistory, interviewType) {
  const chatJSON = JSON.stringify(chatHistory, null, 2);

  const prompt = `
You are an expert interviewer. Evaluate the following ${interviewType === "practice" ? "practice" : "company"} interview:
${chatJSON}

Instructions:
1. Give an overall score out of 100.
2. Give a confidence score out of 100.
3. List strengths and weaknesses.
4. For each question, evaluate the candidate's answer:
   - Assign a score (0-100) for company interviews.
   - For practice interviews, give polite, constructive feedback explaining improvements.
5. Do not generate new questions.
6. If an answer is irrelevant:
   - Company: "Answer needs improvement."
   - Practice: "Your answer needs improvement. Here's how to improve..."
7. Return a JSON object like this:

{
  "overallScore": number,
  "confidenceScore": number,
  "strengths": [string],
  "weaknesses": [string],
  "questions": [
    {
      "question": string,
      "userAnswer": string,
      "score": number,           // optional for practice interview
      "feedback": string
    }
  ]
}
`;

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [prompt],
    config: { temperature: 0.5},
  });

  const text = response.candidates[0].content.parts[0].text;

  // Parse JSON safely
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Gemini returned invalid JSON");
    }
  }
  return parsed;
}
