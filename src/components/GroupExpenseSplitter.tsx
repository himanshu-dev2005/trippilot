import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Receipt, Trash2, Users, ArrowRight } from 'lucide-react';

type ExpenseEntry = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
};

type Settlement = {
  from: string;
  to: string;
  amount: number;
};

function computeSettlements(names: string[], expenses: ExpenseEntry[]): Settlement[] {
  if (names.length < 2 || expenses.length === 0) return [];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const share = total / names.length;

  const balances = new Map<string, number>();
  for (const name of names) balances.set(name, -share);
  for (const exp of expenses) {
    balances.set(exp.paidBy, (balances.get(exp.paidBy) ?? 0) + exp.amount);
  }

  const debtors: Array<{ name: string; owe: number }> = [];
  const creditors: Array<{ name: string; owed: number }> = [];
  for (const [name, bal] of balances.entries()) {
    if (bal < -0.5) debtors.push({ name, owe: -bal });
    else if (bal > 0.5) creditors.push({ name, owed: bal });
  }

  debtors.sort((a, b) => b.owe - a.owe);
  creditors.sort((a, b) => b.owed - a.owed);

  const result: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]!;
    const c = creditors[j]!;
    const transfer = Math.min(d.owe, c.owed);
    if (transfer >= 1) {
      result.push({ from: d.name, to: c.name, amount: Math.round(transfer) });
    }
    d.owe -= transfer;
    c.owed -= transfer;
    if (d.owe < 0.5) i += 1;
    if (c.owed < 0.5) j += 1;
  }
  return result;
}

export function GroupExpenseSplitter({
  destination,
  travelers,
}: {
  destination: string;
  travelers: number;
}) {
  const storageKey = `trippilot:expenses:${destination.trim().toLowerCase()}`;

  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: Math.max(2, travelers) }, (_, i) => `Traveler ${i + 1}`),
  );
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('Traveler 1');

  useEffect(() => {
    setNames((prev) => {
      const target = Math.max(2, travelers);
      if (prev.length === target) return prev;
      if (prev.length < target) {
        return [
          ...prev,
          ...Array.from({ length: target - prev.length }, (_, i) => `Traveler ${prev.length + i + 1}`),
        ];
      }
      return prev.slice(0, target);
    });
  }, [travelers]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ExpenseEntry[];
        if (Array.isArray(parsed)) setExpenses(parsed);
      } else {
        setExpenses([]);
      }
    } catch {
      setExpenses([]);
    }
  }, [storageKey]);

  function saveExpenses(next: ExpenseEntry[]) {
    setExpenses(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }

  function handleAddExpense(e: FormEvent) {
    e.preventDefault();
    const numeric = Math.round(Number(amount));
    if (!title.trim() || !Number.isFinite(numeric) || numeric <= 0) return;
    const entry: ExpenseEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      amount: numeric,
      paidBy: names.includes(paidBy) ? paidBy : names[0]!,
    };
    saveExpenses([entry, ...expenses]);
    setTitle('');
    setAmount('');
  }

  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const perPerson = names.length > 0 ? Math.round(totalSpent / names.length) : 0;
  const settlements = useMemo(() => computeSettlements(names, expenses), [names, expenses]);

  return (
    <div className="neu-raised flex flex-col gap-4 rounded-2xl p-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">
            Group Split-Bill
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F0FF] px-2.5 py-0.5 text-[11px] font-semibold text-[#6C3FE4] dark:bg-[#1E103C] dark:text-[#a78bfa]">
          <Users className="size-3" /> {names.length} people
        </span>
      </div>

      {/* Add expense form */}
      <form onSubmit={handleAddExpense} className="grid grid-cols-1 gap-2 sm:grid-cols-12">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cab, lunch, tickets..."
          className="neu-inset h-9 rounded-lg px-3 text-xs text-foreground sm:col-span-5 focus:outline-none"
        />
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="₹ Amount"
          className="neu-inset h-9 rounded-lg px-3 font-mono text-xs text-foreground sm:col-span-3 focus:outline-none"
        />
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="neu-inset h-9 rounded-lg px-2 text-xs text-foreground sm:col-span-3 focus:outline-none"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="submit"
          aria-label="Add expense"
          className="neu-btn-primary flex h-9 items-center justify-center rounded-lg px-3 text-xs sm:col-span-1"
        >
          <Plus className="size-4" />
        </button>
      </form>

      {/* Totals */}
      <div className="neu-inset-sm flex items-center justify-between rounded-xl px-4 py-2.5 text-xs">
        <span>
          Total: <strong className="font-mono text-foreground">₹{totalSpent.toLocaleString('en-IN')}</strong>
        </span>
        <span>
          Per person: <strong className="font-mono text-primary">₹{perPerson.toLocaleString('en-IN')}</strong>
        </span>
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Who Owes Whom
          </span>
          {settlements.map((s, idx) => (
            <div
              key={`${s.from}-${s.to}-${idx}`}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs"
            >
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                {s.from} <ArrowRight className="size-3 text-primary" /> {s.to}
              </span>
              <span className="font-mono font-bold text-primary">
                ₹{s.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Logged items */}
      {expenses.length > 0 && (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto text-xs">
          {expenses.map((exp) => (
            <li
              key={exp.id}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-1.5"
            >
              <span className="truncate text-foreground">
                <strong>{exp.title}</strong> · paid by {exp.paidBy}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-mono font-semibold">₹{exp.amount.toLocaleString('en-IN')}</span>
                <button
                  type="button"
                  aria-label={`Remove ${exp.title}`}
                  onClick={() => saveExpenses(expenses.filter((item) => item.id !== exp.id))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
