import { useState, useCallback, useEffect, useRef } from "react";
import { InfiniteGrid } from "./Playground/components/Grid";
import Generated from "./Playground/Generated";
import { Compass } from "./Playground/components/Compass";
import { useNavigate } from "react-router-dom";
import "./Playground.css";
import VerticalToolbar from "./Playground/components/VerticalToolbar";
import ToolPanel from "./Playground/components/ToolPanel";
import VisualizationPanel from "./Playground/components/VisualizationPanel";
import { FloorPlanProvider, useFloorPlan } from "./Playground/FloorPlanContext";
import { Download, ArrowBack, Share } from "@mui/icons-material";

const roomData = [
  { name: "Master Bedroom", count: 0, width: 12, length: 10, open: false },
  { name: "Bathroom", count: 0, width: 7, length: 4, open: false },
  { name: "Kitchen", count: 0, width: 8, length: 12, open: false },
  { name: "Living Room", count: 0, width: 12, length: 10, open: false },
  { name: "Secondary Room", count: 0, width: 11, length: 9, open: false },
  { name: "Children Room", count: 0, width: 10, length: 9, open: false },
  { name: "Dining Room", count: 0, width: 11, length: 9, open: false },
  { name: "Balcony", count: 0, width: 10, length: 4, open: false },
];

