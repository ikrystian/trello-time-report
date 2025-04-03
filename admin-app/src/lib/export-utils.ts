import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// Removed unused html2canvas import
import { ProcessedCardData } from '@/types/time-report';

// Define the type for export formats
export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'html' | 'txt' | 'json' | 'xml';

// Helper function to format date for filenames
function formatDateForFilename(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper function to get filename with format
function getFilename(format: string, prefix: string = 'trello-time-report'): string {
  return `${prefix}-${formatDateForFilename()}.${format}`;
}

// Export to PDF
export async function exportToPDF(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): Promise<void> {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Trello Time Report', 14, 22);
  doc.setFontSize(11);
  doc.text(`Generated on: ${new Date().toLocaleDateString('pl-PL')}`, 14, 30);

  // Prepare data for tables
  const tableData: string[][] = []; // Use string[][] instead of any[]

  timeData.forEach(card => {
    const listName = listMap[card.listId] || 'Unknown List';

    card.timeEntries.forEach(entry => {
      const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown';
      const date = entry.date ? new Date(entry.date).toLocaleDateString('pl-PL') : 'No date';

      tableData.push([
        listName,
        card.cardName,
        userName,
        date,
        entry.hours.toFixed(2),
        entry.comment || ''
      ]);
    });
  });

  // Add table
  autoTable(doc, {
    head: [['List', 'Card', 'User', 'Date', 'Hours', 'Comment']],
    body: tableData,
    startY: 40,
    margin: { top: 40 },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] }
  });

  // Save the PDF
  doc.save(getFilename('pdf'));
}

// Export to CSV
export function exportToCSV(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  const headers = ['List', 'Card', 'Card URL', 'Estimated Hours', 'User', 'Date', 'Reported Hours', 'Comment'];
  const rows: string[][] = [];

  // Add header row
  rows.push(headers);

  // Add data rows
  timeData.forEach(card => {
    const listName = listMap[card.listId] || 'Unknown List';

    card.timeEntries.forEach(entry => {
      const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown';
      const date = entry.date ? new Date(entry.date).toLocaleDateString('pl-PL') : 'No date';

      rows.push([
        listName,
        card.cardName,
        card.cardUrl,
        card.estimatedHours.toString(),
        userName,
        date,
        entry.hours.toString(),
        entry.comment || ''
      ]);
    });
  });

  // Convert to CSV string
  const csvContent = rows.map(row =>
    row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      const escaped = cell.replace(/"/g, '""');
      return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
    }).join(',')
  ).join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, getFilename('csv'));
}

