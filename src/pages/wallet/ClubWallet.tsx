// @ts-nocheck
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWalletStore } from '@/store/walletStore';
import { useUserStore } from '@/store/userStore';
import { calculateAccounting, exportBookkeepingAsPDF } from '@/lib/bookkeeper';
import { formatCurrency } from '@/lib/utils';
import { notify } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Wallet,
  Plus,
  Download,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building,
  RefreshCw,
  Edit3,
  ShieldAlert,
  ShieldCheck,
  Calculator,
  Sparkles,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClubWallet() {
  const {
    financialRecords,
    dues,
    bankBalance,
    bankAdminBalance,
    fetchWallet,
    updateBankBalance,
    updateBBF,
  } = useWalletStore();
  const user = useUserStore();

  const [activeTab, setActiveTab] = useState<'balance' | 'ie' | 'rp' | 'projects' | 'receivables' | 'payables'>('balance');
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [newBankBal, setNewBankBal] = useState('');
  const [newAdminBal, setNewAdminBal] = useState('');
  const [reconciling, setReconciling] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const accounting = calculateAccounting(financialRecords, dues, bankBalance, bankAdminBalance);

  // Reconciliation Variance
  const variance = Math.abs(accounting.totalAssets - accounting.totalLiabilities);
  const isBalanced = accounting.isAccurate;

  const handleExportPDF = () => {
    exportBookkeepingAsPDF(
      financialRecords,
      dues,
      bankBalance,
      bankAdminBalance,
      `Leo Club of ${user.clubName || 'MyLeo'}`
    );
  };

  const handleSaveBankBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateBankBalance({
      bank_balance: newBankBal || bankBalance,
      bank_admin_balance: newAdminBal || bankAdminBalance,
    });
    setBankModalOpen(false);
    fetchWallet();
  };

  // Self-Audit & 1-Click Auto-Reconciliation
  const handleAutoReconcile = async () => {
    setReconciling(true);
    // Discrepancy is resolved by adjusting Balance Brought Forward (BBF) to balance the double entry
    const adjustment = accounting.totalAssets - accounting.totalLiabilities;
    const currentBBFCash = accounting.bbfCash || 0;
    const reconciledBBFCash = currentBBFCash - adjustment;

    await updateBBF({
      bbf_cash: reconciledBBFCash,
      bbf_bank: accounting.bbfBank || 0,
      bbf_admin_bank: accounting.bbfAdminBank || 0,
    });

    setReconciling(false);
    setReconcileModalOpen(false);
    notify('Ledger reconciled successfully! Total Assets now match Total Liabilities & Equity.', 'success');
    fetchWallet();
  };

  return (
    <AppLayout
      pageTitle="Club Wallet"
      subtitle={`Official Double-Entry Financial Ledger for Leo Club of ${user.clubName || 'Your Club'}`}
      actions={
        user.canManageWallet ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReconcileModalOpen(true)}
              className="gap-1.5 border-brand-200 text-brand-700 hover:bg-brand-50"
            >
              <Calculator className="w-4 h-4 text-brand-600" />
              <span>Reconciliation Audit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewBankBal(String(bankBalance));
                setNewAdminBal(String(bankAdminBalance));
                setBankModalOpen(true);
              }}
              className="gap-1.5"
            >
              <Edit3 className="w-4 h-4" /> Bank Balances
            </Button>
            <Link to="/add-wallet-record">
              <Button variant="brand" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Record
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleExportPDF} className="gap-1.5">
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        ) : (
          <Button variant="secondary" size="sm" onClick={handleExportPDF} className="gap-1.5">
            <Download className="w-4 h-4" /> Export PDF
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Role Capability Restriction Notice for Secretary / Non-Treasurer Roles */}
        {!user.canManageWallet && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-start gap-3.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Wallet Financial Management: Read-Only Audit Mode Active</p>
                <p className="mt-1 leading-relaxed text-amber-800">
                  Under the Leo Reporting Hierarchy and MD 306 governance bylaws, <strong>Club Secretaries</strong> are authorized to create and manage Project Reports, Activity Reports, and Member records, but <strong>do not possess Wallet financial management rights</strong>. Financial administration, bank balance configuration, and double-entry ledger additions are reserved exclusively for the <strong>Club President</strong> and <strong>Club Treasurer</strong>.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-300 text-amber-800 bg-white shrink-0 self-start sm:self-center font-mono">
              Role: {user.currentRole || 'Read-Only Audit'}
            </Badge>
          </div>
        )}

        {/* Double-Entry Parity Alert / Resolution Banner */}
        {!isBalanced ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-sm">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Balance Discrepancy Detected ({formatCurrency(variance)} LKR Variance)</p>
                <p className="mt-1 leading-relaxed text-red-700">
                  Total Liabilities & Equity ({formatCurrency(accounting.totalLiabilities)} LKR) do not match Total Assets ({formatCurrency(accounting.totalAssets)} LKR).
                  {user.canManageWallet
                    ? ' Run the Self-Audit tool to identify root causes and auto-reconcile.'
                    : ' Please inform your Club Treasurer or Club President to run the double-entry self-audit and reconcile.'}
                </p>
              </div>
            </div>
            {user.canManageWallet ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setReconcileModalOpen(true)}
                className="gap-1.5 flex-shrink-0 w-fit"
              >
                <Calculator className="w-4 h-4" /> Diagnose & Reconcile
              </Button>
            ) : (
              <Badge variant="outline" className="border-red-300 text-red-700 bg-white font-mono shrink-0 py-1">
                Treasurer Action Required
              </Badge>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Double-entry balance verified: Total Assets match Total Liabilities & Equity ({formatCurrency(accounting.totalAssets)} LKR).</span>
            </div>
            <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-emerald-200 text-emerald-700 font-bold">
              Balanced
            </span>
          </div>
        )}

        {/* Top Metric Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card className="p-5 bg-white/95 hover:border-brand-300 transition-all shadow-soft-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(accounting.totalIncome)} LKR</div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Dues collected: {formatCurrency(dues)} LKR</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-5 bg-white/95 hover:border-red-300 transition-all shadow-soft-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Total Expenses</span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(accounting.totalExpenses)} LKR</div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Operational & Service spend</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <Card className="p-5 bg-white/95 hover:border-brand-300 transition-all shadow-soft-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Net Surplus / (Deficit)</span>
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-black mt-2 ${accounting.surplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(accounting.surplus)} LKR
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Accumulated fund growth</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="p-5 bg-white/95 hover:border-amber-300 transition-all shadow-soft-xs">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                <span>Liquid Cash & Bank</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-brand-700 mt-2">
                {formatCurrency(accounting.cashInHand + bankBalance + bankAdminBalance)} LKR
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Cash: {formatCurrency(accounting.cashInHand)} | Bank: {formatCurrency(bankBalance + bankAdminBalance)}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <Tabs
            tabs={[
              { id: 'balance', label: 'Balance Sheet' },
              { id: 'ie', label: 'Income & Expenditure' },
              { id: 'rp', label: 'Receipts & Payments' },
              { id: 'projects', label: 'Project Budgets', count: accounting.projectBudgets.length },
              { id: 'receivables', label: 'Receivables', count: accounting.receivablesList.length },
              { id: 'payables', label: 'Payables', count: accounting.payablesList.length },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as any)}
          />
        </div>

        {/* Tab 1: Balance Sheet */}
        {activeTab === 'balance' && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Statement of Financial Position (Balance Sheet)</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-xs">
              {/* Assets Section */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Non-Current Assets</h4>
                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                  {accounting.nonCurrentAssets.length === 0 ? (
                    <p className="text-slate-400 py-1">No non-current assets recorded.</p>
                  ) : (
                    accounting.nonCurrentAssets.map((item: any, i: number) => (
                      <div key={i} className="py-2 flex justify-between">
                        <span className="text-slate-700">{item.description}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(item.value)} LKR</span>
                      </div>
                    ))
                  )}
                  <div className="pt-2 flex justify-between font-bold text-slate-800">
                    <span>Total Non-Current Assets</span>
                    <span>{formatCurrency(accounting.totalNonCurrentAssets)} LKR</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pt-2">Current Assets</h4>
                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-1">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Receivables</span>
                    <span className="font-semibold">{formatCurrency(accounting.totalReceivables)} LKR</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Cash in Hand</span>
                    <span className="font-semibold">{formatCurrency(accounting.cashInHand)} LKR</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Bank Balance (Service Account)</span>
                    <span className="font-semibold">{formatCurrency(bankBalance)} LKR</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Bank Balance (Admin Account)</span>
                    <span className="font-semibold">{formatCurrency(bankAdminBalance)} LKR</span>
                  </div>
                  <div className="pt-2 flex justify-between font-bold text-slate-800">
                    <span>Total Current Assets</span>
                    <span>{formatCurrency(accounting.totalCurrentAssets)} LKR</span>
                  </div>
                </div>

                <div className="flex justify-between p-3.5 rounded-xl bg-brand-50 border border-brand-200 font-bold text-sm text-brand-900">
                  <span>TOTAL ASSETS</span>
                  <span>{formatCurrency(accounting.totalAssets)} LKR</span>
                </div>
              </div>

              {/* Equity & Liabilities Section */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Accumulated Fund & Liabilities</h4>
                <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3 border border-slate-100 space-y-1">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Accumulated Fund at Start</span>
                    <span className="font-semibold">{formatCurrency(accounting.accumulatedStart)} LKR</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Surplus / (Deficit) for the Period</span>
                    <span className={`font-semibold ${accounting.surplus >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(accounting.surplus)} LKR
                    </span>
                  </div>
                  <div className="py-2 flex justify-between font-bold text-slate-800">
                    <span>Accumulated Fund at End</span>
                    <span>{formatCurrency(accounting.accumulatedEnd)} LKR</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-700">Total Current Liabilities (Payables)</span>
                    <span className="font-semibold">{formatCurrency(accounting.totalCurrentLiabilities)} LKR</span>
                  </div>
                </div>

                <div className="flex justify-between p-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm">
                  <span>TOTAL LIABILITIES & EQUITY</span>
                  <span>{formatCurrency(accounting.totalLiabilities)} LKR</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Income & Expenditure */}
        {activeTab === 'ie' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-emerald-700 flex justify-between items-center">
                  <span>Income Statement</span>
                  <span>{formatCurrency(accounting.totalIncome)} LKR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-xs divide-y divide-slate-100">
                <div className="py-2 flex justify-between font-medium">
                  <span className="text-slate-700">Membership Dues Collected</span>
                  <span className="font-bold text-slate-900">{formatCurrency(dues)} LKR</span>
                </div>
                {accounting.incomesList.map((inc: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span className="text-slate-700">{inc.description}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(inc.value)} LKR</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-red-700 flex justify-between items-center">
                  <span>Expenditure Statement</span>
                  <span>{formatCurrency(accounting.totalExpenses)} LKR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-xs divide-y divide-slate-100">
                {accounting.expensesList.map((exp: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span className="text-slate-700">{exp.description}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(exp.value)} LKR</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Receipts & Payments */}
        {activeTab === 'rp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-brand-700 flex justify-between items-center">
                  <span>Total Receipts</span>
                  <span>{formatCurrency(accounting.totalReceipts)} LKR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-xs divide-y divide-slate-100">
                <div className="py-2 flex justify-between font-medium">
                  <span className="text-slate-700">BBF (Cash)</span>
                  <span className="font-semibold">{formatCurrency(accounting.bbfCash)} LKR</span>
                </div>
                <div className="py-2 flex justify-between font-medium">
                  <span className="text-slate-700">BBF (Bank - Service)</span>
                  <span className="font-semibold">{formatCurrency(accounting.bbfBank)} LKR</span>
                </div>
                <div className="py-2 flex justify-between font-medium">
                  <span className="text-slate-700">BBF (Bank - Admin)</span>
                  <span className="font-semibold">{formatCurrency(accounting.bbfAdminBank)} LKR</span>
                </div>
                <div className="py-2 flex justify-between font-medium">
                  <span className="text-slate-700">Membership Dues Collected</span>
                  <span className="font-semibold">{formatCurrency(dues)} LKR</span>
                </div>
                {accounting.receiptsList.map((r: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span className="text-slate-700">{r.description}</span>
                    <span className="font-semibold">{formatCurrency(r.value)} LKR</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex justify-between items-center">
                  <span>Total Payments</span>
                  <span>{formatCurrency(accounting.totalPayments)} LKR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-xs divide-y divide-slate-100">
                {accounting.paymentsList.map((p: any, i: number) => (
                  <div key={i} className="py-2 flex justify-between">
                    <span className="text-slate-700">{p.description}</span>
                    <span className="font-semibold">{formatCurrency(p.value)} LKR</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 4: Project Budgets */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {accounting.projectBudgets.map((pb: any, idx: number) => (
              <Card key={idx}>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900">{pb.proname}</CardTitle>
                    <div className="flex gap-4 text-xs font-semibold">
                      <span className="text-emerald-700">Income: {formatCurrency(pb.tol_income)} LKR</span>
                      <span className="text-red-700">Expenses: {formatCurrency(pb.tol_expense)} LKR</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-bold text-emerald-800 mb-2">Income Entries</h5>
                    <div className="divide-y divide-slate-100">
                      {pb.incomes.map((inc: any, i: number) => (
                        <div key={i} className="py-1.5 flex justify-between">
                          <span className="text-slate-600">{inc.description}</span>
                          <span className="font-medium">{formatCurrency(inc.value)} LKR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-bold text-red-800 mb-2">Expense Entries</h5>
                    <div className="divide-y divide-slate-100">
                      {pb.expenses.map((exp: any, i: number) => (
                        <div key={i} className="py-1.5 flex justify-between">
                          <span className="text-slate-600">{exp.description}</span>
                          <span className="font-medium">{formatCurrency(exp.value)} LKR</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab 5 & 6: Receivables & Payables */}
        {(activeTab === 'receivables' || activeTab === 'payables') && (
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">
                {activeTab === 'receivables' ? 'Outstanding Receivables' : 'Creditors & Outstanding Payables'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="divide-y divide-slate-100 text-xs">
                {(activeTab === 'receivables' ? accounting.receivablesList : accounting.payablesList).map((item: any, i: number) => (
                  <div key={i} className="py-2.5 flex justify-between items-center">
                    <span className="font-medium text-slate-700">{item.description}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.value)} LKR</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RECONCILIATION & SELF-AUDIT MODAL */}
      <Dialog open={reconcileModalOpen} onOpenChange={setReconcileModalOpen}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-600" />
            <DialogTitle>Wallet Self-Audit & Reconciliation Tool</DialogTitle>
          </div>
          <DialogDescription>
            Diagnose balance discrepancies between double-entry ledger postings and bank statements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Status Diagnostic Card */}
          <div className={`p-4 rounded-xl border ${isBalanced ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {isBalanced ? <ShieldCheck className="w-5 h-5 text-emerald-600" /> : <ShieldAlert className="w-5 h-5 text-red-600" />}
                <span>{isBalanced ? 'Ledger Balanced & Verified' : 'Discrepancy Detected'}</span>
              </div>
              <Badge variant={isBalanced ? 'success' : 'destructive'} className="text-xs">
                {isBalanced ? '0.00 Variance' : `${formatCurrency(variance)} LKR Variance`}
              </Badge>
            </div>
            <p className="mt-2 text-xs opacity-90 leading-relaxed">
              {isBalanced
                ? 'Total Assets equal Total Liabilities & Equity exactly. No reconciliation adjustments required.'
                : 'A discrepancy exists between Total Assets and Total Liabilities & Equity. This typically occurs when opening Balance Brought Forward (BBF) does not match prior audited closing assets.'}
            </p>
          </div>

          {/* Breakdown Comparison Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 uppercase text-[10px]">Audit Balance Summary</h4>
            <div className="divide-y divide-slate-100 rounded-xl bg-slate-50 border border-slate-200/80 p-3">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Total Assets</span>
                <span className="font-bold text-slate-900">{formatCurrency(accounting.totalAssets)} LKR</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Total Liabilities & Equity</span>
                <span className="font-bold text-slate-900">{formatCurrency(accounting.totalLiabilities)} LKR</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Verified Bank Balances (Service + Admin)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(bankBalance + bankAdminBalance)} LKR</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-600">Calculated Cash in Hand</span>
                <span className="font-semibold text-slate-800">{formatCurrency(accounting.cashInHand)} LKR</span>
              </div>
              <div className="pt-2 flex justify-between font-bold text-slate-900 border-t border-slate-200">
                <span>Variance (Assets - Liabilities)</span>
                <span className={variance === 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {formatCurrency(accounting.totalAssets - accounting.totalLiabilities)} LKR
                </span>
              </div>
            </div>
          </div>

          {/* Suggested Resolution & One-Click Fix */}
          {!isBalanced && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Recommended Automatic Resolution:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Clicking <strong>Auto-Reconcile Balance</strong> will automatically calibrate the club's Balance Brought Forward (BBF Cash) by <strong>{formatCurrency(accounting.totalAssets - accounting.totalLiabilities)} LKR</strong> to balance the double-entry accounting ledger.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => setReconcileModalOpen(false)}>
            Close
          </Button>
          {!isBalanced && (
            <Button
              variant="brand"
              type="button"
              onClick={handleAutoReconcile}
              loading={reconciling}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto-Reconcile Balance</span>
            </Button>
          )}
        </DialogFooter>
      </Dialog>

      {/* Bank Balances Modal */}
      <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
        <DialogHeader>
          <DialogTitle>Update Verified Bank Balances</DialogTitle>
          <DialogDescription>
            Enter the exact closing balances from your club bank statements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveBankBalance} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Service Account Balance (LKR)</label>
            <Input
              type="number"
              step="0.01"
              value={newBankBal}
              onChange={(e) => setNewBankBal(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase">Admin Account Balance (LKR)</label>
            <Input
              type="number"
              step="0.01"
              value={newAdminBal}
              onChange={(e) => setNewAdminBal(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setBankModalOpen(false)}>Cancel</Button>
            <Button variant="brand" type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </AppLayout>
  );
}
