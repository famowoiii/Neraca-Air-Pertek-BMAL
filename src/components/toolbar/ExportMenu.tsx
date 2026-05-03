import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Image, FileCode2, FileSpreadsheet, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { exportDiagramPng, exportDiagramSvg } from '../../lib/diagram-export';
import { exportToExcel } from '../../lib/excel-export';
import { useProjectStore } from '../../store/projectStore';

export function ExportMenu() {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState<'png' | 'svg' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { project, validationResult } = useProjectStore();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const hasNodes = project.nodes.length > 0;
  const isBusy = exporting !== null;

  const confirmIfErrors = useCallback((): boolean => {
    if (!validationResult || validationResult.valid) return true;
    const errors = validationResult.issues.filter((i) => i.severity === 'error');
    if (errors.length === 0) return true;
    return window.confirm(`Terdapat ${errors.length} error validasi. Tetap export?`);
  }, [validationResult]);

  const handlePng = useCallback(async () => {
    setOpen(false);
    if (!hasNodes) { toast.error('Kanvas masih kosong'); return; }
    if (!confirmIfErrors()) return;
    setExporting('png');
    const toastId = toast.loading('Mengekspor diagram PNG...');
    try {
      await exportDiagramPng();
      toast.success('Diagram PNG berhasil diexport', { id: toastId });
    } catch {
      toast.error('Gagal export PNG', { id: toastId });
    } finally {
      setExporting(null);
    }
  }, [hasNodes, confirmIfErrors]);

  const handleSvg = useCallback(async () => {
    setOpen(false);
    if (!hasNodes) { toast.error('Kanvas masih kosong'); return; }
    if (!confirmIfErrors()) return;
    setExporting('svg');
    const toastId = toast.loading('Mengekspor diagram SVG...');
    try {
      await exportDiagramSvg();
      toast.success('Diagram SVG berhasil diexport', { id: toastId });
    } catch {
      toast.error('Gagal export SVG', { id: toastId });
    } finally {
      setExporting(null);
    }
  }, [hasNodes, confirmIfErrors]);

  const handleExcel = useCallback(() => {
    setOpen(false);
    if (!hasNodes) { toast.error('Tidak ada data untuk di-export'); return; }
    if (!confirmIfErrors()) return;
    try {
      exportToExcel(project);
      toast.success('Export Excel berhasil');
    } catch {
      toast.error('Gagal export Excel');
    }
  }, [hasNodes, confirmIfErrors, project]);

  // Ctrl+E → Excel
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExcel();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleExcel]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        title="Export (Ctrl+E = Excel)"
      >
        {isBusy
          ? <Loader2 size={15} className="animate-spin" />
          : <Download size={15} />
        }
        <span className="ml-1 text-xs">{isBusy ? 'Mengekspor...' : 'Export'}</span>
        <ChevronDown size={11} className="ml-0.5" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-md shadow-lg z-50 py-1 min-w-40">
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handlePng}
            disabled={!hasNodes || isBusy}
          >
            {exporting === 'png' ? <Loader2 size={13} className="animate-spin" /> : <Image size={13} />}
            PNG (300 DPI)
          </button>
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleSvg}
            disabled={!hasNodes || isBusy}
          >
            {exporting === 'svg' ? <Loader2 size={13} className="animate-spin" /> : <FileCode2 size={13} />}
            SVG (Vektor)
          </button>
          <div className="h-px bg-gray-100 my-1" />
          <button
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleExcel}
            disabled={!hasNodes || isBusy}
          >
            <FileSpreadsheet size={13} />
            Excel (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}
