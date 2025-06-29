'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface Props {
  chartData: any;
  isGenerating: boolean;
  generateReport: (reportType: string) => void;
  platformMetrics: any;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export default function AdminReportsPart3({ chartData, isGenerating, generateReport, platformMetrics }: Props) {
  return (
    <>
      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <PieChart width={24} height={24} />
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
                  label={(entry) => `${entry.name} (${entry.percentage}%)`}
                >
                  {chartData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <LineChart width={24} height={24} />
              Receita Mensal (Linha)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData.revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Receita" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Download className="w-5 h-5" />
              Exportar Relatório Completo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => generateReport('complete')}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white"
              disabled={isGenerating}
            >
              Exportar CSV
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
