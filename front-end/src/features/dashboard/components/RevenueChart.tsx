// src/features/dashboard/components/RevenueChart.tsx
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dữ liệu giả lập cho biểu đồ
const data = [
  { name: "Thg 1", revenue: 4000 },
  { name: "Thg 2", revenue: 3000 },
  { name: "Thg 3", revenue: 5000 },
  { name: "Thg 4", revenue: 4500 },
  { name: "Thg 5", revenue: 6000 },
  { name: "Thg 6", revenue: 5500 },
  { name: "Thg 7", revenue: 7000 },
];

export function RevenueChart() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Tổng quan doanh thu</CardTitle>
        <CardDescription>Doanh thu 6 tháng gần nhất</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                `${new Intl.NumberFormat("vi-VN").format(value as number)}₫`
              }
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Doanh thu"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
