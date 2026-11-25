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
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="font-display text-lg text-card-foreground">Expense Breakdown (₹)</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Activity tickets &amp; entry vs. estimated local transit</p>
      <div className="mt-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
              contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="Activities" stackId="cost" fill="var(--color-primary)" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Transit" stackId="cost" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
