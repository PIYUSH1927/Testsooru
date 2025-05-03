import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { initialFloorPlanData } from "./features/initialData";
import { FloorPlanData, BuildTool, Point, Label } from "./features/types";
import { saveFloorPlan } from "./features/save";

export interface VisualizationOptions {
  showMeasurements: boolean;
  showRoomLabels: boolean;
  showGrid: boolean;
  darkMode: boolean;
  wallThickness: number;
  colorScheme: "standard" | "monochrome" | "pastel" | "contrast";
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
  hasChanges: boolean;
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>;
  roomRotations: { [key: string]: number };
  setRoomRotations: React.Dispatch<
    React.SetStateAction<{ [key: string]: number }>
  >;
  handleRoomTypeUpdate: (roomId: string, newRoomType: string) => void;
  saveFloorPlanChanges: () => void;
  resetFloorPlanChanges: () => void;
  addLabel: (text: string, position: Point) => void;
}

export const defaultVisualizationOptions: VisualizationOptions = {
  showMeasurements: true,
  showRoomLabels: true,
  showGrid: false,
  darkMode: false,
  wallThickness: 5,
  colorScheme: "standard",
};

const FloorPlanContext = createContext<FloorPlanContextType | undefined>(
  undefined
);

export const FloorPlanProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [visualizationOptions, setVisualizationOptions] =
    useState<VisualizationOptions>(defaultVisualizationOptions);
  const [activeTool, setActiveTool] = useState<string>("design");
  const [floorPlanData, setFloorPlanData] =
    useState<FloorPlanData>(initialFloorPlanData);
  const [activeBuildTool, setActiveBuildTool] = useState<BuildTool>(null);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [roomRotations, setRoomRotations] = useState<{ [key: string]: number }>(
    {}
  );

  const [originalFloorPlanData, setOriginalFloorPlanData] =
    useState<FloorPlanData>(initialFloorPlanData);

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

  const handleRoomTypeUpdate = useCallback(
    (roomId: string, newRoomType: string) => {
      setFloorPlanData((prevData) => {
        if (!hasChanges) {
          setOriginalFloorPlanData(JSON.parse(JSON.stringify(prevData)));
        }

        const updatedRooms = prevData.rooms.map((room) =>
          room.id === roomId ? { ...room, room_type: newRoomType } : { ...room }
        );

        const newData = {
          ...prevData,
          rooms: updatedRooms,
        };

        setHasChanges(true);
        return newData;
      });
    },
    [hasChanges]
  );

  const addLabel = useCallback(
    (text: string, position: Point) => {
      setFloorPlanData((prevData) => {
        if (!hasChanges) {
          setOriginalFloorPlanData(JSON.parse(JSON.stringify(prevData)));
        }

        const labels = prevData.labels || [];

        const newLabel: Label = {
          id: `label-${Date.now()}`,
          text,
          position,
          fontSize: 12,
          color: "#000000",
        };

        const newData = {
          ...prevData,
          labels: [...labels, newLabel],
        };

        setHasChanges(true);
        return newData;
      });
    },
    [hasChanges]
  );

  const saveFloorPlanChanges = useCallback(() => {
    saveFloorPlan(floorPlanData, roomRotations, setHasChanges);
    setOriginalFloorPlanData(JSON.parse(JSON.stringify(floorPlanData)));
  }, [floorPlanData, roomRotations]);

  const resetFloorPlanChanges = useCallback(() => {
    setFloorPlanData(JSON.parse(JSON.stringify(originalFloorPlanData)));
    setHasChanges(false);
  }, [originalFloorPlanData]);

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

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
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
        isZoomingDisabled,
        hasChanges,
        setHasChanges,
        roomRotations,
        setRoomRotations,
        handleRoomTypeUpdate,
        saveFloorPlanChanges,
        resetFloorPlanChanges,
        addLabel,
      }}
    >
      {children}
    </FloorPlanContext.Provider>
  );
};

export const useFloorPlan = () => {
  const context = useContext(FloorPlanContext);
  if (context === undefined) {
    throw new Error("useFloorPlan must be used within a FloorPlanProvider");
  }
  return context;
};
