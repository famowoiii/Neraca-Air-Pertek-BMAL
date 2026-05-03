import { Toaster } from 'react-hot-toast';
import { Toolbar } from './components/toolbar/Toolbar';
import { NodePalette } from './components/sidebar/NodePalette';
import { ProjectInfoPanel } from './components/sidebar/ProjectInfoPanel';
import { FlowCanvas } from './components/canvas/FlowCanvas';
import { PropertyPanel } from './components/sidebar/PropertyPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { useAutoCalculate } from './lib/useCalculation';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppInner() {
  useAutoCalculate();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toolbar />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 border-r bg-white overflow-y-auto flex-shrink-0">
          <Tabs defaultValue="palette">
            <TabsList className="w-full rounded-none border-b h-8">
              <TabsTrigger value="palette" className="flex-1 text-xs">Node</TabsTrigger>
              <TabsTrigger value="project" className="flex-1 text-xs">Proyek</TabsTrigger>
            </TabsList>
            <TabsContent value="palette" className="mt-0">
              <NodePalette />
            </TabsContent>
            <TabsContent value="project" className="mt-0">
              <ProjectInfoPanel />
            </TabsContent>
          </Tabs>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <FlowCanvas />
        </main>

        <aside className="w-56 border-l bg-white overflow-y-auto flex-shrink-0">
          <div className="p-2 border-b h-8 flex items-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Properti
            </span>
          </div>
          <PropertyPanel />
        </aside>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{ style: { fontSize: '13px' } }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
