import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useRDStationStore } from '@/lib/store';

export function ProspectingTable() {
  const { prospectingDeals, prospectingStages, pipelines, selectedPipelineId } = useRDStationStore();

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');
  
  const [localStartDate, setLocalStartDate] = useState(`${currentYear}-${currentMonth}-01`);
  const [localEndDate, setLocalEndDate] = useState(`${currentYear}-${currentMonth}-${currentDay}`);

  // Find the selected pipeline name to adjust logic if needed, but we'll try to be generic/robust.
  const pipeline = pipelines.find(p => p.id === selectedPipelineId);
  
  // Filter deals for "advogados" origin and current date range
  const advogadosDeals = prospectingDeals.filter(d => {
    const sourceName = d.deal_source?.name?.toLowerCase() || '';
    if (!sourceName.includes('advogado')) return false;

    const createdAt = d.created_at ? d.created_at.split('T')[0] : '';
    if (!createdAt) return false;

    let isValid = true;
    if (localStartDate && localEndDate) {
      isValid = createdAt >= localStartDate && createdAt <= localEndDate;
    } else if (localStartDate) {
      isValid = createdAt >= localStartDate;
    } else if (localEndDate) {
      isValid = createdAt <= localEndDate;
    }
    return Boolean(isValid);
  });

  // Helper to categorize by week of the month based on day (1-7, 8-14, 15-21, 22+)
  const getMonthWeek = (dateString: string) => {
    const day = new Date(dateString).getDate();
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    return 3;
  };

  const metrics = {
    contatos: [0, 0, 0, 0, 0], // index 0-3 are weeks 1-4, index 4 is Total
    oportunidades: [0, 0, 0, 0, 0],
    proposta: [0, 0, 0, 0, 0],
    ganho: [0, 0, 0, 0, 0]
  };

  advogadosDeals.forEach(deal => {
    const week = getMonthWeek(deal.created_at);
    
    const stage = prospectingStages.find(s => s.id === deal.deal_stage?.id);
    const stageName = stage ? stage.name.toLowerCase() : (deal.deal_stage?.name?.toLowerCase() || '');

    // 1. Ganho
    if (deal.status === 'won' || stageName.includes('ganho')) {
      metrics.ganho[week]++;
      metrics.ganho[4]++;
    } 
    // 2. Contatos (Tentando contato)
    else if (stageName.includes('tentando contato')) {
      metrics.contatos[week]++;
      metrics.contatos[4]++;
    } 
    // 3. Proposta (Proposta feita)
    else if (stageName.includes('proposta')) {
      metrics.proposta[week]++;
      metrics.proposta[4]++;
    } 
    // 4. Oportunidades (O restante fica todos em oportunidades / chegaram em Manter relacionamento)
    else {
      metrics.oportunidades[week]++;
      metrics.oportunidades[4]++;
    }
  });

  const weekGoals: Record<'contatos' | 'oportunidades' | 'proposta' | 'ganho', number> = {
    contatos: 300,
    oportunidades: 10,
    proposta: 1,
    ganho: 1,
  };

  const monthGoals: Record<'contatos' | 'oportunidades' | 'proposta' | 'ganho', number> = {
    contatos: 1200,
    oportunidades: 40,
    proposta: 4,
    ganho: 1,
  };

  const renderVal = (val: number, type: 'contatos' | 'oportunidades' | 'proposta' | 'ganho', isTotal: boolean) => {
    const goal = isTotal ? monthGoals[type] : weekGoals[type];
    const achieved = goal > 0 && val >= goal;
    const baseClass = isTotal ? 'font-bold' : 'font-medium';
    const colorClass = achieved
      ? 'text-green-600 dark:text-green-400'
      : isTotal
        ? 'text-indigo-600 dark:text-indigo-400'
        : type === 'ganho' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300';
    return <span className={`${baseClass} ${colorClass}`}>{val}</span>;
  };

  return (
    <Card className="mb-3 border-indigo-100 dark:border-indigo-900 shadow-sm">
      <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-50 dark:border-indigo-900/50 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-indigo-900 dark:text-indigo-300">
          Desempenho de Prospecção (Origem: Advogados)
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-medium px-1 uppercase">De</span>
            <input 
              type="date"
              className="bg-transparent text-gray-900 text-xs focus:ring-0 focus:outline-none dark:text-white"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-medium px-1 uppercase">Até</span>
            <input 
              type="date"
              className="bg-transparent text-gray-900 text-xs focus:ring-0 focus:outline-none dark:text-white"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
            />
          </div>
          {(localStartDate || localEndDate) && (
            <button 
              onClick={() => { setLocalStartDate(''); setLocalEndDate(''); }} 
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2"
            >
              Limpar
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase border-b dark:border-gray-700">
              <tr>
                <th className="px-4 py-4 font-semibold">Métrica</th>
                <th className="px-4 py-4 font-semibold text-center">1ª Semana</th>
                <th className="px-4 py-4 font-semibold text-center">2ª Semana</th>
                <th className="px-4 py-4 font-semibold text-center">3ª Semana</th>
                <th className="px-4 py-4 font-semibold text-center">4ª Semana</th>
                <th className="px-4 py-4 font-bold text-center text-indigo-600 dark:text-indigo-400">Total</th>
                <th className="px-4 py-4 font-bold text-center text-orange-500 dark:text-orange-400">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {(['contatos', 'oportunidades', 'proposta', 'ganho'] as const).map((type) => (
                <tr key={type} className={type === 'ganho' ? 'bg-green-50/30 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}>
                  <td className={`px-4 py-3 font-medium capitalize ${type === 'ganho' ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </td>
                  {metrics[type].slice(0, 4).map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {renderVal(val, type, false)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    {renderVal(metrics[type][4], type, true)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-500 dark:text-orange-400">
                    {monthGoals[type]}
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
