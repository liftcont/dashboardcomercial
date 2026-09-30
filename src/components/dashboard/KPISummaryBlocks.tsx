'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

interface Deal {
  status: 'open' | 'won' | 'lost' | 'paused';
  created_at: string;
}

interface Props {
  deals: Deal[];
}

function StatItem({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className={`flex items-center gap-2 ${color}`}>
        {icon}
        <span className="text-4xl font-bold">{value.toLocaleString('pt-BR')}</span>
      </div>
      <span className="text-sm text-gray-400 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function KPISummaryBlocks({ deals }: Props) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  // Month filter state: defaults to current year-month
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // --- ANNUAL (current year) ---
  const yearDeals = deals.filter((d) => {
    const y = new Date(d.created_at).getFullYear();
    return y === currentYear;
  });
  const yearTotal = yearDeals.length;
  const yearWon = yearDeals.filter((d) => d.status === 'won').length;
  const yearLost = yearDeals.filter((d) => d.status === 'lost').length;

  // --- MONTHLY (selected month) ---
  const monthDeals = deals.filter((d) => {
    const dt = new Date(d.created_at);
    return dt.getFullYear() === selectedYear && dt.getMonth() === selectedMonth;
  });
  const monthTotal = monthDeals.length;
  const monthWon = monthDeals.filter((d) => d.status === 'won').length;
  const monthLost = monthDeals.filter((d) => d.status === 'lost').length;

  // Build month options (Jan–current month of current year)
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  // Build year options from earliest deal up to current year
  const years = Array.from(
    new Set(deals.map((d) => new Date(d.created_at).getFullYear()))
  ).sort((a, b) => b - a);
  if (!years.includes(currentYear)) years.unshift(currentYear);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      {/* ── ANNUAL BLOCK ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            Apurado Anual — {currentYear}
          </h2>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
            {currentYear}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100 dark:divide-gray-700">
          <StatItem
            label="Total de Negócios"
            value={yearTotal}
            color="text-blue-600 dark:text-blue-400"
            icon={<Briefcase className="h-6 w-6" />}
          />
          <div className="pl-4">
            <StatItem
              label="Negócios Ganhos"
              value={yearWon}
              color="text-green-600 dark:text-green-400"
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>
          <div className="pl-4">
            <StatItem
              label="Negócios Perdidos"
              value={yearLost}
              color="text-red-500 dark:text-red-400"
              icon={<TrendingDown className="h-6 w-6" />}
            />
          </div>
        </div>
      </div>

      {/* ── MONTHLY BLOCK ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
            Apurado Mensal
          </h2>
          {/* Month + Year selector */}
          <div className="flex items-center gap-2">
            <select
              className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-100 dark:divide-gray-700">
          <StatItem
            label="Total de Negócios"
            value={monthTotal}
            color="text-blue-600 dark:text-blue-400"
            icon={<Briefcase className="h-6 w-6" />}
          />
          <div className="pl-4">
            <StatItem
              label="Negócios Ganhos"
              value={monthWon}
              color="text-green-600 dark:text-green-400"
              icon={<TrendingUp className="h-6 w-6" />}
            />
          </div>
          <div className="pl-4">
            <StatItem
              label="Negócios Perdidos"
              value={monthLost}
              color="text-red-500 dark:text-red-400"
              icon={<TrendingDown className="h-6 w-6" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
