import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Node,
  type Edge,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type NodeTypes,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import toast from 'react-hot-toast';

import { useProjectStore } from '../../store/projectStore';
import type { WaterNode, WaterEdge, NodeType } from '../../types/nodes';
import { createNode } from '../../lib/nodeFactory';
import { registerDiagramExport, captureElementPng, captureElementSvg } from '../../lib/diagram-export';
import { SourceNode } from './nodes/SourceNode';
import { UsageNode } from './nodes/UsageNode';
import { SplitNode } from './nodes/SplitNode';
import { TreatmentNode } from './nodes/TreatmentNode';
import { DestinationNode } from './nodes/DestinationNode';
import { Droplets } from 'lucide-react';

const NODE_TYPES: NodeTypes = {
  source: SourceNode,
  usage: UsageNode,
  split_loss: SplitNode,
  split_classify: SplitNode,
  treatment_unit: TreatmentNode,
  final_destination: DestinationNode,
};

function toRFNode(wn: WaterNode): Node<WaterNode & Record<string, unknown>> {
  return { id: wn.id, type: wn.type, position: wn.position, data: wn as WaterNode & Record<string, unknown> };
}

function toRFEdge(we: WaterEdge): Edge<WaterEdge & Record<string, unknown>> {
  const isReuse = we.isReuse ?? false;
  const label =
    we.flow !== undefined && we.flow > 0
      ? `${we.flow.toFixed(2)}`
      : we.rule.type === 'percentage'
      ? `${we.rule.value}%`
      : `${we.rule.value}`;

  return {
    id: we.id,
    source: we.source,
    target: we.target,
    data: we as WaterEdge & Record<string, unknown>,
    label,
    labelStyle: { fontSize: 10, fill: '#374151' },
    labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.85 },
    labelBgPadding: [4, 2],
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: isReuse ? '#16a34a' : '#374151',
    },
    style: isReuse
      ? { stroke: '#16a34a', strokeDasharray: '6 3', strokeWidth: 2 }
      : { stroke: '#374151', strokeWidth: 1.5 },
    animated: isReuse,
  };
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="text-center space-y-3 opacity-60">
        <Droplets size={48} className="mx-auto text-blue-300" />
        <div>
          <p className="text-base font-semibold text-gray-400">Kanvas kosong</p>
          <p className="text-sm text-gray-400 mt-1">
            Seret node dari panel kiri untuk memulai neraca air
          </p>
        </div>
      </div>
    </div>
  );
}

function FlowCanvasInner() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const {
    project,
    projectVersion,
    addNode,
    updateNode,
    removeNode,
    addEdge: storeAddEdge,
    removeEdge,
    selectNode,
    selectEdge,
    selectedNodeId,
    selectedEdgeId,
  } = useProjectStore();

  const [rfNodes, setRfNodes, onRFNodesChange] = useNodesState<Node<WaterNode & Record<string, unknown>>>([]);
  const [rfEdges, setRfEdges, onRFEdgesChange] = useEdgesState<Edge<WaterEdge & Record<string, unknown>>>([]);

  // Sync store nodes → RF (handles add/remove/data update)
  useEffect(() => {
    setRfNodes((prev) =>
      project.nodes.map((wn) => {
        const existing = prev.find((n) => n.id === wn.id);
        return existing
          ? { ...existing, data: wn as WaterNode & Record<string, unknown>, selected: wn.id === selectedNodeId }
          : toRFNode(wn);
      })
    );
  }, [project.nodes, selectedNodeId, setRfNodes]);

  // Sync store edges → RF
  useEffect(() => {
    setRfEdges(project.edges.map(toRFEdge));
  }, [project.edges, setRfEdges]);

  // fitView setelah project di-load/reset (projectVersion berubah)
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ duration: 400, padding: 0.2 });
    }, 50);
    return () => clearTimeout(timer);
  }, [projectVersion, fitView]);

  // Register diagram export handlers
  useEffect(() => {
    const { projectName, date } = project.meta;
    const safeName = projectName.replace(/[^a-zA-Z0-9\-_]/g, '-');
    registerDiagramExport({
      png: async () => {
        fitView({ duration: 0, padding: 0.2 });
        await new Promise((r) => setTimeout(r, 200));
        const el = wrapperRef.current?.querySelector('.react-flow') as HTMLElement | null;
        if (!el) return;
        await captureElementPng(el, `neraca-air-${safeName}-${date}.png`);
      },
      svg: async () => {
        fitView({ duration: 0, padding: 0.2 });
        await new Promise((r) => setTimeout(r, 200));
        const el = wrapperRef.current?.querySelector('.react-flow') as HTMLElement | null;
        if (!el) return;
        await captureElementSvg(el, `neraca-air-${safeName}-${date}.svg`);
      },
    });
  }, [fitView, project.meta.projectName, project.meta.date]);

  // RF node changes → store
  const handleNodesChange = useCallback(
    (changes: NodeChange<Node<WaterNode & Record<string, unknown>>>[]) => {
      onRFNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.dragging === false && change.position) {
          updateNode(change.id, { position: change.position });
        }
        if (change.type === 'remove') {
          removeNode(change.id);
          toast('Node dihapus');
        }
        if (change.type === 'select') {
          if (change.selected) selectNode(change.id);
          else if (selectedNodeId === change.id) selectNode(null);
        }
      });
    },
    [onRFNodesChange, updateNode, removeNode, selectNode, selectedNodeId]
  );

  // RF edge changes → store
  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge<WaterEdge & Record<string, unknown>>>[]) => {
      onRFEdgesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'remove') {
          removeEdge(change.id);
        }
        if (change.type === 'select') {
          if (change.selected) selectEdge(change.id);
          else if (selectedEdgeId === change.id) selectEdge(null);
        }
      });
    },
    [onRFEdgesChange, removeEdge, selectEdge, selectedEdgeId]
  );

  // Connect dua node
  const handleConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      if (params.source === params.target) {
        toast.error('Tidak bisa menghubungkan node ke dirinya sendiri');
        return;
      }
      const newEdge: WaterEdge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        rule: { type: 'percentage', value: 100 },
        isReuse: false,
        flow: 0,
      };
      storeAddEdge(newEdge);
      setRfEdges((prev) => addEdge(toRFEdge(newEdge), prev));
      toast.success('Koneksi ditambahkan');
    },
    [storeAddEdge, setRfEdges]
  );

  // Drag-drop dari NodePalette
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!nodeType) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newNode = createNode(nodeType, position);
      addNode(newNode);
      toast.success(`${newNode.label} ditambahkan`);
    },
    [screenToFlowPosition, addNode]
  );

  const isEmpty = project.nodes.length === 0;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isEmpty && <EmptyState />}
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Delete', 'Backspace']}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 1.5 },
        }}
      >
        <Background color="#e5e7eb" gap={20} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const type = node.type as NodeType | undefined;
            const colors: Record<string, string> = {
              source: '#3b82f6',
              usage: '#6b7280',
              split_loss: '#f59e0b',
              split_classify: '#8b5cf6',
              treatment_unit: '#a855f7',
              final_destination: '#1d4ed8',
            };
            return type ? (colors[type] ?? '#9ca3af') : '#9ca3af';
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}

export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner />
    </ReactFlowProvider>
  );
}
