export interface ActivityItem {
  id: string;
  title: string;
  organization: string;
  role: string;
  grades: string[]; // e.g. ["10", "11", "12"]
  hoursPerWeek: number;
  weeksPerYear: number;
  description: string;
}

export interface HonorItem {
  id: string;
  title: string;
  gradeLevel: string;
  levelOfRecognition: 'School' | 'State/Regional' | 'National' | 'International';
}

export interface CollegeApplicationData {
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  highSchool: string;
  gpa: string;
  testScores: string;
  intendedMajor: string;
  targetColleges: string[];
  
  // Essays
  personalStatementPrompt: string;
  personalStatement: string;
  supplementalEssay1Prompt: string;
  supplementalEssay1: string;

  // Activities & Honors
  activities: ActivityItem[];
  honors: HonorItem[];

  // Signatures
  signatureName: string;
  signatureDate: string;
}

export interface EssayFeedbackItem {
  originalText: string;
  suggestedText: string;
  category: 'Cliché' | 'Hook Strength' | 'Tone & Clarity' | 'Grammar & Flow' | 'Show Don\'t Tell';
  reasoning: string;
}

export interface ActivityOptimization {
  activityId: string;
  originalDescription: string;
  optimizedDescription: string;
  keyImprovements: string[];
}

export interface ApplicationAnalysisResult {
  overallScore: number; // 1 - 100
  competitivenessTier: 'Reach Potential' | 'Strong Competitive' | 'Exceptional / Top Tier' | 'Needs Major Refinement';
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  
  essayFeedback: {
    hookRating: number; // 1 - 10
    voiceAuthenticityScore: number; // 1 - 10
    inlineSuggestions: EssayFeedbackItem[];
    improvedVersion: string;
  };

  activityOptimizations: ActivityOptimization[];
  
  targetCollegeAdvice: {
    college: string;
    fitScore: number;
    strategicTip: string;
  }[];
}

export interface HandwritingStyle {
  fontFamily: string; // Built-in or SVG-based cursive font family
  slantAngle: number; // -15 to 15 deg
  strokeWeight: number; // 1 to 4 px
  letterSpacing: number; // -1 to 5 px
  lineHeight: number; // 1.2 to 2.0
  jitterAmount: number; // 0 to 10 imperfection
  inkColor: string; // hex code e.g. '#1e293b' (Navy) or '#0f172a' (Black) or '#1d4ed8' (Blue Gel)
  penType: 'Fountain Pen' | 'Gel Ballpoint' | 'Classic Blue Ink' | 'Graphite Pencil';
  baselineWiggle: number; // 0 to 5 px
  characterScale: number; // 0.8 to 1.2
}

export interface HandwritingAnalysisResult {
  detectedText: string;
  slantDescription: string;
  neatnessRating: string;
  suggestedStyle: Partial<HandwritingStyle>;
  characteristics: string[];
}

export interface SavedDossier {
  id: string;
  userId: string;
  title: string;
  data: CollegeApplicationData;
  handwritingStyle: HandwritingStyle;
  analysis: ApplicationAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}
