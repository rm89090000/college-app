import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeHandwriting } from "../server/geminiHandlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const jsonResult = await analyzeHandwriting(req.body);
    res.status(200).json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing handwriting:", error);
    res.status(error.status || 500).json({ success: false, error: error.message || "Failed to analyze handwriting sample" });
  }
}
