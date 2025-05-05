// features/eventHandlers.tsx
import React, { useCallback, RefObject, useEffect } from "react";
import {
  handleMouseMove,
  handleTouchMove,
  handleMouseUp,
  handleTouchEnd,
  useNonPassiveTouchHandling,
} from "./resizing";

interface Point {
  x: number;
  z: number;
}

interface DragState {
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

interface Room {
  id: string;
  room_type: string;
  area: number;
  height: number;
  width: number;
  floor_polygon: Point[];
}

interface FloorPlanData {
  room_count: number;
  total_area: number;
  room_types: string[];
  rooms: Room[];
}

let globalSelectedRoomType: string | null = null;

export function setGlobalSelectedRoomType(roomType: string | null) {
  globalSelectedRoomType = roomType;
}

export function getGlobalSelectedRoomType() {
  return globalSelectedRoomType;
}

export function useEventHandlers(
  dragState: DragState,
  svgRef: RefObject<SVGSVGElement>,
  scale: number,
  reverseTransformCoordinates: (
    x: number,
    y: number
  ) => { x: number; z: number },
  calculateRoomDimensions: (polygon: Point[]) => {
    width: number;
    height: number;
  },
  calculateRoomArea: (polygon: Point[]) => number,
  setFloorPlanData: React.Dispatch<React.SetStateAction<FloorPlanData>>,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>,
  checkAndUpdateOverlaps: () => boolean | void
) {
  useNonPassiveTouchHandling(svgRef);

  const handleMouseMoveCallback = useCallback(
    (event: MouseEvent) => {
      handleMouseMove(
        event,
        dragState,
        svgRef,
        scale,
        reverseTransformCoordinates,
        calculateRoomDimensions,
        calculateRoomArea,
        setFloorPlanData,
        setDragState
      );
    },
    [
      dragState,
      reverseTransformCoordinates,
      scale,
      calculateRoomDimensions,
      calculateRoomArea,
      setFloorPlanData,
    ]
  );

  const handleTouchMoveCallback = useCallback(
    (event: TouchEvent) => {
      handleTouchMove(
        event,
        dragState,
        svgRef,
        scale,
        reverseTransformCoordinates,
        calculateRoomDimensions,
        calculateRoomArea,
        setFloorPlanData,
        setDragState
      );
    },
    [
      dragState,
      reverseTransformCoordinates,
      scale,
      calculateRoomDimensions,
      calculateRoomArea,
      setFloorPlanData,
    ]
  );

  const handleMouseUpCallback = useCallback(() => {
    handleMouseUp(setDragState, checkAndUpdateOverlaps);
  }, [checkAndUpdateOverlaps, setDragState]);

  const handleTouchEndCallback = useCallback(() => {
    handleTouchEnd(setDragState, checkAndUpdateOverlaps);
  }, [checkAndUpdateOverlaps, setDragState]);

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (
        dragState.active ||
        document.body.hasAttribute("data-room-touch-interaction")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [dragState.active]);

  useEffect(() => {
    
    
    if (dragState.active) {
      document.addEventListener("mousemove", handleMouseMoveCallback);
      document.addEventListener("mouseup", handleMouseUpCallback);

      document.addEventListener("touchmove", handleTouchMoveCallback, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEndCallback);
      document.addEventListener("touchcancel", handleTouchEndCallback);

      return () => {
        document.removeEventListener("mousemove", handleMouseMoveCallback);
        document.removeEventListener("mouseup", handleMouseUpCallback);
        document.removeEventListener("touchmove", handleTouchMoveCallback);
        document.removeEventListener("touchend", handleTouchEndCallback);
        document.removeEventListener("touchcancel", handleTouchEndCallback);
      };
    }
  }, [
    dragState.active,
    handleMouseMoveCallback,
    handleMouseUpCallback,
    handleTouchMoveCallback,
    handleTouchEndCallback,
  ]);

  return {
    handleMouseMoveCallback,
    handleTouchMoveCallback,
    handleMouseUpCallback,
    handleTouchEndCallback,
  };
}

let infoToolPanelActive = false;
let activeInfoOption: string | null = null;

export function setInfoToolPanelState(
  isActive: boolean,
  option: string | null
) {
  infoToolPanelActive = isActive;
  activeInfoOption = option;
}

export function getInfoToolPanelState() {
  return { isActive: infoToolPanelActive, activeOption: activeInfoOption };
}

export function handleRoomSelection(
  roomId: string,
  event: React.MouseEvent | React.TouchEvent,
  selectedRoomIds: string[],
  setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
  handleRoomTypeUpdate?: (roomId: string, roomType: string) => void
) {
  event.stopPropagation();

  const infoPanelState = getInfoToolPanelState();

  if (infoPanelState.isActive) {
    if (
      infoPanelState.activeOption === "setRoomtype" &&
      globalSelectedRoomType &&
      handleRoomTypeUpdate
    ) {
      handleRoomTypeUpdate(roomId, globalSelectedRoomType);
    }

    return;
  }

  if ("ctrlKey" in event) {
    const isMultiSelectMode = event.ctrlKey || event.metaKey;

    if (isMultiSelectMode) {
      setSelectedRoomIds((prev) => {
        if (prev.includes(roomId)) {
          return prev.filter((id) => id !== roomId);
        } else {
          return [...prev, roomId];
        }
      });
    } else {
      setSelectedRoomIds([roomId]);
    }
  } else if ("touches" in event) {
    if (selectedRoomIds.length > 0) {
      if (!selectedRoomIds.includes(roomId)) {
        setSelectedRoomIds([...selectedRoomIds, roomId]);
      }
    } else {
      setSelectedRoomIds([roomId]);
    }
  }
}

let isPlacingLabel = false;
let pendingLabelText: string | null = null;

export function setLabelPlacementState(
  isPlacing: boolean,
  text: string | null
) {
  isPlacingLabel = isPlacing;
  pendingLabelText = text;
}

export function getLabelPlacementState() {
  return { isPlacing: isPlacingLabel, text: pendingLabelText };
}
