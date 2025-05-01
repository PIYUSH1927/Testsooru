import { useRef, useEffect } from "react";
import Generated from "../Generated"; 
import { useFloorPlan } from "../FloorPlanContext";

interface InfiniteGridProps {
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
  visualizationOptions?: any;
}

export const InfiniteGrid = ({ 
  width, 
  height, 
  scale, 
  position, 
  rotation,
  visualizationOptions 
}: InfiniteGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { activeBuildTool } = useFloorPlan();

  const isDrawingActive = activeBuildTool === "drawWall" || activeBuildTool === "drawRoom";
  
  const scaledPosition = {
    x: position.x * scale,
    y: position.y * scale
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    updateCanvasSize();

    const drawNestedGrid = () => {
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const subdivisions = 12; 
      const baseGridSize = 300; 
      const zoomCycle = Math.log(scale/2) / Math.log(subdivisions) % 1;
      const maxLevels = Math.min(3, Math.max(1, Math.floor(scale)));

      for (let level = 0; level < maxLevels; level++) {
        const gridSize = baseGridSize * Math.pow(1/subdivisions, level) * scale;
        const cellSize = gridSize / subdivisions;
        
        let visibility;
        if (level === 0) {
          visibility = 1.0;
        } else {
          const distFromCycle = Math.abs(level - (maxLevels * zoomCycle));
          visibility = 0.8 - Math.min(0.6, distFromCycle * 0.3);
        }

        ctx.strokeStyle = `rgba(200, 210, 220, ${visibility})`; 
        ctx.lineWidth = 0.5 + (visibility * 0.5); 
        
        const offsetX = (position.x * scale) % cellSize;
        const offsetY = (position.y * scale) % cellSize;
        
        for (let i = 0; i <= subdivisions; i++) {
          for (let x = offsetX + (i * cellSize); x < canvas.width + cellSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
        }
        
        for (let i = 0; i <= subdivisions; i++) {
          for (let y = offsetY + (i * cellSize); y < canvas.height + cellSize; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }
      }
    };

    const handleResize = () => {
      updateCanvasSize();
      drawNestedGrid();
    };

    window.addEventListener('resize', handleResize);
    drawNestedGrid();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scale, position, rotation, width, height]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        touchAction: isDrawingActive ? "none" : "auto" 
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          zIndex: -1,
          backgroundColor: "#f7f7f7" 
        }}
      />
      
      <div
        style={{
          position: "absolute",
          top: "49%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${scaledPosition.x}px, ${scaledPosition.y}px) scale(${scale}) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          zIndex: 10
        }}
      >
        <Generated
          rotation={rotation}
          visualizationOptions={visualizationOptions}
        />
      </div>
    </div>
  );
};