import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { ItineraryDay } from '@/lib/optimizer';

export function BudgetBreakdownChart({ itinerary }: { itinerary: ItineraryDay[] }) {
  if (!itinerary.length) return null;

  const data = itinerary.map((day) => ({
    name: `Day ${day.dayNumber}`,
    Activities: day.activityCost,
    Transit: day.transitCost,
  }));

  return (
    <div className="neu-raised rounded-2xl p-6">
      <span className="text-xs font-semibold uppercase tracking-wider text-outline">
        Category Breakdown
      </span>
      <h3 className="mt-1 font-display text-lg font-semibold text-card-foreground">
        Expense Breakdown (₹)
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Activity tickets &amp; entry vs. estimated local transit
      </p>
      <div className="mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              contentStyle={{
                borderRadius: '12px',
                fontSize: '12px',
                border: 'none',
                boxShadow: '6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.6)',
                background: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Activities" stackId="cost" fill="var(--color-chart-1)" radius={[0, 0, 6, 6]} />
            <Bar dataKey="Transit" stackId="cost" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
