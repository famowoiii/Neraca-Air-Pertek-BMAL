import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateFlows } from './calculation';
import { validateProject } from './validation';

/**
 * Auto-recalculate neraca air setiap kali node/edge berubah (debounced 300ms).
 * Menggunakan Zustand subscribe di luar React render cycle untuk menghindari
 * infinite loop saat store diupdate oleh hasil kalkulasi.
 *
 * Flag isProcessing mencegah kalkulasi memicu dirinya sendiri.
 * Temporal store di-pause selama kalkulasi agar computed values tidak masuk history.
 */
export function useAutoCalculate() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let isProcessing = false;

    const unsubscribe = useProjectStore.subscribe((state, prevState) => {
      if (isProcessing) return;

      if (
        state.project.nodes === prevState.project.nodes &&
        state.project.edges === prevState.project.edges
      ) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        isProcessing = true;
        // Pause undo history selama update kalkulasi
        useProjectStore.temporal.getState().pause();
        try {
          const project = useProjectStore.getState().project;

          if (project.nodes.length === 0) {
            useProjectStore.getState().setValidationResult(null);
            return;
          }

          const { nodes, edges } = calculateFlows(project);
          const validation = validateProject({ ...project, nodes, edges });

          const store = useProjectStore.getState();

          const anyNodeChanged = nodes.some((n) => {
            const cur = project.nodes.find((c) => c.id === n.id);
            return cur !== undefined && Math.abs(cur.value - n.value) > 0.0001;
          });
          const anyEdgeChanged = edges.some((e) => {
            const cur = project.edges.find((c) => c.id === e.id);
            return cur !== undefined && Math.abs((cur.flow ?? 0) - (e.flow ?? 0)) > 0.0001;
          });

          if (anyNodeChanged) store.setNodes(nodes);
          if (anyEdgeChanged) store.setEdges(edges);
          store.setValidationResult(validation);
        } finally {
          useProjectStore.temporal.getState().resume();
          isProcessing = false;
        }
      }, 300);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);
}
