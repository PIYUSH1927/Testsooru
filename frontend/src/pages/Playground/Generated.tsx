import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./Generated.css";
import ReactDOM from "react-dom";
import {
  renderOverlapAlert,
  getOverlappingRoomNames,
  isRoomOverlapping,
} from "./features/warning";
import {
  handleMouseDown,
  handleVertexMouseDown,
  handleTouchStart,
  handleVertexTouchStart,
  handleEdgeMouseDown,
  handleEdgeTouchStart,
  renderEdgeHandles,
} from "./features/resizing";

import { handleUndoChanges } from "./features/undo1";
import {
  calculateRoomCentroid,
  calculateRoomArea,
  calculateRoomDimensions,
} from "./features/roomCalculations";
import {
  calculateBounds,
  useCoordinateTransforms,
} from "./features/coordinates";
import { roomColors, floorPlanStyles, wallStyles } from "./features/styles";
import { useInterval } from "./features/intervalHooks";
import {
  useEventHandlers,
  handleRoomSelection,
  getLabelPlacementState,
  setLabelPlacementState,
  getInfoToolPanelState,
} from "./features/eventHandlers";
import { saveFloorPlan } from "./features/save";
import { initialFloorPlanData } from "./features/initialData";
import {
  handleRotateRoom,
  checkAndUpdateOverlaps as checkRoomOverlaps,
} from "./features/rotation";
import { useSimpleUndoHistory, useUndoShortcut } from "./features/history";
import { useFloorPlan } from "./FloorPlanContext";
import WallDrawingTool from "./components/WallDrawingTool";
import RoomDrawingTool from "./components/RoomDrawingTool";
import {
  generateUniqueId,
  createWallPolygon,
  generateRoomPolygon,
} from "./features/drawingTools";
import {
  Point,
  Room,
  FloorPlanData,
  DragState,
  VisualizationOptions,
} from "./features/types";

