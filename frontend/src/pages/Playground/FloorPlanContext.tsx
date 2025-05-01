import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { initialFloorPlanData } from './features/initialData';
import { FloorPlanData, BuildTool } from './features/types';

export interface VisualizationOptions {
  showMeasurements: boolean;
  showRoomLabels: boolean;
  showGrid: boolean;
  darkMode: boolean;
  wallThickness: number;
  colorScheme: 'standard' | 'monochrome' | 'pastel' | 'contrast';
}

interface FloorPlanContextType {
  visualizationOptions: VisualizationOptions;
  updateVisualizationOption: <K extends keyof VisualizationOptions>(
    option: K,
    value: VisualizationOptions[K]
  ) => void;
  resetVisualizationOptions: () => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  floorPlanData: FloorPlanData;
  setFloorPlanData: React.Dispatch<React.SetStateAction<FloorPlanData>>;
  activeBuildTool: BuildTool;
  setActiveBuildTool: React.Dispatch<React.SetStateAction<BuildTool>>;
  isDrawingActive: boolean;
  setIsDrawingActive: React.Dispatch<React.SetStateAction<boolean>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  setPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  defaultScale: number;
  isZoomingDisabled: boolean;
}

export const defaultVisualizationOptions: VisualizationOptions = {
  showMeasurements: true,
  showRoomLabels: true,
  showGrid: false,
  darkMode: false,
  wallThickness: 5,
  colorScheme: 'standard',
};

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(undefined);

export const FloorPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visualizationOptions, setVisualizationOptions] = useState<VisualizationOptions>(
    defaultVisualizationOptions
  );
  const [activeTool, setActiveTool] = useState<string>('design');
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData>(initialFloorPlanData);
  const [activeBuildTool, setActiveBuildTool] = useState<BuildTool>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  
  const defaultScale = window.innerWidth < 850 ? 1.6 : 2.5;
  
  const [scale, setScale] = useState(defaultScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const isZoomingDisabled = activeBuildTool !== null;

  const updateVisualizationOption = <K extends keyof VisualizationOptions>(
    option: K,
    value: VisualizationOptions[K]
  ) => {
    setVisualizationOptions((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const resetVisualizationOptions = () => {
    setVisualizationOptions(defaultVisualizationOptions);
  };

  useEffect(() => {
    if (activeBuildTool) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [activeBuildTool, defaultScale]);

  useEffect(() => {
    const handleResize = () => {
      const newDefaultScale = window.innerWidth < 850 ? 1.6 : 2.5;
      if (activeBuildTool) {
        setScale(newDefaultScale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeBuildTool]);

  return (
    <FloorPlanContext.Provider
      value={{
        visualizationOptions,
        updateVisualizationOption,
        resetVisualizationOptions,
        activeTool,
        setActiveTool,
        floorPlanData,
        setFloorPlanData,
        activeBuildTool,
        setActiveBuildTool,
        isDrawingActive,
        setIsDrawingActive,
        scale,
        setScale,
        position,
        setPosition,
        defaultScale,
        isZoomingDisabled
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (context === undefined) {
    throw new Error('useFloorPlan must be used within a FloorPlanProvider');
  }
  return context;
};