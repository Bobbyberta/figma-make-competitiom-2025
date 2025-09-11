import { useState } from 'react';
import { ScrollArea } from './components/ui/scroll-area';
import { ReactionDiffusion } from './components/ReactionDiffusion';
import { ControlPanel } from './components/ControlPanel';
import { useResponsiveCanvas } from './hooks/useResponsiveCanvas';
import { SimulationParams } from './types/simulation';

export default function App() {
  const { dimensions, isMobile } = useResponsiveCanvas();
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const [params, setParams] = useState<SimulationParams>({
    pattern: 'coral',
    colorScheme: 'classic',
    feedRate: 0.060,
    killRate: 0.055,
    diffusionA: 1.1,
    diffusionB: 0.6,
    resolution: 'high',
    animationDuration: 5 // 5 seconds default
  });

  const handleReset = () => {
    setResetTrigger(prev => prev + 1);
  };

  if (isMobile) {
    // Mobile layout: Stacked vertical
    return (
      <div className="min-h-screen bg-background p-4 space-y-4 min-w-0 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex flex-col items-center justify-center">
          <ReactionDiffusion
            params={params}
            dimensions={dimensions}
            resetTrigger={resetTrigger}
          />
        </div>
        
        {/* Controls Area */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <ControlPanel
            params={params}
            onParamsChange={setParams}
            onReset={handleReset}
          />
        </ScrollArea>
      </div>
    );
  }

  // Desktop layout: Sidebar
  return (
    <div className="h-screen flex min-w-0 overflow-hidden">
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 overflow-hidden">
        <ReactionDiffusion
          params={params}
          dimensions={dimensions}
          resetTrigger={resetTrigger}
        />
      </div>
      
      {/* Sidebar */}
      <div className="w-96 h-screen border-l border-border bg-card/50">
        <ScrollArea className="h-screen">
          <ControlPanel
            params={params}
            onParamsChange={setParams}
            onReset={handleReset}
          />
        </ScrollArea>
      </div>
    </div>
  );
}