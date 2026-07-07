export interface StudentProgressSnapshot {
  studentId: string;
  completedLessons: number;
  quizAverage: number;
  masteryScore: number;
  streakDays: number;
}

export interface TeacherDashboardStats {
  activeStudents: number;
  averageAttendance: number;
  completedPractice: number;
  focusAreas: string[];
}

export interface ParentReport {
  studentId: string;
  summary: string;
  nextSteps: string[];
  confidenceScore: number;
}

export interface SchoolAnalyticsSnapshot {
  schoolName: string;
  totalStudents: number;
  averageMastery: number;
  engagementRate: number;
}

export class AnalyticsService {
  buildTeacherDashboard(stats: TeacherDashboardStats): TeacherDashboardStats {
    return {
      ...stats,
      completedPractice: Math.max(0, stats.completedPractice),
    };
  }

  buildParentReport(snapshot: StudentProgressSnapshot): ParentReport {
    return {
      studentId: snapshot.studentId,
      summary: `Student is progressing steadily with ${snapshot.completedLessons} lessons completed.`,
      nextSteps: ['Keep practicing daily', 'Review the latest quiz feedback'],
      confidenceScore: Math.min(100, snapshot.masteryScore + snapshot.streakDays),
    };
  }

  buildSchoolAnalytics(snapshot: SchoolAnalyticsSnapshot): SchoolAnalyticsSnapshot {
    return {
      ...snapshot,
      averageMastery: Math.min(100, Number(snapshot.averageMastery.toFixed(1))),
      engagementRate: Math.min(100, Number(snapshot.engagementRate.toFixed(1))),
    };
  }
}
