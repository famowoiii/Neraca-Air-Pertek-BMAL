import { Position, type NodeProps, type Node } from '@xyflow/react';
import { Zap } from 'lucide-react';
import type { WaterNode } from '../../../types/nodes';
import { ID_LABELS } from '../../../types/enums';
import { useProjectStore } from '../../../store/projectStore';
import { NodeCard } from './NodeCard';

type TreatmentFlowNode = Node<WaterNode & Record<string, unknown>, 'treatment_unit'>;

export function TreatmentNode({ data, selected }: NodeProps<TreatmentFlowNode>) {
  const unit = useProjectStore((s) => s.project.meta.unit);
  const unitLabel = unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';

  return (
    <NodeCard
      label="Unit Pengolahan"
      subLabel={ID_LABELS[data.subtype] ?? data.subtype}
      value={data.value}
      unit={unitLabel}
      headerBg="#a855f7"
      icon={<Zap size={13} />}
      selected={!!selected}
      handles={[
        { type: 'target', position: Position.Left },
        { type: 'source', position: Position.Right },
      ]}
    />
  );
}
