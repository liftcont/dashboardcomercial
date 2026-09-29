import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useRDStationStore } from '@/lib/store';

export function ProspectingTable() {
  const { prospectingDeals, prospectingStages, startDate, endDate, setStartDate, setEndDate, pipelines, selectedPipelineId } = useRDStationStore();

  // Find the selected pipeline name to adjust logic if needed, but we'll try to be generic/robust.
  const pipeline = pipelines.find(p => p.id === selectedPipelineId);
  
  // Filter deals for "advogados" origin and current date range
  const advogadosDeals = prospectingDeals.filter(d => {
    const sourceName = d.deal_source?.name?.toLowerCase() || '';
    if (!sourceName.includes('advogado')) return false;

    let isValid = true;
    const createdAt = d.created_at.split('T')[0];
    const updatedAt = d.updated_at ? d.updated_at.split('T')[0] : null;

    if (startDate && endDate) {
      isValid = (createdAt >= startDate && createdAt <= endDate) || (updatedAt !== null && updatedAt >= startDate && updatedAt <= endDate);
    } else if (startDate) {
      isValid = (createdAt >= startDate) || (updatedAt !== null && updatedAt >= startDate);
    } else if (endDate) {
      isValid = (createdAt <= endDate) || (updatedAt !== null && updatedAt <= endDate);
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
    lista: [0, 0, 0, 0, 0], // index 0-3 are weeks 1-4, index 4 is Total
    oportunidades: [0, 0, 0, 0, 0],
    proposta: [0, 0, 0, 0, 0],
    ganho: [0, 0, 0, 0, 0]
  };

  advogadosDeals.forEach(deal => {
    const week = getMonthWeek(deal.created_at);
    
    // 1. Lista (Total added)
    metrics.lista[week]++;
    metrics.lista[4]++;

    const stage = prospectingStages.find(s => s.id === deal.deal_stage?.id);
    const order = stage ? stage.order : 1;
    const stageName = stage ? stage.name.toLowerCase() : (deal.deal_stage?.name?.toLowerCase() || '');

    // 2. Oportunidades (Tentando contato ou avançado)
    if (order >= 2) {
      metrics.oportunidades[week]++;
      metrics.oportunidades[4]++;
    }

    // 3. Proposta (Chegou em proposta enviada/feita)
    const hasProposta = stageName.includes('proposta') || (pipeline?.name.includes('Prospecção') ? order >= 8 : order >= 4);
    if (hasProposta) {
      metrics.proposta[week]++;
      metrics.proposta[4]++;
    }

    // 4. Ganho
    if (deal.status === 'won' || stageName.includes('ganho')) {
      metrics.ganho[week]++;
      metrics.ganho[4]++;
    }
  });

  return (
    <Card className="mb-8 border-indigo-100 dark:border-indigo-900 shadow-sm">
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-[10px] text-gray-500 font-medium px-1 uppercase">Até</span>
            <input 
              type="date"
              className="bg-transparent text-gray-900 text-xs focus:ring-0 focus:outline-none dark:text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }} 
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2"
            >
              Limpar
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Oportunidades</td>
                {metrics.oportunidades.map((val, i) => (
                  <td key={i} className={`px-4 py-3 text-center ${i === 4 ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {val}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">Proposta</td>
                {metrics.proposta.map((val, i) => (
                  <td key={i} className={`px-4 py-3 text-center ${i === 4 ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300'}`}>
                    {val}
                  </td>
                ))}
              </tr>
              <tr className="bg-green-50/30 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20">
                <td className="px-4 py-3 font-medium text-green-700 dark:text-green-400">Ganho</td>
                {metrics.ganho.map((val, i) => (
                  <td key={i} className={`px-4 py-3 text-center ${i === 4 ? 'font-bold text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'}`}>
                    {val}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
