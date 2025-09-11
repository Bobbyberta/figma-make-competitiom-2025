import React, { useState, useCallback, useRef } from 'react';
import { FractalCanvas } from './components/FractalCanvas';
import { ConfigPanel } from './components/ConfigPanel';
import { MobileControls } from './components/MobileControls';

import { FractalAnimator } from './components/FractalAnimator';
import { FractalConfig, FractalVariation, DEFAULT_CONFIG } from './components/types/FractalTypes';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Button } from './components/ui/button';

import { useIsMobile } from './components/ui/use-mobile';

export default function App() {
  const [config, setConfig] = useState<FractalConfig>(DEFAULT_CONFIG);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  const handleConfigChange = useCallback((newConfig: Partial<FractalConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleVariationLoad = useCallback((variation: FractalVariation) => {
    setConfig(prev => ({ ...prev, ...variation.config }));
    setShowMobileSettings(false);
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);



  const toggleMobileSettings = useCallback(() => {
    setShowMobileSettings(prev => !prev);
  }, []);

  // Calculate responsive canvas dimensions
  const getCanvasDimensions = () => {
    if (isMobile) {
      return {
        width: Math.min(window.innerWidth - 32, 400),
        height: Math.min(window.innerHeight - 200, 400)
      };
    }
    return {
      width: Math.min(window.innerWidth - 400, 800),
      height: Math.min(window.innerHeight - 100, 600)
    };
  };

  const { width: canvasWidth, height: canvasHeight } = getCanvasDimensions();

  return (
    <div className="min-h-screen bg-background">
      <FractalAnimator config={config} onConfigChange={handleConfigChange} />
      
      {isMobile ? (
        // Mobile Layout
        <div className="flex flex-col p-4 gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 pt-1">Fractal Explorer</h1>
            <p className="text-muted-foreground text-sm">
              Drag to pan • Pinch to zoom • Tap controls below
            </p>
          </div>
          
          <div className="flex justify-center">
            <FractalCanvas
              config={config}
              onConfigChange={handleConfigChange}
              width={canvasWidth}
              height={canvasHeight}
            />
          </div>
          
          <MobileControls
            config={config}
            onConfigChange={handleConfigChange}
            onReset={handleReset}
            onToggleSettings={toggleMobileSettings}
          />
          
          <Sheet open={showMobileSettings} onOpenChange={setShowMobileSettings}>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Fractal Configuration</SheetTitle>
                <SheetDescription>
                  Customize fractal parameters, colors, and animation settings
                </SheetDescription>
              </SheetHeader>
              <ConfigPanel
                config={config}
                onConfigChange={handleConfigChange}
                onVariationLoad={handleVariationLoad}
                onReset={handleReset}
              />
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        // Desktop Layout
        <div className="flex h-screen">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold mb-2 pt-1">Fractal Explorer</h1>
              <p className="text-muted-foreground">
                Explore the infinite beauty of mathematical fractals
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Click and drag to pan • Scroll to zoom • Use controls to customize
              </p>
            </div>
            
            <FractalCanvas
              config={config}
              onConfigChange={handleConfigChange}
              width={canvasWidth}
              height={canvasHeight}
            />
          </div>
          
          <div className="w-80 border-l border-border bg-muted/20">

            <ConfigPanel
              config={config}
              onConfigChange={handleConfigChange}
              onVariationLoad={handleVariationLoad}
              onReset={handleReset}
            />
          </div>
        </div>
      )}
      

    </div>
  );
}