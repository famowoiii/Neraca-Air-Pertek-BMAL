import type { WaterBalanceProject } from '../types/nodes';

export interface TemplateMeta {
  id: string;
  label: string;
  description: string;
  file: string;
  nodeCount: number;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'hotel',
    label: 'Hotel / Resort',
    description: 'PDAM + sumur dangkal + air hujan. Usage: kamar, restoran, laundry, kolam, cooling tower, taman. IPAL domestik + discharge sungai + reuse taman.',
    file: '/templates/hotel.json',
    nodeCount: 21,
  },
  {
    id: 'clinic',
    label: 'Klinik / Rumah Sakit',
    description: 'PDAM + sumur dalam. Usage: lab, sterilisasi, hemodialisa, radiologi, domestik. Limbah B3 ke pengolah berizin; domestik ke IPAL + discharge.',
    file: '/templates/clinic.json',
    nodeCount: 18,
  },
  {
    id: 'food_factory',
    label: 'Pabrik Makanan',
    description: 'Sumur dalam. Usage: boiler, proses produksi, cooling tower, domestik. Oil grease trap + IPAL + reuse penyiraman + discharge sungai.',
    file: '/templates/food-factory.json',
    nodeCount: 18,
  },
  {
    id: 'pks',
    label: 'PKS (Kelapa Sawit)',
    description: 'Air permukaan + sumur dalam. Usage: sterilizer TBS, boiler, domestik. POME ke land application kebun; blowdown ke discharge.',
    file: '/templates/pks.json',
    nodeCount: 16,
  },
  {
    id: 'textile',
    label: 'Pabrik Tekstil',
    description: 'Sumur dalam + PDAM. Usage: pencelupan, boiler, cooling tower, proses, domestik. IPAL + RO untuk reuse proses + discharge sungai.',
    file: '/templates/textile.json',
    nodeCount: 21,
  },
  {
    id: 'mining',
    label: 'Pertambangan',
    description: 'Pit dewatering + sumur dangkal + air hujan. Usage: pencucian batubara, dust suppression, domestik camp. Settling pond + discharge sungai.',
    file: '/templates/mining.json',
    nodeCount: 17,
  },
];

export async function loadTemplate(templateId: string): Promise<WaterBalanceProject> {
  const meta = TEMPLATES.find((t) => t.id === templateId);
  if (!meta) throw new Error(`Template tidak ditemukan: ${templateId}`);

  const res = await fetch(meta.file);
  if (!res.ok) throw new Error(`Gagal memuat template (${res.status}): ${meta.label}`);

  const data = (await res.json()) as Partial<WaterBalanceProject>;

  if (!data.meta || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    throw new Error('Format template tidak valid');
  }

  return data as WaterBalanceProject;
}
