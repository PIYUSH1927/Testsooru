// components/RoomDrawingTool.tsx
import React, { useEffect, useState } from "react";
import { Point } from "../features/types";
import { generateRoomPolygon } from "../features/drawingTools";
import { useFloorPlan } from "../FloorPlanContext";
import { calculateBounds } from "../features/coordinates";

interface RoomDrawingToolProps {
  isActive: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  reverseTransformCoordinates: (x: number, y: number) => Point;
  transformCoordinates: (point: Point) => { x: number; y: number };
  onRoomCreated: (roomPolygon: Point[]) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
}

const RoomDrawingTool: React.FC<RoomDrawingToolProps> = ({
  isActive,
  svgRef,
  reverseTransformCoordinates,
  transformCoordinates,
  onRoomCreated,
  onDrawingStateChange,
}) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const { setActiveBuildTool, floorPlanData, setFloorPlanData } =
    useFloorPlan();

  useEffect(() => {
    if (!isActive) {
      setStartPoint(null);
      setCurrentPoint(null);
      setIsDrawing(false);
      onDrawingStateChange(false);
    }
  }, [isActive, onDrawingStateChange]);

  const exitDrawingMode = () => {
    setActiveBuildTool(null);
  };

  useEffect(() => {
    if (!isActive || !svgRef.current) return;

    const svg = svgRef.current;

    const handleSvgMouseDown = (e: MouseEvent) => {
      if (!isActive) return;

      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = reverseTransformCoordinates(x, y);

      if (!isDrawing) {
        setStartPoint(point);
        setCurrentPoint(point);
        setIsDrawing(true);
        onDrawingStateChange(true);
      } else {
        setIsDrawing(false);
        onDrawingStateChange(false);

        if (startPoint && calculateDistance(startPoint, point) > 10) {
          const roomPolygon = generateRoomPolygon(startPoint, point);
          onRoomCreated(roomPolygon);
        }

        setStartPoint(null);
        setCurrentPoint(null);
        exitDrawingMode();
      }
    };

    const handleSvgMouseMove = (e: MouseEvent) => {
      if (!isActive || !isDrawing) return;

      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = reverseTransformCoordinates(x, y);
      setCurrentPoint(point);

      if (startPoint) {
        const temporaryRoomPolygon = generateRoomPolygon(startPoint, point);

        const tempRoom = {
          id: "temp-drawing-room",
          room_type: "TempRoom",
          area: 0,
          height: 0,
          width: 0,
          floor_polygon: temporaryRoomPolygon,
        };

        const tempRooms = [...floorPlanData.rooms, tempRoom];

        const newBounds = calculateBounds(tempRooms);

        setFloorPlanData({
          ...floorPlanData,
          rooms: floorPlanData.rooms,
        });

        const boundsEvent = new CustomEvent("temporaryBoundsUpdate", {
          detail: newBounds,
        });
        window.dispatchEvent(boundsEvent);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawing) {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
        onDrawingStateChange(false);
        exitDrawingMode();
      }
    };

    svg.addEventListener("mousedown", handleSvgMouseDown);
    svg.addEventListener("mousemove", handleSvgMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      svg.removeEventListener("mousedown", handleSvgMouseDown);
      svg.removeEventListener("mousemove", handleSvgMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isActive,
    isDrawing,
    startPoint,
    reverseTransformCoordinates,
    svgRef,
    onRoomCreated,
    onDrawingStateChange,
    setActiveBuildTool,
    ,
    floorPlanData,
    setFloorPlanData,
  ]);

  if (!isActive || !startPoint || !currentPoint || !isDrawing) return null;

  const roomPolygon = generateRoomPolygon(startPoint, currentPoint);
  const transformedPolygon = roomPolygon.map(transformCoordinates);
  const polygonPoints = transformedPolygon
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <>
      <polygon
        points={polygonPoints}
        fill="rgba(0, 102, 204, 0.3)"
        stroke="#0066cc"
        strokeWidth={2}
        strokeDasharray="5,5"
      />
    </>
  );
};

function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
}

export default RoomDrawingTool;
