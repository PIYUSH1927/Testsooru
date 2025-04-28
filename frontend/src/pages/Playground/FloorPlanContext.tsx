import React, { createContext, useState, useContext, ReactNode } from 'react';
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
        setIsDrawingActive
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