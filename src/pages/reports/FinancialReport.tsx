// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWalletStore } from '@/store/walletStore';
import { calculateAccounting, exportBookkeepingAsPDF } from '@/lib/bookkeeper';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FinancialReport() {
  const { id, month, cName } = useParams<{ id: string; month: string; cName: string }>();
  const { financialRecords, dues, bankBalance, bankAdminBalance, fetchWallet } = useWalletStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet().finally(() => setLoading(false));
  }, [fetchWallet]);

  const accounting = calculateAccounting(financialRecords, dues, bankBalance, bankAdminBalance);

  const handleExportPDF = () => {
    exportBookkeepingAsPDF(
      financialRecords,
      dues,
      bankBalance,
      bankAdminBalance,
      cName ? decodeURIComponent(cName) : 'Leo Club'
    );
  };

  return (
    <AppLayout pageTitle={`${month} Financial Statement`} subtitle={`L/C ${cName ? decodeURIComponent(cName) : ''}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/viewReport/reportID=${id}`}>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-500">
              <ArrowLeft className="w-4 h-4" /> Back to Activity Report
            </Button>
          </Link>

          <Button variant="brand" size="sm" onClick={handleExportPDF} className="gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Download Official PDF Statement
          </Button>
        </div>

        {/* Balance Parity Check Card */}
        {!accounting.isAccurate ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Financial Statement Discrepancy Detected</p>
              <p className="mt-0.5">Total Assets ({formatCurrency(accounting.totalAssets)}) do not equal Total Liabilities ({formatCurrency(accounting.totalLiabilities)}). Please contact your District Treasurer for assistance.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">Double-Entry Balance Verified: Total Assets balance exactly with Liabilities & Equity.</span>
          </div>
        )}

        {/* Financial Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Income</span>
            <div className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(accounting.totalIncome)} LKR</div>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Expenses</span>
            <div className="text-xl font-black text-red-600 mt-1">{formatCurrency(accounting.totalExpenses)} LKR</div>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Period Surplus / (Deficit)</span>
            <div className={`text-xl font-black mt-1 ${accounting.surplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(accounting.surplus)} LKR
            </div>
          </Card>
          <Card className="p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Assets</span>
            <div className="text-xl font-black text-brand-600 mt-1">{formatCurrency(accounting.totalAssets)} LKR</div>
          </Card>
        </div>

        {/* Balance Sheet Breakdown */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-800">Balance Sheet Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs divide-y divide-slate-100">
            <div className="flex justify-between pt-2">
              <span className="text-slate-600 font-medium">Non-Current Assets Total</span>
              <span className="font-bold text-slate-900">{formatCurrency(accounting.totalNonCurrentAssets)} LKR</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-600 font-medium">Receivables (Dues / Pledges)</span>
              <span className="font-bold text-slate-900">{formatCurrency(accounting.totalReceivables)} LKR</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-600 font-medium">Cash in Hand</span>
              <span className="font-bold text-slate-900">{formatCurrency(accounting.cashInHand)} LKR</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-600 font-medium">Bank Balance (Service Account)</span>
              <span className="font-bold text-slate-900">{formatCurrency(bankBalance)} LKR</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-600 font-medium">Bank Balance (Admin Account)</span>
              <span className="font-bold text-slate-900">{formatCurrency(bankAdminBalance)} LKR</span>
            </div>
            <div className="flex justify-between pt-3 font-bold text-sm text-brand-700 bg-brand-50/50 p-3 rounded-xl border border-brand-100">
              <span>Total Assets</span>
              <span>{formatCurrency(accounting.totalAssets)} LKR</span>
            </div>
            <div className="flex justify-between pt-3 font-bold text-sm text-slate-800 p-3 rounded-xl">
              <span>Total Liabilities & Equity</span>
              <span>{formatCurrency(accounting.totalLiabilities)} LKR</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

