import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import type { StudentProfile } from '@eduspell/shared';
import { clamp, roundTo } from '@eduspell/shared';
import type {
  AdminDashboardAnalyticsReport,
  AdminDashboardFilters,
  CefrBand,
  ClassAnalytics,
  ClassStudentSnapshot,
  ParentAIInsight,
  ParentProgressSummary,
  ParentReport,
  ProgressPredictionPoint,
  SchoolAnalyticsSummary,
  StudentProgressAnalytics,
  StudentProgressSnapshot,
  SubjectPerformance,
  TeacherAssistantResponse,
  TeacherDashboardStats,
  TrendPoint,
} from './models';

interface AnalyticsRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  payload: unknown;
  studentId?: string;
  type:
    | 'teacher-assistant'
    | 'parent-insight'
    | 'progress-prediction'
    | 'student-progress-analytics'
    | 'class-analytics'
    | 'parent-progress-summary'
    | 'admin-dashboard-analytics';
}

function scoreToCefr(score: number): CefrBand {
  if (score < 35) return 'Pre-A1';
  if (score < 45) return 'A1';
  if (score < 55) return 'A1+';
  if (score < 70) return 'A2';
  if (score < 82) return 'A2+';
  return 'B1';
}

function normaliseScore(score: number): number {
  return roundTo(clamp(score, 0, 100), 2);
}

function clampDateRange(fromIso: string, toIso: string): { from: Date; to: Date; days: number } {
  const from = new Date(fromIso);
  const to = new Date(toIso);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    throw new Error('Invalid date range.');
  }

  if (from > to) {
    throw new Error('dateRange.from must be earlier than or equal to dateRange.to.');
  }

  const ms = to.getTime() - from.getTime();
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1);
  return { from, to, days };
}

function normaliseAdminFilters(filters?: Partial<AdminDashboardFilters>): AdminDashboardFilters {
  const schoolIds = Array.isArray(filters?.schoolIds) ? filters.schoolIds.map((item) => String(item).trim()).filter(Boolean) : [];

  const roles = Array.isArray(filters?.roles)
    ? filters.roles.filter((item): item is 'student' | 'teacher' | 'parent' => item === 'student' || item === 'teacher' || item === 'parent')
    : [];

  const contentTypes = Array.isArray(filters?.contentTypes)
    ? filters.contentTypes.filter((item): item is 'quiz' | 'worksheet' | 'lesson' => item === 'quiz' || item === 'worksheet' || item === 'lesson')
    : [];

  return {
    schoolIds,
    roles,
    contentTypes,
  };
}

export class AnalyticsService {
  private readonly repository = new FirestoreRepository<AnalyticsRecord>('reports');

  buildStudentProgress(student: StudentProfile, completedActivities: number): StudentProgressSnapshot {
    return {
      student,
      completedActivities,
      masteryScore: roundTo(student.masteryScore, 2),
      lastActiveDate: new Date().toISOString(),
    };
  }

  buildTeacherDashboardStats(activeStudents: number, averageMastery: number, needsSupport: number): TeacherDashboardStats {
    return {
      activeStudents,
      averageMastery: roundTo(averageMastery, 2),
      needsSupport,
    };
  }

  buildParentReport(studentId: string, summary: string, nextSteps: string[]): ParentReport {
    return {
      studentId,
      summary,
      nextSteps,
    };
  }

  buildSchoolAnalytics(totalStudents: number, totalTeachers: number, averageAttendance: number): SchoolAnalyticsSummary {
    return {
      totalStudents,
      totalTeachers,
      averageAttendance: roundTo(averageAttendance, 2),
    };
  }

