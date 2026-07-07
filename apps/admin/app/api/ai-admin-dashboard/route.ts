import { AnalyticsService, type AdminDashboardAnalyticsReport } from '@eduspell/analytics';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RoleFilter = 'student' | 'teacher' | 'parent';
type ContentTypeFilter = 'quiz' | 'worksheet' | 'lesson';

interface GeneratePayload {
  action: 'generate';
  dateRange: {
    from: string;
    to: string;
  };
  filters: {
    schoolIds: string[];
    roles: RoleFilter[];
    contentTypes: ContentTypeFilter[];
  };
}

interface ExportPayload {
  action: 'export';
  format: 'csv' | 'pdf';
  report: AdminDashboardAnalyticsReport;
}

function ensureRoleFilter(value: string): RoleFilter {
  if (value === 'student' || value === 'teacher' || value === 'parent') {
    return value;
  }

  throw new Error(`Invalid role filter: ${value}`);
}

function ensureContentType(value: string): ContentTypeFilter {
  if (value === 'quiz' || value === 'worksheet' || value === 'lesson') {
    return value;
  }

  throw new Error(`Invalid content type filter: ${value}`);
}

function parseGeneratePayload(value: unknown): GeneratePayload {
  const source = value as Record<string, unknown>;
  const dateRange = (source.dateRange ?? {}) as Record<string, unknown>;
  const from = String(dateRange.from ?? '').trim();
  const to = String(dateRange.to ?? '').trim();

  if (!from || !to) {
    throw new Error('dateRange.from and dateRange.to are required.');
  }

  const filtersSource = (source.filters ?? {}) as Record<string, unknown>;

  const schoolIds = Array.isArray(filtersSource.schoolIds)
    ? filtersSource.schoolIds.map((item) => String(item).trim()).filter(Boolean)
    : [];

  const roles = Array.isArray(filtersSource.roles)
    ? filtersSource.roles.map((item) => ensureRoleFilter(String(item)))
    : [];

  const contentTypes = Array.isArray(filtersSource.contentTypes)
    ? filtersSource.contentTypes.map((item) => ensureContentType(String(item)))
    : [];

  return {
    action: 'generate',
    dateRange: {
      from,
      to,
    },
    filters: {
      schoolIds,
      roles,
      contentTypes,
    },
  };
}

function parseExportPayload(value: unknown): ExportPayload {
  const source = value as Record<string, unknown>;
  const format = String(source.format ?? '').trim();
  const report = source.report as AdminDashboardAnalyticsReport | undefined;

  if (format !== 'csv' && format !== 'pdf') {
    throw new Error('format must be csv or pdf.');
  }

  if (!report || typeof report !== 'object') {
    throw new Error('report is required for export.');
  }

  return {
    action: 'export',
    format,
    report,
  };
}

