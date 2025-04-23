import { useRef, useEffect } from "react";

interface InfiniteGridProps {
  width: number;
  height: number;
  scale: number;
  position: { x: number; y: number };
  rotation: number;
}

export const InfiniteGrid = ({ width, height, scale, position, rotation }: InfiniteGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    updateCanvasSize();

    const drawNestedGrid = () => {
      // Clear the canvas
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // We want each grid to have 144 cells (12x12)
      const subdivisions = 12; // Each grid level will have 12x12=144 cells
      
      // Base grid size - adjusting for desired box size
      const baseGridSize = 300; // Adjusted for better visual size
      
      // Calculate the current zoom "cycle"
      const zoomCycle = Math.log(scale/2) / Math.log(subdivisions) % 1;
      
      // How many levels to draw (more at higher zoom)
      const maxLevels = Math.min(3, Math.max(1, Math.floor(scale)));
      
      // Calculate grid sizes for different levels
      for (let level = 0; level < maxLevels; level++) {
        // Calculate this level's grid size
        const gridSize = baseGridSize * Math.pow(1/subdivisions, level) * scale;
        const cellSize = gridSize / subdivisions;
        
        // Calculate visibility for this level based on zoom cycle
        let visibility;
        if (level === 0) {
          // Outermost grid - make it darker
          visibility = 1.0;
        } else {
          // Inner grids
          const distFromCycle = Math.abs(level - (maxLevels * zoomCycle));
          visibility = 0.8 - Math.min(0.6, distFromCycle * 0.3);
        }
        
        // Set drawing properties - much darker lines
        ctx.strokeStyle = `rgba(200, 210, 220, ${visibility})`; // Darker color
        ctx.lineWidth = 0.5 + (visibility * 0.5); // Slightly thicker lines
        
        // Calculate offsets based on position
        const offsetX = (position.x * scale) % cellSize;
        const offsetY = (position.y * scale) % cellSize;
        
        // Draw vertical lines
        for (let i = 0; i <= subdivisions; i++) {
          for (let x = offsetX + (i * cellSize); x < canvas.width + cellSize; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
        }
        
        // Draw horizontal lines
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
  }, [scale, position, rotation]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          backgroundColor: "#ffffff" 
        }}
      />
    </div>
  );
};