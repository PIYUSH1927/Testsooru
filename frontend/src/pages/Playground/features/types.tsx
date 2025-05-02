// features/types.tsx
export interface Point {
  x: number;
  z: number;
}

export interface Room {
  id: string;
  room_type: string;
  area: number;
  height: number;
  width: number;
  floor_polygon: Point[];
  is_regular?: number;
}

export interface Label {
  id: string;
  text: string;
  position: Point;
  fontSize?: number;
  color?: string;
}

export interface FloorPlanData {
  room_count: number;
  total_area: number;
  room_types: string[];
  rooms: Room[];
  labels?: Label[];
}

export interface DragState {
  active: boolean;
  roomId: string | null;
  roomIds: string[];
  vertexIndex: number | null;
  edgeIndices: number[] | null;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  isResizing: boolean;
  isEdgeResizing: boolean;
  isGroupOperation: boolean;
  initialPolygons?: Record<string, Point[]>;
}

export interface VisualizationOptions {
  showMeasurements: boolean;
  showRoomLabels: boolean;
  showGrid: boolean;
  wallThickness: number;
  colorScheme: "standard" | "monochrome" | "pastel" | "contrast";
  darkMode?: boolean;
}

export type ActiveTool =
  | "design"
  | "build"
  | "project"
  | "info"
  | "objects"
  | "styleboards"
  | "exports"
  | "help"
  | "colors";
export type BuildTool =
  | "drawRoom"
  | "drawWall"
  | "placeDoors"
  | "placeWindows"
  | null;

export interface FloorPlanContextType {
  floorPlanData: FloorPlanData;
  setFloorPlanData: React.Dispatch<React.SetStateAction<FloorPlanData>>;

  visualizationOptions: VisualizationOptions;
  setVisualizationOptions: React.Dispatch<
    React.SetStateAction<VisualizationOptions>
  >;

  activeTool: ActiveTool;
  setActiveTool: React.Dispatch<React.SetStateAction<ActiveTool>>;

  activeBuildTool: BuildTool;
  setActiveBuildTool: React.Dispatch<React.SetStateAction<BuildTool>>;

  isDrawingActive: boolean;
  setIsDrawingActive: React.Dispatch<React.SetStateAction<boolean>>;
}
