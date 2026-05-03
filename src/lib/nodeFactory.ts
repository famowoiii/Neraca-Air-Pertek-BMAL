import type { NodeType, WaterNode, NodeSubtype } from '../types/nodes';
import { ID_LABELS } from '../types/enums';

const DEFAULTS: Record<NodeType, NodeSubtype> = {
  source: 'pdam',
  usage: 'toilet_urinoir',
  split_loss: 'evaporation',
  split_classify: 'domestic_mixed',
  treatment_unit: 'equalization_tank',
  final_destination: 'discharge_surface_river',
};

export function createNode(
  type: NodeType,
  position: { x: number; y: number }
): WaterNode {
  const subtype = DEFAULTS[type];
  return {
    id: `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    subtype,
    label: ID_LABELS[subtype] ?? subtype,
    value: 0,
    position,
  };
}
