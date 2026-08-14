import { useLink } from "@refinedev/core";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants";

type RoleRow = {
  name: string;
  value: number;
};

type EnrollmentTrendRow = {
  month?: string;
  current: number;
  average: number;
};

export type AdminDashboardAnalyticsProps = {
  donutData: RoleRow[];
  monthlyData: EnrollmentTrendRow[];
};

export function AdminDashboardAnalytics({ donutData, monthlyData }: AdminDashboardAnalyticsProps) {
  const Link = useLink();

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.55fr)]">
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 px-8 pb-0 pt-8">
          <div>
            <CardTitle className="text-xl">Student distribution</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Where students are distributed academically.</p>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-6 pt-4">
          <div className="h-64">
            {donutData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">No distribution data is available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={102} paddingAngle={2} strokeWidth={0}>
                    {donutData.map((_, index) => <Cell key={`donut-cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, "Students"]} contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {donutData.length > 0 && <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-5">
            {donutData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: `var(--chart-${(index % 5) + 1})` }} />
                <span>{entry.name}</span>
                <Badge variant="secondary" className="ml-auto font-medium">{entry.value}</Badge>
              </div>
            ))}
          </div>}
          <Button variant="outline" className="mt-6 h-11 w-full rounded-xl" asChild>
            <Link to={ROUTES.USERS.LIST}>View full report</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 px-8 pb-0 pt-8">
          <div>
            <CardTitle className="text-xl">Student enrollment trend</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Track how student enrollment has changed throughout the academic year.</p>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8 pt-4">
          <div className="mb-3 flex justify-end gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary" /> Total students</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-primary/40" /> New enrollments</span>
          </div>
          <div className="h-80 min-h-65 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", color: "var(--popover-foreground)" }} />
                <Line type="monotone" dataKey="current" stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="average" stroke="var(--chart-2)" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
