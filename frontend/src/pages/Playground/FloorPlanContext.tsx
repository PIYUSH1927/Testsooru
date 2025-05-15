import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
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
  captureOriginalState: () => void;
  selectedRoomIds: string[];
  setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>;
  openProjectPanel: (roomId: string) => void;
  drawingWallWidth: number;
  setDrawingWallWidth: React.Dispatch<React.SetStateAction<number>>;
  updateLabel: (labelId: string, updates: Partial<Label>) => void;
}

export const defaultVisualizationOptions: VisualizationOptions = {
  showMeasurements: true,
  showRoomLabels: true,
  showGrid: true,
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

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [drawingWallWidth, setDrawingWallWidth] = useState<number>(5);

  const originalFloorPlanDataRef = useRef<FloorPlanData>(JSON.parse(JSON.stringify(initialFloorPlanData)));
  const originalRoomRotationsRef = useRef<{ [key: string]: number }>({});
  const hasStoredOriginal = useRef<boolean>(false);

  const defaultScale = window.innerWidth < 850 ? 1.6 : 2.5;

  const [scale, setScale] = useState(defaultScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [isZoomingDisabled, setIsZoomingDisabled] = useState(false);

  const openProjectPanel = useCallback((roomId: string) => {
    setSelectedRoomIds([roomId]);
    setActiveTool("project");
  }, []);

  const captureOriginalState = useCallback(() => {
    originalFloorPlanDataRef.current = JSON.parse(JSON.stringify(floorPlanData));
    originalRoomRotationsRef.current = JSON.parse(JSON.stringify(roomRotations));
    hasStoredOriginal.current = true;
  }, [floorPlanData, roomRotations]);


  useEffect(() => {
    if (!hasStoredOriginal.current) {
      captureOriginalState();
    }
  }, [captureOriginalState]);

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
      if (!hasChanges) {
        captureOriginalState();
      }

      setFloorPlanData((prevData) => {
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
    [hasChanges, captureOriginalState]
  );

  const addLabel = useCallback(
    (text: string, position: Point) => {
      if (!hasChanges) {
        captureOriginalState();
      }

      setFloorPlanData((prevData) => {
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
    [hasChanges, captureOriginalState]
  );

  const saveFloorPlanChanges = useCallback(() => {
    saveFloorPlan(floorPlanData, roomRotations, setHasChanges);
    originalFloorPlanDataRef.current = JSON.parse(JSON.stringify(floorPlanData));
    originalRoomRotationsRef.current = { ...roomRotations };
  }, [floorPlanData, roomRotations]);

  const resetFloorPlanChanges = useCallback(() => {
    const resetData = JSON.parse(JSON.stringify(originalFloorPlanDataRef.current));
    const resetRotations = { ...originalRoomRotationsRef.current };
    setFloorPlanData(resetData);
    setRoomRotations(resetRotations);
    setHasChanges(false);

    setTimeout(() => {
      const event = new CustomEvent('floorPlanReset', { detail: resetData });
      window.dispatchEvent(event);
    }, 0);
    
  }, []);

  const updateLabel = useCallback(
  (labelId: string, updates: Partial<Label>) => {
    if (!hasChanges) {
      captureOriginalState();
    }

    setFloorPlanData((prevData) => {
      const updatedLabels = (prevData.labels || []).map((label) =>
        label.id === labelId ? { ...label, ...updates } : label
      );

      const newData = {
        ...prevData,
        labels: updatedLabels,
      };

      setHasChanges(true);
      return newData;
    });
  },
  [hasChanges, captureOriginalState]
);

  useEffect(() => {
    if (activeTool !== "design" && activeTool !== "project" && activeTool !== "") {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomingDisabled(true);
    } else {
      setIsZoomingDisabled(false);
    }
  }, [activeTool]); 
  

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
        captureOriginalState,
        selectedRoomIds,
        setSelectedRoomIds,
        openProjectPanel,
        drawingWallWidth,
        setDrawingWallWidth,
        updateLabel,
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