// Export to Excel
export function exportToExcel(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  const headers = ['List', 'Card', 'Card URL', 'Estimated Hours', 'User', 'Date', 'Reported Hours', 'Comment'];
  // Use a more specific type for rows, allowing string, number, or Date | null
  const rows: (string | number | Date | null)[][] = [headers];

  // Add data rows
  timeData.forEach(card => {
    const listName = listMap[card.listId] || 'Unknown List';

    card.timeEntries.forEach(entry => {
      const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown';
      const date = entry.date ? new Date(entry.date) : null;

      rows.push([
        listName,
        card.cardName,
        card.cardUrl,
        card.estimatedHours,
        userName,
        date,
        entry.hours,
        entry.comment || ''
      ]);
    });
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Time Report');

  // Generate Excel file and save
  XLSX.writeFile(wb, getFilename('xlsx'));
}

// Generate HTML content for the report
export function generateReportHTML(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): string {
  let html = `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trello Time Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .list-header { margin-top: 30px; font-size: 18px; font-weight: bold; }
        .card-header { margin-top: 20px; font-size: 16px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Trello Time Report</h1>
      <p>Generated on: ${new Date().toLocaleDateString('pl-PL')}</p>
      <table>
        <thead>
          <tr>
            <th>List</th>
            <th>Card</th>
            <th>User</th>
            <th>Date</th>
            <th>Hours</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Add data rows
  timeData.forEach(card => {
    const listName = listMap[card.listId] || 'Unknown List';

    card.timeEntries.forEach(entry => {
      const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown';
      const date = entry.date ? new Date(entry.date).toLocaleDateString('pl-PL') : 'No date';

      html += `
        <tr>
          <td>${listName}</td>
          <td>${card.cardName}</td>
          <td>${userName}</td>
          <td>${date}</td>
          <td>${entry.hours.toFixed(2)}</td>
          <td>${entry.comment || ''}</td>
        </tr>
      `;
    });
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;
  return html;
}

// Export to HTML (triggers download)
export function exportToHTML(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  const htmlContent = generateReportHTML(timeData, listMap, memberMap);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  saveAs(blob, getFilename('html'));
}

// Export to TXT
export function exportToTXT(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  let txt = `Trello Time Report\n`;
  txt += `Generated on: ${new Date().toLocaleDateString('pl-PL')}\n\n`;

  // Group by list
  const listGroups: Record<string, ProcessedCardData[]> = {};

  timeData.forEach(card => {
    const listId = card.listId || 'unknown-list';
    const listName = listMap[listId] || 'Unknown List';

    if (!listGroups[listName]) {
      listGroups[listName] = [];
    }

    listGroups[listName].push(card);
  });

  // Generate text content
  Object.entries(listGroups).forEach(([listName, cards]) => {
    txt += `\n=== ${listName} ===\n\n`;

    cards.forEach(card => {
      txt += `Card: ${card.cardName}\n`;
      txt += `URL: ${card.cardUrl}\n`;
      txt += `Estimated Hours: ${card.estimatedHours.toFixed(2)}\n`;
      txt += `Time Entries:\n`;

      card.timeEntries.forEach(entry => {
        const userName = entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown';
        const date = entry.date ? new Date(entry.date).toLocaleDateString('pl-PL') : 'No date';

        txt += `  - User: ${userName}, Date: ${date}, Hours: ${entry.hours.toFixed(2)}\n`;
        if (entry.comment) {
          txt += `    Comment: ${entry.comment}\n`;
        }
      });

      txt += '\n';
    });
  });

  // Create and download file
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
  saveAs(blob, getFilename('txt'));
}

// Export to JSON
export function exportToJSON(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  // Create a structured object with resolved references
  const exportData = {
    generatedAt: new Date().toISOString(),
    lists: listMap,
    members: memberMap,
    cards: timeData.map(card => ({
      ...card,
      listName: listMap[card.listId] || 'Unknown List',
      timeEntries: card.timeEntries.map(entry => ({
        ...entry,
        userName: entry.memberId ? memberMap[entry.memberId]?.fullName || entry.memberId : 'Unknown'
      }))
    }))
  };

  // Convert to JSON string with pretty formatting
  const jsonString = JSON.stringify(exportData, null, 2);

  // Create and download file
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, getFilename('json'));
}

// Export to XML
export function exportToXML(
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<TimeReport generatedAt="${new Date().toISOString()}">\n`;

  // Add lists
  xml += `  <Lists>\n`;
  Object.entries(listMap).forEach(([id, name]) => {
    xml += `    <List id="${id}">${name}</List>\n`;
  });
  xml += `  </Lists>\n`;

  // Add members
  xml += `  <Members>\n`;
  Object.entries(memberMap).forEach(([id, member]) => {
    xml += `    <Member id="${id}">${member.fullName}</Member>\n`;
  });
  xml += `  </Members>\n`;

  // Add cards and time entries
  xml += `  <Cards>\n`;
  timeData.forEach(card => {
    xml += `    <Card id="${card.cardId}">\n`;
    xml += `      <Name>${escapeXML(card.cardName)}</Name>\n`;
    xml += `      <URL>${escapeXML(card.cardUrl)}</URL>\n`;
    xml += `      <ListId>${card.listId}</ListId>\n`;
    xml += `      <EstimatedHours>${card.estimatedHours}</EstimatedHours>\n`;

    xml += `      <TimeEntries>\n`;
    card.timeEntries.forEach(entry => {
      xml += `        <TimeEntry>\n`;
      if (entry.memberId) {
        xml += `          <MemberId>${entry.memberId}</MemberId>\n`;
      }
      if (entry.date) {
        xml += `          <Date>${entry.date}</Date>\n`;
      }
      xml += `          <Hours>${entry.hours}</Hours>\n`;
      if (entry.comment) {
        xml += `          <Comment>${escapeXML(entry.comment)}</Comment>\n`;
      }
      xml += `        </TimeEntry>\n`;
    });
    xml += `      </TimeEntries>\n`;

    xml += `    </Card>\n`;
  });
  xml += `  </Cards>\n`;

  xml += `</TimeReport>`;

  // Create and download file
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  saveAs(blob, getFilename('xml'));
}

// Helper function to escape XML special characters
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main export function that handles all formats
export function exportTimeReport(
  format: ExportFormat,
  timeData: ProcessedCardData[],
  listMap: Record<string, string>,
  memberMap: Record<string, { fullName: string; avatarUrl: string | null }>
): void {
  switch (format) {
    case 'pdf':
      exportToPDF(timeData, listMap, memberMap);
      break;
    case 'csv':
      exportToCSV(timeData, listMap, memberMap);
      break;
    case 'excel':
      exportToExcel(timeData, listMap, memberMap);
      break;
    case 'html':
      exportToHTML(timeData, listMap, memberMap);
      break;
    case 'txt':
      exportToTXT(timeData, listMap, memberMap);
      break;
    case 'json':
      exportToJSON(timeData, listMap, memberMap);
      break;
    case 'xml':
      exportToXML(timeData, listMap, memberMap);
      break;
    default:
      console.error('Unsupported export format:', format);
  }
}
