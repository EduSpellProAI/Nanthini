import { aiTelemetryService, geminiClient } from '@eduspell/ai-core';
import { FirestoreRepository } from '@eduspell/database';
import type { AIReportAnalytics, ParentCommunicationInput, ParentProgressReport, ReportRow, ReportSummary } from './models';

interface ReportStorageRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  payload: unknown;
  reportType: 'summary' | 'ai-analytics' | 'parent-communication';
}

export class ReportService {
  private readonly repository = new FirestoreRepository<ReportStorageRecord>('reports');

  buildSummary(rows: ReportRow[]): ReportSummary {
    if (rows.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        attendanceRate: 0,
      };
    }

    const averageScore = rows.reduce((sum, row) => sum + row.score, 0) / rows.length;
    const attendanceRate = rows.reduce((sum, row) => sum + row.attendance, 0) / rows.length;

    return {
      totalStudents: rows.length,
      averageScore,
      attendanceRate,
    };
  }

  async generateAIAnalytics(rows: ReportRow[], context: { schoolName: string; reportingPeriod: string }): Promise<AIReportAnalytics> {
    const summary = this.buildSummary(rows);
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-reports-analytics',
        systemPrompt:
          'Return JSON with executiveSummary, keyTrends (string[]), atRiskStudents (string[]), recommendedActions (string[]). Keep insights data-grounded.',
        userPrompt: JSON.stringify({ rows, summary, context }),
        temperature: 0.2,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const executiveSummary = String(source.executiveSummary ?? '').trim();
          const keyTrends = Array.isArray(source.keyTrends) ? source.keyTrends.map((item) => String(item)) : [];
          const atRiskStudents = Array.isArray(source.atRiskStudents) ? source.atRiskStudents.map((item) => String(item)) : [];
          const recommendedActions = Array.isArray(source.recommendedActions)
            ? source.recommendedActions.map((item) => String(item))
            : [];

          if (!executiveSummary || keyTrends.length === 0 || recommendedActions.length === 0) {
            throw new Error('AI report analytics output is incomplete.');
          }

          return {
            executiveSummary,
            keyTrends,
            atRiskStudents,
            recommendedActions,
          };
        },
      }
    );

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      reportType: 'ai-analytics',
      payload: generated.data,
    });

    await aiTelemetryService.log({
      feature: 'ai-reports-analytics',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(generated.data).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: { reportingPeriod: context.reportingPeriod, studentCount: rows.length },
    });

    return generated.data;
  }

  async generateParentCommunicationReport(input: ParentCommunicationInput): Promise<ParentProgressReport> {
    const generated = await geminiClient.generateJson(
      {
        feature: 'ai-parent-communication-reporting',
        systemPrompt:
          'Return strict JSON with fields summary, strengths (string[]), weaknesses (string[]), attendanceSummary, homeworkSummary, learningRecommendations (string[]), parentLetter, meetingSummary. Tone must match style: formal | encouraging | concise. Keep all guidance parent-friendly and specific to the provided data.',
        userPrompt: JSON.stringify(input),
        temperature: 0.25,
      },
      {
        parse: (value) => {
          const source = value as Record<string, unknown>;
          const summary = String(source.summary ?? '').trim();
          const strengths = Array.isArray(source.strengths) ? source.strengths.map((item) => String(item).trim()).filter(Boolean) : [];
          const weaknesses = Array.isArray(source.weaknesses) ? source.weaknesses.map((item) => String(item).trim()).filter(Boolean) : [];
          const attendanceSummary = String(source.attendanceSummary ?? '').trim();
          const homeworkSummary = String(source.homeworkSummary ?? '').trim();
          const learningRecommendations = Array.isArray(source.learningRecommendations)
            ? source.learningRecommendations.map((item) => String(item).trim()).filter(Boolean)
            : [];
          const parentLetter = String(source.parentLetter ?? '').trim();
          const meetingSummary = String(source.meetingSummary ?? '').trim();

          if (!summary || strengths.length === 0 || learningRecommendations.length === 0 || !attendanceSummary || !homeworkSummary || !parentLetter || !meetingSummary) {
            throw new Error('Parent communication report output is incomplete.');
          }

          return {
            summary,
            strengths,
            weaknesses,
            attendanceSummary,
            homeworkSummary,
            learningRecommendations,
            parentLetter,
            meetingSummary,
          };
        },
      }
    );

    const report: ParentProgressReport = {
      studentName: input.student.name,
      reportingPeriod: input.reportingPeriod,
      style: input.style,
      summary: generated.data.summary,
      strengths: generated.data.strengths,
      weaknesses: generated.data.weaknesses,
      attendanceSummary: generated.data.attendanceSummary,
      homeworkSummary: generated.data.homeworkSummary,
      learningRecommendations: generated.data.learningRecommendations,
      parentLetter: generated.data.parentLetter,
      meetingSummary: generated.data.meetingSummary,
    };

    const now = new Date().toISOString();
    await this.repository.create({
      createdAt: now,
      updatedAt: now,
      reportType: 'parent-communication',
      payload: report,
    });

    await aiTelemetryService.log({
      feature: 'ai-parent-communication-reporting',
      model: generated.model,
      promptHash: generated.promptHash,
      responsePreview: JSON.stringify(report).slice(0, 350),
      latencyMs: generated.latencyMs,
      createdAt: now,
      metadata: {
        studentId: input.student.id,
        style: input.style,
        reportingPeriod: input.reportingPeriod,
      },
    });

    return report;
  }
}
