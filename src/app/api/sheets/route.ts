import { NextResponse } from 'next/server';

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8vlPk5V_akZDFhSLzpzXrBion8XePjtyAnDBsMEJwFQTAkXMObNfzFG31kaZZahnY5SejniG1TsdL/pub?output=csv&gid=0';

export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, { next: { revalidate: 1800 } }); // cache 30min
    if (!res.ok) throw new Error('Falha ao buscar planilha');

    const text = await res.text();
    const rows = text.split('\n').map((r) => r.split(','));

    // Oportunidades geradas em 2026 — colunas D(3) e E(4), linhas 2-13 (index 1-12)
    const oportunidades: { mes: string; total: number }[] = [];
    for (let i = 1; i <= 12; i++) {
      const row = rows[i];
      if (!row) continue;
      const mes = row[3]?.trim().replace(/^"/, '').replace(/"$/, '');
      const total = parseInt(row[4]?.trim().replace(/^"/, '').replace(/"$/, '') || '0', 10);
      if (mes) oportunidades.push({ mes, total: isNaN(total) ? 0 : total });
    }
    const totalOportunidades = oportunidades.reduce((s, x) => s + x.total, 0);

    // Clientes Alcançados — colunas G(6), H(7), I(8), linhas 2-13 (index 1-12)
    const clientes: { mes: string; fechamentos: number; conversao: string }[] = [];
    for (let i = 1; i <= 12; i++) {
      const row = rows[i];
      if (!row) continue;
      const mes = row[6]?.trim().replace(/^"/, '').replace(/"$/, '');
      const fech = parseInt(row[7]?.trim().replace(/^"/, '').replace(/"$/, '') || '0', 10);
      const conv = row[8]?.trim().replace(/^"/, '').replace(/"$/, '') || '';
      if (mes) clientes.push({ mes, fechamentos: isNaN(fech) ? 0 : fech, conversao: conv.includes('DIV') ? '—' : conv });
    }
    // Total row (index 13)
    const totalRow = rows[13];
    const totalFechamentos = parseInt(totalRow?.[7]?.trim() || '0', 10);
    const totalConversao = totalRow?.[8]?.trim().replace(/^"/, '').replace(/"$/, '') || '';

    return NextResponse.json({
      oportunidades,
      totalOportunidades,
      clientes,
      totalFechamentos: isNaN(totalFechamentos) ? 0 : totalFechamentos,
      totalConversao: totalConversao.includes('DIV') ? '—' : totalConversao,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
