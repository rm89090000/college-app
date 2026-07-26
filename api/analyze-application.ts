import type { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeApplication } from "../server/geminiHandlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const jsonResult = await analyzeApplication(req.body);
    res.status(200).json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error analyzing application:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze application" });
  }
}
