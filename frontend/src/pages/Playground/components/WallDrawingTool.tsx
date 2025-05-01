// components/WallDrawingTool.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Point } from '../features/types';
import { createWallPolygon } from '../features/drawingTools';
import { useFloorPlan } from '../FloorPlanContext';

interface WallDrawingToolProps {
  isActive: boolean;
  svgRef: React.RefObject<SVGSVGElement | null>;
  reverseTransformCoordinates: (x: number, y: number) => Point;
  transformCoordinates: (point: Point) => { x: number; y: number };
  scale: number;
  onWallCreated: (wallPolygon: Point[]) => void;
  onDrawingStateChange: (isDrawing: boolean) => void;
}

const WallDrawingTool: React.FC<WallDrawingToolProps> = ({
  isActive,
  svgRef,
  reverseTransformCoordinates,
  transformCoordinates,
  scale,
  onWallCreated,
  onDrawingStateChange
}) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Store the SVG element's current transformation matrix
  const transformMatrixRef = useRef<DOMMatrix | null>(null);
  
  const { setActiveBuildTool } = useFloorPlan();

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

  // Function to get accurate mouse position in SVG coordinate space
  const getMousePosition = (e: MouseEvent, svg: SVGSVGElement) => {
    const CTM = svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  useEffect(() => {
    if (!isActive || !svgRef.current) return;

    const svg = svgRef.current;

    const handleSvgMouseDown = (e: MouseEvent) => {
      if (!isActive) return;
      
      // Get direct SVG coordinates using the current transformation matrix
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Get world coordinates that properly account for both scale and position
      const point = reverseTransformCoordinates(x, y);
      
      if (!isDrawing) {
        setStartPoint(point);
        setCurrentPoint(point);
        setIsDrawing(true);
        onDrawingStateChange(true);
      } else {
        setIsDrawing(false);
        onDrawingStateChange(false);

        if (startPoint && calculateDistance(startPoint, point) > 5 / scale) {
          const wallPolygon = createWallPolygon(startPoint, point);
          onWallCreated(wallPolygon);
        }

        setStartPoint(null);
        setCurrentPoint(null);
        exitDrawingMode();
      }
    };

    const handleSvgMouseMove = (e: MouseEvent) => {
      if (!isActive || !isDrawing) return;
      
      // Get direct SVG coordinates using the current transformation matrix
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Get world coordinates that properly account for both scale and position
      const point = reverseTransformCoordinates(x, y);
      setCurrentPoint(point);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawing) {
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
        onDrawingStateChange(false);
        exitDrawingMode();
      }
    };

    svg.addEventListener('mousedown', handleSvgMouseDown);
    svg.addEventListener('mousemove', handleSvgMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      svg.removeEventListener('mousedown', handleSvgMouseDown);
      svg.removeEventListener('mousemove', handleSvgMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, isDrawing, startPoint, reverseTransformCoordinates, scale, svgRef, onWallCreated, onDrawingStateChange, setActiveBuildTool]);

  if (!isActive || !startPoint || !currentPoint || !isDrawing) return null;

  // Create wall polygon and transform it to screen coordinates
  const wallPoints = createWallPolygon(startPoint, currentPoint);
  const transformedStart = transformCoordinates(wallPoints[0]);
  const transformedEnd = transformCoordinates(wallPoints[1]);

  return (
    <>
      <line
        x1={transformedStart.x}
        y1={transformedStart.y}
        x2={transformedEnd.x}
        y2={transformedEnd.y}
        stroke="#333333"  
        strokeWidth={2}  
        strokeDasharray="5,5"
      />
      <circle
        cx={transformedStart.x}
        cy={transformedStart.y}
        r={5}
        fill="#0066cc"
      />
      <circle
        cx={transformedEnd.x}
        cy={transformedEnd.y}
        r={5}
        fill="#0066cc"
      />
    </>
  );
};

function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.z - p1.z, 2));
}

export default WallDrawingTool;