import { InventoryItemWithUser } from '@/types/data-log';

export function exportToCSV(data: InventoryItemWithUser[], filename: string = 'inventory-export.csv') {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  
  const headers = [
    'Item Name',
    'Batch Number',
    'Quantity',
    'Reject',
    'Reject %',
    'Destination',
    'Category',
    'Entered By',
    'Date Added',
    'Notes',
  ];
  
  const rows = data.map(item => {
    const rejectPercent = item.quantity > 0 ? ((item.reject / item.quantity) * 100).toFixed(2) : '0.00';
    return [
      `"${item.itemName.replace(/"/g, '""')}"`,
      `"${item.batch}"`,
      item.quantity,
      item.reject,
      rejectPercent,
      item.destination,
      item.category || '',
      `"${item.user.name}"`,
      new Date(item.createdAt).toLocaleString(),
      item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '',
    ].join(',');
  });
  
  const csv = BOM + [headers.join(','), ...rows].join('\n');
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

export function exportToJSON(data: InventoryItemWithUser[], filename: string = 'inventory-export.json') {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalRecords: data.length,
    data: data.map(item => ({
      id: item.id,
      itemName: item.itemName,
      batch: item.batch,
      quantity: item.quantity,
      reject: item.reject,
      rejectPercentage: item.quantity > 0 ? ((item.reject / item.quantity) * 100).toFixed(2) : '0.00',
      destination: item.destination,
      category: item.category,
      notes: item.notes,
      enteredBy: {
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  };
  
  const json = JSON.stringify(exportData, null, 2);
  downloadFile(json, filename, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getFileSizeString(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
