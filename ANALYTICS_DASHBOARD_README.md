# Analytics Dashboard Implementation

## Overview
A comprehensive analytics dashboard with data visualizations, KPI cards, trend analysis, and AI-powered insights from Gemini to help managers make informed decisions about inventory management.

## Features Implemented

### 1. Route & Access Control
- **Path**: `/[locale]/analytics`
- **Access**: SUPERVISOR role and above
- **Middleware**: Protected route added to `src/middleware.ts`

### 2. Dashboard Components

#### KPI Cards (`src/components/analytics/KPICards.tsx`)
Six prominent cards displaying:
- **Total Items Entered**: With trend indicator and sparkline
- **Total Quantity**: Breakdown by Mais vs Fozan
- **Overall Reject Rate**: Color-coded (green <5%, yellow 5-10%, red >10%)
- **Active Users**: Count with top contributor badge
- **Categories in Stock**: Number of unique categories with most active
- **Average Daily Entries**: Calculated average with trend

Each card includes:
- Icon representing the metric
- Large, bold main value
- Subtitle/description
- Trend indicator (arrow + percentage)
- Comparison to previous period

#### Charts

1. **Inventory Trend Line Chart** (`src/components/charts/InventoryTrendChart.tsx`)
   - Multi-line chart showing Total, Mais, Fozan, and Rejects over time
   - Toggle visibility for each line
   - Export to CSV functionality
   - Responsive tooltips with formatted dates

2. **Destination Distribution Pie Chart** (`src/components/charts/DestinationChart.tsx`)
   - Percentage split between Mais and Fozan
   - Interactive segments with percentage labels
   - Center summary with total counts

3. **Category Bar Chart** (`src/components/charts/CategoryChart.tsx`)
   - Sortable by quantity or name
   - Stacked or grouped view toggle
   - Horizontal layout for many categories
   - Shows Mais/Fozan split per category

4. **Reject Analysis Chart** (`src/components/charts/RejectAnalysisChart.tsx`)
   - Stacked area chart showing Accepted vs Rejected
   - Toggle between absolute and percentage view
   - Color-coded zones (safe, warning, danger)
   - Gradient fills for visual appeal

5. **User Activity Heatmap** (`src/components/charts/UserActivityHeatmap.tsx`)
   - Day of week vs Hour of day visualization
   - Color intensity based on entry count
   - Tooltips showing exact counts
   - Identifies peak activity times

#### Dashboard Filters (`src/components/analytics/DashboardFilters.tsx`)
- Date range presets (Last 7/30/90 days, This Month, This Year)
- Custom date range picker
- Destination filter (All, Mais, Fozan)
- Category filter
- Reset all filters button
- Filter state persisted in URL

#### AI Insights Panel (`src/components/analytics/AIInsightsPanel.tsx`)
- Collapsible/expandable panel
- Sections for:
  - **Key Findings**: 3-5 bullet points of insights
  - **Alerts**: Urgent issues highlighted
  - **Recommendations**: Actionable steps
  - **Predictions**: Future trends
- Confidence score visualization
- Follow-up question input with example questions
- Conversational Q&A with Gemini
- Auto-refresh on date range change

### 3. API Endpoints

#### Dashboard Data API (`src/app/api/analytics/dashboard/route.ts`)
- **GET** `/api/analytics/dashboard`
- Query parameters: `startDate`, `endDate`, `destination`, `category`
- Returns:
  - KPIs with comparison to previous period
  - Time series data for charts
  - Destination and category breakdowns
  - User activity heatmap data
- Role-based access control (SUPERVISOR+)

#### AI Insights API (`src/app/api/analytics/insights/route.ts`)
- **POST** `/api/analytics/insights`
- Two modes:
  - `type: 'analyze'`: Generate insights from dashboard data
  - `type: 'question'`: Answer follow-up questions
- Integrates with Gemini AI service
- Returns structured insights with confidence scores

### 4. PDF Export (`src/lib/export-pdf.ts`)
- Generate comprehensive PDF reports including:
  - Company header with date range
  - All KPI values
  - Destination and category summaries
  - Top categories list
  - Professional styling with page numbers
- Download or email option

### 5. Type Definitions (`src/types/analytics.ts`)
- `KPIData`: Structure for all KPI metrics
- `TimeSeriesData`: Daily aggregated data points
- `DestinationData`: Breakdown by destination
- `CategoryData`: Breakdown by category
- `ChartData`: Combined chart data structure
- `DashboardData`: Complete dashboard response
- `AIInsights`: AI-generated insights structure
- `DashboardFilters`: Filter state management

## Dependencies Added
```json
{
  "recharts": "^2.x",
  "date-fns": "^2.x",
  "jspdf": "^2.x",
  "html2canvas": "^2.x"
}
```

## Usage

### Accessing the Dashboard
1. Navigate to `/[locale]/analytics` (e.g., `/en/analytics`)
2. Must be logged in with SUPERVISOR, MANAGER, or ADMIN role
3. Dashboard loads with last 30 days of data by default

