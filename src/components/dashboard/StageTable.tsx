import { FunnelData } from '@/lib/rdstation/types';
import { Card, CardContent } from '@/components/ui/Card';

interface StageTableProps {
  data: FunnelData[];
}

export function StageTable({ data }: StageTableProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Etapa do Funil</th>
                <th className="px-6 py-4 font-semibold text-center">Total</th>
                <th className="px-6 py-4 font-semibold text-center text-blue-600 dark:text-blue-400">Em Andamento</th>
                <th className="px-6 py-4 font-semibold text-center text-green-600 dark:text-green-400">Ganhos</th>
                <th className="px-6 py-4 font-semibold text-center text-red-600 dark:text-red-400">Perdas</th>
                <th className="px-6 py-4 font-semibold text-center text-orange-600 dark:text-orange-400">Pausados</th>
                <th className="px-6 py-4 font-semibold text-right">Valor Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {row.stage}
                  </td>
                  <td className="px-6 py-4 text-center font-bold">{row.count}</td>
                  <td className="px-6 py-4 text-center text-blue-600 dark:text-blue-400">{row.openCount}</td>
                  <td className="px-6 py-4 text-center text-green-600 dark:text-green-400">{row.wonCount}</td>
                  <td className="px-6 py-4 text-center text-red-600 dark:text-red-400">{row.lostCount}</td>
                  <td className="px-6 py-4 text-center text-orange-600 dark:text-orange-400">{row.pausedCount}</td>
                  <td className="px-6 py-4 text-right">
                    {row.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma etapa encontrada para este funil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
