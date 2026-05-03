export const SOURCE_TYPES = [
  'groundwater_deep', 'groundwater_shallow', 'surface_water',
  'pdam', 'rainwater', 'recycled_water', 'condensate', 'third_party_supply'
] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const USAGE_TIER1 = [
  'domestic', 'building_operation', 'production_process',
  'utility_system', 'landscape_amenity', 'sector_specific'
] as const;
export type UsageTier1 = typeof USAGE_TIER1[number];

export const USAGE_TIER2 = [
  'toilet_urinoir', 'wastafel_shower', 'kitchen_canteen',
  'laundry_domestic', 'mushola_wudhu',
  'cleaning_service', 'floor_washing', 'vehicle_washing',
  'raw_material_input', 'cip_cleaning', 'product_washing',
  'process_water', 'quenching_cooling',
  'boiler_makeup', 'cooling_tower_makeup', 'chiller_makeup',
  'demin_water', 'fire_hydrant',
  'garden_irrigation', 'decorative_pond', 'swimming_pool',
  'lab_analysis', 'sterilization', 'hemodialisa', 'darkroom_radiology',
  'spa_treatment', 'dyeing_textile', 'sterilizer_pks', 'dust_suppression'
] as const;
export type UsageTier2 = typeof USAGE_TIER2[number];

export const LOSS_TYPES = [
  'evaporation', 'drift_loss', 'blowdown_cooling', 'blowdown_boiler',
  'steam_loss', 'water_in_product', 'leakage_distribution',
  'wind_carry', 'absorption_handling'
] as const;
export type LossType = typeof LOSS_TYPES[number];

export const WASTEWATER_TYPES = [
  'blackwater', 'greywater', 'domestic_mixed', 'industrial_process',
  'cooling_blowdown', 'boiler_blowdown', 'lab_wastewater',
  'infectious_b3', 'chemical_b3', 'stormwater_contaminated',
  'stormwater_clean', 'sludge', 'oil_grease'
] as const;
export type WastewaterType = typeof WASTEWATER_TYPES[number];

export const TREATMENT_UNITS = [
  'bar_screen', 'grit_chamber', 'equalization_tank',
  'oil_grease_trap', 'grease_interceptor',
  'primary_sedimentation', 'daf_flotation', 'septic_tank', 'imhoff_tank',
  'activated_sludge', 'mbr', 'sbr', 'biofilter_aerob', 'biofilter_anaerob',
  'uasb', 'aerated_lagoon', 'constructed_wetland', 'trickling_filter',
  'sand_filter', 'carbon_filter', 'chlorination', 'uv_disinfection',
  'ozonation', 'reverse_osmosis', 'ultrafiltration',
  'sludge_thickener', 'filter_press', 'belt_press',
  'centrifuge', 'drying_bed', 'composting'
] as const;
export type TreatmentUnit = typeof TREATMENT_UNITS[number];

export const FINAL_DESTINATIONS = [
  'discharge_surface_river', 'discharge_surface_lake',
  'discharge_surface_drainage', 'discharge_sea',
  'discharge_groundwater_injection',
  'reuse_cooling_makeup', 'reuse_toilet_flushing', 'reuse_hydrant',
  'reuse_garden', 'reuse_floor_washing', 'reuse_process',
  'la_irrigation', 'la_fertilization', 'la_pks_palm',
  'la_road_dust_suppression', 'la_landscape',
  'tp_b3_transporter', 'tp_b3_processor', 'tp_septic_kuras',
  'tp_iplt', 'tp_ipal_komunal', 'tp_incinerator',
  'nr_evaporation', 'nr_transpiration', 'nr_infiltration', 'nr_runoff'
] as const;
export type FinalDestination = typeof FINAL_DESTINATIONS[number];

