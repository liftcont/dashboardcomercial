'use client';
import { FunnelData } from '@/lib/rdstation/types';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

interface FunnelChartProps {
  data: FunnelData[];
  actionRight?: React.ReactNode;
}

export function FunnelChart({ data, actionRight }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Funil de Vendas</CardTitle>
        {actionRight && <div className="font-normal">{actionRight}</div>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Etapa</th>
                <th className="px-4 py-3 font-semibold text-center">Total</th>
                <th className="px-4 py-3 font-semibold text-center text-blue-600 dark:text-blue-400">Em Andamento</th>
                <th className="px-4 py-3 font-semibold text-center text-green-600 dark:text-green-400">Ganhos</th>
                <th className="px-4 py-3 font-semibold text-center text-red-600 dark:text-red-400 rounded-tr-lg">Perdas</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.stage} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {item.stage}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">
                    {item.count}
                  </td>
                  <td className="px-4 py-3 text-center text-blue-600 dark:text-blue-400">
                    {item.openCount}
                  </td>
                  <td className="px-4 py-3 text-center text-green-600 dark:text-green-400">
                    {item.wonCount}
                  </td>
                  <td className="px-4 py-3 text-center text-red-600 dark:text-red-400">
                    {item.lostCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

interface TimeSeriesChartProps {
  data: Array<{ date: string; contacts: number; deals: number; value: number }>;
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937', // dark mode default
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="contacts" name="Novos Contatos" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="left" dataKey="deals" name="Novos Negócios" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="value" name="Valor (R$)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface CampaignChartProps {
  data: Array<{
    campaignId: string;
    campaignName: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  }>;
}

export function CampaignChart({ data }: CampaignChartProps) {
  const topCampaigns = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance de Campanhas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={topCampaigns} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="campaignName"
              width={180}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="sent" name="Enviados" fill="#9CA3AF" radius={[0, 4, 4, 0]} />
            <Bar dataKey="delivered" name="Entregues" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="opened" name="Abertos" fill="#10B981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="clicked" name="Clicados" fill="#F59E0B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface SourcePieChartProps {
  data: Array<{ source: string; count: number; percentage: number }>;
}

export function SourcePieChart({ data }: SourcePieChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Origem dos Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="count"
              nameKey="source"
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MetricBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
}

export function MetricBarChart({ data, title }: MetricBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              type="number"
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="value"
              name="Valor"
              radius={[0, 4, 4, 0]}
              fill={data[0]?.color || '#4F46E5'}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}