import type { StudentProfile } from '@eduspell/shared';

export interface StudentProgressSnapshot {
  student: StudentProfile;
  completedActivities: number;
  masteryScore: number;
  lastActiveDate: string;
}

export interface TeacherDashboardStats {
  activeStudents: number;
  averageMastery: number;
  needsSupport: number;
}

export interface ParentReport {
  studentId: string;
  summary: string;
  nextSteps: string[];
}

export interface SchoolAnalyticsSummary {
  totalStudents: number;
  totalTeachers: number;
  averageAttendance: number;
}

export interface TeacherAssistantResponse {
  summary: string;
  actionItems: string[];
  studentAlerts: string[];
  teacherQuestionAnswer: string;
  syllabusGuidance: string[];
  cefrGuidance: string[];
  lessonActivitySuggestions: string[];
  classroomManagementTips: string[];
  assessmentSupport: string[];
  differentiationStrategies: string[];
  teachingTips: string[];
  lessonImprovements: string[];
  recommendedWorksheets: string[];
  recommendedQuizzes: string[];
  recommendedHomework: string[];
}

export interface ParentAIInsight {
  summary: string;
  strengthsToCelebrate: string[];
  supportStrategies: string[];
}

export interface ProgressPredictionPoint {
  week: number;
  expectedMastery: number;
}

export type CefrBand = 'Pre-A1' | 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1';

export interface TopicPerformance {
  topic: string;
  score: number;
  trendDelta: number;
}

export interface SubjectPerformance {
  subject: string;
  cefrBand: CefrBand;
  score: number;
  topics: TopicPerformance[];
}

export interface TrendPoint {
  week: string;
  score: number;
}

export interface StudentProgressAnalytics {
  studentId: string;
  studentName: string;
  yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
  cefrBand: CefrBand;
  overallScore: number;
  subjectPerformance: SubjectPerformance[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  trends: TrendPoint[];
}

export interface ClassStudentSnapshot {
  studentId: string;
  studentName: string;
  cefrBand: CefrBand;
  overallScore: number;
}

export interface ClassAnalytics {
  className: string;
  studentCount: number;
  averageScore: number;
  cefrDistribution: Array<{ cefrBand: CefrBand; students: number }>;
  subjectAverages: Array<{ subject: string; score: number }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  atRiskStudents: ClassStudentSnapshot[];
}

export interface ParentProgressSummary {
  studentName: string;
  cefrBand: CefrBand;
  summary: string;
  strengthsToCelebrate: string[];
  growthAreas: string[];
  nextStepsAtHome: string[];
  weeklyTrend: TrendPoint[];
}

export interface AdminDateRange {
  from: string;
  to: string;
}

export interface AdminDashboardFilters {
  schoolIds: string[];
  roles: Array<'student' | 'teacher' | 'parent'>;
  contentTypes: Array<'quiz' | 'worksheet' | 'lesson'>;
}

export interface AdminEntityMonitoring {
  students: number;
  teachers: number;
  parents: number;
  schools: number;
  quizzes: number;
  worksheets: number;
  lessons: number;
}

export interface AdminActiveUsers {
  total: number;
  students: number;
  teachers: number;
  parents: number;
}

export interface AdminAiUsage {
  totalRequests: number;
  byFeature: Array<{ feature: string; requests: number }>;
}

export interface AdminLearningProgress {
  averageMastery: number;
  completionRate: number;
  cefrDistribution: Array<{ cefrBand: CefrBand; students: number }>;
}

export interface AdminSystemHealth {
  uptimePercentage: number;
  averageLatencyMs: number;
  errorRatePercentage: number;
}

export interface AdminChartPoint {
  label: string;
  value: number;
}

export interface AdminDashboardAnalyticsReport {
  generatedAt: string;
  dateRange: AdminDateRange;
  filters: AdminDashboardFilters;
  monitoring: AdminEntityMonitoring;
  activeUsers: AdminActiveUsers;
  aiUsage: AdminAiUsage;
  learningProgress: AdminLearningProgress;
  systemHealth: AdminSystemHealth;
  charts: {
    activeUsers: AdminChartPoint[];
    aiRequests: AdminChartPoint[];
    learningProgress: AdminChartPoint[];
    systemHealth: AdminChartPoint[];
  };
  insights: {
    executiveSummary: string;
    recommendations: string[];
  };
}
