import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Income, Expense } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, EmptyState, Spinner } from '../components/ui/Card';
import { Plus, TrendingUp, TrendingDown, Wallet, Search, Edit2, Trash2 } from 'lucide-react';

const EXPENSE_CATEGORIES = ['إيجار', 'مرتبات', 'مرافق', 'طباعة', 'تسويق', 'أدوات', 'صيانة', 'أخرى'];
const INCOME_CATEGORIES = ['رسوم دراسية', 'مصادر أخرى'];

export function Finance() {
  const [tab, setTab] = useState<'overview' | 'income' | 'expenses'>('overview');
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [incomeItems, expenseItems] = await Promise.all([
      repo.getAll('income'),
      repo.getAll('expenses'),
    ]);
    incomeItems.sort((a, b) => b.income_date.localeCompare(a.income_date));
    expenseItems.sort((a, b) => b.expense_date.localeCompare(a.expense_date));
    setIncome(incomeItems as Income[]);
    setExpenses(expenseItems as Expense[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const profit = totalIncome - totalExpenses;

  // Category breakdown
  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => ({
    category: cat,
    amount: expenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount), 0),
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  const incomeByCategory = INCOME_CATEGORIES.map((cat) => ({
    category: cat,
    amount: income.filter((i) => i.category === cat).reduce((s, i) => s + Number(i.amount), 0),
  })).filter((c) => c.amount > 0);

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  const incomeColumns: Column<Income>[] = [
    { key: 'source', header: 'المصدر', sortable: true, sortValue: (i) => i.source, render: (i) => <span className="font-medium text-ink-900">{i.source}</span> },
    { key: 'category', header: 'التصنيف', render: (i) => <Badge tone="success">{i.category}</Badge> },
    { key: 'amount', header: 'المبلغ', sortable: true, sortValue: (i) => Number(i.amount), render: (i) => <span className="text-success-700 font-semibold tabular">{(Number(i.amount) / 100).toLocaleString('ar-EG')} ج.م</span> },
    { key: 'description', header: 'الوصف', render: (i) => <span className="text-ink-600 text-xs">{i.description || '—'}</span> },
    { key: 'date', header: 'التاريخ', sortable: true, sortValue: (i) => i.income_date, render: (i) => <span className="text-ink-500 text-xs tabular">{i.income_date}</span> },
    {
      key: 'actions', header: '', align: 'left',
      render: (i) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditingIncome(i); setShowIncomeForm(true); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm text-danger-600" onClick={async () => { if (confirm('حذف؟')) { await repo.softDelete('income', i.id); load(); } }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  const expenseColumns: Column<Expense>[] = [
    { key: 'category', header: 'التصنيف', sortable: true, sortValue: (e) => e.category, render: (e) => <Badge tone="danger">{e.category}</Badge> },
    { key: 'payee', header: 'المستفيد', render: (e) => <span className="text-ink-700">{e.payee || '—'}</span> },
    { key: 'amount', header: 'المبلغ', sortable: true, sortValue: (e) => Number(e.amount), render: (e) => <span className="text-danger-700 font-semibold tabular">{(Number(e.amount) / 100).toLocaleString('ar-EG')} ج.م</span> },
    { key: 'description', header: 'الوصف', render: (e) => <span className="text-ink-600 text-xs">{e.description || '—'}</span> },
    { key: 'date', header: 'التاريخ', sortable: true, sortValue: (e) => e.expense_date, render: (e) => <span className="text-ink-500 text-xs tabular">{e.expense_date}</span> },
    {
      key: 'actions', header: '', align: 'left',
      render: (e) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditingExpense(e); setShowExpenseForm(true); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm text-danger-600" onClick={async () => { if (confirm('حذف؟')) { await repo.softDelete('expenses', e.id); load(); } }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="kpi-card">
          <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center text-success-600"><TrendingUp size={18} /></div>
          <p className="text-2xl font-bold text-ink-900 tabular">{(totalIncome / 100).toLocaleString('ar-EG')}</p>
          <p className="text-xs text-ink-600">إجمالي الإيرادات (ج.م)</p>
        </div>
        <div className="kpi-card">
          <div className="w-9 h-9 rounded-lg bg-danger-50 flex items-center justify-center text-danger-600"><TrendingDown size={18} /></div>
          <p className="text-2xl font-bold text-ink-900 tabular">{(totalExpenses / 100).toLocaleString('ar-EG')}</p>
          <p className="text-xs text-ink-600">إجمالي المصروفات (ج.م)</p>
        </div>
        <div className={`kpi-card ${profit < 0 ? 'border-danger-200' : 'border-success-200'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${profit >= 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}><Wallet size={18} /></div>
          <p className={`text-2xl font-bold tabular ${profit >= 0 ? 'text-success-700' : 'text-danger-700'}`}>{(profit / 100).toLocaleString('ar-EG')}</p>
          <p className="text-xs text-ink-600">صافي الربح (ج.م)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-ink-200">
        {[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'income', label: 'الإيرادات' },
          { id: 'expenses', label: 'المصروفات' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 h-10 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-brand-600 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-5">
          <Card>
            <CardHeader title="الإيرادات حسب التصنيف" />
            <div className="p-4 space-y-3">
              {incomeByCategory.map((c) => {
                const pct = totalIncome > 0 ? (c.amount / totalIncome) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-700">{c.category}</span>
                      <span className="text-sm font-semibold text-ink-900 tabular">{(c.amount / 100).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <CardHeader title="المصروفات حسب التصنيف" />
            <div className="p-4 space-y-3">
              {expenseByCategory.map((c) => {
                const pct = totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0;
                return (
                  <div key={c.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-ink-700">{c.category}</span>
                      <span className="text-sm font-semibold text-ink-900 tabular">{(c.amount / 100).toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div className="h-full bg-danger-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === 'income' && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pr-9" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={() => { setEditingIncome(null); setShowIncomeForm(true); }}><Plus size={16} /> إيراد جديد</Button>
          </div>
          <DataTable columns={incomeColumns} data={income.filter((i) => !search || i.source.includes(search) || (i.description || '').includes(search))} rowKey={(i) => i.id} emptyState={<EmptyState icon={<TrendingUp size={40} />} title="لا توجد إيرادات" />} />
        </>
      )}

      {tab === 'expenses' && (
        <>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input className="input pr-9" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}><Plus size={16} /> مصروف جديد</Button>
          </div>
          <DataTable columns={expenseColumns} data={expenses.filter((e) => !search || e.category.includes(search) || (e.description || '').includes(search) || (e.payee || '').includes(search))} rowKey={(e) => e.id} emptyState={<EmptyState icon={<TrendingDown size={40} />} title="لا توجد مصروفات" />} />
        </>
      )}

      {showIncomeForm && <IncomeForm income={editingIncome} onClose={() => setShowIncomeForm(false)} onSaved={() => { setShowIncomeForm(false); load(); }} />}
      {showExpenseForm && <ExpenseForm expense={editingExpense} onClose={() => setShowExpenseForm(false)} onSaved={() => { setShowExpenseForm(false); load(); }} />}
    </div>
  );
}

function IncomeForm({ income, onClose, onSaved }: { income: Income | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    source: income?.source || '',
    category: income?.category || 'رسوم دراسية',
    amount: income ? income.amount / 100 : 0,
    description: income?.description || '',
    income_date: income?.income_date || new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.source.trim()) return;
    setSaving(true);
    const data = {
      ...form,
      amount: Math.round(Number(form.amount) * 100)
    };
    if (income) { await repo.update('income', income.id, data); }
    else { await repo.insert('income', data); }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={income ? 'تعديل إيراد' : 'إيراد جديد'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.source.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Input label="المصدر *" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="col-span-2" />
        <Select label="التصنيف" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={INCOME_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <Input label="المبلغ (ج.م)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <Input label="التاريخ" type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} className="col-span-2" />
        <Textarea label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}

function ExpenseForm({ expense, onClose, onSaved }: { expense: Expense | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    category: expense?.category || 'أخرى',
    amount: expense ? expense.amount / 100 : 0,
    payee: expense?.payee || '',
    description: expense?.description || '',
    expense_date: expense?.expense_date || new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    const data = {
      ...form,
      amount: Math.round(Number(form.amount) * 100)
    };
    if (expense) { await repo.update('expenses', expense.id, data); }
    else { await repo.insert('expenses', data); }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={expense ? 'تعديل مصروف' : 'مصروف جديد'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Select label="التصنيف" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <Input label="المبلغ (ج.م)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <Input label="المستفيد" value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} className="col-span-2" />
        <Input label="التاريخ" type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="col-span-2" />
        <Textarea label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}
