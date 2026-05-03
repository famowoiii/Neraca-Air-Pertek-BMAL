import type { WaterBalanceProject, ValidationResult, ValidationIssue, WaterEdge } from '../types/nodes';

export function validateProject(project: WaterBalanceProject): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Build adjacency
  const inEdgesOf = new Map<string, WaterEdge[]>();
  const outEdgesOf = new Map<string, WaterEdge[]>();
  for (const n of project.nodes) {
    inEdgesOf.set(n.id, []);
    outEdgesOf.set(n.id, []);
  }
  for (const e of project.edges) {
    inEdgesOf.get(e.target)?.push(e);
    outEdgesOf.get(e.source)?.push(e);
  }

  // 1. Tidak ada sumber air
  const sourceNodes = project.nodes.filter((n) => n.type === 'source');
  if (sourceNodes.length === 0 && project.nodes.length > 0) {
    issues.push({ severity: 'error', message: 'Tidak ada node sumber air dalam diagram' });
  }

  // 2. Sumber bernilai 0
  for (const src of sourceNodes) {
    if (src.value <= 0) {
      issues.push({
        severity: 'warning',
        nodeId: src.id,
        message: `Sumber "${src.label}" memiliki nilai 0 m³/hari`,
      });
    }
  }

  // 3. Orphan nodes
  for (const node of project.nodes) {
    const hasIn = (inEdgesOf.get(node.id) ?? []).length > 0;
    const hasOut = (outEdgesOf.get(node.id) ?? []).length > 0;

    if (node.type === 'source' && !hasOut) {
      issues.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Sumber "${node.label}" tidak terhubung ke node lain`,
      });
    } else if (node.type === 'final_destination' && !hasIn) {
      issues.push({
        severity: 'warning',
        nodeId: node.id,
        message: `Tujuan akhir "${node.label}" tidak menerima aliran`,
      });
    } else if (!['source', 'final_destination'].includes(node.type) && !hasIn && !hasOut) {
      issues.push({
        severity: 'error',
        nodeId: node.id,
        message: `Node "${node.label}" terisolasi (tidak punya koneksi masuk maupun keluar)`,
      });
    }
  }

  // 4. Persentase outgoing harus = 100% (jika semua edge bertipe percentage)
  for (const node of project.nodes) {
    const outEdges = outEdgesOf.get(node.id) ?? [];
    const pctEdges = outEdges.filter((e) => e.rule.type === 'percentage');
    const fixedEdges = outEdges.filter((e) => e.rule.type === 'fixed');

    if (pctEdges.length > 0 && fixedEdges.length === 0) {
      const sum = pctEdges.reduce((s, e) => s + e.rule.value, 0);
      if (Math.abs(sum - 100) > 0.001) {
        issues.push({
          severity: 'error',
          nodeId: node.id,
          message: `Total persentase keluar dari "${node.label}": ${sum.toFixed(1)}% (harus 100%)`,
        });
      }
    }
  }

  // 5. Mass balance (non-source, non-destination yang punya outgoing)
  for (const node of project.nodes) {
    if (node.type === 'source' || node.type === 'final_destination') continue;
    const outEdges = outEdgesOf.get(node.id) ?? [];
    if (outEdges.length === 0) continue; // terminal intermediate - bisa jadi loss node

    const inFlow = (inEdgesOf.get(node.id) ?? []).reduce((s, e) => s + (e.flow ?? 0), 0);
    const outFlow = outEdges.reduce((s, e) => s + (e.flow ?? 0), 0);

    if (inFlow > 0.001 && Math.abs(inFlow - outFlow) > Math.max(0.1, inFlow * 0.001)) {
      issues.push({
        severity: 'error',
        nodeId: node.id,
        message: `Mass balance tidak seimbang di "${node.label}": masuk ${inFlow.toFixed(3)}, keluar ${outFlow.toFixed(3)} m³/hari`,
      });
    }
  }

  // 6. Aliran negatif atau tidak valid
  for (const edge of project.edges) {
    const flow = edge.flow ?? 0;
    if (flow < -0.001) {
      issues.push({
        severity: 'error',
        edgeId: edge.id,
        message: 'Terdapat aliran bernilai negatif',
      });
    }
    if (!isFinite(flow) || isNaN(flow)) {
      issues.push({
        severity: 'error',
        edgeId: edge.id,
        message: 'Aliran tidak konvergen atau tidak valid (kemungkinan reuse loop tanpa reduksi)',
      });
    }
  }

  // 7. Tidak ada tujuan akhir
  const destNodes = project.nodes.filter((n) => n.type === 'final_destination');
  if (destNodes.length === 0 && project.nodes.length > 0) {
    issues.push({
      severity: 'warning',
      message: 'Tidak ada node tujuan akhir - diagram mungkin belum lengkap',
    });
  }

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}