export const PERTEK_CATEGORY_MAP: Record<FinalDestination, string> = {
  discharge_surface_river: 'Pembuangan ke Badan Air Permukaan',
  discharge_surface_lake: 'Pembuangan ke Badan Air Permukaan',
  discharge_surface_drainage: 'Pembuangan ke Badan Air Permukaan',
  discharge_sea: 'Pembuangan ke Laut',
  discharge_groundwater_injection: 'Pembuangan ke Formasi Tertentu',
  reuse_cooling_makeup: 'Pemanfaatan Kembali (Reuse Internal)',
  reuse_toilet_flushing: 'Pemanfaatan Kembali (Reuse Internal)',
  reuse_hydrant: 'Pemanfaatan Kembali (Reuse Internal)',
  reuse_garden: 'Pemanfaatan untuk Aplikasi ke Tanah',
  reuse_floor_washing: 'Pemanfaatan Kembali (Reuse Internal)',
  reuse_process: 'Pemanfaatan Kembali (Reuse Internal)',
  la_irrigation: 'Pemanfaatan untuk Aplikasi ke Tanah',
  la_fertilization: 'Pemanfaatan untuk Aplikasi ke Tanah',
  la_pks_palm: 'Pemanfaatan untuk Aplikasi ke Tanah',
  la_road_dust_suppression: 'Pemanfaatan untuk Aplikasi ke Tanah',
  la_landscape: 'Pemanfaatan untuk Aplikasi ke Tanah',
  tp_b3_transporter: 'Pengelolaan Pihak Ketiga',
  tp_b3_processor: 'Pengelolaan Pihak Ketiga',
  tp_septic_kuras: 'Pengelolaan Pihak Ketiga',
  tp_iplt: 'Pengelolaan Pihak Ketiga',
  tp_ipal_komunal: 'Pengelolaan Pihak Ketiga',
  tp_incinerator: 'Pengelolaan Pihak Ketiga',
  nr_evaporation: 'Pelepasan Alami',
  nr_transpiration: 'Pelepasan Alami',
  nr_infiltration: 'Pelepasan Alami',
  nr_runoff: 'Pelepasan Alami',
};

export const ID_LABELS: Record<string, string> = {
  // Source types
  groundwater_deep: 'Sumur Dalam',
  groundwater_shallow: 'Sumur Dangkal',
  surface_water: 'Air Permukaan',
  pdam: 'PDAM',
  rainwater: 'Air Hujan',
  recycled_water: 'Air Daur Ulang',
  condensate: 'Air Kondensat',
  third_party_supply: 'Pihak Ketiga (Tangki/IPA)',
  // Usage tier1
  domestic: 'Domestik',
  building_operation: 'Operasional Gedung',
  production_process: 'Proses Produksi',
  utility_system: 'Sistem Utilitas',
  landscape_amenity: 'Lanskap dan Amenitas',
  sector_specific: 'Spesifik Sektor',
  // Usage tier2 - domestic
  toilet_urinoir: 'Toilet / Urinoir',
  wastafel_shower: 'Wastafel / Shower',
  kitchen_canteen: 'Dapur / Kantin',
  laundry_domestic: 'Laundry',
  mushola_wudhu: 'Mushola / Wudhu',
  // Building operation
  cleaning_service: 'Cleaning Service',
  floor_washing: 'Pencucian Lantai',
  vehicle_washing: 'Pencucian Kendaraan',
  // Production process
  raw_material_input: 'Input Bahan Baku',
  cip_cleaning: 'CIP Cleaning',
  product_washing: 'Pencucian Produk',
  process_water: 'Air Proses',
  quenching_cooling: 'Quenching / Pendinginan',
  // Utility system
  boiler_makeup: 'Make-up Boiler',
  cooling_tower_makeup: 'Make-up Cooling Tower',
  chiller_makeup: 'Make-up Chiller',
  demin_water: 'Air Demineralisasi',
  fire_hydrant: 'Cadangan Hydrant',
  // Landscape
  garden_irrigation: 'Penyiraman Taman',
  decorative_pond: 'Kolam Hias',
  swimming_pool: 'Kolam Renang',
  // Sector specific
  lab_analysis: 'Laboratorium',
  sterilization: 'Sterilisasi',
  hemodialisa: 'Hemodialisa',
  darkroom_radiology: 'Radiologi',
  spa_treatment: 'Spa / Perawatan',
  dyeing_textile: 'Pencelupan Tekstil',
  sterilizer_pks: 'Perebusan TBS (PKS)',
  dust_suppression: 'Penyemprotan Debu',
  // Loss types
  evaporation: 'Penguapan',
  drift_loss: 'Drift Loss',
  blowdown_cooling: 'Blowdown Cooling Tower',
  blowdown_boiler: 'Blowdown Boiler',
  steam_loss: 'Kehilangan Uap',
  water_in_product: 'Air dalam Produk',
  leakage_distribution: 'Kebocoran Distribusi',
  wind_carry: 'Terbawa Angin',
  absorption_handling: 'Penyerapan Material',
  // Wastewater types
  blackwater: 'Air Limbah Hitam',
  greywater: 'Air Limbah Abu-abu',
  domestic_mixed: 'Limbah Domestik Campuran',
  industrial_process: 'Limbah Proses Industri',
  cooling_blowdown: 'Blowdown Cooling',
  boiler_blowdown: 'Blowdown Boiler',
  lab_wastewater: 'Limbah Laboratorium',
  infectious_b3: 'Limbah Infeksius (B3)',
  chemical_b3: 'Limbah Kimia (B3)',
  stormwater_contaminated: 'Limpasan Tercemar',
  stormwater_clean: 'Limpasan Bersih',
  sludge: 'Lumpur (Sludge)',
  oil_grease: 'Minyak dan Lemak',
  // Treatment units
  bar_screen: 'Bar Screen',
  grit_chamber: 'Bak Penangkap Pasir',
  equalization_tank: 'Bak Ekualisasi',
  oil_grease_trap: 'Perangkap Minyak',
  grease_interceptor: 'Grease Interceptor',
  primary_sedimentation: 'Sedimentasi Primer',
  daf_flotation: 'DAF Flotasi',
  septic_tank: 'Septic Tank',
  imhoff_tank: 'Imhoff Tank',
  activated_sludge: 'Lumpur Aktif',
  mbr: 'MBR',
  sbr: 'SBR',
  biofilter_aerob: 'Biofilter Aerob',
  biofilter_anaerob: 'Biofilter Anaerob',
  uasb: 'UASB',
  aerated_lagoon: 'Lagoon Aerasi',
  constructed_wetland: 'Constructed Wetland',
  trickling_filter: 'Trickling Filter',
  sand_filter: 'Filter Pasir',
  carbon_filter: 'Filter Karbon',
  chlorination: 'Klorinasi',
  uv_disinfection: 'Disinfeksi UV',
  ozonation: 'Ozonasi',
  reverse_osmosis: 'Reverse Osmosis',
  ultrafiltration: 'Ultrafiltrasi',
  sludge_thickener: 'Pengental Lumpur',
  filter_press: 'Filter Press',
  belt_press: 'Belt Press',
  centrifuge: 'Sentrifugasi',
  drying_bed: 'Drying Bed',
  composting: 'Komposting',
  // Final destinations
  discharge_surface_river: 'Sungai',
  discharge_surface_lake: 'Danau / Waduk',
  discharge_surface_drainage: 'Drainase Kota',
  discharge_sea: 'Laut',
  discharge_groundwater_injection: 'Sumur Injeksi',
  reuse_cooling_makeup: 'Reuse ke Cooling Tower',
  reuse_toilet_flushing: 'Reuse untuk Flushing',
  reuse_hydrant: 'Reuse Cadangan Hidran',
  reuse_garden: 'Reuse Penyiraman Taman',
  reuse_floor_washing: 'Reuse Pencucian Lantai',
  reuse_process: 'Reuse ke Proses',
  la_irrigation: 'Land App. Irigasi',
  la_fertilization: 'Land App. Pupuk',
  la_pks_palm: 'Land App. PKS (POME)',
  la_road_dust_suppression: 'Land App. Tambang',
  la_landscape: 'Land App. Lanskap',
  tp_b3_transporter: 'Pihak Ketiga - Pengangkut B3',
  tp_b3_processor: 'Pihak Ketiga - Pengolah B3',
  tp_septic_kuras: 'Pihak Ketiga - Kuras Septic',
  tp_iplt: 'Pihak Ketiga - IPLT',
  tp_ipal_komunal: 'Pihak Ketiga - IPAL Komunal',
  tp_incinerator: 'Pihak Ketiga - Insinerator',
  nr_evaporation: 'Pelepasan - Penguapan',
  nr_transpiration: 'Pelepasan - Transpirasi',
  nr_infiltration: 'Pelepasan - Infiltrasi',
  nr_runoff: 'Pelepasan - Limpasan',
};