function toCsv(report: AdminDashboardAnalyticsReport): string {
  const rows: string[][] = [
    ['Section', 'Metric', 'Value'],
    ['Date Range', 'From', report.dateRange.from],
    ['Date Range', 'To', report.dateRange.to],
    ['Monitoring', 'Students', String(report.monitoring.students)],
    ['Monitoring', 'Teachers', String(report.monitoring.teachers)],
    ['Monitoring', 'Parents', String(report.monitoring.parents)],
    ['Monitoring', 'Schools', String(report.monitoring.schools)],
    ['Monitoring', 'Quizzes', String(report.monitoring.quizzes)],
    ['Monitoring', 'Worksheets', String(report.monitoring.worksheets)],
    ['Monitoring', 'Lessons', String(report.monitoring.lessons)],
    ['Active Users', 'Total', String(report.activeUsers.total)],
    ['Active Users', 'Students', String(report.activeUsers.students)],
    ['Active Users', 'Teachers', String(report.activeUsers.teachers)],
    ['Active Users', 'Parents', String(report.activeUsers.parents)],
    ['AI Usage', 'Total Requests', String(report.aiUsage.totalRequests)],
    ['Learning Progress', 'Average Mastery', String(report.learningProgress.averageMastery)],
    ['Learning Progress', 'Completion Rate', String(report.learningProgress.completionRate)],
    ['System Health', 'Uptime %', String(report.systemHealth.uptimePercentage)],
    ['System Health', 'Average Latency (ms)', String(report.systemHealth.averageLatencyMs)],
    ['System Health', 'Error Rate %', String(report.systemHealth.errorRatePercentage)],
  ];

  report.aiUsage.byFeature.forEach((item) => {
    rows.push(['AI Usage By Feature', item.feature, String(item.requests)]);
  });

  report.learningProgress.cefrDistribution.forEach((item) => {
    rows.push(['CEFR Distribution', item.cefrBand, String(item.students)]);
  });

  return rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

function wrapText(text: string, maxChars = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

async function toPdf(report: AdminDashboardAnalyticsReport): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595, 842]);
  let y = 800;

  const drawLine = (text: string, x = 48, size = 11, isBold = false) => {
    if (y < 70) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }

    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? bold : regular,
    });

    y -= 16;
  };

  drawLine('EduSpell Pro AI Admin Dashboard Report', 48, 16, true);
  drawLine(`Generated: ${report.generatedAt}`, 48, 11);
  drawLine(`Range: ${report.dateRange.from} to ${report.dateRange.to}`, 48, 11);
  y -= 8;

  drawLine('Entity Monitoring', 48, 12, true);
  drawLine(`Students: ${report.monitoring.students}`, 56);
  drawLine(`Teachers: ${report.monitoring.teachers}`, 56);
  drawLine(`Parents: ${report.monitoring.parents}`, 56);
  drawLine(`Schools: ${report.monitoring.schools}`, 56);
  drawLine(`Quizzes: ${report.monitoring.quizzes}`, 56);
  drawLine(`Worksheets: ${report.monitoring.worksheets}`, 56);
  drawLine(`Lessons: ${report.monitoring.lessons}`, 56);

  y -= 6;
  drawLine('Active Users and AI Usage', 48, 12, true);
  drawLine(`Active users total: ${report.activeUsers.total}`, 56);
  drawLine(`AI requests total: ${report.aiUsage.totalRequests}`, 56);
  report.aiUsage.byFeature.forEach((item) => drawLine(`${item.feature}: ${item.requests}`, 56));

  y -= 6;
  drawLine('Learning Progress and System Health', 48, 12, true);
  drawLine(`Average mastery: ${report.learningProgress.averageMastery}%`, 56);
  drawLine(`Completion rate: ${report.learningProgress.completionRate}%`, 56);
  drawLine(`Uptime: ${report.systemHealth.uptimePercentage}%`, 56);
  drawLine(`Latency: ${report.systemHealth.averageLatencyMs}ms`, 56);
  drawLine(`Error rate: ${report.systemHealth.errorRatePercentage}%`, 56);

  y -= 6;
  drawLine('Executive Summary', 48, 12, true);
  wrapText(report.insights.executiveSummary).forEach((line) => drawLine(line, 56));

  y -= 6;
  drawLine('Recommendations', 48, 12, true);
  report.insights.recommendations.forEach((item, index) => {
    wrapText(`${index + 1}. ${item}`).forEach((line, lineIndex) => drawLine(line, lineIndex === 0 ? 56 : 64));
  });

  return pdf.save();
}

export async function POST(request: NextRequest) {
  try {
    const role = request.cookies.get('eduspell_role')?.value;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can access this endpoint.' }, { status: 403 });
    }

    const body = (await request.json()) as { action?: string };

    if (body.action === 'generate') {
      const payload = parseGeneratePayload(body);
      const service = new AnalyticsService();

      const report = await service.generateAdminDashboardAnalytics({
        adminId: request.cookies.get('eduspell_user_id')?.value ?? 'admin-user',
        dateRange: payload.dateRange,
        filters: payload.filters,
      });

      return NextResponse.json({ data: report });
    }

    if (body.action === 'export') {
      const payload = parseExportPayload(body);
      const fromLabel = payload.report.dateRange.from.slice(0, 10);
      const toLabel = payload.report.dateRange.to.slice(0, 10);

      if (payload.format === 'csv') {
        return NextResponse.json({
          data: {
            fileName: `admin-dashboard-report-${fromLabel}-to-${toLabel}.csv`,
            mimeType: 'text/csv',
            base64: Buffer.from(toCsv(payload.report), 'utf-8').toString('base64'),
          },
        });
      }

      const pdfBytes = await toPdf(payload.report);
      return NextResponse.json({
        data: {
          fileName: `admin-dashboard-report-${fromLabel}-to-${toLabel}.pdf`,
          mimeType: 'application/pdf',
          base64: Buffer.from(pdfBytes).toString('base64'),
        },
      });
    }

    throw new Error('action must be generate or export.');
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unable to process admin dashboard analytics request.',
      },
      { status: 400 }
    );
  }
}
