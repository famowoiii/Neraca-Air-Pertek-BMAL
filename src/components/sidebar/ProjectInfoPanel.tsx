import { useProjectStore } from '../../store/projectStore';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function ProjectInfoPanel() {
  const { project, updateMeta } = useProjectStore();
  const { meta } = project;

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Info Proyek
      </p>

      <div className="flex flex-col gap-1">
        <Label htmlFor="projectName" className="text-xs">Nama Proyek</Label>
        <Input
          id="projectName"
          value={meta.projectName}
          onChange={(e) => updateMeta({ projectName: e.target.value })}
          className="h-7 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="clientName" className="text-xs">Nama Klien</Label>
        <Input
          id="clientName"
          value={meta.clientName}
          onChange={(e) => updateMeta({ clientName: e.target.value })}
          className="h-7 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="date" className="text-xs">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={meta.date}
          onChange={(e) => updateMeta({ date: e.target.value })}
          className="h-7 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Satuan</Label>
        <Select value={meta.unit} onValueChange={(v) => updateMeta({ unit: v as typeof meta.unit })}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="m3_per_hari">m3/hari</SelectItem>
            <SelectItem value="L_per_hari">L/hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Sektor Industri</Label>
        <Select
          value={meta.industrySector || 'custom'}
          onValueChange={(v) => updateMeta({ industrySector: v as typeof meta.industrySector })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Kustom</SelectItem>
            <SelectItem value="hotel">Hotel / Resort</SelectItem>
            <SelectItem value="clinic">Klinik / RS</SelectItem>
            <SelectItem value="food_factory">Pabrik Makanan</SelectItem>
            <SelectItem value="pks">PKS (Kelapa Sawit)</SelectItem>
            <SelectItem value="textile">Tekstil</SelectItem>
            <SelectItem value="mining">Pertambangan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="regulatoryVersion" className="text-xs">Versi Regulasi</Label>
        <Input
          id="regulatoryVersion"
          value={meta.regulatoryVersion}
          onChange={(e) => updateMeta({ regulatoryVersion: e.target.value })}
          className="h-7 text-xs"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="notes" className="text-xs">Catatan</Label>
        <textarea
          id="notes"
          value={meta.notes}
          onChange={(e) => updateMeta({ notes: e.target.value })}
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          placeholder="Catatan proyek..."
        />
      </div>
    </div>
  );
}
