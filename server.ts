import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Model configuration (Gemma 4 API model by default)
const getModelName = () => {
  return process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || "gemma-4";
};

// Helper for generating AI content using Gemma 4 API with resilient fallback
async function generateContentWithFallback(ai: GoogleGenAI, params: any) {
  const model = getModelName();
  try {
    return await ai.models.generateContent({
      ...params,
      model,
    });
  } catch (err: any) {
    if (model !== "gemini-3.6-flash" && err?.message?.toLowerCase().includes("not found")) {
      console.warn(`Model ${model} not found or unavailable, falling back to gemini-3.6-flash`);
      return await ai.models.generateContent({
        ...params,
        model: "gemini-3.6-flash",
      });
    }
    throw err;
  }
}

// API Route: Healthcheck
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Route: Analyze College Application
app.post("/api/analyze-application", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const applicationData = req.body;

    const prompt = `
You are a senior dean of admissions and college admissions consultant at an elite university (e.g. Stanford, Harvard, MIT, UC Berkeley).
Analyze the following college application submission thoroughly.

Applicant Name: ${applicationData.applicantName || "Student"}
Intended Major: ${applicationData.intendedMajor || "Undecided"}
Target Colleges: ${JSON.stringify(applicationData.targetColleges || [])}
GPA & Test Scores: ${applicationData.gpa || "N/A"} | ${applicationData.testScores || "N/A"}

Personal Statement Prompt:
"${applicationData.personalStatementPrompt || "Common App Essay"}"

Personal Statement Essay:
"""
${applicationData.personalStatement || "No essay provided."}
"""

Supplemental Essay:
"${applicationData.supplementalEssay1Prompt || "Supplemental"}":
"""
${applicationData.supplementalEssay1 || "No supplemental essay provided."}
"""

Extracurricular Activities:
${JSON.stringify(applicationData.activities || [], null, 2)}

Honors & Awards:
${JSON.stringify(applicationData.honors || [], null, 2)}

Provide a deep, constructive admissions evaluation in valid JSON matching this structure:
{
  "overallScore": number (1 to 100),
  "competitivenessTier": "Reach Potential" | "Strong Competitive" | "Exceptional / Top Tier" | "Needs Major Refinement",
  "overallSummary": string (2-3 compelling sentences evaluating overall narrative hook and admissions impression),
  "strengths": string[] (3 bullet points highlighting standout elements),
  "weaknesses": string[] (3 bullet points identifying gaps, clichés, or areas lacking quantitative impact),
  "essayFeedback": {
    "hookRating": number (1 to 10),
    "voiceAuthenticityScore": number (1 to 10),
    "inlineSuggestions": [
      {
        "originalText": string (exact short passage from essay),
        "suggestedText": string (improved rewrite),
        "category": "Cliché" | "Hook Strength" | "Tone & Clarity" | "Grammar & Flow" | "Show Don't Tell",
        "reasoning": string (concise explanation of why this rewrite conveys greater reflection/impact)
      }
    ],
    "improvedVersion": string (complete enhanced version of the personal statement maintaining student's authentic voice)
  },
  "activityOptimizations": [
    {
      "activityId": string (matches activity id or title),
      "originalDescription": string,
      "optimizedDescription": string (rewrite under 150 characters using high-impact active verbs & metrics),
      "keyImprovements": string[]
    }
  ],
  "targetCollegeAdvice": [
    {
      "college": string,
      "fitScore": number (1 to 100),
      "strategicTip": string (specific positioning advice for this university)
    }
  ]
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            competitivenessTier: { type: Type.STRING },
            overallSummary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            essayFeedback: {
              type: Type.OBJECT,
              properties: {
                hookRating: { type: Type.NUMBER },
                voiceAuthenticityScore: { type: Type.NUMBER },
                inlineSuggestions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      originalText: { type: Type.STRING },
                      suggestedText: { type: Type.STRING },
                      category: { type: Type.STRING },
                      reasoning: { type: Type.STRING },
                    },
                    required: ["originalText", "suggestedText", "category", "reasoning"],
                  },
                },
                improvedVersion: { type: Type.STRING },
              },
              required: ["hookRating", "voiceAuthenticityScore", "inlineSuggestions", "improvedVersion"],
            },
            activityOptimizations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  activityId: { type: Type.STRING },
                  originalDescription: { type: Type.STRING },
                  optimizedDescription: { type: Type.STRING },
                  keyImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["activityId", "originalDescription", "optimizedDescription"],
              },
            },
            targetCollegeAdvice: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  college: { type: Type.STRING },
                  fitScore: { type: Type.NUMBER },
                  strategicTip: { type: Type.STRING },
                },
                required: ["college", "fitScore", "strategicTip"],
              },
            },
          },
          required: [
            "overallScore",
            "competitivenessTier",
            "overallSummary",
            "strengths",
            "weaknesses",
            "essayFeedback",
            "activityOptimizations",
            "targetCollegeAdvice",
          ],
        },
      },
    });

    const resultText = response.text || "{}";
    const jsonResult = JSON.parse(resultText);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing application:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze application" });
  }
});

// API Route: Analyze Handwriting Sample via Vision
app.post("/api/analyze-handwriting", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { imageBase64, mimeType = "image/png" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "Missing imageBase64 sample" });
    }

    // Strip base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
Analyze this handwriting sample image provided by a student.
Determine its visual styling characteristics so we can recreate their exact personal handwriting style when autofilling application forms.

Return JSON in this exact structure:
{
  "detectedText": string (transcription of any legible handwritten words in the sample),
  "slantDescription": string (e.g. "Slight right-leaning cursive", "Upright block print", "Slanted quick jot"),
  "neatnessRating": string (e.g. "Neat & Elegant", "Expressive & Cursive", "Casual Print", "Architectural Block"),
  "suggestedStyle": {
    "slantAngle": number (between -15 and 15),
    "strokeWeight": number (between 1.0 and 3.5),
    "letterSpacing": number (between -0.5 and 4.0),
    "lineHeight": number (between 1.3 and 1.8),
    "jitterAmount": number (between 0 and 8 for natural wobble/imperfection),
    "inkColor": string (hex code like '#1e293b' for navy, '#0f172a' for dark black, or '#1d4ed8' for blue gel pen),
    "penType": "Fountain Pen" | "Gel Ballpoint" | "Classic Blue Ink" | "Graphite Pencil",
    "baselineWiggle": number (between 0 and 4),
    "characterScale": number (between 0.85 and 1.15)
  },
  "characteristics": string[] (3-4 bullet observations like "Connected cursive loops", "High crossbars on t's", "Rounded open o's")
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    const jsonResult = JSON.parse(resultText);
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing handwriting:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze handwriting sample" });
  }
});

// API Route: Extract Structured Application Data from Uploaded Document/Text
app.post("/api/extract-app-data", async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { textContent, imageBase64, mimeType } = req.body;

    const parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/png",
        },
      });
    }

    const systemPrompt = `
You are an intelligent college application parser.
Extract as much structured information as possible from the provided text/document image.

Return JSON in this format:
{
  "applicantName": string,
  "email": string,
  "phone": string,
  "highSchool": string,
  "gpa": string,
  "testScores": string,
  "intendedMajor": string,
  "targetColleges": string[],
  "personalStatement": string,
  "activities": [
    {
      "title": string,
      "organization": string,
      "role": string,
      "grades": string[],
      "hoursPerWeek": number,
      "weeksPerYear": number,
      "description": string
    }
  ],
  "honors": [
    {
      "title": string,
      "gradeLevel": string,
      "levelOfRecognition": string
    }
  ]
}
`;

    if (textContent) {
      parts.push({ text: `Raw document text:\n${textContent}\n\n${systemPrompt}` });
    } else {
      parts.push({ text: systemPrompt });
    }

    const response = await generateContentWithFallback(ai, {
      contents: { parts },
      config: {
        responseMimeType: "application/json",
      },
    });

    const jsonResult = JSON.parse(response.text || "{}");
    res.json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error extracting app data:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to parse application document" });
  }
});

// Vite Middleware & Static Server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
