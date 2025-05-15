import React, { useEffect, useRef, useState } from "react";
import "./ToolPanel.css";
import { useFloorPlan } from "../FloorPlanContext";
import { Room, Point } from "../features/types";
import BuildToolsPanel from "./BuildToolsPanel";
import ObjectsPanel from "./ObjectsPanel";
import ExportsPanel from "./ExportsPanel";
import HelpPanel from "./HelpPanel";
import {
  setGlobalSelectedRoomType,
  getGlobalSelectedRoomType,
  setInfoToolPanelState,
  setLabelPlacementState,
} from "../features/eventHandlers";

interface TouchDragSystem {
  isDragging: boolean;
  roomType: string | null;
  dropTarget: string | null;
  ghostElement: HTMLDivElement | null;
  startDrag: (roomType: string, getRoomColor: (roomType: string, isSelected: boolean) => string) => void;
  updatePosition: (x: number, y: number) => void;
  endDrag: (
    handleRoomTypeUpdate: (roomId: string, roomType: string) => void,
    setHasChanges: (value: boolean) => void,
    floorPlanData: any
  ) => void;
}

declare global {
  interface Window {
    touchDragSystem?: TouchDragSystem;
  }
}

const createTouchDragSystem = (): TouchDragSystem => {
  if (window.touchDragSystem) return window.touchDragSystem;

  const system: TouchDragSystem = {
    isDragging: false,
    roomType: null,
    dropTarget: null,
    ghostElement: null,

    startDrag(roomType: string, getRoomColor: (roomType: string, isSelected: boolean) => string) {
      this.isDragging = true;
      this.roomType = roomType;

      this.ghostElement = document.createElement('div');
      this.ghostElement.id = 'touch-drag-ghost';
      this.ghostElement.textContent = roomType;
      this.ghostElement.style.position = 'fixed';
      this.ghostElement.style.zIndex = '10000';
      this.ghostElement.style.backgroundColor = getRoomColor(roomType, false);
      this.ghostElement.style.padding = '8px 12px';
      this.ghostElement.style.borderRadius = '4px';
      this.ghostElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      this.ghostElement.style.pointerEvents = 'none';
      this.ghostElement.style.transform = 'translate(-50%, -50%)';
      this.ghostElement.style.fontWeight = 'bold';
      document.body.appendChild(this.ghostElement);

      document.body.setAttribute('data-touch-dragging-room-type', roomType);
    },

    updatePosition(x: number, y: number) {
      if (!this.isDragging || !this.ghostElement) return;

      this.ghostElement.style.left = `${x}px`;
      this.ghostElement.style.top = `${y}px`;

      const elementsAtPoint = document.elementsFromPoint(x, y);
      const roomElement = elementsAtPoint.find(el =>
        el.classList && el.classList.contains('room-polygon') && !el.classList.contains('wall-polygon')
      ) as HTMLElement | undefined;

      const prevHighlighted = document.querySelectorAll('.touch-drop-target');
      prevHighlighted.forEach(el => el.classList.remove('touch-drop-target'));

      if (roomElement) {
        roomElement.classList.add('touch-drop-target');
        this.dropTarget = roomElement.id;
      } else {
        this.dropTarget = null;
      }
    },

    endDrag(handleRoomTypeUpdate, setHasChanges, floorPlanData) {
      if (!this.isDragging) return;

      if (this.dropTarget && this.roomType) {
        const roomId = this.dropTarget;
        const room = floorPlanData.rooms.find((r: any) => r.id === roomId);

        if (room && room.room_type !== this.roomType) {
          handleRoomTypeUpdate(roomId, this.roomType);
          setHasChanges(true);

          const roomElement = document.getElementById(roomId);
          if (roomElement) {
            roomElement.classList.add('room-updated');
            setTimeout(() => {
              roomElement.classList.remove('room-updated');
            }, 300);
          }
        }
      }

      if (this.ghostElement) {
        document.body.removeChild(this.ghostElement);
        this.ghostElement = null;
      }

      document.body.removeAttribute('data-touch-dragging-room-type');

      const highlightedElements = document.querySelectorAll('.touch-drop-target');
      highlightedElements.forEach(el => el.classList.remove('touch-drop-target'));

      this.isDragging = false;
      this.roomType = null;
      this.dropTarget = null;
    }
  };

  window.touchDragSystem = system;
  return system;
};

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
    selectedRoomIds,
    setSelectedRoomIds,
    setScale,
    setPosition,
    setActiveTool
  } = useFloorPlan();

  useEffect(() => {
    if (activeTool && activeTool !== "design") {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [activeTool, setScale, setPosition]);

  const selectedRoomId = selectedRoomIds && selectedRoomIds.length > 0 ? selectedRoomIds[0] : null;

  const [activeInfoOption, setActiveInfoOption] = useState<string | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [labelText, setLabelText] = useState("");
  const [waitingForLabelPlacement, setWaitingForLabelPlacement] =
    useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [storedLabelText, setStoredLabelText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("signs");
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [selectedSignSymbol, setSelectedSignSymbol] = useState<string | null>(null);
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
      setLabelPlacementState(true, storedLabelText || labelText);
    } else {
      setLabelPlacementState(false, null);
    }
  }, [
    activeTool,
    activeInfoOption,
    waitingForLabelPlacement,
    labelText,
    storedLabelText,
  ]);

  useEffect(() => {
    const handleLabelPlaced = () => {
      setWaitingForLabelPlacement(false);
      setStoredLabelText(null);
      setSelectedSignSymbol(null);
    };

    window.addEventListener("labelPlaced", handleLabelPlaced as EventListener);

    return () => {
      window.removeEventListener("labelPlaced", handleLabelPlaced as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const isClickOnFloorPlan =
        target.closest("svg") &&
        !target.closest(
          ".room-polygon, .resize-handle, .edge-indicator, .rotate-button, .tool-panel"
        );

      if (waitingForLabelPlacement && isClickOnFloorPlan) {
        setTimeout(() => {
          setWaitingForLabelPlacement(false);
          setStoredLabelText(null);
          setLabelText("");
        }, 200);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
    };
  }, [waitingForLabelPlacement]);

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
    setInfoToolPanelState(activeTool === "info", activeInfoOption);
    if (
      activeTool === "info" &&
      (activeInfoOption === "placeLabel" || activeInfoOption === "placesignandsymbol") &&
      waitingForLabelPlacement
    ) {
      setLabelPlacementState(true, storedLabelText || labelText);
    } else {
      setLabelPlacementState(false, null);
    }
  }, [
    activeTool,
    activeInfoOption,
    waitingForLabelPlacement,
    labelText,
    storedLabelText,
  ]);

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
          setSelectedRoomIds([]);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedRoomId, setSelectedRoomIds]);

  const selectedRoom = selectedRoomId
    ? safeFloorPlanData.rooms.find((room: Room) => room.id === selectedRoomId)
    : null;

  const handleRoomClick = (roomId: string) => {
    if (activeInfoOption === "setRoomtype" && selectedRoomType) {
      const room = floorPlanData.rooms.find((r) => r.id === roomId);
      if (room && room.room_type !== selectedRoomType) {
        handleRoomTypeUpdate(roomId, selectedRoomType);
        setHasLocalChanges(true);
        setHasChanges(true);
      }

      return;
    } else {
      if (roomId === selectedRoomId) {
        setSelectedRoomIds([]);
      } else {
        setSelectedRoomIds([roomId]);
      }
    }
  };

  const handleSelectRoomType = (roomType: string) => {
    setGlobalSelectedRoomType(roomType);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && labelText.trim()) {
      e.preventDefault();
      setStoredLabelText(labelText);
      setLabelText("");
      setWaitingForLabelPlacement(true);
      setLabelPlacementState(true, labelText);
      setHasChanges(true);
    }
  };

  const handleClose = () => {
    setGlobalSelectedRoomType(null);
    setInfoToolPanelState(false, null);
    setLabelPlacementState(false, null);
    setWaitingForLabelPlacement(false);
    setSelectedSignSymbol(null);

    setSelectedRoomIds([]);

    setActiveTool('design');
    onClose();
  };

  const resetLabelState = () => {
    setWaitingForLabelPlacement(false);
    setLabelText("");
    setStoredLabelText(null);
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

  const getRoomColor = (roomType: string, isSelected: boolean): string => {
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


  const handleMouseEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleTouchEvent = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const handleWheelEvent = (e: React.WheelEvent) => {

    e.stopPropagation();
  };

  if (!activeTool || activeTool === "design") return null;

  const shouldRenderProject = activeTool === "project";

  const renderProjectPanel = () => {
    return (
      <>
        <div className="mini-floor-plan-container" style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}>
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
          <div className="option-header" style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}>
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
            Drag a room type and drop it onto a room in the floor plan to apply it.
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
                className="room-type-item"
                onClick={() => handleSelectRoomType(roomType)}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData("roomType", roomType);
                  e.currentTarget.classList.add("dragging");

                  const dragImage = document.createElement('div');
                  dragImage.textContent = roomType;
                  dragImage.style.backgroundColor = getRoomColor(roomType, false);
                  dragImage.style.padding = '10px';
                  dragImage.style.border = '1px solid #aaa';
                  dragImage.style.borderRadius = '4px';
                  dragImage.style.position = 'absolute';
                  dragImage.style.top = '-1000px';
                  document.body.appendChild(dragImage);

                  e.dataTransfer.setDragImage(dragImage, 25, 25);

                  setTimeout(() => {
                    document.body.removeChild(dragImage);
                  }, 100);
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove("dragging");
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();

                  const touchSystem = createTouchDragSystem();
                  const touch = e.touches[0];

                  touchSystem.startDrag(roomType, getRoomColor);
                  touchSystem.updatePosition(touch.clientX, touch.clientY);

                  const button = e.currentTarget;
                  button.classList.add('touch-dragging');
                  button.style.opacity = '0.7';
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();

                  const touchSystem = createTouchDragSystem();
                  const touch = e.touches[0];

                  touchSystem.updatePosition(touch.clientX, touch.clientY);
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();

                  const touchSystem = createTouchDragSystem();
                  touchSystem.endDrag(handleRoomTypeUpdate, setHasChanges, floorPlanData);
                  const button = e.currentTarget;
                  button.classList.remove('touch-dragging');
                  button.style.opacity = '1';
                }}
              >
                {roomType}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (activeInfoOption === "placeLabel") {
      return (
        <div className="panel-options" style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}>
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
              onKeyPress={handleKeyPress}
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
                  setStoredLabelText(labelText);
                  setWaitingForLabelPlacement(true);
                  setLabelPlacementState(true, labelText);
                  setHasChanges(true);
                  setLabelText("");
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
    } else if (activeInfoOption === "placesignandsymbol") {
      const signsList = [
        "Arrow01", "Arrow02", "NorthArrow", "NorthArrowB", "North Arrow 2017c",
        "v397_northsymbol", "Windroos", "v15_circlex0", "v95_circlex1", "v241_circlex2",
        "v977_circlex3", "v309_circlex4", "v129_circlex5", "v986_circlex6", "v942_circlex7",
        "v473_circlex8", "v630_circlex9", "circle_A", "circle_B", "circle_C", "circle_D",
        "circle_E", "circle_F", "circle_G", "circle_H", "circle_I", "circle_J", "circle_K",
        "circle_L", "circle_M", "circle_N", "circle_O", "circle_P", "circle_Q", "circle_R",
        "circle_S", "circle_T", "circle_U", "circle_V", "circle_W", "circle_X", "circle_Y",
        "circle_Z", "v674_balloon1", "v862_arrow1", "v549_balloon2", "v522_balloon5",
        "v441_balloon3", "v676_balloon4", "v261_eikpunt", "You Are Here_MP", "v314_arrows",
        "Evacuation Path_MP", "Arrow Sign Right", "EXITsignB", "v18_exit2", "Exit_MPb", "Exit_MP",
        "v171_emergencyxexit2", "Emergency icon", "emergency_exit", "v306_firstxaid", "Defibrillator",
        "Emergency Phone Sign", "v294_meetingxpoint", "Pickup Point", "Doctor Sign", "Safety shower",
        "Evac-Chair", "BHV-Kast", "First Aid Kit_MP", "EmergencyPhone_MP", "v333_firexhose",
        "Fire Hose Signb", "Fire Plan_MP", "v683_firexextinguisher", "Fire Extinguisher Sign",
        "Fire Hydrant_MP", "v157_emergencyxbutton", "Fire Pull Station_MP", "Fire Phone Sign",
        "v587_escapexladder", "Fire Ladder Sign", "Fire Helmet Sign", "BranbareStoffenB", "SchadelijkB",
        "Giftig", "wet_sign", "Electrical Hazard_MP", "Generator_MP", "Radiation Hazard_MP",
        "Waterafsluiter", "Oxigen Valve_MP", "elevator", "telefoon", "exit", "ToiletMen_Sign",
        "ToiletWomen_Sign", "toiletsign", "rolstoel", "kantoor", "pin", "To Clean up_MP",
        "To Repair_MP", "To Drain_MP", "To Seal_MP", "To Install_MP", "To Inspect_MP",
        "To Paint_MP", "To Remove_MP", "To Dry_MP", "To Move_MP"
      ];

      const symbolsList = [
        "v996_aanslxtelefoon", "aansl_tel rechts", "aansl_cai rechts", "v572_aanslxcai",
        "v192_stopcontactxenkel", "v411_stopcontactxenkel", "v404_stopcontactxdubbel",
        "v973_outlet", "v547_gfixoutlet", "v370_quadxoutlet", "v187_floorxoutlet",
        "v745_telecomoutlet", "v598_tvxoutlet", "v551_switch", "v818_switchxthreeway",
        "v503_switchxfourway", "v908_switchxdimmer", "Switch_ThreewayDimmer", "v15_smokedetector",
        "v874_surfaceceilinglight", "v271_dropcordceilinglight", "v609_recessedceilinglight",
        "v885_walllight", "v326_thermostat", "v801_doorbell", "v396_doorbelchime",
        "DoorbelTransformerb", "v931_servicepanel", "v33_verbrxkoelkast", "Stereo_Outletb",
        "TV_Outletb", "DoorbelChimeb", "SmokeDetectorb", "Thermostatb", "v244_verbrxventilator",
        "v650_verbrxverwarmaccu", "verbr_boiler", "v779_verbrxwandverlichting", "v248_verbrxbel",
        "v5_verbrxvaatwasmachine", "v671_verbrxvaatwasmachine", "v865_verbrxdiepvriezer",
        "v466_verbrxtransformator", "v486_verbrxdroogkast", "v33_verbrxkoelkast (1)",
        "v722_verbrxmotor", "v882_verbrxkwhteller", "pomp", "type microwave", "type electrische oven",
        "Ceiling Light MP", "Emergency Light MP", "Fan MP", "Flood Light MP", "Fluorescent Light MP",
        "Light Socket MP", "Motor MP", "Projector MP", "Self Contained Emergency Light MP",
        "Spot Light MP", "Pull-Cord Switch MP", "Clock MP", "TV Cable MP", "Bell MP 2",
        "Single-stroke Bell MP", "Buzzer MP", "Duplex Outlet with Switch MP c", "Pushbutton w Pilot MP",
        "Pushbutton MP", "Restricted Pushbutton MP", "Switch MP b", "Dimmer Switch MP",
        "Switch 2 Way 1 Pole MP", "Single Outlet MP", "Duplex Outlet MP", "Data Cable MP",
        "Ground Fault Outlet MP", "Ground Fault Duplex Outlet MP", "Ground Fault Duplex Outlet and Switch MP",
        "Ground Fault Outlet and Switch MP", "Isolaterd Duplex Outlet MP", "Switch 2 Pole MP",
        "Switch with Pilot Light MP", "Battery MP", "Ground MP", "Water Heater MP",
        "SecuritySystem_MP", "Door Window Contact_MP", "GlassBreakSensor_MP", "CO Detector_MP",
        "Motion Detector_MP", "Sensor_MP", "Smoke Detector_MP", "Thermostat_MP", "Surveillance Camera_MP",
        "Smoke Detector_MP (1)", "Heat Detector_MP", "Onsite Treatment System", "Pit", "Chamber",
        "Gully", "Grease Interceptor", "Capped Point", "Provisional Drain Pip", "Waste Stack",
        "Vertical Pipe", "Vent Pipe", "Inspection Shaft", "Boundary Trap", "Inspection Opening",
        "Vertical Junction", "Sloped Junction", "Onback Junction", "Pump Unit", "Reflux Valve",
        "Shower2D", "Shower2Db", "Stopcontact", "v5_powersocketsingle", "v708_powersocketdouble",
        "TV_NET_socket", "Wifi", "Internet_Data_Outlet_", "Cable_Antenna_Outlet", "Fridge symbol",
        "Washing machine symbol", "Dryer symbol", "Washer Dryer symbol", "Dishwasher symbol",
        "Oven symbol", "Microwave symbol", "Microwave oven symbol", "Stove 2 symbol", "Stove 4 symbol",
        "Sink symbol", "Sink round symbol", "Double sink symbol", "Central Heating symbol",
        "Electricity symbol", "Water symbol", "Water and Electricity symbol", "Fresh air supply",
        "Air flow direction", "Air transit", "Dirty air discharge"
      ];

      const handleSignSymbolClick = (item: string, type: string) => {
        const svgPath = `/${type === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg`;
        setStoredLabelText(svgPath);
        setWaitingForLabelPlacement(true);
        setLabelPlacementState(true, svgPath);
        setHasChanges(true);
        setSelectedSignSymbol(item);
      };

      return (
        <div className="panel-options signs-symbols-panel" style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",

        }}>
          <div className="option-header">
            <button
              className="back-button"
              onClick={() => {
                setActiveInfoOption(null);
                resetLabelState();
                setSelectedSignSymbol(null);
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
            <span className="section-title1">Signs & Symbols</span>
          </div>

          <div className="tabs-container" style={{
            display: "flex",
          }}>
            <button
              className={`tab-button ${activeTab === "signs" ? "active" : ""}`}
              onClick={() => setActiveTab("signs")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "signs" ? "#000" : "#f5f5f5",
                color: activeTab === "signs" ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: activeTab === "signs" ? "4px 4px 0 0" : "0",
              }}
            >
              Signs
            </button>
            <button
              className={`tab-button ${activeTab === "symbols" ? "active" : ""}`}
              onClick={() => setActiveTab("symbols")}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: activeTab === "symbols" ? "#000" : "#f5f5f5",
                color: activeTab === "symbols" ? "#fff" : "#000",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: activeTab === "symbols" ? "4px 4px 0 0" : "0",
              }}
            >
              Symbols
            </button>
          </div>
          {waitingForLabelPlacement && (
            <div
              className="click-instruction"
              style={{
                color: "#2196F3",
                textAlign: "center",
                fontSize: "small",
                fontWeight: "bold",
                zIndex: "10000000"
              }}
            >
              Now click on the floor plan where you want to place this sign/symbol
            </div>
          )}

          <div className="signs-symbols-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            padding: "0px",
            position: "relative",
            left: "0.3rem",
            overflowY: "auto",
          }}>
            {(activeTab === "signs" ? signsList : symbolsList).map((item) => (
              <div
                key={item}
                className="sign-symbol-item"
                onClick={() => handleSignSymbolClick(item, activeTab)}
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg` ? "#2196F3" : "#f8f8f8",
                  border: waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg` ? "2px solid #1976D2" : "1px solid #ddd",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!(waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg`)) {
                    e.currentTarget.style.backgroundColor = "#e0e0e0";
                    e.currentTarget.style.borderColor = "#999";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg`)) {
                    e.currentTarget.style.backgroundColor = waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg` ? "#2196F3" : "#f8f8f8";
                    e.currentTarget.style.borderColor = waitingForLabelPlacement && storedLabelText === `/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg` ? "2px solid #1976D2" : "#ddd";
                  }
                }}
              >
                <img
                  src={`/${activeTab === 'signs' ? 'Signs' : 'Symbols'}/${item}.svg`}
                  alt={item}
                  style={{
                    maxWidth: "40px",
                    maxHeight: "40px",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10'%3E%3F%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            ))}
          </div>


        </div>
      );
    } else {
      return (
        <div className="panel-options info-options" style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}>
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

          <button className="menu-option" onClick={() => setActiveInfoOption("placesignandsymbol")}>
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
        return <BuildToolsPanel onSelectTool={(toolId: string) => { }} />;

      case "info":
        return renderInfoPanel();

      case "objects":
        return <ObjectsPanel onSelectObject={(objectId: string) => {
        }} />;
      case "styleboards":
        return (
          <div className="panel-options" style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}>
            <p>Style options for your project</p>
          </div>
        );

      case "exports":
        return <ExportsPanel onSelectOption={(optionId: string) => {
        }} />;

      case "help":
        return <HelpPanel onSelectOption={(optionId: string) => {
        }} />;

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
        return "Export";
      case "help":
        return "Help";
      case "colors":
        return "Colors";
      default:
        return `${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)
          } Tools`;
    }
  };

  return (
    <div
      className="tool-panel"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      ref={panelRef}
      onMouseDown={handleMouseEvent}
      onMouseMove={handleMouseEvent}
      onMouseUp={handleMouseEvent}
      onWheel={handleWheelEvent}
      onClick={handleMouseEvent}
      onTouchStart={handleTouchEvent}
      onTouchMove={handleTouchEvent}
      onTouchEnd={handleTouchEvent}
    >
      <div className="panel-header">
        <h2>{getPanelTitle()}</h2>
        <button className="close-panel" onClick={handleClose}>
          ×
        </button>
      </div>
      <div
        className="panel-content"
        onMouseDown={handleMouseEvent}
        onMouseMove={handleMouseEvent}
        onMouseUp={handleMouseEvent}
        onWheel={handleWheelEvent}
        onClick={handleMouseEvent}
        onTouchStart={handleTouchEvent}
        onTouchMove={handleTouchEvent}
        onTouchEnd={handleTouchEvent}
      >
        {renderPanelContent()}
      </div>
    </div>
  );
};

export default ToolPanel;