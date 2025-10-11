// src/features/inventory/components/overview/InventoryValueByCategoryChart.tsx
"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Dữ liệu giả lập
const data = [
  { name: "Chăm sóc da mặt", value: 75000000 },
  { name: "Chăm sóc cơ thể", value: 45000000 },
  { name: "Trang điểm", value: 30000000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function InventoryValueByCategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giá trị kho theo danh mục</CardTitle>
        <CardDescription>
          Phân bổ giá trị tồn kho theo từng loại sản phẩm.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                `${new Intl.NumberFormat("vi-VN").format(value)} ₫`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
