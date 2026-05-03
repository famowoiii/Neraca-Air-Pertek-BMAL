import { useState, useCallback } from 'react';
import { LayoutTemplate } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { useProjectStore } from '../../store/projectStore';
import { TEMPLATES, loadTemplate } from '../../lib/templates';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TemplateLoaderModal({ open, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setProject, isDirty } = useProjectStore();

  const handleLoad = useCallback(async () => {
    if (!selected) return;
    if (isDirty) {
      if (!window.confirm('Proyek saat ini belum disimpan. Lanjutkan muat template?')) return;
    }
    setLoading(true);
    try {
      const project = await loadTemplate(selected);
      const today = new Date().toISOString().split('T')[0];
      setProject({ ...project, meta: { ...project.meta, date: today, clientName: '' } });
      toast.success(`Template "${TEMPLATES.find((t) => t.id === selected)?.label}" berhasil dimuat`);
      onClose();
      setSelected(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memuat template');
    } finally {
      setLoading(false);
    }
  }, [selected, isDirty, setProject, onClose]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelected(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Muat Template Sektor Industri</DialogTitle>
          <DialogDescription>
            Pilih template yang paling sesuai dengan jenis industri klien. Semua nilai dapat disesuaikan setelah dimuat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`text-left p-3 rounded-lg border-2 transition-colors ${
                selected === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <LayoutTemplate size={14} className={selected === t.id ? 'text-blue-600' : 'text-gray-400'} />
                <span className="text-sm font-semibold text-gray-800">{t.label}</span>
                <span className="ml-auto text-xs text-gray-400">{t.nodeCount} node</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleLoad}
            disabled={!selected || loading}
          >
            {loading ? 'Memuat...' : 'Muat Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
