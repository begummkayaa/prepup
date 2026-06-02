export type CvAnalysisAiReport = {
  compatibilityScore: number;
  scoreSummary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
};
