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
  getGlobalSelectedRoomType,
  handleLabelMouseDown,
  handleLabelTouchStart,
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
  visualizationOptions: propVisualizationOptions = {},
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
    setHasChanges,
    roomRotations,
    setRoomRotations,
    hasChanges,
    captureOriginalState,
    selectedRoomIds: contextSelectedRoomIds,
    setSelectedRoomIds: setContextSelectedRoomIds,
    activeTool,
    setActiveTool,
    openProjectPanel,
    visualizationOptions: contextVisualizationOptions,
    drawingWallWidth,
    updateLabel,
  } = useFloorPlan();

  const options: VisualizationOptions = {
    ...contextVisualizationOptions,
    ...propVisualizationOptions,
  };

  const [leftPosition, setLeftPosition] = useState("10%");
  const [floorPlanData, setFloorPlanData] = useState<FloorPlanData>(
    contextFloorPlanData || initialFloorPlanData
  );

  const tlength = 15;
  const twidth = 10;

  const [position, setPosition] = useState({ x: 0, y: 0 });

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

    if (!hasChanges) {
      captureOriginalState();
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

    if (!hasChanges) {
      captureOriginalState();
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

    if (!hasChanges) {
      captureOriginalState();
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

    if (!hasChanges) {
      captureOriginalState();
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

    if (!hasChanges) {
      captureOriginalState();
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

    if (!hasChanges) {
      captureOriginalState();
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
    if (!hasChanges) {
      captureOriginalState();
    }

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



  useEffect(() => {
    checkAndUpdateOverlaps();
  }, []);

  useInterval(() => {
    checkAndUpdateOverlaps();
  }, 100);


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

            const actualRoomCount = updatedRooms.filter(
              (room) => room.room_type !== "Wall"
            ).length;

            const updatedData = {
              ...prevData,
              rooms: updatedRooms,
              room_count: actualRoomCount,
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
  const padding = 1000; //earlier 20
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
        (infoPanelState.activeOption === "placeLabel" || infoPanelState.activeOption === "placesignandsymbol") &&
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

  ////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    const handleDragEnd = (e: DragEvent) => {
      setDragState({
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
      e.preventDefault();
      e.stopPropagation();

      document.body.style.pointerEvents = "none";
      setTimeout(() => {
        document.body.style.pointerEvents = "";
      }, 100);
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("drop", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("drop", handleDragEnd);
    };
  }, []);

  useEffect(() => {
    if (floorPlanData && setContextFloorPlanData && !dragState.active) {
      setContextFloorPlanData(floorPlanData);
    }
  }, [floorPlanData, setContextFloorPlanData, dragState.active]);

  const isContextInitialized = useRef(false);
  const prevRoomTypesRef = useRef<string[]>([]);

  useEffect(() => {
    if (!contextFloorPlanData) return;
    const contextRoomTypes = contextFloorPlanData.rooms.map(
      (r) => `${r.id}-${r.room_type}`
    );

    const isInitialLoad = !isContextInitialized.current;
    const hasLabelChange =
      floorPlanData?.labels?.length !== contextFloorPlanData?.labels?.length;
    const hasRoomTypeChange =
      JSON.stringify(contextRoomTypes) !==
      JSON.stringify(prevRoomTypesRef.current);

    if (isInitialLoad || hasLabelChange || hasRoomTypeChange) {
      prevRoomTypesRef.current = contextRoomTypes;
      isContextInitialized.current = true;
      setFloorPlanData(contextFloorPlanData);
    }
  }, [contextFloorPlanData]);

  useEffect(() => {
    if (contextSelectedRoomIds && contextSelectedRoomIds.length > 0) {
      setSelectedRoomIds(contextSelectedRoomIds);
    }
  }, [contextSelectedRoomIds]);

  useEffect(() => {
    if (selectedRoomIds) {
      setContextSelectedRoomIds(selectedRoomIds);
    }
  }, [selectedRoomIds, setContextSelectedRoomIds]);

  useEffect(() => {
    const handleFloorPlanReset = (event: CustomEvent) => {
      if (event.detail) {
        setFloorPlanData(event.detail);
        checkAndUpdateOverlaps();
      }
    };

    window.addEventListener(
      "floorPlanReset",
      handleFloorPlanReset as EventListener
    );

    return () => {
      window.removeEventListener(
        "floorPlanReset",
        handleFloorPlanReset as EventListener
      );
    };
  }, [checkAndUpdateOverlaps]);

  ///////////////////////////////////////////////////////////////////////////

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

  useEffect(() => {
    const handleTemporaryBoundsUpdate = (event: CustomEvent) => {
      if (!event.detail) return;

      const tempBounds = event.detail;

      const paddedBounds = {
        minX: tempBounds.minX - padding,
        maxX: tempBounds.maxX + padding,
        minZ: tempBounds.minZ - padding,
        maxZ: tempBounds.maxZ + padding,
      };

      const newContentWidth = paddedBounds.maxX - paddedBounds.minX;
      const newContentHeight = paddedBounds.maxZ - paddedBounds.minZ;

      if (floorPlanRef.current) {
        floorPlanRef.current.style.width = `${newContentWidth * scale}px`;
        floorPlanRef.current.style.height = `${newContentHeight * scale}px`;
      }
    };

    window.addEventListener(
      "temporaryBoundsUpdate",
      handleTemporaryBoundsUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "temporaryBoundsUpdate",
        handleTemporaryBoundsUpdate as EventListener
      );
    };
  }, [padding, scale]);

  const positionWallMeasurements = (
    transformedPoints: { x: number; y: number }[],
    room: Room
  ) => {
    if (transformedPoints.length < 3) return null;
    let horizontalWalls = [];
    let verticalWalls = [];

    for (let i = 0; i < transformedPoints.length; i++) {
      const nextIndex = (i + 1) % transformedPoints.length;
      const point1 = transformedPoints[i];
      const point2 = transformedPoints[nextIndex];

      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length < 20) continue;

      const midpoint = {
        x: (point1.x + point2.x) / 2,
        y: (point1.y + point2.y) / 2,
      };

      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      const isHorizontal = Math.abs(Math.abs(angle) - 90) > 45;

      if (isHorizontal) {
        horizontalWalls.push({
          midpoint,
          angle,
          length,
          point1,
          point2,
        });
      } else {
        verticalWalls.push({
          midpoint,
          angle,
          length,
          point1,
          point2,
        });
      }
    }

    horizontalWalls.sort((a, b) => b.length - a.length);
    verticalWalls.sort((a, b) => b.length - a.length);

    const widthWall = horizontalWalls.length > 0 ? horizontalWalls[0] : null;
    const heightWall = verticalWalls.length > 0 ? verticalWalls[0] : null;

    const result = [];

    const centroid = {
      x:
        transformedPoints.reduce((sum, p) => sum + p.x, 0) /
        transformedPoints.length,
      y:
        transformedPoints.reduce((sum, p) => sum + p.y, 0) /
        transformedPoints.length,
    };

    if (widthWall) {
      const dx = centroid.x - widthWall.midpoint.x;
      const dy = centroid.y - widthWall.midpoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const dirX = dx / dist;
      const dirY = dy / dist;

      const offsetDistance = 7;

      let labelAngle = widthWall.angle;

      if (labelAngle > 90 || labelAngle < -90) {
        labelAngle += 180;
      }

      result.push({
        position: {
          x: widthWall.midpoint.x + dirX * offsetDistance,
          y: widthWall.midpoint.y + dirY * offsetDistance,
        },
        angle: labelAngle,
        value: room.width.toFixed(1),
        isWidth: true,
      });
    }

    if (heightWall) {
      const dx = centroid.x - heightWall.midpoint.x;
      const dy = centroid.y - heightWall.midpoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const dirX = dx / dist;
      const dirY = dy / dist;

      const offsetDistance = 7;

      let labelAngle = heightWall.angle;

      if (labelAngle > 90 || labelAngle < -90) {
        labelAngle += 180;
      }

      result.push({
        position: {
          x: heightWall.midpoint.x + dirX * offsetDistance,
          y: heightWall.midpoint.y + dirY * offsetDistance,
        },
        angle: labelAngle,
        value: room.height.toFixed(1),
        isWidth: false,
      });
    }

    return result;
  };

  const findRoomNamePosition = (
    transformedPoints: { x: number; y: number }[],
    centroid: { x: number; y: number },
    roomType: string
  ) => {
    if (transformedPoints.length < 3) return centroid;

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    transformedPoints.forEach((point) => {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    const roomNamePadding = 8;

    const isSmallRoom = width < 60 || height < 60;
    const isNarrowRoom = width < height * 0.5 || height < width * 0.5;
    const isWideRoom = width > height * 1.5;

    if (roomType === "SecondRoom" || roomType === "Kitchen") {
      return {
        x: centroid.x,
        y: centroid.y - height * 0.08,
      };
    }

    if (isSmallRoom || isNarrowRoom || isWideRoom) {
      let bestPosition = { ...centroid };

      if (width < height * 0.5) {
        bestPosition.y = centroid.y - height * 0.08;
      }

      if (height < width * 0.5) {
        bestPosition.y = centroid.y - height * 0.08;
      }

      if (width < 40 && height < 40) {
        bestPosition = {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2 - roomNamePadding / 3,
        };
      }

      return bestPosition;
    }

    return {
      x: centroid.x,
      y: centroid.y - roomNamePadding / 2,
    };
  };

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
      width: drawingWallWidth,
      floor_polygon: simpleLine,
    };

    setFloorPlanData((prevData) => {
      const updatedRooms = [...prevData.rooms, newWall];

      const actualRoomCount = updatedRooms.filter(
        (room) => room.room_type !== "Wall"
      ).length;

      return {
        ...prevData,
        rooms: updatedRooms,
        room_count: actualRoomCount,
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

      const actualRoomCount = updatedRooms.filter(
        (room) => room.room_type !== "Wall"
      ).length;

      let updatedRoomTypes = [...prevData.room_types];
      if (!updatedRoomTypes.includes("SecondRoom")) {
        updatedRoomTypes.push("SecondRoom");
      }

      return {
        ...prevData,
        rooms: updatedRooms,
        room_count: actualRoomCount,
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
        return "#B5DBFF";

      case "pastel":
        const lightenColor = (color: string) => {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);

          const mixAmount = 0.4;
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
          LivingRoom: "#FFBDB9",
          Bathroom: "#A0D0F0",
          MasterRoom: "#FFDCC5",
          Kitchen: "#E2CCE2",
          SecondRoom: "#F9DD7D",
          ChildRoom: "#DFBDFF",
          DiningRoom: "#BADEBC",
          Balcony: "#C2E5E2",
          Wall: "#333333",
        };
        return contrastMap[roomType] || "#E8E8E8";
      default:
        return baseColors;
    }
  };

  const sortedRooms = useMemo(() => {
    return [...floorPlanData.rooms].sort((a, b) => {
      const aSelected = selectedRoomIds.includes(a.id);
      const bSelected = selectedRoomIds.includes(b.id);

      if (aSelected && !bSelected) return 1;
      if (!aSelected && bSelected) return -1;
      return 0;
    });
  }, [floorPlanData.rooms, selectedRoomIds]);

  const labelStyles = `
  .floor-plan-label.selected-label {
    cursor: move;
  }
  
  .floor-plan-label:not(.selected-label) {
    cursor: pointer;
  }
  
  .floor-plan-label.dragging {
    opacity: 0.7;
  }
`;

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
        <style>{labelStyles}</style>

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
          onMouseDown={(e) => {
            if (document.body.classList.contains("drag-completed")) {
              e.stopPropagation();
              e.preventDefault();
              return;
            }
          }}
        >
          {options.showMeasurements && (
            <p
              style={{
                position: "absolute",
                top:
                  transformCoordinates({ x: bounds.minX, z: bounds.minZ }).y -
                  50,
                left: "50%",
                transform: "translateX(-50%)",
                textAlign: "center",
                marginBottom: "-25px",
                color: "#000",
                fontSize: "small",
                width: "100%",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
              className="always-black-text"
            >
              <span
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  padding: "5px",
                }}
              >
                <b>Total Area:</b> {floorPlanData.total_area.toFixed(2)} m²
                &nbsp;|&nbsp; <b>Total Rooms:</b> {floorPlanData.room_count}
              </span>
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

            {/* 
            {coordinateSystem}
            */}

            {options.showMeasurements && (
              <>
                <line
                  x1={
                    transformCoordinates({
                      x: bounds.minX - 10,
                      z: bounds.minZ,
                    }).x
                  }
                  y1={
                    transformCoordinates({ x: bounds.minX, z: bounds.minZ }).y +
                    2
                  }
                  x2={
                    transformCoordinates({
                      x: bounds.minX - 10,
                      z: bounds.maxZ,
                    }).x
                  }
                  y2={
                    transformCoordinates({ x: bounds.minX, z: bounds.maxZ }).y -
                    2
                  }
                  stroke={"black"}
                  strokeWidth="1"
                  markerStart="url(#arrow1)"
                  markerEnd="url(#arrow)"
                />
                <text
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
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
                      ${transformCoordinates({
                    x: bounds.minX - 12,
                    z: (bounds.minZ + bounds.maxZ) / 2,
                  }).x
                    },
                      ${transformCoordinates({
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
                    }).x + 3
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
                    }).x - 2
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
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
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

            {sortedRooms.map((room) => {
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
                    transform={`rotate(${roomRotations[room.id] || 0}, ${midpoint.x
                      }, ${midpoint.y})`}
                  >
                    <line
                      id={room.id}
                      className={`wall-line ${isSelected ? "selected-wall" : ""
                        }`}
                      x1={startPoint.x}
                      y1={startPoint.y}
                      x2={endPoint.x}
                      y2={endPoint.y}
                      stroke={isSelected ? "#2196F3" : "#333333"}
                      strokeWidth={room.width || options.wallThickness}
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
                          handleRoomTypeUpdate,
                          openProjectPanel
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
                  transform={`rotate(${roomRotations[room.id] || 0}, ${centroid.x
                    }, ${centroid.y})`}
                >
                  <polygon
                    id={room.id}
                    key={`${room.id}-${room.room_type}`}
                    className={`room-polygon ${isSelected
                      ? isPrimarySelection
                        ? "primary-selection"
                        : "secondary-selection"
                      : ""
                      } ${isOverlapping ? "overlapping" : ""} ${isWall ? "wall-polygon" : ""
                      } ${isLabelPlacementMode ? "disable-interaction" : ""}`}
                    points={polygonPoints}
                    fill={getRoomColor(room.room_type)}
                    strokeWidth={isWall ? (room.width || 2) : options.wallThickness}
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
                        handleRoomTypeUpdate,
                        openProjectPanel
                      );
                    }}
                    onDragOver={(e) => {
                      if (!isWall) {
                        e.preventDefault();
                        e.currentTarget.classList.add("drop-target");
                      }
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("drop-target");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("drop-target");

                      const roomType = e.dataTransfer.getData("roomType");

                      if (roomType && room.room_type !== roomType && !isWall) {
                        if (!hasChanges) {
                          captureOriginalState();
                        }

                        handleRoomTypeUpdate(room.id, roomType);
                        setHasChanges(true);

                        const svgElement = e.currentTarget as SVGPolygonElement;
                        svgElement.classList.add("room-updated");
                        setTimeout(() => {
                          svgElement.classList.remove("room-updated");
                        }, 300);
                      }

                      document.body.classList.add("drag-complete");
                      const mouseUpEvent = new MouseEvent("mouseup", {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                      });
                      document.dispatchEvent(mouseUpEvent);
                      setDragState({
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

                      const savedPosition = { ...position };
                      setTimeout(() => {
                        setPosition(savedPosition);
                        document.body.classList.remove("drag-complete");
                      }, 300);
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
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          msUserSelect: "none",
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
                      {(() => {
                        const adjustedPosition = findRoomNamePosition(
                          transformedPoints,
                          centroid,
                          room.room_type
                        );

                        return (
                          <text
                            className="room-label room-name1"
                            x={adjustedPosition.x}
                            y={adjustedPosition.y}
                            pointerEvents="none"
                            fill={"black"}
                            textAnchor="middle"
                          >
                            {room.room_type}
                          </text>
                        );
                      })()}

                      {(() => {
                        const wallLabels = positionWallMeasurements(
                          transformedPoints,
                          room
                        );

                        if (wallLabels && wallLabels.length > 0) {
                          return wallLabels.map((label, index) => (
                            <text
                              key={`wall-label-${index}`}
                              className="room-label dimension-label"
                              x={label.position.x}
                              y={label.position.y}
                              textAnchor="middle"
                              dominantBaseline="central"
                              pointerEvents="none"
                              fill={"black"}
                              transform={`rotate(${label.angle}, ${label.position.x}, ${label.position.y})`}
                              style={{
                                fontSize: "10px",
                                fontWeight: "bold",
                              }}
                            >
                              {label.value}m
                            </text>
                          ));
                        }

                        return null;
                      })()}
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
                const currentFontSize = label.fontSize || 12;

                const isSvgPath = label.text.startsWith('/Signs/') || label.text.startsWith('/Symbols/');

                const handleLabelDrag = (e: React.MouseEvent | React.TouchEvent) => {
                  e.stopPropagation();
                  if (selectedLabelId === label.id) {
                    if (!hasChanges) {
                      captureOriginalState();
                    }
                    captureStateBeforeChange();

                    if ('touches' in e) {
                      handleLabelTouchStart(e, label.id, svgRef, label, setDragState, setHasChanges);
                    } else {
                      handleLabelMouseDown(e, label.id, svgRef, label, setDragState, setHasChanges);
                    }
                  }
                };


                if (isSvgPath) {

                  return (
                    <g
                      key={label.id}
                      className={`floor-plan-label ${selectedLabelId === label.id ? "selected-label" : ""} ${dragState.isLabelDragging && dragState.labelId === label.id ? "dragging" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLabelId(selectedLabelId === label.id ? null : label.id);
                      }}
                      onMouseDown={(e) => handleLabelDrag(e)}
                      onTouchStart={(e) => handleLabelDrag(e)}

                      style={{ cursor: selectedLabelId === label.id ? "move" : "pointer" }}
                    >
                      <image
                        href={label.text}
                        x={position.x - currentFontSize}
                        y={position.y - currentFontSize}
                        width={currentFontSize * 2}
                        height={currentFontSize * 2}
                        preserveAspectRatio="xMidYMid meet"
                        pointerEvents="all"
                      />
                      {selectedLabelId === label.id && (
                        <>
                          <rect
                            x={position.x - currentFontSize - 5}
                            y={position.y - currentFontSize - 5}
                            width={currentFontSize * 2 + 10}
                            height={currentFontSize * 2 + 10}
                            fill="none"
                            stroke="#2196F3"
                            strokeWidth="1.5"
                            rx="3"
                            ry="3"
                          />

                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              if (updateLabel) {
                                if (!hasChanges) {
                                  captureOriginalState();
                                }
                                captureStateBeforeChange();

                                const updatedLabel = {
                                  ...label,
                                  fontSize: Math.max(8, currentFontSize - 1)
                                };

                                updateLabel(label.id, updatedLabel);
                                setFloorPlanData((prevData) => {
                                  const updatedLabels = (prevData.labels || []).map((l) =>
                                    l.id === label.id ? updatedLabel : l
                                  );
                                  return {
                                    ...prevData,
                                    labels: updatedLabels,
                                  };
                                });
                                setHasChanges(true);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <circle
                              cx={position.x - currentFontSize - 18}
                              cy={position.y}
                              r="8"
                              fill="white"
                              stroke="black"
                              strokeWidth="1"
                            />
                            <text
                              x={position.x - currentFontSize - 18}
                              y={position.y + 5}
                              fill="black"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              pointerEvents="none"
                              style={{
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none",
                              }}
                            >
                              −
                            </text>
                          </g>

                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              if (updateLabel) {
                                if (!hasChanges) {
                                  captureOriginalState();
                                }
                                captureStateBeforeChange();

                                const updatedLabel = {
                                  ...label,
                                  fontSize: Math.min(48, currentFontSize + 1)
                                };

                                updateLabel(label.id, updatedLabel);
                                setFloorPlanData((prevData) => {
                                  const updatedLabels = (prevData.labels || []).map((l) =>
                                    l.id === label.id ? updatedLabel : l
                                  );
                                  return {
                                    ...prevData,
                                    labels: updatedLabels,
                                  };
                                });
                                setHasChanges(true);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <circle
                              cx={position.x + currentFontSize + 18}
                              cy={position.y}
                              r="8"
                              fill="white"
                              stroke="black"
                              strokeWidth="1"
                            />
                            <text
                              x={position.x + currentFontSize + 18}
                              y={position.y + 5}
                              fill="black"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              pointerEvents="none"
                              style={{
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none",
                              }}
                            >
                              +
                            </text>
                          </g>
                        </>
                      )}
                    </g>
                  );
                } else {


                  const charWidth = currentFontSize * 0.6;
                  const boxPadding = 8;
                  const boxWidth = label.text.length * charWidth + boxPadding * 2;
                  const boxHeight = currentFontSize + boxPadding;

                  return (
                    <g
                      key={label.id}
                      className={`floor-plan-label ${selectedLabelId === label.id ? "selected-label" : ""} ${dragState.isLabelDragging && dragState.labelId === label.id ? "dragging" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLabelId(
                          selectedLabelId === label.id ? null : label.id
                        );
                      }}
                      onMouseDown={(e) => handleLabelDrag(e)}
                      onTouchStart={(e) => handleLabelDrag(e)}
                      style={{ cursor: selectedLabelId === label.id ? "move" : "pointer" }}
                    >
                      <rect
                        x={position.x - boxWidth / 2}
                        y={position.y - boxHeight / 2}
                        width={boxWidth}
                        height={boxHeight}
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
                        y={position.y + currentFontSize * 0.35}
                        fill={label.color || "#000000"}
                        fontSize={currentFontSize}
                        fontWeight="bold"
                        textAnchor="middle"
                        pointerEvents="none"

                        style={{
                          userSelect: "none",
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          msUserSelect: "none",
                        }}
                      >
                        {label.text}
                      </text>

                      {selectedLabelId === label.id && (
                        <>

                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              if (updateLabel) {
                                if (!hasChanges) {
                                  captureOriginalState();
                                }
                                captureStateBeforeChange();

                                const updatedLabel = {
                                  ...label,
                                  fontSize: Math.max(8, currentFontSize - 1)
                                };

                                updateLabel(label.id, updatedLabel);


                                setFloorPlanData((prevData) => {
                                  const updatedLabels = (prevData.labels || []).map((l) =>
                                    l.id === label.id ? updatedLabel : l
                                  );
                                  return {
                                    ...prevData,
                                    labels: updatedLabels,
                                  };
                                });

                                setHasChanges(true);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <circle
                              cx={position.x - boxWidth / 2 - 10}
                              cy={position.y}
                              r="8"
                              fill="white"
                              stroke="black"
                              strokeWidth="1"
                            />
                            <text
                              x={position.x - boxWidth / 2 - 10}
                              y={position.y + 5}
                              fill="black"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              pointerEvents="none"
                              style={{
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none",
                              }}
                            >
                              −
                            </text>
                          </g>

                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              if (updateLabel) {
                                if (!hasChanges) {
                                  captureOriginalState();
                                }
                                captureStateBeforeChange();

                                const updatedLabel = {
                                  ...label,
                                  fontSize: Math.min(24, currentFontSize + 1)
                                };

                                updateLabel(label.id, updatedLabel);

                                setFloorPlanData((prevData) => {
                                  const updatedLabels = (prevData.labels || []).map((l) =>
                                    l.id === label.id ? updatedLabel : l
                                  );
                                  return {
                                    ...prevData,
                                    labels: updatedLabels,
                                  };
                                });

                                setHasChanges(true);
                              }
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <circle
                              cx={position.x + boxWidth / 2 + 10}
                              cy={position.y}
                              r="8"
                              fill="white"
                              stroke="black"
                              strokeWidth="1"
                            />
                            <text
                              x={position.x + boxWidth / 2 + 10}
                              y={position.y + 5}
                              fill="black"
                              fontSize="14"
                              fontWeight="bold"
                              textAnchor="middle"
                              pointerEvents="none"
                              style={{
                                userSelect: "none",
                                WebkitUserSelect: "none",
                                MozUserSelect: "none",
                                msUserSelect: "none",
                              }}
                            >
                              +
                            </text>
                          </g>
                        </>
                      )}
                    </g>
                  );
                }
              })}
          </svg>
        </div>
      </div>
    </div>
  );
}
