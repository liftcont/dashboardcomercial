'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { KPISummaryBlocks } from '@/components/dashboard/KPISummaryBlocks';
import { SheetKPIBlocks } from '@/components/dashboard/SheetKPIBlocks';
import { ClientMovementBlocks } from '@/components/dashboard/ClientMovementBlocks';
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
  Tv,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SLIDES = [
  { id: 0, title: 'Metas & Visão Executiva', label: '1. Visão Geral' },
  { id: 1, title: 'Evolução Mensal (Planilha 2026)', label: '2. Planilha' },
  { id: 2, title: 'Gráfico do Funil de Vendas', label: '3. Funil de Vendas' },
  { id: 3, title: 'Detalhamento das Etapas do Funil', label: '4. Detalhamento' },
  { id: 4, title: 'Desempenho de Prospecção Ativa (Advogados)', label: '5. Prospecção' },
];

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
    sourceFilter,
    setSelectedPipelineId,
    setStartDate,
    setEndDate,
    setSourceFilter,
    fetchAllData,
    handleAuthCallback,
    getAuthUrl,
    logout,
  } = useDashboard();

  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Modo TV / Slides State
  const [isTvMode, setIsTvMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    setMounted(true);
    const savedZoom = localStorage.getItem('lift_zoom_v2');
    if (savedZoom) {
      setZoom(Number(savedZoom));
    }
    const savedTv = localStorage.getItem('lift_tv_mode');
    if (searchParams.get('tv') === 'true' || savedTv === 'true') {
      setIsTvMode(true);
    }
    const code = searchParams.get('code');
    const authError = searchParams.get('error');

    if (code) {
      handleAuthCallback(code);
      router.replace('/dashboard');
    } else if (authError) {
      console.error('Auth error:', authError);
    }
  }, [searchParams, handleAuthCallback, router]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.style.zoom = `${zoom}%`;
      localStorage.setItem('lift_zoom_v2', String(zoom));
    }
  }, [zoom, mounted]);

  // Salva preferência do Modo TV
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('lift_tv_mode', isTvMode ? 'true' : 'false');
    }
  }, [isTvMode, mounted]);

  // Timer de 60 segundos por slide
  useEffect(() => {
    if (!isTvMode) return;

    const timer = setInterval(() => {
      if (!isPaused) {
        setSecondsLeft((sec) => {
          if (sec <= 1) {
            setCurrentSlide((s) => (s + 1) % SLIDES.length);
            return 60;
          }
          return sec - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTvMode, isPaused]);

  // Listener para controle remoto da TV e teclado
  useEffect(() => {
    if (!isTvMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Botão OK (Enter) ou Espaço ou botão Play/Pause de controle remoto
      if (
        e.key === 'Enter' ||
        e.key === ' ' ||
        e.keyCode === 13 ||
        e.keyCode === 32 ||
        e.keyCode === 179 ||
        e.keyCode === 19
      ) {
        e.preventDefault();
        setIsPaused((p) => !p);
      } else if (e.key === 'ArrowRight' || e.keyCode === 39 || e.keyCode === 417) {
        // Seta Direita no controle da TV
        e.preventDefault();
        setCurrentSlide((s) => (s + 1) % SLIDES.length);
        setSecondsLeft(60);
      } else if (e.key === 'ArrowLeft' || e.keyCode === 37 || e.keyCode === 412) {
        // Seta Esquerda no controle da TV
        e.preventDefault();
        setCurrentSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
        setSecondsLeft(60);
      } else if (
        e.key === 'Escape' ||
        e.keyCode === 27 ||
        e.keyCode === 10009 ||
        e.keyCode === 461
      ) {
        // ESC ou Voltar no controle da TV
        setIsTvMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTvMode]);

  const goToNextSlide = () => {
    setCurrentSlide((s) => (s + 1) % SLIDES.length);
    setSecondsLeft(60);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
    setSecondsLeft(60);
  };

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

  const funnelDateFilter = (
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
  );

  const funnelSourceFilter = (
    <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs shadow-inner">
      <button
        type="button"
        onClick={() => setSourceFilter('all')}
        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
          sourceFilter === 'all'
            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Todos
      </button>
      <button
        type="button"
        onClick={() => setSourceFilter('anuncio')}
        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
          sourceFilter === 'anuncio'
            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Anúncio
      </button>
      <button
        type="button"
        onClick={() => setSourceFilter('organico')}
        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
          sourceFilter === 'organico'
            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        Orgânico
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDERIZAÇÃO: MODO TV (SLIDES AUTOMÁTICOS)
  // ═══════════════════════════════════════════════════════════
  if (isTvMode) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-between select-none">
        {/* Top TV Bar */}
        <header className="bg-gray-850 bg-gray-900/90 backdrop-blur border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
            {/* Logo & Slide Info */}
            <div className="flex items-center gap-3">
              <img src="/logo-lift.svg" alt="Lift Logo" className="h-7 w-7 object-contain" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white tracking-wide">LIFT TV</h1>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Slide {currentSlide + 1} de {SLIDES.length}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{SLIDES[currentSlide].title}</p>
              </div>
            </div>

            {/* Slide Navigation Pills */}
            <div className="flex items-center gap-1.5 bg-gray-800/80 p-1 rounded-xl border border-gray-700/60">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setSecondsLeft(60);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    currentSlide === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                  }`}
                >
                  {slide.label}
                </button>
              ))}
            </div>

            {/* Controls (Remote TV & Mouse) */}
            <div className="flex items-center gap-2">
              {/* Timer / Pause Badge */}
              <div
                onClick={() => setIsPaused((p) => !p)}
                className={`cursor-pointer px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isPaused
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-gray-800 text-indigo-300 border border-gray-700'
                }`}
                title="Pressione OK no controle para pausar"
              >
                {isPaused ? (
                  <>
                    <Pause className="h-3 w-3" />
                    <span>PAUSADO</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-green-400 fill-green-400" />
                    <span>{secondsLeft}s</span>
                  </>
                )}
              </div>

              {/* Prev / Next / Pause Buttons */}
              <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-lg border border-gray-700/60">
                <button
                  onClick={goToPrevSlide}
                  className="p-1 rounded hover:bg-gray-700 text-gray-300 hover:text-white"
                  title="Slide Anterior (Seta ◀)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className="p-1 rounded hover:bg-gray-700 text-gray-300 hover:text-white"
                  title="Pausar / Continuar (Botão OK)"
                >
                  {isPaused ? <Play className="h-4 w-4 text-green-400" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  onClick={goToNextSlide}
                  className="p-1 rounded hover:bg-gray-700 text-gray-300 hover:text-white"
                  title="Próximo Slide (Seta ▶)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Scale Adjuster */}
              <div className="flex items-center gap-1 bg-gray-800/80 rounded-lg px-2 py-1 text-xs font-medium text-gray-300 border border-gray-700/60">
                <button
                  onClick={() => setZoom((z) => Math.max(40, z - 5))}
                  className="px-1 py-0.5 rounded hover:bg-gray-700 font-bold"
                  title="Diminuir escala"
                >
                  −
                </button>
                <span className="w-9 text-center font-bold text-indigo-400">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(120, z + 5))}
                  className="px-1 py-0.5 rounded hover:bg-gray-700 font-bold"
                  title="Aumentar escala"
                >
                  +
                </button>
              </div>

              {/* Exit TV Mode Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTvMode(false)}
                className="bg-gray-800 hover:bg-red-950/40 text-gray-300 hover:text-red-400 border-gray-700 flex items-center gap-1"
                title="Sair do Modo TV (ESC)"
              >
                <X className="h-4 w-4" />
                <span className="text-xs">Sair</span>
              </Button>
            </div>
          </div>

          {/* Progress bar do slide (60 segundos) */}
          <div className="w-full bg-gray-800 h-0.5 overflow-hidden">
            <div
              className={`h-0.5 transition-all duration-1000 ${
                isPaused ? 'bg-amber-400' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-green-500'
              }`}
              style={{ width: `${(secondsLeft / 60) * 100}%` }}
            ></div>
          </div>
        </header>

        {/* Slide Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex-1 w-full">
          {currentSlide === 0 && (
            <div className="space-y-3">
              <KPISummaryBlocks deals={deals} />
              <ClientMovementBlocks deals={deals} />
            </div>
          )}

          {currentSlide === 1 && (
            <div>
              <SheetKPIBlocks />
            </div>
          )}

          {currentSlide === 2 && (
            <div>
              {funnelData.length > 0 && (
                <FunnelChart 
                  data={funnelData} 
                  actionRight={funnelDateFilter} 
                  actionLeft={funnelSourceFilter} 
                />
              )}
            </div>
          )}

          {currentSlide === 3 && (
            <div className="space-y-3">
              {funnelData.length > 0 && (
                <div>
                  <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-white">Detalhamento das Etapas do Funil</h2>
                      {funnelSourceFilter}
                    </div>
                    {funnelDateFilter}
                  </div>
                  <StageTable data={funnelData} />
                </div>
              )}
            </div>
          )}

          {currentSlide === 4 && (
            <div className="space-y-4">
              <ProspectingTable />
              {(campaignPerformance.length > 0 || leadSources.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {campaignPerformance.length > 0 && <CampaignChart data={campaignPerformance} />}
                  {leadSources.length > 0 && <SourcePieChart data={leadSources} />}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Helper Bar for Remote Controls */}
        <footer className="bg-gray-900/80 border-t border-gray-800/80 py-1.5 px-4 text-center text-[11px] text-gray-500 flex items-center justify-center gap-4">
          <span>🎮 <strong>Controle da TV:</strong> Pressione <strong>OK</strong> para Pausar/Continuar</span>
          <span>•</span>
          <span>Setas <strong>◀ / ▶</strong> para trocar de slide</span>
          <span>•</span>
          <span><strong>ESC</strong> ou Voltar para sair</span>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDERIZAÇÃO: MODO PADRÃO (DASHBOARD COMPLETO)
  // ═══════════════════════════════════════════════════════════
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
              {/* Botão para Iniciar Modo TV / Slides */}
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setIsTvMode(true);
                  setCurrentSlide(0);
                  setSecondsLeft(60);
                  setIsPaused(false);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Tv className="h-4 w-4" />
                <span className="font-semibold">Modo TV (Slides)</span>
              </Button>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase mr-1">Escala:</span>
                <button
                  onClick={() => setZoom((z) => Math.max(40, z - 5))}
                  className="px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-bold"
                  title="Diminuir escala"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-indigo-600 dark:text-indigo-400">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(120, z + 5))}
                  className="px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 font-bold"
                  title="Aumentar escala"
                >
                  +
                </button>
              </div>
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

        <ClientMovementBlocks deals={deals} />

        <SheetKPIBlocks />

        <div className="mb-3">
          {funnelData.length > 0 && (
            <FunnelChart 
              data={funnelData} 
              actionRight={funnelDateFilter}
              actionLeft={funnelSourceFilter}
            />
          )}
        </div>

        <ProspectingTable />

        {funnelData.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalhamento do Funil</h2>
                {funnelSourceFilter}
              </div>
              {funnelDateFilter}
            </div>
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