import { Position, type NodeProps, type Node } from '@xyflow/react';
import { Factory } from 'lucide-react';
import type { WaterNode } from '../../../types/nodes';
import { ID_LABELS } from '../../../types/enums';
import { useProjectStore } from '../../../store/projectStore';
import { NodeCard } from './NodeCard';

type UsageFlowNode = Node<WaterNode & Record<string, unknown>, 'usage'>;

export function UsageNode({ data, selected }: NodeProps<UsageFlowNode>) {
  const unit = useProjectStore((s) => s.project.meta.unit);
  const unitLabel = unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';

  return (
    <NodeCard
      label="Pemakaian"
      subLabel={ID_LABELS[data.subtype] ?? data.subtype}
      value={data.value}
      unit={unitLabel}
      headerBg="#6b7280"
      icon={<Factory size={13} />}
      selected={!!selected}
      handles={[
        { type: 'target', position: Position.Left },
        { type: 'source', position: Position.Right },
      ]}
    />
  );
}
