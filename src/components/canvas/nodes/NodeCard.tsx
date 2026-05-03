import type { ReactNode } from 'react';
import { Handle, Position } from '@xyflow/react';

interface HandleConfig {
  type: 'source' | 'target';
  position: Position;
  id?: string;
}

interface NodeCardProps {
  label: string;
  subLabel: string;
  value: number;
  unit: string;
  headerBg: string;
  icon: ReactNode;
  selected: boolean;
  handles: HandleConfig[];
}

export function NodeCard({
  label,
  subLabel,
  value,
  unit,
  headerBg,
  icon,
  selected,
  handles,
}: NodeCardProps) {
  return (
    <div
      className={`rounded-lg bg-white shadow-md min-w-[160px] border-2 transition-colors ${
        selected ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      {handles.map((h, i) => (
        <Handle
          key={i}
          type={h.type}
          position={h.position}
          id={h.id}
          className="!w-3 !h-3 !border-2 !border-white"
          style={{ background: headerBg }}
        />
      ))}

      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-t-md"
        style={{ backgroundColor: headerBg }}
      >
        <span className="text-white">{icon}</span>
        <span className="text-xs font-semibold text-white truncate">{label}</span>
      </div>

      <div className="px-3 py-2 space-y-0.5">
        <p className="text-xs text-gray-700 font-medium truncate">{subLabel}</p>
        <p className="text-xs text-gray-500 tabular-nums">
          {value > 0 ? value.toFixed(3) : '0.000'} {unit}
        </p>
      </div>
    </div>
  );
}
