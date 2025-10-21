export interface KPIData {
  totalItems: {
    value: number;
    change: number;
    previous: number;
  };
  totalQuantity: {
    value: number;
    change: number;
    previous: number;
    mais: number;
    fozan: number;
  };
  rejectRate: {
    value: number;
    change: number;
    previous: number;
    totalRejects: number;
  };
  activeUsers: {
    value: number;
    topContributor: string | null;
    topContributorCount: number;
  };
  categories: {
    value: number;
    mostActive: string | null;
  };
  avgDailyEntries: {
    value: number;
  };
}

export interface TimeSeriesData {
  date: string;
  total: number;
  mais: number;
  fozan: number;
  rejects: number;
  count: number;
}

export interface DestinationData {
  count: number;
  quantity: number;
  rejects: number;
}

export interface CategoryData {
  count: number;
  quantity: number;
  rejects: number;
  mais: number;
  fozan: number;
}

export interface ChartData {
  timeSeries: TimeSeriesData[];
  byDestination: Record<string, DestinationData>;
  byCategory: Record<string, CategoryData>;
  userActivity: Record<string, number>;
}

export interface DashboardData {
  kpis: KPIData;
  charts: ChartData;
  metadata: {
    startDate: string;
    endDate: string;
    totalRecords: number;
    filters: {
      destination: string | null;
      category: string | null;
    };
  };
}

export interface AIInsights {
  insights: string[];
  recommendations: string[];
  alerts: string[];
  confidenceScore: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface DashboardFilters {
  dateRange: DateRange;
  destination: string;
  category: string;
}
