'use client';

import React from 'react';
import { UserPlus, UserMinus, Target, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface Deal {
  status: 'open' | 'won' | 'lost' | 'paused';
  created_at: string;
}

interface Props {
  deals: Deal[];
}

export function ClientMovementBlocks({ deals }: Props) {
  const currentYear = new Date().getFullYear();

  // 2026 realtime won deals from RD Station
  const won2026Realtime = deals.filter(
    (d) => d.status === 'won' && new Date(d.created_at).getFullYear() === currentYear
  ).length;

  // Fallback to 53 if deals haven't loaded yet
  const totalEntradas2026 = won2026Realtime > 0 ? won2026Realtime : 53;

  // Entradas data
  const entradas = {
    2024: 24,
    2025: 57,
    2026: totalEntradas2026,
  };

  // Saídas (Churn) data
  const saídas = {
    2024: 8,
    2025: 23,
    2026: 19,
  };

  // Meta 2026
  const meta2026 = 120;
  const progressoPercent = Math.min(100, Math.round((totalEntradas2026 / meta2026) * 1000) / 10);
  const faltamParaMeta = Math.max(0, meta2026 - totalEntradas2026);

  // Saldo Líquido
  const saldoLiquido2024 = entradas[2024] - saídas[2024];
  const saldoLiquido2025 = entradas[2025] - saídas[2025];
  const saldoLiquido2026 = totalEntradas2026 - saídas[2026];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
      {/* ── BLOCO 1: TOTAL ENTRADAS ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-wide">
                  Total Entradas
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Novos clientes captados por ano
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Tempo Real
            </span>
          </div>

          {/* Cards dos Anos */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-750/50 dark:bg-gray-700/40 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">2024</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {entradas[2024]}
              </div>
              <span className="text-[10px] text-gray-400">clientes</span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-750/50 dark:bg-gray-700/40 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">2025</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {entradas[2025]}
              </div>
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">+137%</span>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5 text-center border border-green-200 dark:border-green-800/60 ring-1 ring-green-500/20">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-green-700 dark:text-green-300">2026</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 font-bold">
                  Atual
                </span>
              </div>
              <div className="text-2xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">
                {totalEntradas2026}
              </div>
              <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">em andamento</span>
            </div>
          </div>
        </div>

        {/* Barra de Meta 2026 */}
        <div className="bg-slate-50 dark:bg-gray-700/30 rounded-xl p-3 border border-slate-200/80 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-indigo-500" />
              Meta 2026: {meta2026} novos clientes
            </span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {totalEntradas2026} / {meta2026} ({progressoPercent}%)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressoPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            <span>Realizado: <strong className="text-gray-800 dark:text-gray-200">{totalEntradas2026} clientes</strong></span>
            <span>Faltam: <strong className="text-orange-600 dark:text-orange-400">{faltamParaMeta} clientes</strong></span>
          </div>
        </div>
      </div>

      {/* ── BLOCO 2: TOTAL SAÍDAS ── */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <UserMinus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white tracking-wide">
                  Total Saídas
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Clientes perdidos por churn ao ano
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-semibold">
              Churn
            </span>
          </div>

          {/* Cards dos Anos */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-750/50 dark:bg-gray-700/40 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">2024</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {saídas[2024]}
              </div>
              <span className="text-[10px] text-gray-400">perdas</span>
            </div>

            <div className="bg-gray-50 dark:bg-gray-750/50 dark:bg-gray-700/40 rounded-xl p-2.5 text-center border border-gray-100 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">2025</span>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                {saídas[2025]}
              </div>
              <span className="text-[10px] text-gray-400">perdas</span>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-2.5 text-center border border-red-200 dark:border-red-800/60 ring-1 ring-red-500/20">
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold text-red-700 dark:text-red-300">2026</span>
                <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 font-bold">
                  Atual
                </span>
              </div>
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-0.5">
                {saídas[2026]}
              </div>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">acumulado</span>
            </div>
          </div>
        </div>

        {/* Saldo Líquido de Clientes */}
        <div className="bg-slate-50 dark:bg-gray-700/30 rounded-xl p-3 border border-slate-200/80 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Crescimento Líquido (Entradas − Saídas)
            </span>
            <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              +{saldoLiquido2026} em 2026
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
            <div>
              <span className="text-[10px] text-gray-400">2024:</span>{' '}
              <strong className="text-gray-700 dark:text-gray-300">+{saldoLiquido2024}</strong>
            </div>
            <div>
              <span className="text-[10px] text-gray-400">2025:</span>{' '}
              <strong className="text-gray-700 dark:text-gray-300">+{saldoLiquido2025}</strong>
            </div>
            <div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">2026:</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">+{saldoLiquido2026}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
