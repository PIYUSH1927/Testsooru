// features/eventHandlers.tsx
import React, { useCallback, RefObject, useEffect } from "react";
import {
  handleMouseMove,
  handleTouchMove,
  handleMouseUp,
  handleTouchEnd,
  useNonPassiveTouchHandling,
} from "./resizing";
import { Label } from "./types";

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
  // Add these new properties
  isLabelDragging?: boolean;
  labelId?: string | null;
  initialLabelPosition?: Point;
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
  labels?: Label[]; // Make sure this is here
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
        setDragState,
        checkAndUpdateOverlaps
      );
    },
    [
      dragState,
      reverseTransformCoordinates,
      scale,
      calculateRoomDimensions,
      calculateRoomArea,
      setFloorPlanData,
      checkAndUpdateOverlaps,
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
        setDragState,
        checkAndUpdateOverlaps
      );
    },
    [
      dragState,
      reverseTransformCoordinates,
      scale,
      calculateRoomDimensions,
      calculateRoomArea,
      setFloorPlanData,
      checkAndUpdateOverlaps
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
        document.body.hasAttribute("data-room-touch-interaction") ||
        document.body.hasAttribute("data-label-touch-interaction") ||
        dragState.isLabelDragging
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [dragState.active, dragState.isLabelDragging]);

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

  if (isActive && option === "setRoomtype") {
    document.body.classList.add('roomtype-mode');
  } else {
    document.body.classList.remove('roomtype-mode');
  }
}

export function getInfoToolPanelState() {
  return { isActive: infoToolPanelActive, activeOption: activeInfoOption };
}

export function handleRoomSelection(
  roomId: string,
  event: React.MouseEvent | React.TouchEvent,
  selectedRoomIds: string[],
  setSelectedRoomIds: React.Dispatch<React.SetStateAction<string[]>>,
  handleRoomTypeUpdate?: (roomId: string, roomType: string) => void,
  openProjectPanel?: (roomId: string) => void
) {
  event.stopPropagation();

  const infoPanelState = getInfoToolPanelState();

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
      const isNewSelection =
        selectedRoomIds.length !== 1 || selectedRoomIds[0] !== roomId;

      setSelectedRoomIds([roomId]);

      if (isNewSelection && openProjectPanel) {
        openProjectPanel(roomId);
      }
    }
  } else if ("touches" in event) {
    if (selectedRoomIds.length > 0) {
      if (!selectedRoomIds.includes(roomId)) {
        setSelectedRoomIds([...selectedRoomIds, roomId]);

        if (openProjectPanel) {
          openProjectPanel(roomId);
        }
      }
    } else {
      setSelectedRoomIds([roomId]);

      if (openProjectPanel) {
        openProjectPanel(roomId);
      }
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

export function handleLabelMouseDown(
  event: React.MouseEvent,
  labelId: string,
  svgRef: React.RefObject<SVGSVGElement | null>,
  label: Label,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>,
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
) {
  event.stopPropagation();
  event.preventDefault();

  if (!svgRef.current) return;

  const rect = svgRef.current.getBoundingClientRect();
  const startX = event.clientX - rect.left;
  const startY = event.clientY - rect.top;

  setDragState({
    active: true,
    roomId: null,
    roomIds: [],
    vertexIndex: null,
    edgeIndices: null,
    startX,
    startY,
    lastX: startX,
    lastY: startY,
    isResizing: false,
    isEdgeResizing: false,
    isGroupOperation: false,
    isLabelDragging: true,
    labelId: labelId,
    initialLabelPosition: { ...label.position }
  });

  setHasChanges(true);
}

export function handleLabelTouchStart(
  event: React.TouchEvent,
  labelId: string,
  svgRef: React.RefObject<SVGSVGElement | null>,
  label: Label,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>,
  setHasChanges: React.Dispatch<React.SetStateAction<boolean>>
) {
  event.stopPropagation();

  if (!svgRef.current) return;

  const touch = event.touches[0];
  const rect = svgRef.current.getBoundingClientRect();
  const startX = touch.clientX - rect.left;
  const startY = touch.clientY - rect.top;

  setDragState({
    active: true,
    roomId: null,
    roomIds: [],
    vertexIndex: null,
    edgeIndices: null,
    startX,
    startY,
    lastX: startX,
    lastY: startY,
    isResizing: false,
    isEdgeResizing: false,
    isGroupOperation: false,
    isLabelDragging: true,
    labelId: labelId,
    initialLabelPosition: { ...label.position }
  });

  document.body.setAttribute("data-label-touch-interaction", "true");
  setHasChanges(true);
}