### Filtering Data
1. Use date range presets or custom dates
2. Filter by destination (Mais/Fozan) or category
3. Filters apply to all charts and KPIs
4. Click "Reset Filters" to return to defaults

### AI Insights
1. AI insights generate automatically on page load
2. Click "Refresh" to regenerate insights
3. Ask follow-up questions in the input field
4. Use example questions for common queries

### Exporting
1. Click "Export PDF" to generate a comprehensive report
2. Individual charts can export to CSV using their export buttons
3. PDF includes all KPIs, summaries, and top categories

## Performance Optimizations
- Auto-refresh toggle (60-second intervals)
- Manual refresh button with last updated timestamp
- Lazy loading for charts (render when in viewport)
- Memoized calculations
- Debounced filter changes
- API response caching (5 minutes)

## Responsive Design
- Desktop: Multi-column grid layout
- Tablet: 2-column layout
- Mobile: Single column with simplified charts
- Touch gestures for chart interactions

## Accessibility
- All charts with proper ARIA labels
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support
- Alternative data table views

## Known Issues

### Prisma Client Type Recognition
The TypeScript compiler is not recognizing the `prisma.inventoryItem` model despite:
- Prisma client being generated successfully
- The model existing in the schema
- Other API routes using it successfully

**Workaround Applied**: Used `any` type for Prisma queries to allow compilation.

**To Fix**:
1. Ensure Prisma client is generated: `npm run prisma:generate`
2. Restart TypeScript server in your IDE
3. If issue persists, check that `@prisma/client` is properly installed
4. Verify the schema path in `package.json` scripts

## Future Enhancements
- Comparison mode (compare two time periods side by side)
- Anomaly detection highlighting
- Drill-down capability (click chart to see detailed data)
- Custom dashboard layouts (drag and drop widgets)
- Scheduled email reports
- Real-time updates with WebSockets
- Advanced filtering (multiple categories, date ranges)
- Chart annotations and notes
- Export individual charts as PNG/SVG
- Dashboard templates for different roles

## File Structure
```
src/
├── app/
│   ├── [locale]/
│   │   └── analytics/
│   │       └── page.tsx                    # Main dashboard page
│   └── api/
│       └── analytics/
│           ├── dashboard/
│           │   └── route.ts                # Dashboard data API
│           └── insights/
│               └── route.ts                # AI insights API
├── components/
│   ├── analytics/
│   │   ├── KPICards.tsx                   # KPI cards component
│   │   ├── DashboardFilters.tsx           # Filter controls
│   │   └── AIInsightsPanel.tsx            # AI insights panel
│   └── charts/
│       ├── InventoryTrendChart.tsx        # Line chart
│       ├── DestinationChart.tsx           # Pie chart
│       ├── CategoryChart.tsx              # Bar chart
│       ├── RejectAnalysisChart.tsx        # Area chart
│       └── UserActivityHeatmap.tsx        # Heatmap
├── lib/
│   └── export-pdf.ts                      # PDF export utility
└── types/
    └── analytics.ts                        # Type definitions
```

## Testing Checklist
- [ ] Dashboard loads for SUPERVISOR role
- [ ] Dashboard blocked for DATA_ENTRY role
- [ ] All KPIs display correct values
- [ ] Charts render with data
- [ ] Date range filters work
- [ ] Destination filter works
- [ ] AI insights generate successfully
- [ ] Follow-up questions work
- [ ] PDF export generates correctly
- [ ] Auto-refresh toggles on/off
- [ ] Manual refresh updates data
- [ ] Responsive layout on mobile
- [ ] Charts export to CSV
- [ ] Tooltips show correct data
- [ ] Heatmap displays activity patterns

## API Response Example
```json
{
  "kpis": {
    "totalItems": { "value": 150, "change": 12.5, "previous": 133 },
    "totalQuantity": { "value": 15000, "change": 8.3, "previous": 13850, "mais": 9000, "fozan": 6000 },
    "rejectRate": { "value": 3.2, "change": -0.5, "previous": 3.7, "totalRejects": 480 },
    "activeUsers": { "value": 5, "topContributor": "John Doe", "topContributorCount": 45 },
    "categories": { "value": 12, "mostActive": "Medical Supplies" },
    "avgDailyEntries": { "value": 5.0 }
  },
  "charts": {
    "timeSeries": [...],
    "byDestination": {...},
    "byCategory": {...},
    "userActivity": {...}
  },
  "metadata": {
    "startDate": "2025-09-21T00:00:00.000Z",
    "endDate": "2025-10-21T23:59:59.999Z",
    "totalRecords": 150,
    "filters": { "destination": "all", "category": "all" }
  }
}
```

## Support
For issues or questions, refer to:
- Main project README
- API documentation
- Gemini AI service documentation
- Recharts documentation: https://recharts.org/
