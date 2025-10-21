import { ReportType, ReportStatus } from '@prisma/client';

export interface ReportConfig {
  type: ReportType;
  period: {
    start: Date;
    end: Date;
  };
  content: {
    summary: boolean;
    charts: boolean;
    detailedTable: boolean;
    rejectAnalysis: boolean;
    destinationBreakdown: boolean;
    categoryAnalysis: boolean;
    aiInsights: boolean;
    userActivity: boolean;
    auditTrail: boolean;
    comparativeAnalysis: boolean;
  };
  format: 'pdf' | 'excel' | 'powerpoint';
  customization: {
    includeLogo: boolean;
    includeSignatures: boolean;
    language: 'en' | 'ar' | 'bilingual';
    paperSize: 'A4' | 'Letter';
    orientation: 'portrait' | 'landscape';
  };
  email?: {
    enabled: boolean;
    recipients: string[];
    subject: string;
    message: string;
  };
}

export interface ReportEntry {
  id: string;
  title: string;
  type: ReportType;
  periodStart: Date;
  periodEnd: Date;
  generatedAt: Date;
  generatedBy: {
    id: string;
    name: string;
  };
  fileSize: number;
  format: string;
  status: ReportStatus;
  fileUrl?: string;
}

export interface ReportProgress {
  step: string;
  percentage: number;
  message: string;
}

export interface ReportData {
  summary: {
    totalItems: number;
    totalQuantity: number;
    overallRejectRate: number;
    topCategories: string[];
    maisVsFozan: {
      mais: number;
      fozan: number;
    };
  };
  trends: {
    date: string;
    quantity: number;
    rejects: number;
  }[];
  categoryBreakdown: {
    category: string;
    count: number;
    quantity: number;
    rejectRate: number;
  }[];
  destinationData: {
    destination: string;
    count: number;
    percentage: number;
  }[];
  aiInsights?: string[];
  detailedItems: any[];
}

export interface ScheduledReport {
  id: string;
  name: string;
  reportType: ReportType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  time: string;
  recipients: string[];
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  config: ReportConfig;
}
