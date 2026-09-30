'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface OportunidadeRow { mes: string; total: number; }
interface ClienteRow { mes: string; fechamentos: number; conversao: string; }

interface SheetData {
  oportunidades: OportunidadeRow[];
  totalOportunidades: number;
  clientes: ClienteRow[];
  totalFechamentos: number;
  totalConversao: string;
}

const monthNamesMap: Record<string, string> = {
  janeiro: 'Janeiro', fevereiro: 'Fevereiro', marco: 'Março', março: 'Março',
  abril: 'Abril', maio: 'Maio', junho: 'Junho', julho: 'Julho',
  agosto: 'Agosto', setembro: 'Setembro', outubro: 'Outubro',
  novembro: 'Novembro', dezembro: 'Dezembro',
};

function normalize(mes: string) {
  const key = mes.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return monthNamesMap[key] || mes;
}

// idx 0 = Janeiro = month 0 in JS Date; September = 8
const currentMonthIndex = new Date().getMonth();

export function SheetKPIBlocks() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/sheets')
      .then((r) => setData(r.data))
      .catch(() => setError('Falha ao carregar dados da planilha'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
        {error || 'Sem dados da planilha'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">

      {/* ── BLOCO 1: Oportunidades geradas em 2026 ── */}
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-slate-700 dark:bg-slate-900 px-3 py-1 text-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wide">
            Oportunidades geradas em 2026
          </h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/60">
              <th className="px-3 py-1 text-left font-semibold text-slate-600 dark:text-slate-300">Mês</th>
              <th className="px-3 py-1 text-center font-semibold text-indigo-600 dark:text-indigo-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {data.oportunidades.map((row, idx) => {
              const isCurrent = idx === currentMonthIndex;
              return (
                <tr key={row.mes} className={isCurrent
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}>
                  <td className={`px-3 py-0.5 ${isCurrent ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {normalize(row.mes)}
                    {isCurrent && <span className="ml-1.5 text-[9px] uppercase bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded px-1 py-0.5">atual</span>}
                  </td>
                  <td className={`px-3 py-0.5 text-center font-medium ${row.total === 0 ? 'text-gray-400 dark:text-gray-600' : isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                    {row.total || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-700 dark:bg-slate-900">
              <td className="px-3 py-1 font-bold text-white">Total</td>
              <td className="px-3 py-1 text-center font-bold text-indigo-300">{data.totalOportunidades}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── BLOCO 2: Clientes Alcançados ── */}
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-slate-700 dark:bg-slate-900 px-3 py-1 text-center">
          <h2 className="text-xs font-bold text-white uppercase tracking-wide">
            Clientes Alcançados
          </h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/60">
              <th className="px-3 py-1 text-left font-semibold text-slate-600 dark:text-slate-300">Mês</th>
              <th className="px-3 py-1 text-center font-semibold text-indigo-600 dark:text-indigo-400">Fechamentos</th>
              <th className="px-3 py-1 text-center font-semibold text-indigo-600 dark:text-indigo-400">Conversão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {data.clientes.map((row, idx) => {
              const isCurrent = idx === currentMonthIndex;
              const convNum = parseFloat(row.conversao.replace(',', '.').replace('%', ''));
              const highConv = !isNaN(convNum) && convNum >= 30;
              // ensure % symbol present
              const convDisplay = row.conversao === '—' ? '—'
                : row.conversao.includes('%') ? row.conversao
                : `${row.conversao}%`;
              return (
                <tr key={row.mes} className={isCurrent
                  ? 'bg-indigo-50 dark:bg-indigo-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'}>
                  <td className={`px-3 py-0.5 ${isCurrent ? 'font-semibold text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {normalize(row.mes)}
                    {isCurrent && <span className="ml-1.5 text-[9px] uppercase bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 rounded px-1 py-0.5">atual</span>}
                  </td>
                  <td className={`px-3 py-0.5 text-center font-medium ${row.fechamentos === 0 ? 'text-gray-400 dark:text-gray-600' : isCurrent ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-800 dark:text-gray-200'}`}>
                    {row.fechamentos || '—'}
                  </td>
                  <td className={`px-3 py-0.5 text-center font-medium ${
                    row.conversao === '—' ? 'text-gray-400 dark:text-gray-600' :
                    highConv ? 'text-green-600 dark:text-green-400 font-bold' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {convDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-700 dark:bg-slate-900">
              <td className="px-3 py-1 font-bold text-white">Total</td>
              <td className="px-3 py-1 text-center font-bold text-indigo-300">{data.totalFechamentos}</td>
              <td className="px-3 py-1 text-center font-bold text-indigo-300">
                {data.totalConversao === '—' ? '—' : data.totalConversao.includes('%') ? data.totalConversao : `${data.totalConversao}%`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
