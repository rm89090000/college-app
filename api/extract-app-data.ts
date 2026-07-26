import type { VercelRequest, VercelResponse } from "@vercel/node";
import { extractAppData } from "../server/geminiHandlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, error: "Method not allowed" });
    return;
  }

  try {
    const jsonResult = await extractAppData(req.body);
    res.status(200).json({ success: true, data: jsonResult });
  } catch (error: any) {
    console.error("Error extracting app data:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to parse application document" });
  }
}
