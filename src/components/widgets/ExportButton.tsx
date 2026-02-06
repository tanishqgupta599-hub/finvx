"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  exportToCSV, 
  exportToJSON, 
  exportToPDF, 
  formatTransactionsForExport,
  formatInvestmentsForExport,
  formatCreditCardsForExport,
  ExportData 
} from "@/lib/export";
import { useAppStore } from "@/state/app-store";
import { useCurrencyFormat } from "@/lib/currency";

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportButtonProps {
  type?: 'transactions' | 'investments' | 'credit-cards' | 'full-report';
  className?: string;
}

const INVESTMENT_TYPES = ['stock', 'mutual_fund', 'etf', 'bond', 'gold', 'fd'] as const;

export function ExportButton({ type = 'full-report', className }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const transactions = useAppStore((s) => s.transactions);
  const assets = useAppStore((s) => s.assets);
  const creditCards = useAppStore((s) => s.creditCards);
  const loans = useAppStore((s) => s.loans);
  const profile = useAppStore((s) => s.profile);
  const { format } = useCurrencyFormat();

  // Memoize investments to prevent infinite loops
  const investments = useMemo(() => {
    return assets.filter(a => INVESTMENT_TYPES.includes(a.type as any));
  }, [assets]);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (format === 'pdf') {
        await exportPDF();
      } else if (format === 'csv') {
        await exportCSV();
      } else {
        await exportJSON();
      }
      
      toast.success(`Exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    const timestamp = new Date().toLocaleDateString();
    let content = '';

    if (type === 'full-report' || type === 'transactions') {
      content += `
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Account</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 100).map(txn => `
              <tr>
                <td>${new Date(txn.date).toLocaleDateString()}</td>
                <td>${txn.description}</td>
                <td>${format(Math.abs(txn.amount))}</td>
                <td>${txn.category}</td>
                <td>${txn.account || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'full-report' || type === 'investments') {
      content += `
        <h2>Investments</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Institution</th>
            </tr>
          </thead>
          <tbody>
            ${investments.map(inv => `
              <tr>
                <td>${inv.name}</td>
                <td>${inv.type}</td>
                <td>${format(inv.value)}</td>
                <td>${inv.institution || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'full-report' || type === 'credit-cards') {
      content += `
        <h2>Credit Cards</h2>
        <table>
          <thead>
            <tr>
              <th>Brand</th>
              <th>Last 4</th>
              <th>Limit</th>
              <th>Balance</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            ${creditCards.map(card => `
              <tr>
                <td>${card.brand}</td>
                <td>${card.last4}</td>
                <td>${format(card.limit)}</td>
                <td>${format(card.balance)}</td>
                <td>${format(card.limit - card.balance)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    if (type === 'full-report') {
      const totalAssets = assets.reduce((sum, a) => sum + a.value, 0);
      const totalDebt = loans.reduce((sum, l) => sum + l.balance, 0);
      const netWorth = totalAssets - totalDebt;

      content = `
        <div class="summary">
          <h2>Financial Summary</h2>
          <p><strong>Total Assets:</strong> ${format(totalAssets)}</p>
          <p><strong>Total Debt:</strong> ${format(totalDebt)}</p>
          <p><strong>Net Worth:</strong> ${format(netWorth)}</p>
        </div>
      ` + content;
    }

    exportToPDF(`${profile?.name || 'User'}'s Financial Report - ${timestamp}`, content);
  };

  const exportCSV = async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (type === 'transactions') {
      exportToCSV(formatTransactionsForExport(transactions), `transactions-${timestamp}`);
    } else if (type === 'investments') {
      exportToCSV(formatInvestmentsForExport(investments), `investments-${timestamp}`);
    } else if (type === 'credit-cards') {
      exportToCSV(formatCreditCardsForExport(creditCards), `credit-cards-${timestamp}`);
    } else {
      // Full report - export all as separate files
      exportToCSV(formatTransactionsForExport(transactions), `transactions-${timestamp}`);
      setTimeout(() => exportToCSV(formatInvestmentsForExport(investments), `investments-${timestamp}`), 100);
      setTimeout(() => exportToCSV(formatCreditCardsForExport(creditCards), `credit-cards-${timestamp}`), 200);
    }
  };

  const exportJSON = async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const data: any = {
      exportedAt: new Date().toISOString(),
      profile: profile?.name || 'User'
    };

    if (type === 'transactions' || type === 'full-report') {
      data.transactions = transactions;
    }
    if (type === 'investments' || type === 'full-report') {
      data.investments = investments;
    }
    if (type === 'credit-cards' || type === 'full-report') {
      data.creditCards = creditCards;
    }
    if (type === 'full-report') {
      data.loans = loans;
      data.assets = assets;
    }

    exportToJSON(data, `financial-report-${timestamp}`);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleExport('csv')}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Export CSV
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleExport('json')}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Export JSON
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export PDF
      </Button>
    </div>
  );
}