export const USAGE_TIER1_FOR_TIER2: Record<UsageTier2, UsageTier1> = {
  toilet_urinoir: 'domestic',
  wastafel_shower: 'domestic',
  kitchen_canteen: 'domestic',
  laundry_domestic: 'domestic',
  mushola_wudhu: 'domestic',
  cleaning_service: 'building_operation',
  floor_washing: 'building_operation',
  vehicle_washing: 'building_operation',
  raw_material_input: 'production_process',
  cip_cleaning: 'production_process',
  product_washing: 'production_process',
  process_water: 'production_process',
  quenching_cooling: 'production_process',
  boiler_makeup: 'utility_system',
  cooling_tower_makeup: 'utility_system',
  chiller_makeup: 'utility_system',
  demin_water: 'utility_system',
  fire_hydrant: 'utility_system',
  garden_irrigation: 'landscape_amenity',
  decorative_pond: 'landscape_amenity',
  swimming_pool: 'landscape_amenity',
  lab_analysis: 'sector_specific',
  sterilization: 'sector_specific',
  hemodialisa: 'sector_specific',
  darkroom_radiology: 'sector_specific',
  spa_treatment: 'sector_specific',
  dyeing_textile: 'sector_specific',
  sterilizer_pks: 'sector_specific',
  dust_suppression: 'sector_specific',
};
