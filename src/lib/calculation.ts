import type { WaterBalanceProject, WaterNode, WaterEdge } from '../types/nodes';

const MAX_ITERATIONS = 50;
const TOLERANCE = 0.001;

/**
 * Hitung flow di seluruh graph menggunakan iterative propagation.
 * Untuk reuse loop: iterasi hingga konvergen (delta < TOLERANCE) atau max 50x.
 *
 * Aturan edge:
 *   - 'fixed'      : flow = rule.value
 *   - 'percentage' : flow = nodeValue * (rule.value / 100)
 *
 * Node 'source': nilai diambil dari node.value (manual input).
 * Node lainnya:  nilai = total incoming flow.
 */
export function calculateFlows(project: WaterBalanceProject): {
  nodes: WaterNode[];
  edges: WaterEdge[];
} {
  // Clone agar tidak mutasi state asli
  const nodeMap = new Map<string, WaterNode>();
  const edgeMap = new Map<string, WaterEdge>();

  for (const n of project.nodes) nodeMap.set(n.id, { ...n });
  for (const e of project.edges) edgeMap.set(e.id, { ...e, flow: 0 });

  // Adjacency lists
  const inEdgesOf = new Map<string, string[]>();
  const outEdgesOf = new Map<string, string[]>();
  for (const n of project.nodes) {
    inEdgesOf.set(n.id, []);
    outEdgesOf.set(n.id, []);
  }
  for (const e of project.edges) {
    if (inEdgesOf.has(e.target)) inEdgesOf.get(e.target)!.push(e.id);
    if (outEdgesOf.has(e.source)) outEdgesOf.get(e.source)!.push(e.id);
  }

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let maxDelta = 0;

    for (const node of project.nodes) {
      const n = nodeMap.get(node.id)!;

      // Nilai non-source = total incoming flow
      if (n.type !== 'source') {
        const inFlow = (inEdgesOf.get(n.id) ?? []).reduce(
          (sum, eid) => sum + (edgeMap.get(eid)?.flow ?? 0),
          0
        );
        n.value = inFlow;
        nodeMap.set(n.id, n);
      }

      // Distribusikan ke outgoing edges
      for (const eid of outEdgesOf.get(n.id) ?? []) {
        const edge = edgeMap.get(eid)!;
        const prevFlow = edge.flow ?? 0;
        const newFlow =
          edge.rule.type === 'fixed'
            ? edge.rule.value
            : n.value * (edge.rule.value / 100);

        const delta = Math.abs(newFlow - prevFlow);
        if (delta > maxDelta) maxDelta = delta;

        edgeMap.set(eid, { ...edge, flow: newFlow });
      }
    }

    if (maxDelta < TOLERANCE) break;
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}
