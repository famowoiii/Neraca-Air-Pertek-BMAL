import * as XLSX from 'xlsx';
import type { WaterBalanceProject } from '../types/nodes';
import type { FinalDestination, UsageTier2 } from '../types/enums';
import { ID_LABELS, PERTEK_CATEGORY_MAP, USAGE_TIER1_FOR_TIER2 } from '../types/enums';

const UNIT_LABEL: Record<string, string> = {
  m3_per_hari: 'm³/hari',
  L_per_hari: 'L/hari',
};

function label(key: string): string {
  return ID_LABELS[key] ?? key;
}

function pct(value: number, total: number): string {
  if (total === 0) return '0.00%';
  return ((value / total) * 100).toFixed(2) + '%';
}

function setColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((w) => ({ wch: w }));
}

export function exportToExcel(project: WaterBalanceProject): void {
  const { meta, nodes, edges } = project;
  const unitLabel = UNIT_LABEL[meta.unit] ?? meta.unit;

  const sources = nodes.filter((n) => n.type === 'source');
  const usages = nodes.filter((n) => n.type === 'usage');
  const losses = nodes.filter((n) => n.type === 'split_loss');
  const wastewater = nodes.filter((n) => n.type === 'split_classify');
  const destinations = nodes.filter((n) => n.type === 'final_destination');
  const reuseEdges = edges.filter((e) => e.isReuse);

  const totalInflow = sources.reduce((s, n) => s + n.value, 0);
  const totalOutflow = destinations.reduce((s, n) => s + n.value, 0);
  const totalLoss = losses.reduce((s, n) => s + n.value, 0);
  const totalWastewater = wastewater.reduce((s, n) => s + n.value, 0);
  const totalReuse = reuseEdges.reduce((s, e) => s + (e.flow ?? 0), 0);
  const totalDemand = usages.reduce((s, n) => s + n.value, 0);

  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Ringkasan Neraca ────────────────────────────────────────────
  const sheet1Data: (string | number)[][] = [
    ['NERACA AIR - RINGKASAN'],
    [],
    ['Nama Proyek', meta.projectName],
    ['Nama Klien', meta.clientName || '-'],
    ['Tanggal', meta.date],
    ['Satuan', unitLabel],
    ['Referensi Regulasi', meta.regulatoryVersion],
    ['Sektor Industri', meta.industrySector ?? 'custom'],
    [],
    ['NERACA', ''],
    ['Total Inflow (Sumber Air)', totalInflow],
    ['Total Pemakaian', totalDemand],
    ['Total Loss', totalLoss],
    ['Total Air Limbah (Klasifikasi)', totalWastewater],
    ['Total Outflow (Destinasi Akhir)', totalOutflow],
    ['Selisih Inflow - Outflow', +(totalInflow - totalOutflow).toFixed(4)],
    [],
    ['Catatan Proyek', meta.notes || '-'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  setColWidths(ws1, [35, 30]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan Neraca');

  // ─── Sheet 2: Detail Sumber Air ───────────────────────────────────────────
  const sheet2Header = ['No', 'Nama Sumber', 'Tipe Sumber', `Volume (${unitLabel})`, '% dari Total Inflow'];
  const sheet2Rows = sources.map((n, i) => [
    i + 1,
    n.label,
    label(n.subtype),
    +n.value.toFixed(4),
    pct(n.value, totalInflow),
  ]);
  sheet2Rows.push(['', 'TOTAL', '', +totalInflow.toFixed(4), '100.00%']);

  const ws2 = XLSX.utils.aoa_to_sheet([sheet2Header, ...sheet2Rows]);
  setColWidths(ws2, [5, 25, 28, 18, 20]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Detail Sumber Air');

  // ─── Sheet 3: Detail Pemakaian ────────────────────────────────────────────
  const sheet3Header = [
    'No', 'Nama Pemakaian', 'Tipe', 'Kategori (Tier 1)',
    `Volume (${unitLabel})`, '% dari Total Pemakaian', 'Keterangan',
  ];
  const sheet3Rows = usages.map((n, i) => {
    const tier1Key = n.metadata?.usageTier1 ?? USAGE_TIER1_FOR_TIER2[n.subtype as UsageTier2] ?? '';
    return [
      i + 1,
      n.label,
      label(n.subtype),
      label(tier1Key),
      +n.value.toFixed(4),
      pct(n.value, totalDemand),
      n.metadata?.notes ?? '',
    ];
  });
  sheet3Rows.push(['', 'TOTAL', '', '', +totalDemand.toFixed(4), '100.00%', '']);

  const ws3 = XLSX.utils.aoa_to_sheet([sheet3Header, ...sheet3Rows]);
  setColWidths(ws3, [5, 28, 28, 25, 18, 22, 30]);
  XLSX.utils.book_append_sheet(wb, ws3, 'Detail Pemakaian');

  // ─── Sheet 4: Detail Loss Mechanism ──────────────────────────────────────
  const totalLossForPct = totalLoss > 0 ? totalLoss : 1;
  const sheet4Header = ['No', 'Nama Loss', 'Mekanisme Loss', `Volume (${unitLabel})`, '% dari Total Loss'];
  const sheet4Rows = losses.map((n, i) => [
    i + 1,
    n.label,
    label(n.subtype),
    +n.value.toFixed(4),
    pct(n.value, totalLossForPct),
  ]);
  if (losses.length > 0) {
    sheet4Rows.push(['', 'TOTAL', '', +totalLoss.toFixed(4), '100.00%']);
  } else {
    sheet4Rows.push(['', 'Tidak ada loss node', '', 0, '0.00%']);
  }

  const ws4 = XLSX.utils.aoa_to_sheet([sheet4Header, ...sheet4Rows]);
  setColWidths(ws4, [5, 28, 28, 18, 20]);
  XLSX.utils.book_append_sheet(wb, ws4, 'Detail Loss Mechanism');

  // ─── Sheet 5: Klasifikasi Air Limbah ─────────────────────────────────────
  const sheet5Header = [
    'No', 'Nama Node', 'Klasifikasi Air Limbah',
    `Volume (${unitLabel})`, 'Tujuan IPAL / Pengelolaan',
  ];
  const sheet5Rows = wastewater.map((n, i) => {
    // cari target node pertama dari edges keluar node ini
    const outEdge = edges.find((e) => e.source === n.id);
    const targetNode = outEdge ? nodes.find((nd) => nd.id === outEdge.target) : undefined;
    const tujuan = targetNode ? targetNode.label : '-';
    return [
      i + 1,
      n.label,
      label(n.subtype),
      +n.value.toFixed(4),
      tujuan,
    ];
  });
  if (wastewater.length === 0) {
    sheet5Rows.push(['', 'Tidak ada node klasifikasi air limbah', '', 0, '-']);
  } else {
    sheet5Rows.push(['', 'TOTAL', '', +totalWastewater.toFixed(4), '']);
  }

  const ws5 = XLSX.utils.aoa_to_sheet([sheet5Header, ...sheet5Rows]);
  setColWidths(ws5, [5, 28, 30, 18, 35]);
  XLSX.utils.book_append_sheet(wb, ws5, 'Klasifikasi Air Limbah');

  // ─── Sheet 6: Distribusi Destinasi Akhir ──────────────────────────────────
  const sheet6Header = [
    'No', 'Destinasi Akhir', 'Kategori PERTEK (Permen LHK 5/2021)',
    `Volume (${unitLabel})`, '% dari Total Outflow',
  ];
  const sheet6Rows = destinations.map((n, i) => {
    const pertekCat = PERTEK_CATEGORY_MAP[n.subtype as FinalDestination] ?? 'Tidak Terklasifikasi';
    return [
      i + 1,
      n.label,
      pertekCat,
      +n.value.toFixed(4),
      pct(n.value, totalOutflow),
    ];
  });
  if (destinations.length > 0) {
    sheet6Rows.push(['', 'TOTAL', '', +totalOutflow.toFixed(4), '100.00%']);
  }

  const ws6 = XLSX.utils.aoa_to_sheet([sheet6Header, ...sheet6Rows]);
  setColWidths(ws6, [5, 30, 42, 18, 20]);
  XLSX.utils.book_append_sheet(wb, ws6, 'Destinasi Akhir');

  // ─── Sheet 7: Reuse & Sirkularitas ────────────────────────────────────────
  const reuseRows: (string | number)[][] = [
    ['REUSE DAN SIRKULARITAS AIR'],
    [],
    ['Parameter', 'Nilai', 'Satuan'],
  ];

  reuseEdges.forEach((e, i) => {
    const srcNode = nodes.find((n) => n.id === e.source);
    const tgtNode = nodes.find((n) => n.id === e.target);
    reuseRows.push([
      `Reuse ${i + 1}: ${srcNode?.label ?? e.source} ke ${tgtNode?.label ?? e.target}`,
      +(e.flow ?? 0).toFixed(4),
      unitLabel,
    ]);
  });

  reuseRows.push([]);
  reuseRows.push(['Total Volume Reuse', +totalReuse.toFixed(4), unitLabel]);

  const pctSirkularitas = totalDemand > 0 ? (totalReuse / totalDemand) * 100 : 0;
  const penghematan = totalReuse;
  reuseRows.push(['Persen Sirkularitas (Reuse / Total Pemakaian)', +pctSirkularitas.toFixed(2), '%']);
  reuseRows.push(['Penghematan Air Bersih', +penghematan.toFixed(4), unitLabel]);
  reuseRows.push([]);
  if (reuseEdges.length === 0) {
    reuseRows.push(['Tidak ada reuse loop dalam diagram ini.', '', '']);
  }

  const ws7 = XLSX.utils.aoa_to_sheet(reuseRows);
  setColWidths(ws7, [50, 18, 12]);
  XLSX.utils.book_append_sheet(wb, ws7, 'Reuse Sirkularitas');

  // ─── Download ─────────────────────────────────────────────────────────────
  const safeName = meta.projectName.replace(/[^a-zA-Z0-9\-_]/g, '-');
  XLSX.writeFile(wb, `neraca-air-${safeName}-${meta.date}.xlsx`);
}
