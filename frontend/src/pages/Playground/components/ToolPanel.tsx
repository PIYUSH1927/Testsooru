import React, { useEffect, useRef, useState } from "react";
import "./ToolPanel.css";
import { useFloorPlan } from "../FloorPlanContext";
import { Room, Point } from "../features/types";
import BuildToolsPanel from "./BuildToolsPanel";
import {
  setGlobalSelectedRoomType,
  getGlobalSelectedRoomType,
  setInfoToolPanelState,
  setLabelPlacementState,
} from "../features/eventHandlers";

interface ToolPanelProps {
  activeTool: string;
  onClose: () => void;
}

interface BuildToolsPanelProps {
  onSelectTool: (toolId: string) => void;
}

const ToolPanel: React.FC<ToolPanelProps> = ({ activeTool, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    floorPlanData,
    setFloorPlanData,
    setIsDrawingActive,
    handleRoomTypeUpdate,
    hasChanges,
    setHasChanges,
    saveFloorPlanChanges,
    resetFloorPlanChanges,
    addLabel,
  } = useFloorPlan();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeInfoOption, setActiveInfoOption] = useState<string | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [waitingForLabelPlacement, setWaitingForLabelPlacement] =
    useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const safeFloorPlanData = floorPlanData || {
    rooms: [],
    total_area: 0,
    room_count: 0,
    room_types: [],
  };

  useEffect(() => {
    setInfoToolPanelState(activeTool === "info", activeInfoOption);
    if (
      activeTool === "info" &&
      activeInfoOption === "placeLabel" &&
      waitingForLabelPlacement
    ) {
      setLabelPlacementState(true, labelText);
    } else {
      setLabelPlacementState(false, null);
    }
  }, [activeTool, activeInfoOption, waitingForLabelPlacement, labelText]);

  useEffect(() => {
    return () => {
      setInfoToolPanelState(false, null);
      setLabelPlacementState(false, null);
    };
  }, []);

  useEffect(() => {
    if (activeInfoOption === "placeLabel" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeInfoOption]);

  const positionPanel = () => {
    if (panelRef.current) {
      const activeItem = document.querySelector(`.toolbar-item`);
      if (activeItem) {
        const activeRect = activeItem.getBoundingClientRect();
        panelRef.current.style.top = `${activeRect.top}px`;
      }
    }
  };

  useEffect(() => {
    positionPanel();
  }, [activeTool]);

  useEffect(() => {
    window.addEventListener("resize", positionPanel);
    return () => {
      window.removeEventListener("resize", positionPanel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectedRoomId) {
        const isClickInFloorPlan = (event.target as Element).closest(
          ".mini-floor-plan"
        );
        const isClickOnRoom = (event.target as Element).closest(".mini-room");

        if (isClickInFloorPlan && !isClickOnRoom) {
          setSelectedRoomId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRoomId]);
  const selectedRoom = selectedRoomId
    ? safeFloorPlanData.rooms.find((room: Room) => room.id === selectedRoomId)
    : null;

  const handleRoomClick = (roomId: string) => {
    if (activeInfoOption === "setRoomtype" && selectedRoomType) {
      const room = floorPlanData.rooms.find((r) => r.id === roomId);
      if (room && room.room_type !== selectedRoomType) {
        handleRoomTypeUpdate(roomId, selectedRoomType);
        setHasLocalChanges(true);
      }
    } else {
      setSelectedRoomId(roomId === selectedRoomId ? null : roomId);
    }
  };

  const handleSelectRoomType = (roomType: string) => {
    setSelectedRoomType(roomType);
    setGlobalSelectedRoomType(roomType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && labelText.trim()) {
      e.preventDefault();
      setWaitingForLabelPlacement(true);
      setLabelPlacementState(true, labelText);
    }
  };

  const handleClose = () => {
    setGlobalSelectedRoomType(null);
    setInfoToolPanelState(false, null);
    setLabelPlacementState(false, null);
    setWaitingForLabelPlacement(false);
    onClose();
  };

  const resetLabelState = () => {
    setWaitingForLabelPlacement(false);
    setLabelText("");
    setLabelPlacementState(false, null);
  };

  const calculateBounds = () => {
    if (
      !safeFloorPlanData ||
      !safeFloorPlanData.rooms ||
      safeFloorPlanData.rooms.length === 0
    ) {
      return { minX: 0, maxX: 100, minZ: 0, maxZ: 100 };
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;

    safeFloorPlanData.rooms.forEach((room: Room) => {
      room.floor_polygon.forEach((point: Point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minZ = Math.min(minZ, point.z);
        maxZ = Math.max(maxZ, point.z);
      });
    });

    return { minX, maxX, minZ, maxZ };
  };

  const bounds = calculateBounds();
  const padding = 10;
  const previewWidth = 228;
  const previewHeight = 120;

  const scaleX =
    (previewWidth - padding * 2) / (bounds.maxX - bounds.minX || 1);
  const scaleZ =
    (previewHeight - padding * 2) / (bounds.maxZ - bounds.minZ || 1);
  const scale = Math.min(scaleX, scaleZ);

  const transformPoint = (point: Point) => {
    const x = (point.x - bounds.minX) * scale + padding;
    const y = (point.z - bounds.minZ) * scale + padding;
    return { x, y };
  };
  const getRoomColor = (roomType: string, isSelected: boolean) => {
    if (roomType === "Wall") {
      return "#333333";
    }

    if (isSelected) {
      return "#2196F3";
    }

    const colorMap: { [key: string]: string } = {
      LivingRoom: "#D5E8D4",
      Bathroom: "#DAE8FC",
      Kitchen: "#FFE6CC",
      MasterRoom: "#E1D5E7",
      SecondRoom: "#FFF2CC",
      ChildRoom: "#F8CECC",
      DiningRoom: "#D4E1F5",
      Balcony: "#B9E0A5",
    };

    return colorMap[roomType] || "#D0D0D0";
  };

  if (!activeTool || activeTool === "design") return null;

  const shouldRenderProject = activeTool === "project";

  const renderProjectPanel = () => {
    return (
      <>
        <div className="mini-floor-plan-container">
          <svg
            width={previewWidth}
            height={previewHeight}
            className="mini-floor-plan"
          >
            <rect
              width={previewWidth}
              height={previewHeight}
              fill="#f8f9fa"
              stroke="#e0e0e0"
              strokeWidth="1"
            />

            {safeFloorPlanData.rooms.map((room: Room) => {
              const isSelected = room.id === selectedRoomId;

              if (
                room.room_type === "Wall" &&
                room.floor_polygon.length === 2
              ) {
                const start = transformPoint(room.floor_polygon[0]);
                const end = transformPoint(room.floor_polygon[1]);

                return (
                  <line
                    key={room.id}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isSelected ? "#2196F3" : "#333333"}
                    strokeWidth={isSelected ? 2 : 1.5}
                    onClick={() => handleRoomClick(room.id)}
                    className="mini-room"
                  />
                );
              }

              const points = room.floor_polygon
                .map((point: Point) => {
                  const transformed = transformPoint(point);
                  return `${transformed.x},${transformed.y}`;
                })
                .join(" ");

              return (
                <polygon
                  key={room.id}
                  points={points}
                  fill={getRoomColor(room.room_type, isSelected)}
                  stroke={isSelected ? "#2196F3" : "#666"}
                  strokeWidth={isSelected ? 1.5 : 0.75}
                  onClick={() => handleRoomClick(room.id)}
                  className="mini-room"
                />
              );
            })}
          </svg>
        </div>

        <div className="area-display">
          {selectedRoom ? (
            <>
              <div className="selected-room-info">
                <span className="room-type">{selectedRoom.room_type}</span>
                <span className="room-area">
                  {selectedRoom.area?.toFixed(2)} m²
                </span>
              </div>
              <div className="room-dimensions">
                {selectedRoom.width?.toFixed(1)}' ×{" "}
                {selectedRoom.height?.toFixed(1)}'
              </div>
            </>
          ) : (
            <div className="total-area-info">
              <span className="total-area-label">Total Area</span>
              <span className="total-area-value">
                {safeFloorPlanData.total_area?.toFixed(2)} m²
              </span>
            </div>
          )}
        </div>

        <div className="panel-options project-options">
          <button className="menu-option">
            <span className="option-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12L15 15"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#555555"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="option-text">Design History</span>
            <span className="option-arrow">›</span>
          </button>

          <button className="menu-option">
            <span className="option-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 18V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V18"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M2.5 19H21.5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M7 14C7 12.3431 8.34315 11 10 11H14C15.6569 11 17 12.3431 17 14V18H7V14Z"
                  stroke="#555555"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span className="option-text">Items In Design</span>
            <span className="option-arrow">›</span>
          </button>
        </div>
      </>
    );
  };

  const renderInfoPanel = () => {
    if (activeInfoOption === "setRoomtype") {
      return (
        <div className="panel-options">
          <div className="option-header">
            <button
              className="back-button"
              onClick={() => {
                setActiveInfoOption(null);
                setGlobalSelectedRoomType(null);
                setInfoToolPanelState(activeTool === "info", null);
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="section-title1">Set Roomtype</span>
          </div>

          <p className="instruction-text">
            Select a room type, then click on a room in the floor plan to apply
            it.
          </p>

          <div className="room-type-grid">
            {[
              "LivingRoom",
              "Kitchen",
              "Bathroom",
              "MasterRoom",
              "SecondRoom",
              "Balcony",
              "DiningRoom",
              "ChildRoom",
            ].map((roomType, index) => (
              <button
                key={roomType + index}
                className={`room-type-item ${
                  selectedRoomType === roomType ? "selected" : ""
                }`}
                onClick={() => handleSelectRoomType(roomType)}
              >
                {roomType}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (activeInfoOption === "placeLabel") {
      return (
        <div className="panel-options">
          <div className="option-header">
            <button
              className="back-button"
              onClick={() => {
                setActiveInfoOption(null);
                resetLabelState();
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 12H5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="section-title1">Place Label</span>
          </div>

          <p className="instruction-text">
            Enter label text, click the button below, then place the label on
            your floor plan.
          </p>

          <div className="label-input-container">
            <input
              ref={inputRef}
              type="text"
              value={labelText}
              onChange={(e) => setLabelText(e.target.value)}
              placeholder="Enter label text"
              className="label-input"
            />

            <button
              className="apply-label-button"
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "13px",
                width: "100%",
                fontWeight: "bold",
                position: "relative",
                right: "5px",
              }}
              onClick={() => {
                if (labelText.trim()) {
                  setWaitingForLabelPlacement(true);
                  setLabelPlacementState(true, labelText);
                }
              }}
              disabled={!labelText.trim()}
            >
              Click here to place label
            </button>
          </div>

          {waitingForLabelPlacement && (
            <div
              className="click-instruction"
              style={{
                color: "#2196F3",
                marginTop: "0px",
                textAlign: "center",
                fontSize: "small",
                margin: "4px",
              }}
            >
              Now click on the floor plan to place this label
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="panel-options info-options">
          <button
            className="menu-option"
            onClick={() => setActiveInfoOption("setRoomtype")}
          >
            <span className="option-icon">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10.5V20.5C3 21.0523 3.44772 21.5 4 21.5H8V15.5C8 14.9477 8.44772 14.5 9 14.5H15C15.5523 14.5 16 14.9477 16 15.5V21.5H20C20.5523 21.5 21 21.0523 21 20.5V10.5"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 10L12 2L2 10"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="option-text">Set Roomtype</span>
            <span className="option-arrow">›</span>
          </button>

          <button
            className="menu-option"
            onClick={() => setActiveInfoOption("placeLabel")}
          >
            <span className="option-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 19V5H20V19H4Z"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 10H15"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 14H16"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="option-text">Place Label</span>
            <span className="option-arrow">›</span>
          </button>

          <button className="menu-option">
            <span className="option-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#555555"
                  strokeWidth="2"
                />
                <path
                  d="M12 8V16"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M8 12L16 12"
                  stroke="#555555"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="option-text">Place Signs & Symbols</span>
            <span className="option-arrow">›</span>
          </button>
        </div>
      );
    }
  };

  const renderPanelContent = () => {
    switch (activeTool) {
      case "project":
        return renderProjectPanel();

      case "build":
        return <BuildToolsPanel onSelectTool={(toolId: string) => {}} />;

      case "info":
        return renderInfoPanel();

      case "objects":
        return (
          <div className="panel-options furniture-options">
            <div className="furniture-item">
              <div className="furniture-icon">🛋️</div>
              <span>Sofa</span>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon">🛏️</div>
              <span>Bed</span>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon">🪑</div>
              <span>Chair</span>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon">🪟</div>
              <span>Window</span>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon">🚪</div>
              <span>Door</span>
            </div>
            <div className="furniture-item">
              <div className="furniture-icon">🍽️</div>
              <span>Table</span>
            </div>
          </div>
        );

      case "styleboards":
        return (
          <div className="panel-options">
            <p>Style options for your project</p>
          </div>
        );

      case "exports":
        return (
          <div className="panel-options">
            <button className="export-button">PNG Image</button>
            <button className="export-button">PDF Document</button>
            <button className="export-button">CAD File</button>
            <div className="checkbox-control">
              <input type="checkbox" id="include-measurements" />
              <label htmlFor="include-measurements">Include Measurements</label>
            </div>
            <div className="checkbox-control">
              <input type="checkbox" id="include-furniture" />
              <label htmlFor="include-furniture">Include Furniture</label>
            </div>
          </div>
        );

      case "help":
        return (
          <div className="panel-options">
            <p>Need help with something?</p>
            <ul className="help-links">
              <li>
                <a href="#">Getting Started Guide</a>
              </li>
              <li>
                <a href="#">Video Tutorials</a>
              </li>
              <li>
                <a href="#">Keyboard Shortcuts</a>
              </li>
              <li>
                <a href="#">Contact Support</a>
              </li>
            </ul>
          </div>
        );

      default:
        return <p>Select a tool to begin</p>;
    }
  };

  const getPanelTitle = () => {
    switch (activeTool) {
      case "project":
        return selectedRoom ? selectedRoom.room_type : "Project";
      case "build":
        return "Build";
      case "info":
        return "Info";
      case "objects":
        return "Objects";
      case "styleboards":
        return "Styleboards";
      case "finishes":
        return "Finishes";
      case "exports":
        return "Exports";
      case "help":
        return "Help";
      case "colors":
        return "Colors";
      default:
        return `${
          activeTool.charAt(0).toUpperCase() + activeTool.slice(1)
        } Tools`;
    }
  };

  return (
    <div className="tool-panel" ref={panelRef}>
      <div className="panel-header">
        <h2>{getPanelTitle()}</h2>
        <button className="close-panel" onClick={handleClose}>
          ×
        </button>
      </div>
      <div className="panel-content">{renderPanelContent()}</div>
    </div>
  );
};

export default ToolPanel;
