import { Position, type NodeProps, type Node } from '@xyflow/react';
import { AlertTriangle, Split } from 'lucide-react';
import type { WaterNode } from '../../../types/nodes';
import { ID_LABELS } from '../../../types/enums';
import { useProjectStore } from '../../../store/projectStore';
import { NodeCard } from './NodeCard';

type SplitFlowNode = Node<WaterNode & Record<string, unknown>, 'split_loss' | 'split_classify'>;

export function SplitNode({ data, selected }: NodeProps<SplitFlowNode>) {
  const unit = useProjectStore((s) => s.project.meta.unit);
  const unitLabel = unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';

  const isLoss = data.type === 'split_loss';
  const headerBg = isLoss ? '#f59e0b' : '#8b5cf6';
  const icon = isLoss ? <AlertTriangle size={13} /> : <Split size={13} />;
  const label = isLoss ? 'Kehilangan' : 'Klasifikasi Limbah';

  return (
    <NodeCard
      label={label}
      subLabel={ID_LABELS[data.subtype] ?? data.subtype}
      value={data.value}
      unit={unitLabel}
      headerBg={headerBg}
      icon={icon}
      selected={!!selected}
      handles={[
        { type: 'target', position: Position.Left },
        { type: 'source', position: Position.Right },
      ]}
    />
  );
}
