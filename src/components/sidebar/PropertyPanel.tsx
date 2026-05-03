import { useState, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

import { useProjectStore } from '../../store/projectStore';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  ID_LABELS,
  USAGE_TIER1_FOR_TIER2,
} from '../../types/enums';
import type { NodeType, NodeSubtype } from '../../types/nodes';

// ─── Grouped subtype options ───────────────────────────────────────────────

const SOURCE_GROUPS = {
  'Sumber Utama': ['pdam', 'groundwater_deep', 'groundwater_shallow', 'surface_water'],
  'Sumber Alternatif': ['rainwater', 'recycled_water', 'condensate', 'third_party_supply'],
} as const;

const USAGE_GROUPS = {
  'Domestik': ['toilet_urinoir', 'wastafel_shower', 'kitchen_canteen', 'laundry_domestic', 'mushola_wudhu'],
  'Operasional Gedung': ['cleaning_service', 'floor_washing', 'vehicle_washing'],
  'Proses Produksi': ['raw_material_input', 'cip_cleaning', 'product_washing', 'process_water', 'quenching_cooling'],
  'Utilitas': ['boiler_makeup', 'cooling_tower_makeup', 'chiller_makeup', 'demin_water', 'fire_hydrant'],
  'Lanskap': ['garden_irrigation', 'decorative_pond', 'swimming_pool'],
  'Spesifik Sektor': ['lab_analysis', 'sterilization', 'hemodialisa', 'darkroom_radiology', 'spa_treatment', 'dyeing_textile', 'sterilizer_pks', 'dust_suppression'],
} as const;

const TREATMENT_GROUPS = {
  'Pre-treatment': ['bar_screen', 'grit_chamber', 'equalization_tank', 'oil_grease_trap', 'grease_interceptor'],
  'Primer': ['primary_sedimentation', 'daf_flotation', 'septic_tank', 'imhoff_tank'],
  'Sekunder (Biologis)': ['activated_sludge', 'mbr', 'sbr', 'biofilter_aerob', 'biofilter_anaerob', 'uasb', 'aerated_lagoon', 'constructed_wetland', 'trickling_filter'],
  'Tersier': ['sand_filter', 'carbon_filter', 'chlorination', 'uv_disinfection', 'ozonation', 'reverse_osmosis', 'ultrafiltration'],
  'Penanganan Lumpur': ['sludge_thickener', 'filter_press', 'belt_press', 'centrifuge', 'drying_bed', 'composting'],
} as const;

const DESTINATION_GROUPS = {
  'Pembuangan': ['discharge_surface_river', 'discharge_surface_lake', 'discharge_surface_drainage', 'discharge_sea', 'discharge_groundwater_injection'],
  'Reuse Internal': ['reuse_cooling_makeup', 'reuse_toilet_flushing', 'reuse_hydrant', 'reuse_garden', 'reuse_floor_washing', 'reuse_process'],
  'Aplikasi ke Tanah': ['la_irrigation', 'la_fertilization', 'la_pks_palm', 'la_road_dust_suppression', 'la_landscape'],
  'Pihak Ketiga': ['tp_b3_transporter', 'tp_b3_processor', 'tp_septic_kuras', 'tp_iplt', 'tp_ipal_komunal', 'tp_incinerator'],
  'Pelepasan Alami': ['nr_evaporation', 'nr_transpiration', 'nr_infiltration', 'nr_runoff'],
} as const;

const LOSS_GROUPS = {
  'Kehilangan Fisik': ['evaporation', 'drift_loss', 'wind_carry', 'leakage_distribution', 'absorption_handling'],
  'Blowdown & Uap': ['blowdown_cooling', 'blowdown_boiler', 'steam_loss'],
  'Terinkorporasi Produk': ['water_in_product'],
} as const;

const WASTEWATER_GROUPS = {
  'Domestik': ['blackwater', 'greywater', 'domestic_mixed'],
  'Industri': ['industrial_process', 'cooling_blowdown', 'boiler_blowdown', 'lab_wastewater'],
  'B3': ['infectious_b3', 'chemical_b3'],
  'Limpasan': ['stormwater_contaminated', 'stormwater_clean'],
  'Residu': ['sludge', 'oil_grease'],
} as const;

