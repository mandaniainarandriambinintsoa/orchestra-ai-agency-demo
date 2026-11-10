"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { activitySeries } from "@/lib/demo-data";

export function ActivityChart() {
  return (
    <div className="h-[280px] w-full" role="img" aria-label="Activité des prospects entrants et qualifiés sur sept jours">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={activitySeries} margin={{ top: 12, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="entrants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#496d43" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#496d43" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="qualifies" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9cad92" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#9cad92" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e8ebe3" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#697267", fontSize: 11 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#84907c", fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: "#ced4c9", strokeDasharray: "4 4" }}
            contentStyle={{ border: "1px solid #e1e5dc", borderRadius: 12, boxShadow: "0 10px 24px rgb(31 45 28 / 8%)", fontSize: 12 }}
          />
          <Area type="monotone" dataKey="entrants" name="Entrants" stroke="#496d43" strokeWidth={2} fill="url(#entrants)" />
          <Area type="monotone" dataKey="qualifies" name="Qualifiés" stroke="#9cad92" strokeWidth={2} fill="url(#qualifies)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
