import { Position, type NodeProps, type Node } from '@xyflow/react';
import { Droplets } from 'lucide-react';
import type { WaterNode } from '../../../types/nodes';
import { ID_LABELS } from '../../../types/enums';
import { useProjectStore } from '../../../store/projectStore';
import { NodeCard } from './NodeCard';

type SourceFlowNode = Node<WaterNode & Record<string, unknown>, 'source'>;

export function SourceNode({ data, selected }: NodeProps<SourceFlowNode>) {
  const unit = useProjectStore((s) => s.project.meta.unit);
  const unitLabel = unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';

  return (
    <NodeCard
      label="Sumber Air"
      subLabel={ID_LABELS[data.subtype] ?? data.subtype}
      value={data.value}
      unit={unitLabel}
      headerBg="#3b82f6"
      icon={<Droplets size={13} />}
      selected={!!selected}
      handles={[{ type: 'source', position: Position.Right }]}
    />
  );
}
