import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useWalletStore } from '@/store/walletStore';
import { notify } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';

export default function AddRecord() {
  const navigate = useNavigate();
  const { addRecord } = useWalletStore();
  const [loading, setLoading] = useState(false);

  const [category, setCategory] = useState<'income' | 'payment' | 'bbf' | 'asset'>('income');
  const [recordType, setRecordType] = useState('cr'); // cr, cnr, loan, ex
  const [mode, setMode] = useState('C'); // C = Cash, B = Bank Service, A = Bank Admin
  const [detail, setDetail] = useState('');
  const [value, setValue] = useState('');
  const [isBbf, setIsBbf] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim() || !value) {
      notify('Please enter all required fields', 'warning');
      return;
    }

    setLoading(true);
    let resolvedType = recordType;
    if (category === 'payment') resolvedType = recordType;
    if (category === 'asset') resolvedType = 'noncrnt';
    if (category === 'bbf') resolvedType = 'bbf';

    const payload = {
      type: resolvedType,
      mode,
      detail,
      value,
      is_bbf: isBbf ? 1 : 0,
      settled_value: 0,
    };

    const res = await addRecord(payload);
    setLoading(false);
    if (res) {
      notify('Financial record added successfully!', 'success');
      navigate('/club-wallet');
    }
  };

  return (
    <AppLayout pageTitle="Add Financial Record" subtitle="Record an Income, Expense, Loan, or Asset entry">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/club-wallet')} className="gap-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" /> Back to Wallet
        </Button>

        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">New Transaction Entry</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'income', label: 'Income' },
                    { id: 'payment', label: 'Payment' },
                    { id: 'asset', label: 'Asset' },
                    { id: 'bbf', label: 'BBF' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id as any);
                        if (c.id === 'income') setRecordType('cr');
                        if (c.id === 'payment') setRecordType('ex');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                        category === c.id
                          ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-type selector */}
              {category === 'income' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Income Type</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="cr">Cash Received (CR)</option>
                    <option value="cnr">Receivable / Cash Not Received (CNR)</option>
                    <option value="loan">Loan Received</option>
                  </select>
                </div>
              )}

              {category === 'payment' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Payment Type</label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-brand-400"
                  >
                    <option value="ex">Expense (General / Project)</option>
                    <option value="loan">Loan Repayment</option>
                  </select>
                </div>
              )}

              {/* Transaction Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Transaction Account / Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'C', label: 'Cash in Hand' },
                    { id: 'B', label: 'Bank (Service)' },
                    { id: 'A', label: 'Bank (Admin)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                        mode === m.id
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Description / Details</label>
                <Input
                  placeholder="e.g. Donation from XYZ, Hall Booking Advance..."
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  required
                />
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Value in LKR</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>

              {/* BBF check */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isBbf}
                  onChange={(e) => setIsBbf(e.target.checked)}
                  className="rounded text-brand-600 h-4 w-4"
                />
                <span>Balance Brought Forward (Opening balance from previous year)</span>
              </label>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="brand" loading={loading} className="gap-2">
                  <Save className="w-4 h-4" /> Record Transaction
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

