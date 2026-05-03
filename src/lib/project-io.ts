import type { WaterBalanceProject } from '../types/nodes';

const FILE_VERSION = '1.0';

interface ProjectFile {
  version: string;
  savedAt: string;
  project: WaterBalanceProject;
}

export function saveProjectToFile(project: WaterBalanceProject): void {
  const payload: ProjectFile = {
    version: FILE_VERSION,
    savedAt: new Date().toISOString(),
    project,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeName = project.meta.projectName.replace(/[^a-zA-Z0-9\-_]/g, '-');
  const a = document.createElement('a');
  a.href = url;
  a.download = `neraca-air-${safeName}-${project.meta.date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function loadProjectFromFile(file: File): Promise<WaterBalanceProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text) as Partial<ProjectFile>;

        if (!data.project) {
          throw new Error('Bukan file neraca air yang valid');
        }

        const p = data.project;
        if (!p.meta || !Array.isArray(p.nodes) || !Array.isArray(p.edges)) {
          throw new Error('Struktur file tidak lengkap (meta/nodes/edges tidak ada)');
        }

        // Pastikan setiap node punya field wajib
        for (const n of p.nodes) {
          if (!n.id || !n.type || n.position == null) {
            throw new Error(`Node tidak valid: ${JSON.stringify(n)}`);
          }
          if (n.value == null) n.value = 0;
        }

        // Pastikan setiap edge punya field wajib
        for (const e of p.edges) {
          if (!e.id || !e.source || !e.target || !e.rule) {
            throw new Error(`Koneksi tidak valid: ${JSON.stringify(e)}`);
          }
        }

        resolve(p);
      } catch (err) {
        reject(
          new Error(
            `Gagal membaca file: ${err instanceof Error ? err.message : 'Format tidak dikenal'}`
          )
        );
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari disk'));
    reader.readAsText(file);
  });
}
