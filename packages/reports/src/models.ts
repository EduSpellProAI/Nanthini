import type { StudentProfile } from '@eduspell/shared';

export interface ReportRow {
  student: StudentProfile;
  score: number;
  attendance: number;
}

export interface ReportSummary {
  totalStudents: number;
  averageScore: number;
  attendanceRate: number;
}

export interface AIReportAnalytics {
  executiveSummary: string;
  keyTrends: string[];
  atRiskStudents: string[];
  recommendedActions: string[];
}

export type ParentReportStyle = 'formal' | 'encouraging' | 'concise';

export interface ParentCommunicationInput {
  student: StudentProfile;
  reportingPeriod: string;
  attendanceRate: number;
  homeworkCompletionRate: number;
  subjectScores: Array<{
    subject: string;
    score: number;
    cefrBand: 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';
    topics: Array<{ topic: string; score: number }>;
  }>;
  style: ParentReportStyle;
}

export interface ParentProgressReport {
  studentName: string;
  reportingPeriod: string;
  style: ParentReportStyle;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  attendanceSummary: string;
  homeworkSummary: string;
  learningRecommendations: string[];
  parentLetter: string;
  meetingSummary: string;
}
