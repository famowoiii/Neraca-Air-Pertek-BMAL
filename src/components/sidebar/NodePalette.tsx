import type { ReactNode, DragEvent } from 'react';
import { Droplets, Factory, Split, Zap, MapPin, AlertTriangle } from 'lucide-react';

interface PaletteItem {
  nodeType: string;
  label: string;
  icon: ReactNode;
  color: string;
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    nodeType: 'source',
    label: 'Sumber Air',
    icon: <Droplets size={16} />,
    color: 'bg-blue-100 border-blue-400 text-blue-800',
    description: 'Sumber air masuk (PDAM, sumur, dll)',
  },
  {
    nodeType: 'usage',
    label: 'Pemakaian',
    icon: <Factory size={16} />,
    color: 'bg-gray-100 border-gray-400 text-gray-800',
    description: 'Titik penggunaan air',
  },
  {
    nodeType: 'split_loss',
    label: 'Kehilangan',
    icon: <AlertTriangle size={16} />,
    color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    description: 'Evaporasi, kebocoran, dll',
  },
  {
    nodeType: 'split_classify',
    label: 'Klasifikasi Limbah',
    icon: <Split size={16} />,
    color: 'bg-purple-100 border-purple-400 text-purple-800',
    description: 'Pisahkan jenis air limbah',
  },
  {
    nodeType: 'treatment_unit',
    label: 'Unit Pengolahan',
    icon: <Zap size={16} />,
    color: 'bg-violet-100 border-violet-400 text-violet-800',
    description: 'IPAL, septic tank, dll',
  },
  {
    nodeType: 'final_destination',
    label: 'Tujuan Akhir',
    icon: <MapPin size={16} />,
    color: 'bg-green-100 border-green-400 text-green-800',
    description: 'Pembuangan, reuse, land application',
  },
];

export function NodePalette() {
  const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        Tambah Node
      </p>
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.nodeType}
          draggable
          onDragStart={(e) => onDragStart(e, item.nodeType)}
          className={`flex items-center gap-2 p-2 rounded-md border cursor-grab active:cursor-grabbing select-none hover:opacity-80 transition-opacity ${item.color}`}
          title={item.description}
        >
          {item.icon}
          <span className="text-xs font-medium">{item.label}</span>
        </div>
      ))}
      <p className="text-xs text-muted-foreground mt-2">
        Seret node ke kanvas untuk menambahkan
      </p>
    </div>
  );
}