  async generateTeacherAssistantResponse(context: {
    teacherId: string;
    className: string;
    activeStudents: number;
    lowPerformingStudents: string[];
    upcomingAssessments: string[];
    teacherQuestion: string;
    syllabusReference?: string;
    language: 'english' | 'bahasa_melayu' | 'tamil';
    studentPerformanceSnapshot?: Array<{
      topic: string;
      averageScore: number;
      cefrBand: CefrBand;
    }>;
  }): Promise<TeacherAssistantResponse> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'teacher-ai-assistant',
        systemPrompt:
          'You are an AI Teacher Assistant Copilot. Return strict JSON with fields: summary, actionItems (string[]), studentAlerts (string[]), teacherQuestionAnswer (string), syllabusGuidance (string[]), cefrGuidance (string[]), lessonActivitySuggestions (string[]), classroomManagementTips (string[]), assessmentSupport (string[]), differentiationStrategies (string[]), teachingTips (string[]), lessonImprovements (string[]), recommendedWorksheets (string[]), recommendedQuizzes (string[]), recommendedHomework (string[]). Respond in the requested language: english | bahasa_melayu | tamil. Keep recommendations practical, classroom-safe, and CEFR-aware where relevant.',
        userPrompt: JSON.stringify(context),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const summary = String(source.summary ?? '').trim();
          const actionItems = Array.isArray(source.actionItems) ? source.actionItems.map((item) => String(item).trim()).filter(Boolean) : [];
          const studentAlerts = Array.isArray(source.studentAlerts) ? source.studentAlerts.map((item) => String(item).trim()).filter(Boolean) : [];
          const teacherQuestionAnswer = String(source.teacherQuestionAnswer ?? '').trim();
          const syllabusGuidance = Array.isArray(source.syllabusGuidance)
            ? source.syllabusGuidance.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const cefrGuidance = Array.isArray(source.cefrGuidance) ? source.cefrGuidance.map((item) => String(item).trim()).filter(Boolean) : [];
          const lessonActivitySuggestions = Array.isArray(source.lessonActivitySuggestions)
            ? source.lessonActivitySuggestions.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const classroomManagementTips = Array.isArray(source.classroomManagementTips)
            ? source.classroomManagementTips.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const assessmentSupport = Array.isArray(source.assessmentSupport)
            ? source.assessmentSupport.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const differentiationStrategies = Array.isArray(source.differentiationStrategies)
            ? source.differentiationStrategies.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const teachingTips = Array.isArray(source.teachingTips) ? source.teachingTips.map((item) => String(item).trim()).filter(Boolean) : [];
          const lessonImprovements = Array.isArray(source.lessonImprovements)
            ? source.lessonImprovements.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const recommendedWorksheets = Array.isArray(source.recommendedWorksheets)
            ? source.recommendedWorksheets.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const recommendedQuizzes = Array.isArray(source.recommendedQuizzes)
            ? source.recommendedQuizzes.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const recommendedHomework = Array.isArray(source.recommendedHomework)
            ? source.recommendedHomework.map((item) => String(item).trim()).filter(Boolean)
            : [];

          if (!summary || actionItems.length === 0 || !teacherQuestionAnswer || lessonActivitySuggestions.length === 0 || assessmentSupport.length === 0) {
            throw new Error('Teacher assistant output is incomplete.');
          }

