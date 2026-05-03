import type {
  SourceType, UsageTier1, UsageTier2, LossType,
  WastewaterType, TreatmentUnit, FinalDestination
} from './enums';

export type NodeType =
  | 'source'
  | 'usage'
  | 'split_loss'
  | 'split_classify'
  | 'treatment_unit'
  | 'final_destination';

export type NodeSubtype =
  | SourceType
  | UsageTier2
  | LossType
  | WastewaterType
  | TreatmentUnit
  | FinalDestination;

export interface WaterNode {
  id: string;
  type: NodeType;
  subtype: NodeSubtype;
  label: string;
  value: number;
  position: { x: number; y: number };
  metadata?: {
    usageTier1?: UsageTier1;
    bakuMutuRef?: string;
    permitNumber?: string;
    treatmentEfficiency?: number;
    notes?: string;
  };
}

export interface EdgeRule {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface WaterEdge {
  id: string;
  source: string;
  target: string;
  rule: EdgeRule;
  isReuse?: boolean;
  flow?: number;
}

export interface ProjectMeta {
  projectName: string;
  clientName: string;
  date: string;
  unit: 'm3_per_hari' | 'L_per_hari';
  notes: string;
  regulatoryVersion: string;
  industrySector?: 'hotel' | 'clinic' | 'food_factory' | 'pks'
                | 'mining' | 'textile' | 'custom';
}

export interface WaterBalanceProject {
  meta: ProjectMeta;
  nodes: WaterNode[];
  edges: WaterEdge[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  nodeId?: string;
  edgeId?: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