export default function InteractiveFloorPlan({
  rotation = 0,
  visualizationOptions = {
    showMeasurements: true,
    showRoomLabels: true,
    wallThickness: 5,
    colorScheme: "standard" as const,
  },
}: {
  rotation?: number;
  visualizationOptions?: Partial<VisualizationOptions>;
}) {
  const {
    floorPlanData: contextFloorPlanData,
    setFloorPlanData: setContextFloorPlanData,
    activeBuildTool,
    isDrawingActive,
    setIsDrawingActive,
    handleRoomTypeUpdate,
    addLabel,
  } = useFloorPlan();

  const options: VisualizationOptions = {
    showMeasurements: true,
    showRoomLabels: true,
    showGrid: true,
    wallThickness: 5,
    colorScheme: "standard",
    ...visualizationOptions,
  };

  const [hasChanges, setHasChanges] = useState(false);
  const [leftPosition, setLeftPosition] = useState("10%");
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData>(
    contextFloorPlanData || initialFloorPlanData
  );
  const [roomRotations, setRoomRotations] = useState<{ [key: string]: number }>(
    {}
  );

  const tlength = 15;
  const twidth = 10;

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [scale, setScale] = useState(window.innerWidth < 850 ? 1.6 : 2.5);
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [isLabelPlacementMode, setIsLabelPlacementMode] = useState(false);

  const [overlappingRooms, setOverlappingRooms] = useState<string[][]>([]);

  const [dragState, setDragState] = useState<DragState>({
    active: false,
    roomId: null,
    roomIds: [],
    vertexIndex: null,
    edgeIndices: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    isResizing: false,
    isEdgeResizing: false,
    isGroupOperation: false,
  });

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current && contextFloorPlanData) {
      setFloorPlanData(contextFloorPlanData);
      isInitialMount.current = false;
    }
  }, [contextFloorPlanData]);

  useEffect(() => {
    if (selectedRoomIds.length === 1) {
      setSelectedRoomId(selectedRoomIds[0]);
    } else if (selectedRoomIds.length === 0) {
      setSelectedRoomId(null);
    }
  }, [selectedRoomIds]);

  const { saveState, undo, hasUndoState } = useSimpleUndoHistory();

  const handleUndo = useCallback(() => {
    undo((state) => {
      if (state) {
        const undoData = JSON.parse(JSON.stringify(state.floorPlanData));
        const undoRotations = JSON.parse(JSON.stringify(state.roomRotations));

        setFloorPlanData(state.floorPlanData);
        setRoomRotations(state.roomRotations);
      }
    });
  }, [undo]);

  useUndoShortcut(handleUndo);

  const isCapturingState = useRef(false);

  const captureStateBeforeChange = () => {
    if (!isCapturingState.current) {
      isCapturingState.current = true;
      saveState({
        floorPlanData: JSON.parse(JSON.stringify(floorPlanData)),
        roomRotations: { ...roomRotations },
      });
    }
  };

  useEffect(() => {
    if (!dragState.active) {
      isCapturingState.current = false;
    }
  }, [dragState.active]);

  const handleMouseDownWithHistory = (
    event: React.MouseEvent,
    roomId: string,
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[]
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleMouseDown(
      event,
      roomId,
      svgRef,
      setDragState,
      setHasChanges,
      setSelectedRoomIds,
      selectedRoomIds
    );
  };

  const handleVertexMouseDownWithHistory = (
    event: React.MouseEvent,
    roomId: string,
    vertexIndex: number,
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[],
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleVertexMouseDown(
      event,
      roomId,
      vertexIndex,
      svgRef,
      setDragState,
      setSelectedRoomIds,
      selectedRoomIds,
      setHasChanges,
      floorPlanData
    );
  };

  const handleEdgeMouseDownWithHistory = (
    event: React.MouseEvent,
    roomId: string,
    edgeIndices: number[],
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[],
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleEdgeMouseDown(
      event,
      roomId,
      edgeIndices,
      svgRef,
      setDragState,
      setSelectedRoomIds,
      selectedRoomIds,
      setHasChanges,
      floorPlanData
    );
  };

  const shouldShowRotationIcon = () => {
    const infoPanelState = getInfoToolPanelState();
    return !infoPanelState.isActive;
  };

  const handleTouchStartWithHistory = (
    event: React.TouchEvent,
    roomId: string,
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[]
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleTouchStart(
      event,
      roomId,
      svgRef,
      setDragState,
      setHasChanges,
      setSelectedRoomIds,
      selectedRoomIds
    );
  };

  const handleVertexTouchStartWithHistory = (
    event: React.TouchEvent,
    roomId: string,
    vertexIndex: number,
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[],
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleVertexTouchStart(
      event,
      roomId,
      vertexIndex,
      svgRef,
      setDragState,
      setSelectedRoomIds,
      selectedRoomIds,
      setHasChanges,
      floorPlanData
    );
  };

  const handleEdgeTouchStartWithHistory = (
    event: React.TouchEvent,
    roomId: string,
    edgeIndices: number[],
    svgRef: React.RefObject<SVGSVGElement | null>,
    setDragState: React.Dispatch<React.SetStateAction<DragState>>,
    setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
    selectedRoomIds: string[],
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      return;
    }

    captureStateBeforeChange();

    handleEdgeTouchStart(
      event,
      roomId,
      edgeIndices,
      svgRef,
      setDragState,
      setSelectedRoomIds,
      selectedRoomIds,
      setHasChanges,
      floorPlanData
    );
  };

  const handleRotateRoomWithHistory = (
    roomId: string,
    direction: "left" | "right",
    roomRotations: { [key: string]: number },
    setRoomRotations: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >,
    setHasChanges: React.Dispatch<React.SetStateAction<boolean>>,
    checkAndUpdateOverlaps: () => void
  ) => {
    captureStateBeforeChange();

    handleRotateRoom(
      roomId,
      direction,
      roomRotations,
      setRoomRotations,
      setHasChanges,
      checkAndUpdateOverlaps,
      selectedRoomIds
    );

    setTimeout(() => {
      isCapturingState.current = false;
    }, 10);
  };

  const checkAndUpdateOverlaps = useCallback(() => {
    return checkRoomOverlaps(floorPlanData, roomRotations, setOverlappingRooms);
  }, [floorPlanData, roomRotations]);

  useInterval(() => {
    if (!dragState.active) {
      checkAndUpdateOverlaps();
    }
  }, 300);

  useEffect(() => {
    checkAndUpdateOverlaps();
  }, []);

  useInterval(() => {
    if (!dragState.active) {
      checkAndUpdateOverlaps();
    }
  }, 500);

  const getRoomType = (roomId: string) => {
    const room = floorPlanData.rooms.find((r) => r.id === roomId);
    return room?.room_type;
  };

  useEffect(() => {
    const handleResize = () => {
      setScale(window.innerWidth < 850 ? 1.8 : 2.5);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        !dragState.active &&
        !isDrawingActive &&
        !(activeBuildTool === "drawWall" || activeBuildTool === "drawRoom")
      ) {
        const target = event.target as HTMLElement;

        const isClickInsideRoom = target.closest(".room-polygon");
        const isClickOnRotateButton = target.closest(".rotate-button");
        const isClickOnResizeHandle = target.closest(
          ".resize-handle, .resize-edge"
        );
        const isClickOnToolbar = target.closest(".selection-toolbar");
        const isClickOnLabel = target.closest(".floor-plan-label");

        if (
          !isClickInsideRoom &&
          !isClickOnRotateButton &&
          !isClickOnResizeHandle &&
          !isClickOnToolbar &&
          !isClickOnLabel &&
          selectedRoomIds.length > 0
        ) {
          setSelectedRoomIds([]);
        }

        if (!isClickOnLabel && selectedLabelId !== null) {
          setSelectedLabelId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [
    selectedRoomIds,
    selectedLabelId,
    dragState.active,
    isDrawingActive,
    activeBuildTool,
  ]);

  useEffect(() => {
    if (contextFloorPlanData) {
      setFloorPlanData(contextFloorPlanData);
    }
  }, [contextFloorPlanData]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedRoomIds.length > 0) {
          captureStateBeforeChange();

          setFloorPlanData((prevData) => {
            const updatedRooms = prevData.rooms.filter(
              (room) => !selectedRoomIds.includes(room.id)
            );

            const totalArea = updatedRooms.reduce((sum, room) => {
              if (room.room_type !== "Wall") {
                return sum + room.area;
              }
              return sum;
            }, 0);

            const updatedData = {
              ...prevData,
              rooms: updatedRooms,
              room_count: updatedRooms.length,
              total_area: parseFloat(totalArea.toFixed(2)),
            };

            if (setContextFloorPlanData) {
              setTimeout(() => {
                setContextFloorPlanData(updatedData);
              }, 0);
            }

            return updatedData;
          });

          setSelectedRoomIds([]);
          setSelectedRoomId(null);
          setHasChanges(true);
          checkAndUpdateOverlaps();
        } else if (selectedLabelId) {
          captureStateBeforeChange();

          setFloorPlanData((prevData) => {
            const updatedData = {
              ...prevData,
              labels: prevData.labels
                ? prevData.labels.filter(
                    (label) => label.id !== selectedLabelId
                  )
                : [],
            };

            if (setContextFloorPlanData) {
              setTimeout(() => {
                setContextFloorPlanData(updatedData);
              }, 0);
            }

            return updatedData;
          });

          setSelectedLabelId(null);
          setHasChanges(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedRoomIds,
    selectedLabelId,
    captureStateBeforeChange,
    setContextFloorPlanData,
    checkAndUpdateOverlaps,
  ]);

  const bounds = useMemo(
    () => calculateBounds(floorPlanData.rooms),
    [floorPlanData.rooms]
  );
  const padding = 20;
  const contentWidth = bounds.maxX - bounds.minX + 2 * padding;
  const contentHeight = bounds.maxZ - bounds.minZ + 2 * padding;
  const isMobile = window.innerWidth < 850;

  const { transformCoordinates, reverseTransformCoordinates } =
    useCoordinateTransforms(bounds, padding, scale);

  useEffect(() => {
    const handleFloorPlanClick = (e: MouseEvent) => {
      const labelState = getLabelPlacementState();
      const infoPanelState = getInfoToolPanelState();

      if (
        infoPanelState.isActive &&
        infoPanelState.activeOption === "placeLabel" &&
        labelState.isPlacing &&
        labelState.text
      ) {
        setIsLabelPlacementMode(true);
        if (svgRef.current) {
          const rect = svgRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const floorPlanCoords = reverseTransformCoordinates(x, y);
          captureStateBeforeChange();
          addLabel(labelState.text, floorPlanCoords);

          setHasChanges(true);
          setLabelPlacementState(false, null);

          setIsLabelPlacementMode(false);

          window.dispatchEvent(new CustomEvent("labelPlaced"));

          e.stopPropagation();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("click", handleFloorPlanClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleFloorPlanClick, {
        capture: true,
      });
    };
  }, [reverseTransformCoordinates, addLabel, setHasChanges]);

  useEffect(() => {
    if (floorPlanData && setContextFloorPlanData) {
      setContextFloorPlanData(floorPlanData);
    }
  }, [floorPlanData, setContextFloorPlanData]);

  useEffect(() => {
    if (contextFloorPlanData) {
      setFloorPlanData(contextFloorPlanData);
    }
  }, [contextFloorPlanData, contextFloorPlanData?.labels]);

  useEffect(() => {
    const labelState = getLabelPlacementState();
    setIsLabelPlacementMode(labelState.isPlacing);
  }, [getLabelPlacementState().isPlacing]);

  useEffect(() => {
    if (contextFloorPlanData && floorPlanData) {
      const contextLabelsLength = contextFloorPlanData.labels?.length || 0;
      const currentLabelsLength = floorPlanData.labels?.length || 0;
      if (contextLabelsLength !== currentLabelsLength) {
        setHasChanges(true);
      }
    }
  }, [floorPlanData?.labels, contextFloorPlanData?.labels]);

  const eventHandlers = useEventHandlers(
    dragState,
    svgRef as React.RefObject<SVGSVGElement>,
    scale,
    reverseTransformCoordinates,
    calculateRoomDimensions,
    calculateRoomArea,
    setFloorPlanData,
    setDragState,
    checkAndUpdateOverlaps
  );

  useEffect(() => {
    const updateLeft = () => {
      if (window.innerWidth > 850) {
        setLeftPosition("23%");
      } else {
        setLeftPosition("17.5%");
      }
    };

    updateLeft();
    window.addEventListener("resize", updateLeft);

    return () => window.removeEventListener("resize", updateLeft);
  }, []);

  const getOverlappingRoomNamesHelper = () => {
    return getOverlappingRoomNames(overlappingRooms, getRoomType);
  };

  const rotateAllSelectedRooms = (direction: "left" | "right") => {
    if (selectedRoomIds.length <= 1) return;

    captureStateBeforeChange();
    const newRotations = { ...roomRotations };

    selectedRoomIds.forEach((roomId) => {
      const currentRotation = roomRotations[roomId] || 0;
      const rotationAmount = direction === "right" ? 90 : -90;
      newRotations[roomId] = (currentRotation + rotationAmount) % 360;
    });

    setRoomRotations(newRotations);
    setHasChanges(true);
    checkAndUpdateOverlaps();
  };

  const handleResetChanges = () => {
    const resetData = JSON.parse(JSON.stringify(initialFloorPlanData));

    setFloorPlanData(resetData);
    setSelectedRoomId(null);
    setHasChanges(false);
    setRoomRotations({});
    setSelectedRoomIds([]);

    if (setContextFloorPlanData) {
      setContextFloorPlanData(resetData);
    }
  };

  const handleWallCreated = (wallPoints: Point[]) => {
    captureStateBeforeChange();

    const start = wallPoints[0];
    const end = wallPoints[wallPoints.length - 1];

    const simpleLine = [start, end];

    const newWall: Room = {
      id: generateUniqueId("wall"),
      room_type: "Wall",
      area: 0,
      height: 0,
      width: 0,
      floor_polygon: simpleLine,
    };

    setFloorPlanData((prevData) => {
      const updatedRooms = [...prevData.rooms, newWall];

      return {
        ...prevData,
        rooms: updatedRooms,
        room_count: updatedRooms.length,
        total_area: prevData.total_area,
      };
    });

    setHasChanges(true);
    checkAndUpdateOverlaps();
  };

  const handleRoomCreated = (roomPolygon: Point[]) => {
    captureStateBeforeChange();

    const dimensions = calculateRoomDimensions(roomPolygon);
    const area = calculateRoomArea(roomPolygon);

    const newRoom: Room = {
      id: generateUniqueId("room"),
      room_type: "",
      area: area,
      height: dimensions.height,
      width: dimensions.width,
      floor_polygon: roomPolygon,
      is_regular: 1,
    };

    setFloorPlanData((prevData) => {
      const updatedRooms = [...prevData.rooms, newRoom];
      const totalArea = updatedRooms.reduce((sum, room) => {
        if (room.room_type !== "Wall") {
          return sum + room.area;
        }
        return sum;
      }, 0);

      let updatedRoomTypes = [...prevData.room_types];
      if (!updatedRoomTypes.includes("SecondRoom")) {
        updatedRoomTypes.push("SecondRoom");
      }

      return {
        ...prevData,
        rooms: updatedRooms,
        room_count: updatedRooms.length,
        room_types: updatedRoomTypes,
        total_area: parseFloat(totalArea.toFixed(2)),
      };
    });

    setHasChanges(true);
    checkAndUpdateOverlaps();
  };

  const getRoomColor = (roomType: string) => {
    if (roomType === "Wall") {
      return "black";
    }

    const baseColors = "#D0D0D0";

    switch (options.colorScheme) {
      case "monochrome":
        return "#A3D1FF";

      case "pastel":
        const lightenColor = (color: string) => {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);

          const mixAmount = 0.3;
          const newR = Math.floor(r + (255 - r) * mixAmount);
          const newG = Math.floor(g + (255 - g) * mixAmount);
          const newB = Math.floor(b + (255 - b) * mixAmount);

          return `#${newR.toString(16).padStart(2, "0")}${newG
            .toString(16)
            .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
        };
        return lightenColor(baseColors);

      case "contrast":
        const contrastMap: { [key: string]: string } = {
          LivingRoom: "#FFAAA5",
          Bathroom: "#85C1E9",
          MasterRoom: "#FFD3B6",
          Kitchen: "#D8BFD8",
          SecondRoom: "#F6D55C",
          ChildRoom: "#D5AAFF",
          DiningRoom: "#A5D6A7",
          Balcony: "#B2DFDB",
          Wall: "#333333",
        };
        return contrastMap[roomType] || "#E8E8E8";
      default:
        return baseColors;
    }
  };

  const edgeStyles = `
    .resize-edge {
      cursor: move;
      stroke-opacity: 0;
      stroke-width: ${options.wallThickness}px;
    }
    
    .resize-edge:hover + .edge-indicator, 
    .resize-edge:active + .edge-indicator {
      stroke: #2196F3;
      stroke-opacity: 0.7;
      stroke-width: ${options.wallThickness}px;
    }
    
    .edge-indicator {
      stroke-opacity: 0;
      transition: stroke-opacity 0.2s;
      stroke-width: ${options.wallThickness}px;
    }
    
    .resize-edge:hover + .edge-indicator, 
    .resize-edge:active + .edge-indicator {
      stroke-opacity: 1;
    }

    .room-polygon.primary-selection {
      stroke-width: ${options.wallThickness}px;
    }
  
    .room-polygon.secondary-selection {
      stroke-width: ${options.wallThickness * 0.75}px;
    }
  
    .room-polygon.overlapping {
      stroke-width: ${options.wallThickness}px;
    }
   .room-polygon.disable-interaction {
    pointer-events: none;
  }
  
  .floor-plan-label {
    z-index: 1000;
  }
`;
  const coordinateSystem = useMemo(
    () => (
      <g className="coordinate-system">
        <circle
          cx={padding * scale}
          cy={contentHeight * scale - padding * scale}
          r="6"
          fill="red"
          stroke="black"
          strokeWidth="1"
        />
        <text
          x={padding * scale + 10}
          y={contentHeight * scale - padding * scale + 5}
          fontSize="12"
          fill="black"
          fontWeight="bold"
        >
          Origin (0,0)
        </text>

        <line
          x1={padding * scale}
          y1={contentHeight * scale - padding * scale}
          x2={(contentWidth * scale) / 2 + 50}
          y2={contentHeight * scale - padding * scale}
          stroke="red"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <text
          x={(contentWidth * scale) / 3}
          y={contentHeight * scale - padding * scale + 14}
          fontSize="10"
          fill="red"
          fontWeight="bold"
        >
          X-Axis
        </text>

        <line
          x1={padding * scale}
          y1={contentHeight * scale - padding * scale}
          x2={padding * scale}
          y2={(contentHeight * scale) / 2 - 50}
          stroke="blue"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />
        <text
          x={padding * scale - 40}
          y={(contentHeight * scale) / 2 + 22}
          fontSize="10"
          fill="blue"
          fontWeight="bold"
          transform={`
          rotate(
            -90,
            ${
              transformCoordinates({
                x: bounds.minX - 12,
                z: (bounds.minZ + bounds.maxZ) / 2,
              }).x
            },
            ${
              transformCoordinates({
                x: bounds.minX - 12,
                z: (bounds.minZ + bounds.maxZ) / 2,
              }).y
            }
          )
        `}
        >
          Z-Axis
        </text>
      </g>
    ),
    [bounds, contentHeight, contentWidth, padding, scale, transformCoordinates]
  );

  const handleSaveFloorPlan = useCallback(() => {
    saveFloorPlan(floorPlanData, roomRotations, setHasChanges);

    if (setContextFloorPlanData) {
      setContextFloorPlanData(floorPlanData);
    }
  }, [floorPlanData, roomRotations, setContextFloorPlanData]);

  return (
    <div className={`generated-container`}>
      {renderOverlapAlert({
        overlappingRooms,
        getOverlappingRoomNames: getOverlappingRoomNamesHelper,
      })}

      <div>
        <style>{floorPlanStyles}</style>
        <style>{edgeStyles}</style>
        <style>{wallStyles}</style>

        <div
          ref={floorPlanRef}
          className="floor-plan-container"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: isMobile
              ? "translate(-50%, -50%)"
              : "translate(-50%, -50%)",
            width: `${contentWidth * scale}px`,
            height: `${contentHeight * scale}px`,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {options.showMeasurements && (
            <p
              style={{
                position: "absolute",
                top: "0px",
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                marginBottom: "-25px",
                color: "#000",
                fontSize: "small",
                width: "100%",
              }}
              className="always-black-text"
            >
              <b>Total Area:</b> {floorPlanData.total_area.toFixed(2)} m²
              &nbsp;|&nbsp; <b>Total Rooms:</b> {floorPlanData.room_count}
              {hasUndoState && !isMobile && (
                <span
                  style={{
                    fontSize: "0.8em",
                    marginLeft: "10px",
                    color: "#666",
                  }}
                >
                  (Ctrl/Cmd+Z to undo last change)
                </span>
              )}
            </p>
          )}

          <svg
            width="100%"
            height="100%"
            ref={svgRef}
            style={{
              touchAction: "none",
              backgroundColor: "transparent",
            }}
          >
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 0 0 L 10 5 L 0 10 Z" fill={"black"} />
              </marker>

              <marker
                id="arrow1"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M 10 0 L 0 5 L 10 10 Z" fill={"black"} />
              </marker>
            </defs>

            {coordinateSystem}

            {options.showMeasurements && (
              <>
                <line
                  x1={
                    transformCoordinates({
                      x: bounds.minX - 10,
                      z: bounds.minZ,
                    }).x + 4
                  }
                  y1={
                    transformCoordinates({ x: bounds.minX, z: bounds.minZ }).y +
                    10
                  }
                  x2={
                    transformCoordinates({
                      x: bounds.minX - 10,
                      z: bounds.maxZ,
                    }).x + 4
                  }
                  y2={
                    transformCoordinates({ x: bounds.minX, z: bounds.maxZ }).y +
                    10
                  }
                  stroke={"black"}
                  strokeWidth="1"
                  markerStart="url(#arrow1)"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={
                    transformCoordinates({
                      x: bounds.minX - 10,
                      z: (bounds.minZ + bounds.maxZ) / 2,
                    }).x
                  }
                  y={
                    transformCoordinates({
                      x: bounds.minX,
                      z: (bounds.minZ + bounds.maxZ) / 2,
                    }).y
                  }
                  fontSize="11"
                  fill={"black"}
                  textAnchor="middle"
                  transform={`
                    rotate(
                      -90,
                      ${
                        transformCoordinates({
                          x: bounds.minX - 12,
                          z: (bounds.minZ + bounds.maxZ) / 2,
                        }).x
                      },
                      ${
                        transformCoordinates({
                          x: bounds.minX - 12,
                          z: (bounds.minZ + bounds.maxZ) / 2,
                        }).y
                      }
                    )
                  `}
                >
                  {tlength} m
                </text>

                <line
                  x1={
                    transformCoordinates({
                      x: bounds.minX,
                      z: bounds.maxZ + 10,
                    }).x
                  }
                  y1={
                    transformCoordinates({
                      x: bounds.minX,
                      z: bounds.maxZ + 10,
                    }).y
                  }
                  x2={
                    transformCoordinates({
                      x: bounds.maxX,
                      z: bounds.maxZ + 10,
                    }).x
                  }
                  y2={
                    transformCoordinates({
                      x: bounds.maxX,
                      z: bounds.maxZ + 10,
                    }).y
                  }
                  stroke="black"
                  strokeWidth="1"
                  markerStart="url(#arrow1)"
                  markerEnd="url(#arrow)"
                />
                <text
                  x={
                    transformCoordinates({
                      x: (bounds.minX + bounds.maxX) / 2,
                      z: bounds.maxZ + 20,
                    }).x
                  }
                  y={
                    transformCoordinates({
                      x: (bounds.minX + bounds.maxX) / 2,
                      z: bounds.maxZ + 16,
                    }).y
                  }
                  fontSize="11"
                  fill="black"
                  textAnchor="middle"
                >
                  {twidth} m
                </text>
              </>
            )}

            {floorPlanData.rooms.map((room) => {
              const transformedPoints =
                room.floor_polygon.map(transformCoordinates);
              if (
                room.room_type === "Wall" &&
                room.floor_polygon.length === 2
              ) {
                const startPoint = transformedPoints[0];
                const endPoint = transformedPoints[1];
                const isSelected = selectedRoomIds.includes(room.id);
                const midpoint = {
                  x: (startPoint.x + endPoint.x) / 2,
                  y: (startPoint.y + endPoint.y) / 2,
                };

                return (
                  <g
                    key={room.id}
                    transform={`rotate(${roomRotations[room.id] || 0}, ${
                      midpoint.x
                    }, ${midpoint.y})`}
                  >
                    <line
                      id={room.id}
                      className={`wall-line ${
                        isSelected ? "selected-wall" : ""
                      }`}
                      x1={startPoint.x}
                      y1={startPoint.y}
                      x2={endPoint.x}
                      y2={endPoint.y}
                      stroke={isSelected ? "#2196F3" : "#333333"}
                      strokeWidth={options.wallThickness}
                      strokeLinecap="square"
                      onClick={(e) => {
                        if (
                          isDrawingActive ||
                          activeBuildTool === "drawWall" ||
                          activeBuildTool === "drawRoom" ||
                          isLabelPlacementMode
                        ) {
                          return;
                        }
                        handleRoomSelection(
                          room.id,
                          e,
                          selectedRoomIds,
                          setSelectedRoomIds,
                          handleRoomTypeUpdate
                        );
                      }}
                      onMouseDown={(e) =>
                        handleMouseDownWithHistory(
                          e,
                          room.id,
                          svgRef,
                          setDragState,
                          setHasChanges,
                          setSelectedRoomIds,
                          selectedRoomIds
                        )
                      }
                      onTouchStart={(e) =>
                        handleTouchStartWithHistory(
                          e,
                          room.id,
                          svgRef,
                          setDragState,
                          setHasChanges,
                          setSelectedRoomIds,
                          selectedRoomIds
                        )
                      }
                    />

                    {isSelected && (
                      <>
                        <circle
                          cx={startPoint.x}
                          cy={startPoint.y}
                          r={isMobile ? 8 : 6}
                          className="resize-handle"
                          onMouseDown={(e) =>
                            handleVertexMouseDownWithHistory(
                              e,
                              room.id,
                              0,
                              svgRef,
                              setDragState,
                              setSelectedRoomIds,
                              selectedRoomIds,
                              setHasChanges
                            )
                          }
                          onTouchStart={(e) =>
                            handleVertexTouchStartWithHistory(
                              e,
                              room.id,
                              0,
                              svgRef,
                              setDragState,
                              setSelectedRoomIds,
                              selectedRoomIds,
                              setHasChanges
                            )
                          }
                        />

                        <circle
                          cx={endPoint.x}
                          cy={endPoint.y}
                          r={isMobile ? 8 : 6}
                          className="resize-handle"
                          onMouseDown={(e) =>
                            handleVertexMouseDownWithHistory(
                              e,
                              room.id,
                              1,
                              svgRef,
                              setDragState,
                              setSelectedRoomIds,
                              selectedRoomIds,
                              setHasChanges
                            )
                          }
                          onTouchStart={(e) =>
                            handleVertexTouchStartWithHistory(
                              e,
                              room.id,
                              1,
                              svgRef,
                              setDragState,
                              setSelectedRoomIds,
                              selectedRoomIds,
                              setHasChanges
                            )
                          }
                        />
                      </>
                    )}
                  </g>
                );
              }

              const polygonPoints = transformedPoints
                .map((p) => `${p.x},${p.y}`)
                .join(" ");

              const centroid = calculateRoomCentroid(transformedPoints);

              const isOverlapping = isRoomOverlapping(
                room.id,
                overlappingRooms
              );

              const isSelected = selectedRoomIds.includes(room.id);
              const isPrimarySelection =
                selectedRoomIds.length > 0 && selectedRoomIds[0] === room.id;

              const isWall = room.room_type === "Wall";

              return (
                <g
                  key={room.id}
                  transform={`rotate(${roomRotations[room.id] || 0}, ${
                    centroid.x
                  }, ${centroid.y})`}
                >
                  <polygon
                    id={room.id}
                    key={`${room.id}-${room.room_type}`}
                    className={`room-polygon ${
                      isSelected
                        ? isPrimarySelection
                          ? "primary-selection"
                          : "secondary-selection"
                        : ""
                    } ${isOverlapping ? "overlapping" : ""} ${
                      isWall ? "wall-polygon" : ""
                    } ${isLabelPlacementMode ? "disable-interaction" : ""}`}
                    points={polygonPoints}
                    fill={getRoomColor(room.room_type)}
                    strokeWidth={isWall ? 2 : options.wallThickness}
                    style={{
                      strokeWidth: isWall
                        ? "2px"
                        : `${options.wallThickness}px`,
                      stroke: isWall ? "#333333" : undefined,
                      strokeLinecap: isWall ? "square" : undefined,
                    }}
                    onClick={(e) => {
                      if (
                        isDrawingActive ||
                        activeBuildTool === "drawWall" ||
                        activeBuildTool === "drawRoom"
                      ) {
                        return;
                      }
                      handleRoomSelection(
                        room.id,
                        e,
                        selectedRoomIds,
                        setSelectedRoomIds,
                        handleRoomTypeUpdate
                      );
                    }}
                    onMouseDown={(e) =>
                      handleMouseDownWithHistory(
                        e,
                        room.id,
                        svgRef,
                        setDragState,
                        setHasChanges,
                        setSelectedRoomIds,
                        selectedRoomIds
                      )
                    }
                    onTouchStart={(e) =>
                      handleTouchStartWithHistory(
                        e,
                        room.id,
                        svgRef,
                        setDragState,
                        setHasChanges,
                        setSelectedRoomIds,
                        selectedRoomIds
                      )
                    }
                  />
                  {isSelected &&
                    !isWall &&
                    renderEdgeHandles(
                      room,
                      transformCoordinates,
                      handleEdgeMouseDownWithHistory,
                      handleEdgeTouchStartWithHistory,
                      svgRef,
                      setDragState,
                      setSelectedRoomIds,
                      selectedRoomIds,
                      setHasChanges,
                      isMobile,
                      floorPlanData
                    )}
                  {isSelected &&
                    !isWall &&
                    transformedPoints.map((point, index) => (
                      <circle
                        key={`handle-${room.id}-${index}`}
                        cx={point.x}
                        cy={point.y}
                        r={isMobile ? 8 : 6}
                        className="resize-handle"
                        onMouseDown={(e) =>
                          handleVertexMouseDownWithHistory(
                            e,
                            room.id,
                            index,
                            svgRef,
                            setDragState,
                            setSelectedRoomIds,
                            selectedRoomIds,
                            setHasChanges
                          )
                        }
                        onTouchStart={(e) =>
                          handleVertexTouchStartWithHistory(
                            e,
                            room.id,
                            index,
                            svgRef,
                            setDragState,
                            setSelectedRoomIds,
                            selectedRoomIds,
                            setHasChanges
                          )
                        }
                      />
                    ))}
                  {isSelected && !isWall && shouldShowRotationIcon() && (
                    <foreignObject
                      x={centroid.x - (isMobile ? 8 : 10)}
                      y={centroid.y - (isMobile ? 8 : 10)}
                      width={isMobile ? "20" : "20"}
                      height={isMobile ? "20" : "20"}
                    >
                      <button
                        className="rotate-button"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const direction =
                            (navigator.platform.indexOf("Mac") !== -1
                              ? e.metaKey
                              : e.ctrlKey || e.metaKey) || e.altKey
                              ? "left"
                              : "right";

                          if (selectedRoomIds.length > 1) {
                            rotateAllSelectedRooms(direction);
                          } else {
                            handleRotateRoomWithHistory(
                              room.id,
                              direction,
                              roomRotations,
                              setRoomRotations,
                              setHasChanges,
                              checkAndUpdateOverlaps
                            );
                          }
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (selectedRoomIds.length > 1) {
                            rotateAllSelectedRooms("left");
                          } else {
                            handleRotateRoomWithHistory(
                              room.id,
                              "left",
                              roomRotations,
                              setRoomRotations,
                              setHasChanges,
                              checkAndUpdateOverlaps
                            );
                          }
                        }}
                        style={{
                          width: isMobile ? "20px" : "30px",
                          height: isMobile ? "20px" : "30px",
                          position: "relative",
                          right: isMobile ? "8px" : "12px",
                          bottom: "5px",
                          borderRadius: "50%",
                          zIndex: "100",
                          background: "transparent",
                          color: "#333333",
                          fontWeight: "bolder",
                          fontSize: isMobile ? "15px" : "20px",
                          border: "none",
                          cursor: "pointer",
                        }}
                        title={
                          selectedRoomIds.length > 1
                            ? "Rotate all selected rooms"
                            : "Left-click to rotate clockwise, Right-click to rotate counter-clockwise"
                        }
                      >
                        <b>↻</b>
                      </button>
                    </foreignObject>
                  )}
                  {options.showRoomLabels && !isWall && (
                    <>
                      <text
                        className="room-label room-name1"
                        x={centroid.x}
                        y={centroid.y}
                        pointerEvents="none"
                        fill={"black"}
                      >
                        {room.room_type}
                      </text>
                      {room.area < 5 ? (
                        <>
                          <text
                            className="room-label"
                            x={centroid.x}
                            y={centroid.y + 7}
                            pointerEvents="none"
                            fill={"black"}
                          >
                            {room.width.toFixed(1)}' × {room.height.toFixed(1)}'
                          </text>
                          <text
                            className="room-label"
                            x={centroid.x}
                            y={centroid.y + 15}
                            pointerEvents="none"
                            fill={"black"}
                          >
                            ({room.area.toFixed(2)} m²)
                          </text>
                        </>
                      ) : (
                        <text
                          className="room-label"
                          x={centroid.x}
                          y={centroid.y + 10}
                          pointerEvents="none"
                          fill={"black"}
                        >
                          {room.width.toFixed(1)}' × {room.height.toFixed(1)}' (
                          {room.area.toFixed(2)} m²)
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
            {activeBuildTool === "drawWall" && (
              <WallDrawingTool
                isActive={activeBuildTool === "drawWall"}
                svgRef={svgRef}
                reverseTransformCoordinates={reverseTransformCoordinates}
                transformCoordinates={transformCoordinates}
                scale={scale}
                onWallCreated={handleWallCreated}
                onDrawingStateChange={setIsDrawingActive}
              />
            )}
            {activeBuildTool === "drawRoom" && (
              <RoomDrawingTool
                isActive={activeBuildTool === "drawRoom"}
                svgRef={svgRef}
                reverseTransformCoordinates={reverseTransformCoordinates}
                transformCoordinates={transformCoordinates}
                onRoomCreated={handleRoomCreated}
                onDrawingStateChange={setIsDrawingActive}
              />
            )}

            {floorPlanData.labels &&
              floorPlanData.labels.map((label) => {
                const position = transformCoordinates(label.position);

                return (
                  <g
                    key={label.id}
                    className={`floor-plan-label ${
                      selectedLabelId === label.id ? "selected-label" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLabelId(
                        selectedLabelId === label.id ? null : label.id
                      );
                    }}
                  >
                    <rect
                      x={position.x - 4 * label.text.length}
                      y={position.y - 12}
                      width={8 * label.text.length}
                      height={18}
                      fill={
                        selectedLabelId === label.id
                          ? "rgba(33, 150, 243, 0.3)"
                          : "rgba(255, 255, 255, 0.7)"
                      }
                      rx="3"
                      ry="3"
                      stroke={
                        selectedLabelId === label.id ? "#2196F3" : "#000000"
                      }
                      strokeWidth={selectedLabelId === label.id ? "1.5" : "0.5"}
                      opacity="0.8"
                    />
                    <text
                      x={position.x}
                      y={position.y}
                      fill={label.color || "#000000"}
                      fontSize={label.fontSize || 12}
                      fontWeight="bold"
                      textAnchor="middle"
                      pointerEvents="none"
                    >
                      {label.text}
                    </text>
                  </g>
                );
              })}
          </svg>

          {hasChanges && (
            <div
              style={{
                position: "absolute",
                display: "flex",
                gap: "15px",
                bottom: "-50px",
                left: leftPosition,
                pointerEvents: "auto",
                margin: "auto",
              }}
            >
              <button className="save-button" onClick={handleSaveFloorPlan}>
                Save Changes
              </button>
              <button className="undo-button" onClick={handleResetChanges}>
                Reset Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