const PlaygroundWithProvider = () => {
  return (
    <FloorPlanProvider>
      <PlaygroundContent />
    </FloorPlanProvider>
  );
};
const PlaygroundContent = () => {
  const {
    visualizationOptions,
    activeTool,
    setActiveTool,
    activeBuildTool,
    setActiveBuildTool,
    isDrawingActive,
  } = useFloorPlan();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isMiniModalOpen, setIsMiniModalOpen] = useState(false);
  const [rooms, setRooms] = useState(roomData);
  const [showVisualizationPanel, setShowVisualizationPanel] = useState(false);
  const [showToolPanel, setShowToolPanel] = useState(false);

  const [showAll, setShowAll] = useState(false);
  const [allottedWidth, setAllottedWidth] = useState(30);
  const [allottedHeight, setAllottedHeight] = useState(40);

  const [touchStartDistance, setTouchStartDistance] = useState(0);

  useEffect(() => {
    if (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [activeBuildTool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "+" || e.key === "-" || e.key === "=") {
          e.preventDefault();
        }
      }

      if (
        e.key === "Escape" &&
        (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom")
      ) {
        exitDrawingMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeBuildTool]);

  useEffect(() => {
    const preventNavigation = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", preventNavigation, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchmove", preventNavigation);
    };
  }, [isDragging]);

  const scaledPosition = {
    x: position.x * scale,
    y: position.y * scale,
  };

  const exitDrawingMode = () => {
    setActiveBuildTool(null);
    setActiveTool("build");
  };

  useEffect(() => {
    const targetElement = containerRef.current;
    if (!targetElement) return;

    const handleWheel = (e: WheelEvent) => {
      if (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") {
        e.preventDefault();
        return;
      }

      if (isModalOpen || isDrawingActive) return;

      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale((prevScale) =>
          Math.min(Math.max(0.1, prevScale * delta), 4000)
        );
      } else {
        setPosition((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    targetElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      targetElement.removeEventListener("wheel", handleWheel);
    };
  }, [isModalOpen, scale, isDrawingActive, activeBuildTool]);

  const getDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") {
      e.preventDefault();
      return;
    }

    if (isModalOpen || isDrawingActive) return;

    if (document.body.getAttribute("data-room-touch-interaction") === "true") {
      return;
    }

    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);
      setTouchStartDistance(distance);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMousePosition({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
    if (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") {
      e.preventDefault();
      return;
    }

    if (isModalOpen || isDrawingActive) return;

    if (document.body.getAttribute("data-room-touch-interaction") === "true") {
      return;
    }

    e.preventDefault();

    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);
      if (touchStartDistance > 0) {
        const delta = distance / touchStartDistance;
        setScale((prevScale) =>
          Math.min(Math.max(0.1, prevScale * delta), 4000)
        );
        setTouchStartDistance(distance);
      }
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePosition.x;
      const dy = touch.clientY - lastMousePosition.y;
      setPosition((prev) => ({
        x: prev.x + dx / scale,
        y: prev.y + dy / scale,
      }));
      setLastMousePosition({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>): void => {
    setIsDragging(false);
    setTouchStartDistance(0);
  };

  useEffect(() => {
    const element = document.querySelector(".absolute.inset-0") as HTMLElement;
    if (element) {
      const touchStartWrapper = (e: TouchEvent) => {
        if (
          document.body.getAttribute("data-room-touch-interaction") === "true"
        ) {
          return;
        }
        (handleTouchStart as unknown as EventListener)(e);
      };

      const touchMoveWrapper = (e: TouchEvent) => {
        if (
          document.body.getAttribute("data-room-touch-interaction") === "true"
        ) {
          return;
        }
        (handleTouchMove as unknown as EventListener)(e);
      };

      element.addEventListener("touchstart", touchStartWrapper, {
        passive: false,
      });
      element.addEventListener("touchmove", touchMoveWrapper, {
        passive: false,
      });
      element.addEventListener(
        "touchend",
        handleTouchEnd as unknown as EventListener
      );

      return () => {
        element.removeEventListener("touchstart", touchStartWrapper);
        element.removeEventListener("touchmove", touchMoveWrapper);
        element.removeEventListener(
          "touchend",
          handleTouchEnd as unknown as EventListener
        );
      };
    }
  }, [
    scale,
    isDragging,
    lastMousePosition,
    touchStartDistance,
    isModalOpen,
    activeBuildTool,
  ]);

  const handleWheel = (e: React.WheelEvent) => {
    if (
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    ) {
      e.preventDefault();
      return;
    }
  };

  const toggleDropdown = (index: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, i) =>
        i === index ? { ...room, open: !room.open } : room
      )
    );
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") {
      return;
    }

    if (isDrawingActive) return;

    setIsDragging(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (
      !isDragging ||
      isDrawingActive ||
      activeBuildTool === "drawWall" ||
      activeBuildTool === "drawRoom"
    )
      return;

    const dx = event.clientX - lastMousePosition.x;
    const dy = event.clientY - lastMousePosition.y;
    setPosition((prev) => ({ x: prev.x + dx / scale, y: prev.y + dy / scale }));
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateRoomCount = (index: number, delta: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, i) =>
        i === index ? { ...room, count: Math.max(0, room.count + delta) } : room
      )
    );
  };

  const updateRoomSize = (
    index: number,
    field: "width" | "length",
    value: number
  ) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    );
  };

  const handleToolSelected = (toolId: string) => {
    setActiveTool(toolId);

    if (toolId === "colors") {
      setShowVisualizationPanel(true);
      setShowToolPanel(false);
    } else if (toolId !== "design") {
      setShowToolPanel(true);
      setShowVisualizationPanel(false);
    } else {
      setShowToolPanel(false);
      setShowVisualizationPanel(false);
    }
  };

  const handleCloseToolPanel = () => {
    setShowToolPanel(false);
    setActiveTool("design");
    setActiveBuildTool(null);
  };

  const handleCloseVisualizationPanel = () => {
    setShowVisualizationPanel(false);
    setActiveTool("design");
  };

  const totalArea = rooms.reduce(
    (sum, room) => sum + room.count * room.width * room.length,
    0
  );

  const totalRooms = rooms.reduce((sum, room) => sum + room.count, 0);
  const navigate = useNavigate();

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${
        visualizationOptions.darkMode ? "dark-mode" : ""
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        overflow: "hidden",
        width: "100%",
        height: "100%",
        position: "fixed",
        overscrollBehavior: "none",
        touchAction: "pan-y",
      }}
    >
      <InfiniteGrid
        width={window.innerWidth}
        height={window.innerHeight}
        scale={scale}
        position={position}
        rotation={rotation}
        visualizationOptions={visualizationOptions}
      />

      {/* 
      <div
        style={{
          position: "absolute",
          top: "49%",
          left: "51%",
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
      */}

      <VerticalToolbar onToolSelected={handleToolSelected} />
      {showToolPanel && (
        <ToolPanel activeTool={activeTool} onClose={handleCloseToolPanel} />
      )}

      {showVisualizationPanel && (
        <VisualizationPanel onClose={handleCloseVisualizationPanel} />
      )}

      <div className="compass-container">
        <Compass
          size={window.innerWidth < 768 ? 45 : 60}
          rotation={rotation}
          onRotate={setRotation}
        />
      </div>

      {(activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") && (
        <div
          style={{
            position: "fixed",
            top: "15px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 20px",
            width: "auto",
            backgroundColor: "rgba(33, 150, 243, 0.8)",
            color: "white",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            zIndex: 2000,
            textAlign: "center",
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        >
          {activeBuildTool === "drawWall"
            ? "Wall Drawing Mode: Click to start, click again to finish"
            : "Room Drawing Mode: Click to start, click again to finish"}
        </div>
      )}

      {(activeBuildTool === "drawWall" || activeBuildTool === "drawRoom") && (
        <div
          style={{
            position: "fixed",
            bottom: "13px",
            left: "7%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "5px 12px",
            backgroundColor: "rgba(255, 0, 0, 0.7)",
            color: "white",
            borderRadius: "5px",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
          onClick={exitDrawingMode}
        >
          <span style={{ fontSize: "16px" }}>✕</span>
          Exit Drawing Mode
        </div>
      )}

      <div
        className="three-d-icon1"
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div
          onClick={() => navigate("/projects")}
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid black",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          <ArrowBack
            style={{
              marginRight: "8px",
              fontSize: "22px",
            }}
          />
          Back
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid black",
            borderRadius: "8px",
            padding: "8px 14px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "black",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          <Download
            style={{
              marginRight: "8px",
              transform: "scaleX(0.7)",
              fontSize: "22px",
            }}
          />
          Download
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid black",
            borderRadius: "8px",
            padding: "8px 16px",
            cursor: "pointer",
            backgroundColor: "black",
            color: "white",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          <Share style={{ marginRight: "8px", fontSize: "medium" }} />
          Share
        </div>
      </div>

      <div
        className="three-d-icon"
        style={{
          display: "flex",
          border: "1px solid black",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
          width: "100px",
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "8px 0",
            backgroundColor: "black",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          2D
        </div>
        <div
        onClick={() => navigate("/3D")}
          style={{
            flex: 1,
            padding: "8px 0",
            backgroundColor: "transparent",
            color: "#555",
            fontWeight: "bold",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          3D
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontWeight: "bolder" }}>House Parameters</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsMiniModalOpen(true);
                }}
              >
                ✖
              </button>
            </div>

            <div className="room-list">
              <h3>Site Dimensions</h3>
              <div className="input-container">
                <label>Width (ft):</label>
                <input
                  type="number"
                  value={allottedWidth}
                  onChange={(e) =>
                    setAllottedWidth(parseFloat(e.target.value) || 0)
                  }
                />
                <label>Length (ft):</label>
                <input
                  type="number"
                  value={allottedHeight}
                  onChange={(e) =>
                    setAllottedHeight(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <p className="total-area">
                Total Area:{" "}
                <span>
                  <b>{allottedWidth * allottedHeight} ft²</b>
                </span>
              </p>

              {totalArea > allottedWidth * allottedHeight && (
                <p className="warning">
                  ⚠ Your allotted area exceeds the area constraint!
                </p>
              )}
            </div>

            <div className="room-list">
              <h3>Rooms</h3>
              {(showAll ? rooms : rooms.slice(0, 3)).map((room, index) => (
                <div key={index} className="room-item">
                  <div
                    className="room-header"
                    onClick={() => toggleDropdown(index)}
                  >
                    <span className="room-name" style={{ textAlign: "left" }}>
                      {room.name}
                    </span>
                    <span className="arrow-icon">{room.open ? "▾" : "▸"}</span>
                    <div className="counter">
                      <button
                        style={{ fontSize: "15px", color: "black" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRoomCount(index, -1);
                        }}
                      >
                        -
                      </button>
                      <span>{room.count}</span>
                      <button
                        style={{ fontSize: "15px", color: "black" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRoomCount(index, 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {room.open &&
                    Array.from({ length: room.count }).map((_, i) => (
                      <div key={i} className="room-details">
                        <div className={`room-box ${i === 0 ? "active" : ""}`}>
                          <span>
                            ⬜ {room.name} {i + 1}
                          </span>
                          <div className="size-input">
                            <input
                              type="number"
                              value={room.width}
                              onChange={(e) =>
                                updateRoomSize(
                                  index,
                                  "width",
                                  parseFloat(e.target.value)
                                )
                              }
                            />
                            ×
                            <input
                              type="number"
                              value={room.length}
                              onChange={(e) =>
                                updateRoomSize(
                                  index,
                                  "length",
                                  parseFloat(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
              <button
                className="see-more-btn"
                onClick={() => setShowAll(!showAll)}
                style={{ color: "black" }}
              >
                {showAll ? "− See less" : "+ See more"}
              </button>
            </div>
            <hr />
            <div className="total-info">
              <p className="total-area">
                Sum of Total area:{" "}
                <span>
                  <b>{totalArea.toFixed(1)} ft²</b>
                </span>
              </p>
              <p className="total-rooms">
                Total Rooms:{" "}
                <span>
                  <b>{totalRooms}</b>
                </span>
              </p>
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsMiniModalOpen(true);
                }}
                className="generate-btn"
              >
                ✨Generate Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {isMiniModalOpen && (
        <div className="modal-overlay1 mini">
          <div className="modal mini-modal">
            <div className="modal-header">
              <h2 style={{ fontWeight: "bolder", color: "black" }}>
                House Parameters
              </h2>
              <button
                className="close-btn"
                onClick={() => {
                  setIsMiniModalOpen(false);
                  setIsModalOpen(true);
                }}
              >
                ➕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaygroundWithProvider;
