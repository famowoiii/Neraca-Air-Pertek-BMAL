import { Position, type NodeProps, type Node } from '@xyflow/react';
import { MapPin } from 'lucide-react';
import type { WaterNode } from '../../../types/nodes';
import type { FinalDestination } from '../../../types/enums';
import { ID_LABELS } from '../../../types/enums';
import { useProjectStore } from '../../../store/projectStore';
import { NodeCard } from './NodeCard';

type DestinationFlowNode = Node<WaterNode & Record<string, unknown>, 'final_destination'>;

function getDestinationColor(subtype: string): string {
  if (subtype.startsWith('discharge_')) return '#1d4ed8';
  if (subtype.startsWith('reuse_')) return '#16a34a';
  if (subtype.startsWith('la_')) return '#b45309';
  if (subtype.startsWith('tp_')) return '#374151';
  if (subtype.startsWith('nr_')) return '#9ca3af';
  return '#6b7280';
}

export function DestinationNode({ data, selected }: NodeProps<DestinationFlowNode>) {
  const unit = useProjectStore((s) => s.project.meta.unit);
  const unitLabel = unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';
  const headerBg = getDestinationColor(data.subtype as FinalDestination);

  return (
    <NodeCard
      label="Tujuan Akhir"
      subLabel={ID_LABELS[data.subtype] ?? data.subtype}
      value={data.value}
      unit={unitLabel}
      headerBg={headerBg}
      icon={<MapPin size={13} />}
      selected={!!selected}
      handles={[{ type: 'target', position: Position.Left }]}
    />
  );
}
