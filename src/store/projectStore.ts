import { create } from 'zustand';
import { temporal } from 'zundo';
import type { WaterBalanceProject, WaterNode, WaterEdge, ValidationResult } from '../types/nodes';

const DEFAULT_PROJECT: WaterBalanceProject = {
  meta: {
    projectName: 'Neraca Air Baru',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    unit: 'm3_per_hari',
    notes: '',
    regulatoryVersion: 'Permen LHK 5/2021',
    industrySector: 'custom',
  },
  nodes: [],
  edges: [],
};

interface ProjectState {
  project: WaterBalanceProject;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  validationResult: ValidationResult | null;
  isDirty: boolean;
  projectVersion: number;

  setProject: (project: WaterBalanceProject) => void;
  updateMeta: (meta: Partial<WaterBalanceProject['meta']>) => void;
  addNode: (node: WaterNode) => void;
  updateNode: (id: string, changes: Partial<WaterNode>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: WaterEdge) => void;
  updateEdge: (id: string, changes: Partial<WaterEdge>) => void;
  removeEdge: (id: string) => void;
  setNodes: (nodes: WaterNode[]) => void;
  setEdges: (edges: WaterEdge[]) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  resetProject: () => void;
}

export const useProjectStore = create<ProjectState>()(
  temporal(
    (set) => ({
      project: DEFAULT_PROJECT,
      selectedNodeId: null,
      selectedEdgeId: null,
      validationResult: null,
      isDirty: false,
      projectVersion: 0,

      setProject: (project) =>
        set((s) => ({
          project,
          isDirty: false,
          selectedNodeId: null,
          selectedEdgeId: null,
          validationResult: null,
          projectVersion: s.projectVersion + 1,
        })),

      updateMeta: (meta) =>
        set((s) => ({
          project: { ...s.project, meta: { ...s.project.meta, ...meta } },
          isDirty: true,
        })),

      addNode: (node) =>
        set((s) => ({
          project: { ...s.project, nodes: [...s.project.nodes, node] },
          isDirty: true,
        })),

      updateNode: (id, changes) =>
        set((s) => ({
          project: {
            ...s.project,
            nodes: s.project.nodes.map((n) => (n.id === id ? { ...n, ...changes } : n)),
          },
          isDirty: true,
        })),

      removeNode: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            nodes: s.project.nodes.filter((n) => n.id !== id),
            edges: s.project.edges.filter((e) => e.source !== id && e.target !== id),
          },
          selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
          isDirty: true,
        })),

      addEdge: (edge) =>
        set((s) => ({
          project: { ...s.project, edges: [...s.project.edges, edge] },
          isDirty: true,
        })),

      updateEdge: (id, changes) =>
        set((s) => ({
          project: {
            ...s.project,
            edges: s.project.edges.map((e) => (e.id === id ? { ...e, ...changes } : e)),
          },
          isDirty: true,
        })),

      removeEdge: (id) =>
        set((s) => ({
          project: {
            ...s.project,
            edges: s.project.edges.filter((e) => e.id !== id),
          },
          selectedEdgeId: s.selectedEdgeId === id ? null : s.selectedEdgeId,
          isDirty: true,
        })),

      setNodes: (nodes) =>
        set((s) => ({
          project: { ...s.project, nodes },
          isDirty: true,
        })),

      setEdges: (edges) =>
        set((s) => ({
          project: { ...s.project, edges },
          isDirty: true,
        })),

      selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
      selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
      setValidationResult: (result) => set({ validationResult: result }),

      resetProject: () =>
        set((s) => ({
          project: {
            ...DEFAULT_PROJECT,
            meta: {
              ...DEFAULT_PROJECT.meta,
              date: new Date().toISOString().split('T')[0],
            },
          },
          selectedNodeId: null,
          selectedEdgeId: null,
          validationResult: null,
          isDirty: false,
          projectVersion: s.projectVersion + 1,
        })),
    }),
    {
      // Hanya rekam perubahan pada project (bukan selection/validation)
      partialize: (state) => ({ project: state.project }),
      // Jangan rekam jika project reference tidak berubah
      equality: (a, b) => a.project === b.project,
      limit: 50,
    }
  )
);
