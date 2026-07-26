import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
export const getGeminiClient = () => {
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
// Note: "gemma-4" alone is not a valid model id - Gemma 4 is served under
// size-suffixed ids (gemma-4-4b-it, gemma-4-12b-it, gemma-4-26b-a4b-it, gemma-4-31b-it).
export const getModelName = () => {
  return process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || "gemma-4-12b-it";
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

// Analyze College Application
export async function analyzeApplication(applicationData: any) {
  const ai = getGeminiClient();

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
  return JSON.parse(resultText);
}

// Analyze Handwriting Sample via Vision
export async function analyzeHandwriting({
  imageBase64,
  mimeType = "image/png",
}: {
  imageBase64: string;
  mimeType?: string;
}) {
  if (!imageBase64) {
    const err: any = new Error("Missing imageBase64 sample");
    err.status = 400;
    throw err;
  }

  const ai = getGeminiClient();

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
  return JSON.parse(resultText);
}

// Extract Structured Application Data from Uploaded Document/Text
export async function extractAppData({
  textContent,
  imageBase64,
  mimeType,
}: {
  textContent?: string;
  imageBase64?: string;
  mimeType?: string;
}) {
  const ai = getGeminiClient();

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

  return JSON.parse(response.text || "{}");
}
