'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

interface Props {
  chartData: any;
}

export default function AdminReportsPart3Part1({ chartData }: Props) {
  return (
    <>
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            Market Share por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label={(entry: any) => `${entry.name} (${entry.percentage}%)`}
              >
                {chartData.categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            Receita Mensal (Linha)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value: string | number) => formatCurrency(value)} />
              <Tooltip formatter={(value: string | number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="Receita" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
