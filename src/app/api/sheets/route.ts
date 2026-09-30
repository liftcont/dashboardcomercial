import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Real-time export URL (no Google publish delay) + fallback to pub URL
const SHEET_EXPORT_URL =
  'https://docs.google.com/spreadsheets/d/1famSTBWeCCZ5YZ-XbOgISTTBLuWOWDp4tqtktEKA6vc/export?format=csv&gid=0';
const SHEET_PUB_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vR8vlPk5V_akZDFhSLzpzXrBion8XePjtyAnDBsMEJwFQTAkXMObNfzFG31kaZZahnY5SejniG1TsdL/pub?output=csv&gid=0';

// Proper CSV row parser that handles quoted fields containing commas
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

export async function GET() {
  try {
    let res = await fetch(`${SHEET_EXPORT_URL}&t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      res = await fetch(`${SHEET_PUB_URL}&t=${Date.now()}`, {
        cache: 'no-store',
      });
    }
    if (!res.ok) throw new Error('Falha ao buscar planilha');

    const text = await res.text();
    const rows = text.split('\n').map(parseCSVRow);

    // Data starts at row index 2 (row 0 = section headers, row 1 = column headers)
    // Oportunidades: col 3 (Mês) and col 4 (Total)
    // Clientes: col 6 (Mês), col 7 (Fechamentos), col 8 (Conversão)
    const oportunidades: { mes: string; total: number }[] = [];
    const clientes: { mes: string; fechamentos: number; conversao: string }[] = [];

    for (let i = 2; i <= 13; i++) {
      const row = rows[i];
      if (!row) continue;

      // Oportunidades
      const mes = row[3]?.trim();
      const totalRaw = row[4]?.trim();
      if (mes) {
        const total = parseInt(totalRaw || '0', 10);
        oportunidades.push({ mes, total: isNaN(total) ? 0 : total });
      }

      // Clientes
      const cMes = row[6]?.trim();
      const fech = parseInt(row[7]?.trim() || '0', 10);
      const convRaw = row[8]?.trim() || '';
      const conv = convRaw.includes('DIV') || convRaw === '' ? '—' : convRaw;
      if (cMes) clientes.push({ mes: cMes, fechamentos: isNaN(fech) ? 0 : fech, conversao: conv });
    }

    // Total row is at index 14
    const totalRow = rows[14];
    const totalOportunidades = oportunidades.reduce((s, x) => s + x.total, 0);
    const totalFechamentos = parseInt(totalRow?.[7]?.trim() || '0', 10);
    const totalConversaoRaw = totalRow?.[8]?.trim() || '';
    const totalConversao = totalConversaoRaw.includes('DIV') || totalConversaoRaw === '' ? '—' : totalConversaoRaw;

    return NextResponse.json(
      {
        oportunidades,
        totalOportunidades,
        clientes,
        totalFechamentos: isNaN(totalFechamentos) ? 0 : totalFechamentos,
        totalConversao,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
