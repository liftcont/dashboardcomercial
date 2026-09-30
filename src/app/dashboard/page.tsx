'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPISummaryBlocks } from '@/components/dashboard/KPISummaryBlocks';
import { SheetKPIBlocks } from '@/components/dashboard/SheetKPIBlocks';
import {
  FunnelChart,
  TimeSeriesChart,
  CampaignChart,
  SourcePieChart,
  MetricBarChart,
} from '@/components/dashboard/Charts';
import { StageTable } from '@/components/dashboard/StageTable';
import { ProspectingTable } from '@/components/dashboard/ProspectingTable';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Users,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    isAuthenticated,
    loading,
    error,
    metrics,
    deals,
    funnelData,
    campaignPerformance,
    timeSeriesData,
    leadSources,
    pipelines,
    selectedPipelineId,
    startDate,
    endDate,
    setSelectedPipelineId,
    setStartDate,
    setEndDate,
    fetchAllData,
    handleAuthCallback,
    getAuthUrl,
    logout,
  } = useDashboard();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (code) {
      handleAuthCallback(code);
      router.replace('/dashboard');
    } else if (authError) {
      console.error('Auth error:', authError);
    }
  }, [searchParams, handleAuthCallback, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const authUrl = getAuthUrl();
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full w-16 h-16 flex items-center justify-center">
              <img src="/logo-lift.svg" alt="Lift Logo" className="h-8 w-8 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">LIFT Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Integração com RD Station para visualização de métricas de marketing e vendas
            </p>
            {authUrl && (
              <Button
                size="lg"
                className="w-full"
                onClick={() => (window.location.href = authUrl)}
              >
                Conectar com RD Station
              </Button>
            )}
            {!authUrl && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                Configure as variáveis de ambiente: RDSTATION_CLIENT_ID, RDSTATION_CLIENT_SECRET, RDSTATION_REDIRECT_URI
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card variant="outline" className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
                <Button variant="outline" size="sm" onClick={fetchAllData} className="ml-auto">
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-lift.svg" alt="Lift Logo" className="h-8 w-8 object-contain" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">LIFT Dashboard</h1>
              
              {pipelines && pipelines.length > 0 && (
                <div className="ml-4 pl-4 flex gap-4 border-l border-gray-200 dark:border-gray-700">
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
                    value={selectedPipelineId || ''}
                    onChange={(e) => setSelectedPipelineId(e.target.value)}
                    disabled={loading.deals}
                  >
                    {pipelines.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Atualizado: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
              <Button variant="outline" size="sm" onClick={fetchAllData} disabled={loading.contacts || loading.deals || loading.campaigns}>
                <RefreshCw className={`h-4 w-4 ${loading.contacts || loading.deals || loading.campaigns ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <KPISummaryBlocks deals={deals} />

        <SheetKPIBlocks />

        <div className="mb-3">
          {funnelData.length > 0 && (
            <FunnelChart 
              data={funnelData} 
              actionRight={
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 font-medium px-1 uppercase">De</span>
                    <input 
                      type="date"
                      className="bg-transparent text-gray-900 text-xs focus:ring-0 focus:outline-none dark:text-white"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 p-1 rounded-md border border-gray-200 dark:border-gray-700">
                    <span className="text-[10px] text-gray-500 font-medium px-1 uppercase">Até</span>
                    <input 
                      type="date"
                      className="bg-transparent text-gray-900 text-xs focus:ring-0 focus:outline-none dark:text-white"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setStartDate(''); setEndDate(''); }} 
                      className="text-gray-500 h-8 px-2"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </div>

        <ProspectingTable />

        {funnelData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Detalhamento do Funil</h2>
            <StageTable data={funnelData} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {campaignPerformance.length > 0 && <CampaignChart data={campaignPerformance} />}
          {leadSources.length > 0 && <SourcePieChart data={leadSources} />}
        </div>


        {(loading.contacts || loading.deals || loading.campaigns) && (
          <div className="fixed bottom-4 right-4">
            <Card variant="elevated">
              <CardContent className="px-4 py-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Atualizando dados...</span>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}