import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { DashboardData, DashboardFilters } from '@/types/analytics';

export async function exportDashboardToPDF(
  data: DashboardData | null,
  filters: DashboardFilters
) {
  if (!data) {
    throw new Error('No data to export');
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(31, 41, 55);
  pdf.text('📊 Analytics Dashboard Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(
    `Generated on ${format(new Date(), 'MMMM dd, yyyy HH:mm:ss')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 5;
  pdf.text(
    `Period: ${format(filters.dateRange.start, 'MMM dd, yyyy')} - ${format(filters.dateRange.end, 'MMM dd, yyyy')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;

  // KPIs Section
  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text('Key Performance Indicators', 15, yPosition);
  yPosition += 8;

  const kpis = [
    {
      label: 'Total Items Entered',
      value: data.kpis.totalItems.value.toLocaleString(),
      change: `${data.kpis.totalItems.change > 0 ? '+' : ''}${data.kpis.totalItems.change.toFixed(1)}%`,
    },
    {
      label: 'Total Quantity',
      value: data.kpis.totalQuantity.value.toLocaleString(),
      change: `${data.kpis.totalQuantity.change > 0 ? '+' : ''}${data.kpis.totalQuantity.change.toFixed(1)}%`,
    },
    {
      label: 'Reject Rate',
      value: `${data.kpis.rejectRate.value.toFixed(2)}%`,
      change: `${data.kpis.rejectRate.change > 0 ? '+' : ''}${data.kpis.rejectRate.change.toFixed(2)}%`,
    },
    {
      label: 'Active Users',
      value: data.kpis.activeUsers.value.toString(),
      change: data.kpis.activeUsers.topContributor || 'N/A',
    },
    {
      label: 'Categories',
      value: data.kpis.categories.value.toString(),
      change: data.kpis.categories.mostActive || 'N/A',
    },
    {
      label: 'Avg Daily Entries',
      value: data.kpis.avgDailyEntries.value.toFixed(1),
      change: '',
    },
  ];

  pdf.setFontSize(10);
  kpis.forEach((kpi, index) => {
    const x = 15 + (index % 2) * 95;
    const y = yPosition + Math.floor(index / 2) * 20;

    pdf.setTextColor(107, 114, 128);
    pdf.text(kpi.label, x, y);
    
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.text(kpi.value, x, y + 6);
    
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(kpi.change, x, y + 11);
    
    pdf.setFontSize(10);
  });

  yPosition += 70;

  // Destination Distribution
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text('Distribution by Destination', 15, yPosition);
  yPosition += 8;

  Object.entries(data.charts.byDestination).forEach(([dest, values]) => {
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`${dest}:`, 20, yPosition);
    pdf.text(`${values.quantity.toLocaleString()} units (${values.count} items)`, 50, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Top Categories
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setFontSize(14);
  pdf.setTextColor(31, 41, 55);
  pdf.text('Top Categories', 15, yPosition);
  yPosition += 8;

  const topCategories = Object.entries(data.charts.byCategory)
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 10);

  topCategories.forEach(([cat, values]) => {
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`${cat}:`, 20, yPosition);
    pdf.text(`${values.quantity.toLocaleString()} units`, 80, yPosition);
    pdf.text(`Mais: ${values.mais} | Fozan: ${values.fozan}`, 120, yPosition);
    yPosition += 6;

    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  });

  // Footer
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  pdf.save(`analytics-dashboard-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`);
}

export async function exportChartToPNG(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Chart element not found');
  }

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2,
  });

  const link = document.createElement('a');
  link.download = `${filename}-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