type Groups = Record<string, readonly string[]>;

function GroupedSelect({
  value,
  onValueChange,
  groups,
}: {
  value: string;
  onValueChange: (v: string) => void;
  groups: Groups;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-7 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {Object.entries(groups).map(([groupLabel, items]) => (
          <SelectGroup key={groupLabel}>
            <SelectLabel className="text-xs text-muted-foreground px-2 py-1">{groupLabel}</SelectLabel>
            {(items as readonly string[]).map((key) => (
              <SelectItem key={key} value={key} className="text-xs pl-4">
                {ID_LABELS[key] ?? key}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

function getGroupsForNodeType(nodeType: NodeType): Groups {
  const map: Record<NodeType, Groups> = {
    source: SOURCE_GROUPS,
    usage: USAGE_GROUPS,
    split_loss: LOSS_GROUPS,
    split_classify: WASTEWATER_GROUPS,
    treatment_unit: TREATMENT_GROUPS,
    final_destination: DESTINATION_GROUPS,
  };
  return map[nodeType];
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 mt-3 mb-1">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Node Property Form ────────────────────────────────────────────────────

function NodePropertyForm({ nodeId }: { nodeId: string }) {
  const { project, updateNode, removeNode, selectNode } = useProjectStore();
  const node = project.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const [label, setLabel] = useState(node.label);
  const [valueStr, setValueStr] = useState(String(node.value));

  // Sync local state when node changes from outside (e.g., Phase 4 calculation)
  useEffect(() => {
    setLabel(node.label);
    setValueStr(String(node.value));
  }, [node.label, node.value]);

  const commitLabel = useCallback(() => {
    const trimmed = label.trim();
    if (trimmed && trimmed !== node.label) {
      updateNode(nodeId, { label: trimmed });
    } else {
      setLabel(node.label);
    }
  }, [label, node.label, nodeId, updateNode]);

  const commitValue = useCallback(() => {
    const num = parseFloat(valueStr);
    if (!isNaN(num) && num >= 0) {
      updateNode(nodeId, { value: num });
    } else {
      setValueStr(String(node.value));
    }
  }, [valueStr, node.value, nodeId, updateNode]);

  const handleSubtypeChange = useCallback(
    (subtype: string) => {
      const label = ID_LABELS[subtype] ?? subtype;
      const changes: Partial<typeof node> = { subtype: subtype as NodeSubtype, label };
      if (node.type === 'usage') {
        changes.metadata = {
          ...node.metadata,
          usageTier1: USAGE_TIER1_FOR_TIER2[subtype as keyof typeof USAGE_TIER1_FOR_TIER2],
        };
      }
      updateNode(nodeId, changes);
    },
    [nodeId, node.type, node.metadata, updateNode]
  );

  const handleDelete = useCallback(() => {
    removeNode(nodeId);
    selectNode(null);
    toast('Node dihapus');
  }, [nodeId, removeNode, selectNode]);

  const unit = project.meta.unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';
  const groups = getGroupsForNodeType(node.type);

  const NODE_TYPE_LABELS: Record<NodeType, string> = {
    source: 'Sumber Air',
    usage: 'Pemakaian',
    split_loss: 'Kehilangan',
    split_classify: 'Klasifikasi Limbah',
    treatment_unit: 'Unit Pengolahan',
    final_destination: 'Tujuan Akhir',
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {NODE_TYPE_LABELS[node.type]}
      </p>

      {/* Subtype */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Jenis</Label>
        <GroupedSelect
          value={node.subtype}
          onValueChange={handleSubtypeChange}
          groups={groups}
        />
      </div>

      {/* Label */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Label</Label>
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={(e) => e.key === 'Enter' && commitLabel()}
          className="h-7 text-xs"
        />
      </div>

      {/* Value - hanya untuk source (Phase 4 akan hitung otomatis untuk node lain) */}
      {node.type === 'source' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Volume ({unit})</Label>
          <Input
            type="number"
            min="0"
            step="0.001"
            value={valueStr}
            onChange={(e) => setValueStr(e.target.value)}
            onBlur={commitValue}
            onKeyDown={(e) => e.key === 'Enter' && commitValue()}
            className="h-7 text-xs"
          />
        </div>
      )}

      {/* Metadata section */}
      <SectionDivider label="Metadata" />

      {(node.type === 'source' || node.type === 'final_destination') && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">No. Izin / PERTEK</Label>
          <Input
            value={node.metadata?.permitNumber ?? ''}
            onChange={(e) =>
              updateNode(nodeId, {
                metadata: { ...node.metadata, permitNumber: e.target.value },
              })
            }
            className="h-7 text-xs"
            placeholder="Contoh: SK.123/MenLHK/..."
          />
        </div>
      )}

      {node.type === 'final_destination' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Referensi Baku Mutu</Label>
          <Input
            value={node.metadata?.bakuMutuRef ?? ''}
            onChange={(e) =>
              updateNode(nodeId, {
                metadata: { ...node.metadata, bakuMutuRef: e.target.value },
              })
            }
            className="h-7 text-xs"
            placeholder="Contoh: Permen LHK 68/2016"
          />
        </div>
      )}

      {node.type === 'treatment_unit' && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Efisiensi Pengolahan (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            value={node.metadata?.treatmentEfficiency ?? ''}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v))
                updateNode(nodeId, {
                  metadata: { ...node.metadata, treatmentEfficiency: v },
                });
            }}
            className="h-7 text-xs"
            placeholder="0-100"
          />
        </div>
      )}

      {node.type === 'usage' && node.metadata?.usageTier1 && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Kategori Tier 1</Label>
          <p className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
            {ID_LABELS[node.metadata.usageTier1] ?? node.metadata.usageTier1}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Catatan</Label>
        <textarea
          value={node.metadata?.notes ?? ''}
          onChange={(e) =>
            updateNode(nodeId, {
              metadata: { ...node.metadata, notes: e.target.value },
            })
          }
          rows={2}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          placeholder="Catatan tambahan..."
        />
      </div>

      <Button
        variant="destructive"
        size="sm"
        className="mt-2 h-7 text-xs w-full"
        onClick={handleDelete}
      >
        <Trash2 size={12} className="mr-1" />
        Hapus Node
      </Button>
    </div>
  );
}

// ─── Edge Property Form ────────────────────────────────────────────────────

function EdgePropertyForm({ edgeId }: { edgeId: string }) {
  const { project, updateEdge, removeEdge, selectEdge } = useProjectStore();
  const edge = project.edges.find((e) => e.id === edgeId);
  if (!edge) return null;

  const [ruleValue, setRuleValue] = useState(String(edge.rule.value));

  useEffect(() => {
    setRuleValue(String(edge.rule.value));
  }, [edge.rule.value]);

  const commitRuleValue = useCallback(() => {
    const num = parseFloat(ruleValue);
    if (!isNaN(num) && num >= 0) {
      const clamped = edge.rule.type === 'percentage' ? Math.min(100, num) : num;
      updateEdge(edgeId, { rule: { ...edge.rule, value: clamped } });
    } else {
      setRuleValue(String(edge.rule.value));
    }
  }, [ruleValue, edge.rule, edgeId, updateEdge]);

  const handleDelete = useCallback(() => {
    removeEdge(edgeId);
    selectEdge(null);
    toast('Koneksi dihapus');
  }, [edgeId, removeEdge, selectEdge]);

  // Hitung sum persentase dari source yang sama
  const outgoing = project.edges.filter((e) => e.source === edge.source);
  const pctEdges = outgoing.filter((e) => e.rule.type === 'percentage');
  const fixedEdges = outgoing.filter((e) => e.rule.type === 'fixed');
  const pctSum = pctEdges.reduce((acc, e) => acc + e.rule.value, 0);
  const isPctOnly = fixedEdges.length === 0 && pctEdges.length > 1;
  const pctImbalanced = isPctOnly && Math.abs(pctSum - 100) > 0.001;

  const sourceNode = project.nodes.find((n) => n.id === edge.source);
  const targetNode = project.nodes.find((n) => n.id === edge.target);
  const unit = project.meta.unit === 'm3_per_hari' ? 'm³/hari' : 'L/hari';

  return (
    <div className="flex flex-col gap-2 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Koneksi
      </p>

      {/* Source → Target info */}
      <div className="text-xs bg-muted rounded px-2 py-1.5 space-y-0.5">
        <div className="flex gap-1">
          <span className="text-muted-foreground">Dari:</span>
          <span className="font-medium truncate">{sourceNode?.label ?? edge.source}</span>
        </div>
        <div className="flex gap-1">
          <span className="text-muted-foreground">Ke:</span>
          <span className="font-medium truncate">{targetNode?.label ?? edge.target}</span>
        </div>
      </div>

      {/* Rule type */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">Jenis Aturan</Label>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateEdge(edgeId, { rule: { type: 'percentage', value: edge.rule.value } })
            }
            className={`flex-1 text-xs py-1 rounded border transition-colors ${
              edge.rule.type === 'percentage'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            Persen (%)
          </button>
          <button
            onClick={() =>
              updateEdge(edgeId, { rule: { type: 'fixed', value: edge.rule.value } })
            }
            className={`flex-1 text-xs py-1 rounded border transition-colors ${
              edge.rule.type === 'fixed'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-input hover:bg-muted'
            }`}
          >
            Tetap ({unit})
          </button>
        </div>
      </div>

      {/* Rule value */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs">
          Nilai {edge.rule.type === 'percentage' ? '(%)' : `(${unit})`}
        </Label>
        <Input
          type="number"
          min="0"
          max={edge.rule.type === 'percentage' ? 100 : undefined}
          step={edge.rule.type === 'percentage' ? 1 : 0.001}
          value={ruleValue}
          onChange={(e) => setRuleValue(e.target.value)}
          onBlur={commitRuleValue}
          onKeyDown={(e) => e.key === 'Enter' && commitRuleValue()}
          className="h-7 text-xs"
        />
      </div>

      {/* Computed flow (Phase 4 will fill this) */}
      {edge.flow !== undefined && edge.flow > 0 && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Flow dihitung:</span>
          <span className="font-medium tabular-nums">{edge.flow.toFixed(3)} {unit}</span>
        </div>
      )}

      {/* Percentage sum warning */}
      {pctImbalanced && (
        <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 text-xs text-amber-800">
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>
            Total persen dari node ini: <strong>{pctSum.toFixed(1)}%</strong> (harus 100%)
          </span>
        </div>
      )}

      {outgoing.length > 1 && fixedEdges.length > 0 && pctEdges.length > 0 && (
        <div className="flex items-start gap-1.5 bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-xs text-blue-800">
          <Info size={12} className="mt-0.5 flex-shrink-0" />
          <span>
            Campuran aturan tetap+persen. Pastikan total tidak melebihi nilai node sumber.
          </span>
        </div>
      )}

      {/* Reuse toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-xs cursor-pointer" htmlFor="isReuse">
          Tandai sebagai Reuse
        </Label>
        <input
          id="isReuse"
          type="checkbox"
          checked={edge.isReuse ?? false}
          onChange={(e) => updateEdge(edgeId, { isReuse: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer"
        />
      </div>

      {edge.isReuse && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
          Edge reuse akan tampil putus-putus hijau di diagram
        </p>
      )}

      <Button
        variant="destructive"
        size="sm"
        className="mt-2 h-7 text-xs w-full"
        onClick={handleDelete}
      >
        <Trash2 size={12} className="mr-1" />
        Hapus Koneksi
      </Button>
    </div>
  );
}

// ─── Main PropertyPanel ────────────────────────────────────────────────────

export function PropertyPanel() {
  const { selectedNodeId, selectedEdgeId } = useProjectStore();

  if (!selectedNodeId && !selectedEdgeId) {
    return (
      <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Klik node atau koneksi untuk mengedit propertinya
        </p>
      </div>
    );
  }

  if (selectedNodeId) {
    // key= nodeId memastikan state lokal form di-reset saat node berbeda dipilih
    return <NodePropertyForm key={selectedNodeId} nodeId={selectedNodeId} />;
  }

  if (selectedEdgeId) {
    return <EdgePropertyForm key={selectedEdgeId} edgeId={selectedEdgeId} />;
  }

  return null;
}
