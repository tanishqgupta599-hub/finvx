// Export utilities for PDF and Excel

export interface ExportData {
  transactions?: any[];
  investments?: any[];
  creditCards?: any[];
  loans?: any[];
  assets?: any[];
  type: 'transactions' | 'investments' | 'credit-cards' | 'loans' | 'assets' | 'full-report';
  dateRange?: { start: string; end: string };
}

// Export to CSV/Excel format
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to JSON
export function exportToJSON(data: any, filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Generate PDF report (client-side using browser print)
export function exportToPDF(title: string, content: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to export PDF.');
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1f2937;
            line-height: 1.6;
          }
          h1 { color: #111827; margin-bottom: 20px; }
          h2 { color: #374151; margin-top: 30px; margin-bottom: 15px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .summary {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="no-print" style="margin-bottom: 20px; padding: 10px; background: #f0f9ff; border-radius: 4px;">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>Click Print or use Ctrl+P to save as PDF</p>
        </div>
        ${content}
      </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load, then trigger print
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

// Format data for export
export function formatTransactionsForExport(transactions: any[]) {
  return transactions.map(txn => ({
    Date: new Date(txn.date).toLocaleDateString(),
    Description: txn.description,
    Amount: txn.amount,
    Category: txn.category,
    Account: txn.account || 'N/A',
    Type: txn.amount > 0 ? 'Income' : 'Expense'
  }));
}

export function formatInvestmentsForExport(investments: any[]) {
  return investments.map(inv => ({
    Name: inv.name,
    Type: inv.type,
    Value: inv.value,
    Institution: inv.institution || 'N/A',
    'Purchase Date': inv.purchaseDate ? new Date(inv.purchaseDate).toLocaleDateString() : 'N/A'
  }));
}

export function formatCreditCardsForExport(cards: any[]) {
  return cards.map(card => ({
    Brand: card.brand,
    'Last 4': card.last4,
    Limit: card.limit,
    Balance: card.balance,
    'Available Credit': card.limit - card.balance,
    'Utilization %': ((card.balance / card.limit) * 100).toFixed(2),
    'Due Date': card.billDueDate ? new Date(card.billDueDate).toLocaleDateString() : 'N/A',
    APR: card.apr || 'N/A'
  }));
}