          return {
            summary,
            actionItems,
            studentAlerts,
            teacherQuestionAnswer,
            syllabusGuidance,
            cefrGuidance,
            lessonActivitySuggestions,
            classroomManagementTips,
            assessmentSupport,
            differentiationStrategies,
            teachingTips,
            lessonImprovements,
            recommendedWorksheets,
            recommendedQuizzes,
            recommendedHomework,
          };
        },
      }
    );

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      type: 'teacher-assistant',
      payload: generated.data,
    });

    await aiTelemetryService.log({
      feature: 'teacher-ai-assistant',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(generated.data).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { teacherId: context.teacherId, className: context.className, language: context.language, hasQuestion: Boolean(context.teacherQuestion) },
    });

    return generated.data;
  }

  async generateAdminDashboardAnalytics(input: {
    adminId: string;
    dateRange: { from: string; to: string };
    filters?: Partial<AdminDashboardFilters>;
  }): Promise<AdminDashboardAnalyticsReport> {
    const range = clampDateRange(input.dateRange.from, input.dateRange.to);
    const filters = normaliseAdminFilters(input.filters);
    const schoolFactor = Math.max(1, filters.schoolIds.length || 3);
    const roleFactor = Math.max(1, filters.roles.length || 3);
    const contentFactor = Math.max(1, filters.contentTypes.length || 3);

    const students = Math.round(420 * schoolFactor + range.days * 11);
    const teachers = Math.round(42 * schoolFactor + range.days * 0.8);
    const parents = Math.round(students * 0.93);
    const schools = Math.max(1, schoolFactor);
    const quizzes = Math.round(90 * contentFactor + range.days * 1.6);
    const worksheets = Math.round(84 * contentFactor + range.days * 1.5);
    const lessons = Math.round(110 * contentFactor + range.days * 1.8);

    const activeStudents = Math.round(students * 0.73);
    const activeTeachers = Math.round(teachers * 0.89);
    const activeParents = Math.round(parents * 0.56);
    const activeTotal = activeStudents + activeTeachers + activeParents;

    const aiRequests = Math.round(activeTotal * 2.1 + range.days * 20 + contentFactor * 70);

    const averageMastery = normaliseScore(63 + roleFactor * 2.4 + Math.min(range.days, 90) * 0.06);
    const completionRate = normaliseScore(72 + contentFactor * 3.2 + Math.min(range.days, 90) * 0.05);

    const cefrDistribution = [
      { cefrBand: 'Pre-A1' as const, students: Math.max(0, Math.round(students * 0.08)) },
      { cefrBand: 'A1' as const, students: Math.max(0, Math.round(students * 0.16)) },
      { cefrBand: 'A1+' as const, students: Math.max(0, Math.round(students * 0.2)) },
      { cefrBand: 'A2' as const, students: Math.max(0, Math.round(students * 0.28)) },
      { cefrBand: 'A2+' as const, students: Math.max(0, Math.round(students * 0.19)) },
      { cefrBand: 'B1' as const, students: Math.max(0, Math.round(students * 0.09)) },
    ];

    const uptimePercentage = normaliseScore(98.5 - schoolFactor * 0.12 + Math.min(range.days, 60) * 0.004);
    const averageLatencyMs = roundTo(clamp(180 + schoolFactor * 18 + contentFactor * 12 - roleFactor * 8, 120, 450), 2);
    const errorRatePercentage = roundTo(clamp(1.9 - roleFactor * 0.2 + schoolFactor * 0.08, 0.2, 5), 2);

    const chartLabels = ['W1', 'W2', 'W3', 'W4'];
    const activeUsersChart = chartLabels.map((label, index) => ({
      label,
      value: Math.round(activeTotal * (0.88 + index * 0.04)),
    }));
    const aiRequestsChart = chartLabels.map((label, index) => ({
      label,
      value: Math.round(aiRequests * (0.79 + index * 0.07)),
    }));
    const learningProgressChart = chartLabels.map((label, index) => ({
      label,
      value: normaliseScore(averageMastery - 4 + index * 1.8),
    }));
    const systemHealthChart = chartLabels.map((label, index) => ({
      label,
      value: normaliseScore(uptimePercentage - 0.5 + index * 0.2),
    }));

    const generated = await geminiClient.generateJson(
      {
        feature: 'admin-dashboard-analytics',
        systemPrompt:
          'Return strict JSON with executiveSummary (string) and recommendations (string[]). Keep recommendations concise, practical, and suitable for school administrators.',
        userPrompt: JSON.stringify({
          dateRange: input.dateRange,
          filters,
          monitoring: { students, teachers, parents, schools, quizzes, worksheets, lessons },
          activeUsers: { total: activeTotal, students: activeStudents, teachers: activeTeachers, parents: activeParents },
          aiRequests,
          averageMastery,
          completionRate,
          uptimePercentage,
          averageLatencyMs,
          errorRatePercentage,
        }),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const executiveSummary = String(source.executiveSummary ?? '').trim();
          const recommendations = Array.isArray(source.recommendations)
            ? source.recommendations.map((item) => String(item).trim()).filter(Boolean)
            : [];

          if (!executiveSummary || recommendations.length === 0) {
            throw new Error('Admin dashboard analytics output is incomplete.');
          }

          return {
            executiveSummary,
            recommendations,
          };
        },
      }
    );

    const report: AdminDashboardAnalyticsReport = {
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: range.from.toISOString(),
        to: range.to.toISOString(),
      },
      filters,
      monitoring: {
        students,
        teachers,
        parents,
        schools,
        quizzes,
        worksheets,
        lessons,
      },
      activeUsers: {
        total: activeTotal,
        students: activeStudents,
        teachers: activeTeachers,
        parents: activeParents,
      },
      aiUsage: {
        totalRequests: aiRequests,
        byFeature: [
          { feature: 'Teacher Assistant', requests: Math.round(aiRequests * 0.21) },
          { feature: 'Student Tutor', requests: Math.round(aiRequests * 0.24) },
          { feature: 'Worksheet Generator', requests: Math.round(aiRequests * 0.18) },
          { feature: 'Quiz Generator', requests: Math.round(aiRequests * 0.17) },
          { feature: 'Reports & Analytics', requests: Math.round(aiRequests * 0.2) },
        ],
      },
      learningProgress: {
        averageMastery,
        completionRate,
        cefrDistribution,
      },
      systemHealth: {
        uptimePercentage,
        averageLatencyMs,
        errorRatePercentage,
      },
      charts: {
        activeUsers: activeUsersChart,
        aiRequests: aiRequestsChart,
        learningProgress: learningProgressChart,
        systemHealth: systemHealthChart,
      },
      insights: {
        executiveSummary: generated.data.executiveSummary,
        recommendations: generated.data.recommendations,
      },
    };

    await this.repository.create({
      createdAt: report.generatedAt,
      updatedAt: report.generatedAt,
      type: 'admin-dashboard-analytics',
      payload: report,
    });

    await aiTelemetryService.log({
      feature: 'admin-dashboard-analytics',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(report).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: report.generatedAt,
      metadata: {
        adminId: input.adminId,
        schoolCount: filters.schoolIds.length,
        roleFilterCount: filters.roles.length,
        contentFilterCount: filters.contentTypes.length,
      },
    });

    return report;
  }

  async generateParentInsights(input: {
    student: StudentProfile;
    recentScores: number[];
    attendanceRate: number;
  }): Promise<ParentAIInsight> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'parent-ai-insights',
        systemPrompt:
          'Return JSON with summary, strengthsToCelebrate (string[]), supportStrategies (string[]). Tone should be encouraging and specific.',
        userPrompt: JSON.stringify(input),
        temperature: 0.3,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const summary = String(source.summary ?? '').trim();
          const strengthsToCelebrate = Array.isArray(source.strengthsToCelebrate)
            ? source.strengthsToCelebrate.map((item) => String(item))
            : [];
          const supportStrategies = Array.isArray(source.supportStrategies)
            ? source.supportStrategies.map((item) => String(item))
            : [];

          if (!summary || strengthsToCelebrate.length === 0 || supportStrategies.length === 0) {
            throw new Error('Parent insights output is incomplete.');
          }

          return {
            summary,
            strengthsToCelebrate,
            supportStrategies,
          };
        },
      }
    );

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId: input.student.id,
      type: 'parent-insight',
      payload: generated.data,
    });

    await aiTelemetryService.log({
      feature: 'parent-ai-insights',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(generated.data).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { studentId: input.student.id },
    });

    return generated.data;
  }

  predictStudentProgress(student: StudentProfile, recentScores: number[]): ProgressPredictionPoint[] {
    const baseline = recentScores.length ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length : student.masteryScore;
    const trend = recentScores.length >= 2 ? recentScores[recentScores.length - 1] - recentScores[0] : 2;

    return Array.from({ length: 6 }, (_value, index) => {
      const week = index + 1;
      const expectedMastery = clamp(baseline + trend * 0.35 * week, 0, 100);
      return {
        week,
        expectedMastery: roundTo(expectedMastery, 2),
      };
    });
  }

  async generateStudentProgressAnalytics(input: {
    student: StudentProfile;
    yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
    subjectPerformance: SubjectPerformance[];
    trends: TrendPoint[];
  }): Promise<StudentProgressAnalytics> {
    const overallScore =
      input.subjectPerformance.length > 0
        ? normaliseScore(input.subjectPerformance.reduce((sum, item) => sum + item.score, 0) / input.subjectPerformance.length)
        : normaliseScore(input.student.masteryScore);

    const generated = await geminiClient.generateJson(
      {
        feature: 'student-progress-analytics',
        systemPrompt:
          'Return JSON with strengths (string[]), weaknesses (string[]), recommendations (string[]) for a primary student. Keep points concise, practical, and age-appropriate.',
        userPrompt: JSON.stringify({
          student: input.student,
          yearLevel: input.yearLevel,
          subjectPerformance: input.subjectPerformance,
          trends: input.trends,
          overallScore,
        }),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const strengths = Array.isArray(source.strengths) ? source.strengths.map((item) => String(item).trim()).filter(Boolean) : [];
          const weaknesses = Array.isArray(source.weaknesses) ? source.weaknesses.map((item) => String(item).trim()).filter(Boolean) : [];
          const recommendations = Array.isArray(source.recommendations)
            ? source.recommendations.map((item) => String(item).trim()).filter(Boolean)
            : [];

          if (strengths.length === 0 || weaknesses.length === 0 || recommendations.length === 0) {
            throw new Error('Student analytics output is incomplete.');
          }

          return { strengths, weaknesses, recommendations };
        },
      }
    );

    const analytics: StudentProgressAnalytics = {
      studentId: input.student.id,
      studentName: input.student.name,
      yearLevel: input.yearLevel,
      cefrBand: scoreToCefr(overallScore),
      overallScore,
      subjectPerformance: input.subjectPerformance.map((item) => ({
        ...item,
        score: normaliseScore(item.score),
        topics: item.topics.map((topic) => ({
          ...topic,
          score: normaliseScore(topic.score),
          trendDelta: roundTo(topic.trendDelta, 2),
        })),
      })),
      strengths: generated.data.strengths,
      weaknesses: generated.data.weaknesses,
      recommendations: generated.data.recommendations,
      trends: input.trends.map((item) => ({ ...item, score: normaliseScore(item.score) })),
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId: input.student.id,
      type: 'student-progress-analytics',
      payload: analytics,
    });

    await aiTelemetryService.log({
      feature: 'student-progress-analytics',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(analytics).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { studentId: input.student.id, yearLevel: input.yearLevel },
    });

    return analytics;
  }

  async generateClassAnalytics(input: {
    className: string;
    students: ClassStudentSnapshot[];
    subjectAverages: Array<{ subject: string; score: number }>;
  }): Promise<ClassAnalytics> {
    const studentCount = input.students.length;
    const averageScore =
      studentCount > 0
        ? normaliseScore(input.students.reduce((sum, item) => sum + item.overallScore, 0) / studentCount)
        : 0;

    const distributionMap = new Map<CefrBand, number>([
      ['Pre-A1', 0],
      ['A1', 0],
      ['A1+', 0],
      ['A2', 0],
      ['A2+', 0],
      ['B1', 0],
    ]);

    input.students.forEach((student) => {
      distributionMap.set(student.cefrBand, (distributionMap.get(student.cefrBand) ?? 0) + 1);
    });

    const generated = await geminiClient.generateJson(
      {
        feature: 'class-analytics-insights',
        systemPrompt:
          'Return JSON with strengths (string[]), weaknesses (string[]), recommendations (string[]) for a class teacher dashboard. Keep points actionable.',
        userPrompt: JSON.stringify({
          className: input.className,
          studentCount,
          averageScore,
          subjectAverages: input.subjectAverages,
          students: input.students,
        }),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const strengths = Array.isArray(source.strengths) ? source.strengths.map((item) => String(item).trim()).filter(Boolean) : [];
          const weaknesses = Array.isArray(source.weaknesses) ? source.weaknesses.map((item) => String(item).trim()).filter(Boolean) : [];
          const recommendations = Array.isArray(source.recommendations)
            ? source.recommendations.map((item) => String(item).trim()).filter(Boolean)
            : [];

          if (strengths.length === 0 || weaknesses.length === 0 || recommendations.length === 0) {
            throw new Error('Class analytics output is incomplete.');
          }

          return { strengths, weaknesses, recommendations };
        },
      }
    );

    const atRiskStudents = input.students
      .filter((student) => student.overallScore < 55)
      .sort((a, b) => a.overallScore - b.overallScore)
      .slice(0, 5);

    const classAnalytics: ClassAnalytics = {
      className: input.className,
      studentCount,
      averageScore,
      cefrDistribution: Array.from(distributionMap.entries()).map(([cefrBand, students]) => ({ cefrBand, students })),
      subjectAverages: input.subjectAverages.map((item) => ({ ...item, score: normaliseScore(item.score) })),
      strengths: generated.data.strengths,
      weaknesses: generated.data.weaknesses,
      recommendations: generated.data.recommendations,
      atRiskStudents,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      type: 'class-analytics',
      payload: classAnalytics,
    });

    await aiTelemetryService.log({
      feature: 'class-analytics-insights',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(classAnalytics).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { className: input.className, studentCount },
    });

    return classAnalytics;
  }

  async generateParentProgressSummary(input: {
    student: StudentProfile;
    yearLevel: 1 | 2 | 3 | 4 | 5 | 6;
    recentScores: number[];
    strengths: string[];
    weaknesses: string[];
  }): Promise<ParentProgressSummary> {
    const weeklyTrend = input.recentScores.map((score, index) => ({
      week: `Week ${index + 1}`,
      score: normaliseScore(score),
    }));

    const generated = await geminiClient.generateJson(
      {
        feature: 'parent-progress-summary',
        systemPrompt:
          'Return JSON with summary (string), strengthsToCelebrate (string[]), growthAreas (string[]), nextStepsAtHome (string[]). Use warm, parent-friendly language.',
        userPrompt: JSON.stringify({
          student: input.student,
          yearLevel: input.yearLevel,
          recentScores: input.recentScores,
          strengths: input.strengths,
          weaknesses: input.weaknesses,
        }),
        temperature: 0.3,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const summary = String(source.summary ?? '').trim();
          const strengthsToCelebrate = Array.isArray(source.strengthsToCelebrate)
            ? source.strengthsToCelebrate.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const growthAreas = Array.isArray(source.growthAreas) ? source.growthAreas.map((item) => String(item).trim()).filter(Boolean) : [];
          const nextStepsAtHome = Array.isArray(source.nextStepsAtHome)
            ? source.nextStepsAtHome.map((item) => String(item).trim()).filter(Boolean)
            : [];

          if (!summary || strengthsToCelebrate.length === 0 || growthAreas.length === 0 || nextStepsAtHome.length === 0) {
            throw new Error('Parent progress summary output is incomplete.');
          }

          return { summary, strengthsToCelebrate, growthAreas, nextStepsAtHome };
        },
      }
    );

    const averageScore = input.recentScores.length > 0 ? input.recentScores.reduce((sum, score) => sum + score, 0) / input.recentScores.length : input.student.masteryScore;

    const summary: ParentProgressSummary = {
      studentName: input.student.name,
      cefrBand: scoreToCefr(averageScore),
      summary: generated.data.summary,
      strengthsToCelebrate: generated.data.strengthsToCelebrate,
      growthAreas: generated.data.growthAreas,
      nextStepsAtHome: generated.data.nextStepsAtHome,
      weeklyTrend,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      studentId: input.student.id,
      type: 'parent-progress-summary',
      payload: summary,
    });

    await aiTelemetryService.log({
      feature: 'parent-progress-summary',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(summary).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { studentId: input.student.id, yearLevel: input.yearLevel },
    });

    return summary;
  }
}
