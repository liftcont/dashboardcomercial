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
  janeiro: 'Janeiro', fevereiro: 'Fevereiro', março: 'Março', marco: 'Março',
  abril: 'Abril', maio: 'Maio', junho: 'Junho', julho: 'Julho',
  agosto: 'Agosto', setembro: 'Setembro', outubro: 'Outubro',
  novembro: 'Novembro', dezembro: 'Dezembro',
};

function normalize(mes: string) {
  return monthNamesMap[mes.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] || mes;
}

const currentMonthIndex = new Date().getMonth(); // 0-indexed

export function SheetKPIBlocks() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/sheets');
      setData(res.data);
    } catch {
      setError('Falha ao carregar dados da planilha');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 animate-pulse h-64" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">

      {/* ── BLOCO 1: Oportunidades geradas em 2026 ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-orange-500 dark:bg-orange-600 px-4 py-2 text-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            Oportunidades geradas em 2026
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-orange-100 dark:bg-orange-900/30">
              <th className="px-4 py-2 text-left font-semibold text-orange-800 dark:text-orange-300">Mês</th>
              <th className="px-4 py-2 text-center font-semibold text-orange-800 dark:text-orange-300">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.oportunidades.map((row, idx) => {
              const isCurrent = idx === currentMonthIndex;
              return (
                <tr
                  key={row.mes}
                  className={isCurrent
                    ? 'bg-orange-50 dark:bg-orange-900/20 font-semibold'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                >
                  <td className={`px-4 py-1.5 capitalize ${isCurrent ? 'text-orange-700 dark:text-orange-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {normalize(row.mes)}
                    {isCurrent && <span className="ml-2 text-[10px] uppercase bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded px-1">atual</span>}
                  </td>
                  <td className={`px-4 py-1.5 text-center font-medium ${row.total === 0 ? 'text-gray-400' : isCurrent ? 'text-orange-600 dark:text-orange-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {row.total || '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-orange-500 dark:bg-orange-600">
              <td className="px-4 py-2 font-bold text-white">Total</td>
              <td className="px-4 py-2 text-center font-bold text-white">{data.totalOportunidades}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── BLOCO 2: Clientes Alcançados ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-700 px-4 py-2 text-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            Clientes Alcançados
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-900/30">
              <th className="px-4 py-2 text-left font-semibold text-blue-800 dark:text-blue-300">Mês</th>
              <th className="px-4 py-2 text-center font-semibold text-blue-800 dark:text-blue-300">Fechamentos</th>
              <th className="px-4 py-2 text-center font-semibold text-blue-800 dark:text-blue-300">Conversão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.clientes.map((row, idx) => {
              const isCurrent = idx === currentMonthIndex;
              const convNum = parseFloat(row.conversao.replace(',', '.'));
              const highConv = !isNaN(convNum) && convNum >= 30;
              return (
                <tr
                  key={row.mes}
                  className={isCurrent
                    ? 'bg-blue-50 dark:bg-blue-900/20 font-semibold'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}
                >
                  <td className={`px-4 py-1.5 capitalize ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {normalize(row.mes)}
                    {isCurrent && <span className="ml-2 text-[10px] uppercase bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded px-1">atual</span>}
                  </td>
                  <td className={`px-4 py-1.5 text-center font-medium ${row.fechamentos === 0 ? 'text-gray-400' : isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {row.fechamentos || '—'}
                  </td>
                  <td className={`px-4 py-1.5 text-center font-medium ${
                    row.conversao === '—' ? 'text-gray-400' :
                    highConv ? 'text-green-600 dark:text-green-400' :
                    'text-gray-700 dark:text-gray-300'
                  }`}>
                    {row.conversao === '—' ? '—' : `${row.conversao}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-blue-600 dark:bg-blue-700">
              <td className="px-4 py-2 font-bold text-white">Total</td>
              <td className="px-4 py-2 text-center font-bold text-white">{data.totalFechamentos}</td>
              <td className="px-4 py-2 text-center font-bold text-white">{data.totalConversao}</td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
}
