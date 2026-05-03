import { useCallback, useEffect, useRef, useState } from 'react';
import { FilePlus, FolderOpen, Save, LayoutTemplate, Undo2, Redo2 } from 'lucide-react';
import { useStore } from 'zustand';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { useProjectStore } from '../../store/projectStore';
import { ValidationStatus } from './ValidationStatus';
import { ExportMenu } from './ExportMenu';
import { saveProjectToFile, loadProjectFromFile } from '../../lib/project-io';
import { TemplateLoaderModal } from '../modals/TemplateLoaderModal';

export function Toolbar() {
  const { project, isDirty, resetProject, setProject } = useProjectStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const { undo, redo, pastStates, futureStates } = useStore(useProjectStore.temporal);
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleSave = useCallback(() => {
    try {
      saveProjectToFile(project);
      toast.success('Proyek disimpan');
    } catch {
      toast.error('Gagal menyimpan proyek');
    }
  }, [project]);

  const handleNew = useCallback(() => {
    if (isDirty) {
      if (!window.confirm('Proyek belum disimpan. Buat proyek baru?')) return;
    }
    resetProject();
    useProjectStore.temporal.getState().clear();
    toast('Proyek baru dibuat');
  }, [isDirty, resetProject]);

  const handleOpenClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      try {
        const loaded = await loadProjectFromFile(file);
        setProject(loaded);
        useProjectStore.temporal.getState().clear();
        toast.success(`Proyek "${loaded.meta.projectName}" berhasil dibuka`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Gagal membuka file');
      }
    },
    [setProject]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 's') { e.preventDefault(); handleSave(); }
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, undo, redo]);

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-white shadow-sm">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-blue-700">Neraca Air PERTEK</span>
        <span className="text-muted-foreground text-xs">|</span>
        <span className="text-sm font-medium truncate max-w-48">
          {project.meta.projectName}
        </span>
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium">(belum disimpan)</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={handleNew} title="Proyek Baru">
          <FilePlus size={15} />
          <span className="ml-1 text-xs">Baru</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={() => setTemplateModalOpen(true)} title="Muat Template Sektor">
          <LayoutTemplate size={15} />
          <span className="ml-1 text-xs">Template</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={handleOpenClick} title="Buka Proyek">
          <FolderOpen size={15} />
          <span className="ml-1 text-xs">Buka</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={handleSave} title="Simpan Proyek (Ctrl+S)">
          <Save size={15} />
          <span className="ml-1 text-xs">Simpan</span>
        </Button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => undo()}
          disabled={!canUndo}
          title={`Undo (Ctrl+Z) — ${pastStates.length} langkah`}
        >
          <Undo2 size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => redo()}
          disabled={!canRedo}
          title={`Redo (Ctrl+Y) — ${futureStates.length} langkah`}
        >
          <Redo2 size={15} />
        </Button>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ExportMenu />

        <div className="ml-2">
          <ValidationStatus />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      <TemplateLoaderModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
      />
    </div>
  );
}
