export const TYPICAL_VALUES = {
  coolingTower: {
    evaporationRate: 0.01,
    driftLossMin: 0.001,
    driftLossMax: 0.002,
    blowdownCocMin: 3,
    blowdownCocMax: 7,
  },
  boiler: {
    steamLossMin: 0.05,
    steamLossMax: 0.10,
    blowdownMin: 0.05,
    blowdownMax: 0.10,
  },
  domesticLPerPersonPerDay: {
    office_worker: 50,
    factory_worker: 60,
    resident_worker: 125,
    visitor: 35,
    outpatient: 25,
    inpatient_per_bed: 250,
  },
  blackGreySplit: {
    office: { blackwater: 0.30, greywater: 0.70 },
    hotel: { blackwater: 0.20, greywater: 0.80 },
  },
};

export const NODE_COLOR_MAP: Record<string, string> = {
  source: '#3b82f6',
  usage: '#6b7280',
  split_loss: '#f59e0b',
  split_classify: '#8b5cf6',
  treatment_unit: '#a855f7',
  final_destination_discharge: '#1d4ed8',
  final_destination_reuse: '#16a34a',
  final_destination_la: '#b45309',
  final_destination_tp: '#374151',
  final_destination_nr: '#d1d5db',
};
