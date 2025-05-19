import React, { useState } from "react";
import "./ToolPanel.css";
import { useFloorPlan } from "../FloorPlanContext";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

interface ExportsPanelProps {
    onSelectOption?: (optionId: string) => void;
}

const ExportsPanel: React.FC<ExportsPanelProps> = ({ onSelectOption }) => {
    const [includeMeasurements, setIncludeMeasurements] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportStatus, setExportStatus] = useState<string>("");

    const { floorPlanData, updateVisualizationOption, visualizationOptions } =
        useFloorPlan();

    const handleExportOption = async (format: string) => {
        setIsExporting(true);
        setExportStatus(`Exporting as ${format.toUpperCase()}...`);

        try {
            updateVisualizationOption("showMeasurements", includeMeasurements);

            await new Promise((resolve) => setTimeout(resolve, 500));

            switch (format) {
                case "png":
                    await exportAsPNG();
                    break;
                case "pdf":
                    await exportAsPDF();
                    break;
                case "cad":
                    await exportAsCAD();
                    break;
                default:
                    console.error("Unknown export format:", format);
            }

            setExportStatus("Export completed successfully!");

            if (!includeMeasurements) {
                setIncludeMeasurements(true);
                updateVisualizationOption("showMeasurements", true);
            }

            if (onSelectOption) {
                onSelectOption(format);
            }
        } catch (error) {
            console.error("Export failed:", error);
            setExportStatus("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
            setTimeout(() => setExportStatus(""), 3000);
        }
    };

    const exportAsPNG = async () => {
        const floorPlanElement = document.querySelector(".floor-plan-container");
        const parentContainer = floorPlanElement?.parentElement;

        if (!floorPlanElement || !parentContainer) {
            throw new Error("Floor plan element not found");
        }

        try {
            const clonedParentContainer = parentContainer.cloneNode(
                true
            ) as HTMLElement;
            const clonedContainer = clonedParentContainer.querySelector(
                ".floor-plan-container"
            ) as HTMLElement;

            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.backgroundColor = "#ffffff";
            tempContainer.style.overflow = "visible";
            document.body.appendChild(tempContainer);

            tempContainer.appendChild(clonedContainer);

            clonedContainer.style.position = "relative";
            clonedContainer.style.transform = "none";
            clonedContainer.style.left = "0";
            clonedContainer.style.top = "0";

            const svg = clonedContainer.querySelector("svg");
            if (svg) {
                const bbox = svg.getBBox();
                const exportPadding = 100;
                const topPadding = includeMeasurements ? 140 : 100;
                clonedContainer.style.width = bbox.width + 2 * exportPadding + "px";
                clonedContainer.style.height =
                    bbox.height + exportPadding + topPadding + "px";

                svg.setAttribute(
                    "viewBox",
                    `${bbox.x - exportPadding} ${bbox.y - topPadding} ${bbox.width + 2 * exportPadding
                    } ${bbox.height + exportPadding + topPadding}`
                );
            }

            const originalAreaText = parentContainer.querySelector(
                ".always-black-text"
            ) as HTMLElement;

            if (originalAreaText && includeMeasurements) {
                const textContent =
                    originalAreaText.innerText || originalAreaText.textContent || "";

                const areaTextDiv = document.createElement("div");
                areaTextDiv.innerHTML = textContent;
                areaTextDiv.style.position = "absolute";
                areaTextDiv.style.top = "20px";
                areaTextDiv.style.left = "50%";
                areaTextDiv.style.transform = "translateX(-50%)";
                areaTextDiv.style.fontSize = "11px";
                areaTextDiv.style.fontWeight = "bold";
                areaTextDiv.style.color = "#000000";
                areaTextDiv.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                areaTextDiv.style.padding = "5px 10px";
                areaTextDiv.style.borderRadius = "3px";
                areaTextDiv.style.zIndex = "9999";
                areaTextDiv.style.whiteSpace = "nowrap";
                areaTextDiv.style.textAlign = "center";
                areaTextDiv.className = "always-black-text";

                clonedContainer.appendChild(areaTextDiv);
            }

            const dimensionLabels =
                clonedContainer.querySelectorAll(".dimension-label");
            dimensionLabels.forEach((label) => {
                (label as HTMLElement).style.display = includeMeasurements
                    ? "block"
                    : "none";
            });

            const roomLabels = clonedContainer.querySelectorAll(".room-label");
            roomLabels.forEach((label) => {
                if ((label as HTMLElement).classList.contains("room-name1")) {
                    (label as HTMLElement).style.fontSize = "9px";
                } else if (
                    (label as HTMLElement).classList.contains("dimension-label")
                ) {
                    (label as HTMLElement).style.fontSize = "7px";
                } else {
                    (label as HTMLElement).style.fontSize = "8px";
                }
            });

            const areaText = clonedContainer.querySelector(".always-black-text");
            if (areaText) {
                (areaText as HTMLElement).style.fontSize = "10px";
                (areaText as HTMLElement).style.display = "block";
            }

            const wallLines = clonedContainer.querySelectorAll(".wall-line");
            wallLines.forEach((wall) => {
                (wall as SVGLineElement).setAttribute("stroke", "#000000");
                (wall as SVGLineElement).setAttribute("stroke-width", "5");
            });

            const roomPolygons = clonedContainer.querySelectorAll(".room-polygon");
            roomPolygons.forEach((room) => {
                (room as SVGPolygonElement).setAttribute("stroke", "#000000");
                (room as SVGPolygonElement).setAttribute("stroke-width", "5");
            });

            const wallPolygons = clonedContainer.querySelectorAll(".wall-polygon");
            wallPolygons.forEach((wall) => {
                (wall as SVGPolygonElement).setAttribute("stroke", "#000000");
                (wall as SVGPolygonElement).setAttribute("stroke-width", "5");
                (wall as SVGPolygonElement).setAttribute("fill", "#000000");
            });

            const dataUrl = await htmlToImage.toPng(clonedContainer, {
                quality: 0.95,
                backgroundColor: "#ffffff",
                pixelRatio: 2,
            });

            document.body.removeChild(tempContainer);

            saveAs(
                dataUrl,
                `floor-plan-${new Date().toISOString().split("T")[0]}.png`
            );
        } catch (error) {
            console.error("PNG export error:", error);
            throw error;
        }
    };

    const exportAsPDF = async () => {
        const floorPlanElement = document.querySelector(".floor-plan-container");
        const parentContainer = floorPlanElement?.parentElement;

        if (!floorPlanElement || !parentContainer) {
            throw new Error("Floor plan element not found");
        }

        try {
            const clonedParentContainer = parentContainer.cloneNode(
                true
            ) as HTMLElement;
            const clonedContainer = clonedParentContainer.querySelector(
                ".floor-plan-container"
            ) as HTMLElement;

            const tempContainer = document.createElement("div");
            tempContainer.style.position = "absolute";
            tempContainer.style.left = "-9999px";
            tempContainer.style.backgroundColor = "#ffffff";
            tempContainer.style.overflow = "visible";
            document.body.appendChild(tempContainer);

            tempContainer.appendChild(clonedContainer);

            clonedContainer.style.position = "relative";
            clonedContainer.style.transform = "none";
            clonedContainer.style.left = "0";
            clonedContainer.style.top = "0";

            const svg = clonedContainer.querySelector("svg");
            if (svg) {
                const bbox = svg.getBBox();
                const exportPadding = 100;
                const topPadding = includeMeasurements ? 140 : 100;
                clonedContainer.style.width = bbox.width + 2 * exportPadding + "px";
                clonedContainer.style.height =
                    bbox.height + exportPadding + topPadding + "px";

                svg.setAttribute(
                    "viewBox",
                    `${bbox.x - exportPadding} ${bbox.y - topPadding} ${bbox.width + 2 * exportPadding
                    } ${bbox.height + exportPadding + topPadding}`
                );
            }

            const originalAreaText = parentContainer.querySelector(
                ".always-black-text"
            ) as HTMLElement;

            if (originalAreaText && includeMeasurements) {
                const textContent =
                    originalAreaText.innerText || originalAreaText.textContent || "";

                const areaTextDiv = document.createElement("div");
                areaTextDiv.innerHTML = textContent;
                areaTextDiv.style.position = "absolute";
                areaTextDiv.style.top = "20px";
                areaTextDiv.style.left = "50%";
                areaTextDiv.style.transform = "translateX(-50%)";
                areaTextDiv.style.fontSize = "11px";
                areaTextDiv.style.fontWeight = "bold";
                areaTextDiv.style.color = "#000000";
                areaTextDiv.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                areaTextDiv.style.padding = "5px 10px";
                areaTextDiv.style.borderRadius = "3px";
                areaTextDiv.style.zIndex = "9999";
                areaTextDiv.style.whiteSpace = "nowrap";
                areaTextDiv.style.textAlign = "center";
                areaTextDiv.className = "always-black-text";

                clonedContainer.appendChild(areaTextDiv);
            }

            const dimensionLabels =
                clonedContainer.querySelectorAll(".dimension-label");
            dimensionLabels.forEach((label) => {
                (label as HTMLElement).style.display = includeMeasurements
                    ? "block"
                    : "none";
            });

            const roomLabels = clonedContainer.querySelectorAll(".room-label");
            roomLabels.forEach((label) => {
                if ((label as HTMLElement).classList.contains("room-name1")) {
                    (label as HTMLElement).style.fontSize = "9px";
                } else if (
                    (label as HTMLElement).classList.contains("dimension-label")
                ) {
                    (label as HTMLElement).style.fontSize = "7px";
                } else {
                    (label as HTMLElement).style.fontSize = "8px";
                }
            });

            const areaText = clonedContainer.querySelector(".always-black-text");
            if (areaText) {
                (areaText as HTMLElement).style.fontSize = "10px";
                (areaText as HTMLElement).style.display = "block";
            }

            const wallLines = clonedContainer.querySelectorAll(".wall-line");
            wallLines.forEach((wall) => {
                (wall as SVGLineElement).setAttribute("stroke", "#000000");
                (wall as SVGLineElement).setAttribute("stroke-width", "5");
            });

            const roomPolygons = clonedContainer.querySelectorAll(".room-polygon");
            roomPolygons.forEach((room) => {
                (room as SVGPolygonElement).setAttribute("stroke", "#000000");
                (room as SVGPolygonElement).setAttribute("stroke-width", "5");
            });

            const wallPolygons = clonedContainer.querySelectorAll(".wall-polygon");
            wallPolygons.forEach((wall) => {
                (wall as SVGPolygonElement).setAttribute("stroke", "#000000");
                (wall as SVGPolygonElement).setAttribute("stroke-width", "5");
                (wall as SVGPolygonElement).setAttribute("fill", "#000000");
            });

            const dataUrl = await htmlToImage.toPng(clonedContainer, {
                quality: 0.95,
                backgroundColor: "#ffffff",
                pixelRatio: 2,
            });

            document.body.removeChild(tempContainer);

            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });

            const img = new Image();
            img.src = dataUrl;

            await new Promise((resolve) => {
                img.onload = () => {
                    const pageWidth = pdf.internal.pageSize.getWidth();
                    const pageHeight = pdf.internal.pageSize.getHeight();
                    const margin = 10;

                    let imgWidth = pageWidth - 2 * margin;
                    let imgHeight = (img.height * imgWidth) / img.width;

                    if (imgHeight > pageHeight - 20) {
                        imgHeight = pageHeight - 20;
                        imgWidth = (img.width * imgHeight) / img.height;
                    }

                    const x = (pageWidth - imgWidth) / 2;
                    const y = margin;

                    pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);

                    pdf.save(`floor-plan-${new Date().toISOString().split("T")[0]}.pdf`);
                    resolve(true);
                };
            });
        } catch (error) {
            console.error("PDF export error:", error);
            throw error;
        }
    };

    const exportAsCAD = async () => {
        try {
            let dxfContent = "0\nSECTION\n2\nHEADER\n";
            dxfContent += "9\n$ACADVER\n1\nAC1014\n";
            dxfContent += "9\n$INSUNITS\n70\n6\n";
            dxfContent += "9\n$DIMSCALE\n40\n1.0\n";
            dxfContent += "9\n$LTSCALE\n40\n1.0\n";
            dxfContent += "0\nENDSEC\n";

            dxfContent += "0\nSECTION\n2\nTABLES\n";
            dxfContent += "0\nTABLE\n2\nLTYPE\n";

            dxfContent +=
                "0\nLTYPE\n2\nCONTINUOUS\n70\n0\n3\nSolid line\n72\n65\n73\n0\n40\n0.0\n";
            dxfContent +=
                "0\nLTYPE\n2\nDASHED\n70\n0\n3\nDashed line\n72\n65\n73\n2\n40\n0.375\n49\n0.25\n49\n-0.125\n";
            dxfContent += "0\nENDTAB\n";

            dxfContent += "0\nTABLE\n2\nLAYER\n";

            dxfContent +=
                "0\nLAYER\n2\nWALLS\n70\n0\n62\n7\n370\n50\n6\nCONTINUOUS\n";
            dxfContent +=
                "0\nLAYER\n2\nROOMS\n70\n0\n62\n7\n370\n18\n6\nCONTINUOUS\n";
            dxfContent += "0\nLAYER\n2\nTEXT\n70\n0\n62\n7\n370\n18\n6\nCONTINUOUS\n";
            dxfContent +=
                "0\nLAYER\n2\nDIMENSIONS\n70\n0\n62\n3\n370\n18\n6\nCONTINUOUS\n";

            dxfContent += "0\nENDTAB\n0\nENDSEC\n";

            dxfContent += "0\nSECTION\n2\nENTITIES\n";

            const bounds = floorPlanData.rooms.reduce(
                (acc, room) => {
                    room.floor_polygon.forEach((point) => {
                        acc.minX = Math.min(acc.minX, point.x);
                        acc.maxX = Math.max(acc.maxX, point.x);
                        acc.minZ = Math.min(acc.minZ, point.z);
                        acc.maxZ = Math.max(acc.maxZ, point.z);
                    });
                    return acc;
                },
                { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity }
            );

            const floorPlanWidth = bounds.maxX - bounds.minX;
            const floorPlanHeight = bounds.maxZ - bounds.minZ;
            const maxDimension = Math.max(floorPlanWidth, floorPlanHeight);
            const baseTextHeight = maxDimension * 0.008;
            const titleTextHeight = baseTextHeight * 1.5;
            const roomNameTextHeight = baseTextHeight * 1.2;
            const dimensionTextHeight = baseTextHeight;

            const titleOffset = floorPlanWidth * 0.15;
            dxfContent += "0\nTEXT\n";
            dxfContent += "8\nTEXT\n";
            dxfContent += `10\n${(bounds.minX + bounds.maxX) / 2 - titleOffset}\n`;
            dxfContent += `20\n${bounds.maxZ + 2 * titleTextHeight}\n`;
            dxfContent += "30\n0\n";
            dxfContent += `40\n${titleTextHeight}\n`;
            dxfContent += `1\nTotal Area: ${floorPlanData.total_area.toFixed(
                2
            )} m^2 | Total Rooms: ${floorPlanData.room_count}\n`;
            dxfContent += "50\n0\n";
            dxfContent += "72\n1\n";
            dxfContent += "73\n2\n";
            floorPlanData.rooms.forEach((room) => {
                if (room.floor_polygon.length > 1) {
                    const layerName = room.room_type === "Wall" ? "WALLS" : "ROOMS";

                    dxfContent += "0\nPOLYLINE\n";
                    dxfContent += `8\n${layerName}\n`;
                    dxfContent += "66\n1\n";
                    dxfContent += "70\n1\n";
                    dxfContent += "43\n0.0\n";

                    room.floor_polygon.forEach((point) => {
                        dxfContent += "0\nVERTEX\n";
                        dxfContent += `8\n${layerName}\n`;
                        dxfContent += `10\n${point.x}\n`;
                        dxfContent += `20\n${bounds.maxZ - point.z + bounds.minZ}\n`;
                        dxfContent += "30\n0\n";
                    });

                    dxfContent += "0\nSEQEND\n";

                    if (room.room_type !== "Wall") {
                        const centroid = room.floor_polygon.reduce(
                            (acc, point, _, arr) => ({
                                x: acc.x + point.x / arr.length,
                                z: acc.z + point.z / arr.length,
                            }),
                            { x: 0, z: 0 }
                        );

                        const roomTextOffset = floorPlanWidth * 0.02;
                        dxfContent += "0\nTEXT\n";
                        dxfContent += "8\nTEXT\n";
                        dxfContent += `10\n${centroid.x - roomTextOffset}\n`;
                        dxfContent += `20\n${bounds.maxZ - centroid.z + bounds.minZ + roomNameTextHeight * 0.5
                            }\n`;
                        dxfContent += "30\n0\n";
                        dxfContent += `40\n${roomNameTextHeight}\n`;
                        dxfContent += `1\n${room.room_type}\n`;
                        dxfContent += "50\n0\n";
                        dxfContent += "72\n1\n";
                        dxfContent += "73\n2\n";

                        dxfContent += "0\nTEXT\n";
                        dxfContent += "8\nTEXT\n";
                        dxfContent += `10\n${centroid.x - roomTextOffset}\n`;
                        dxfContent += `20\n${bounds.maxZ - centroid.z + bounds.minZ - roomNameTextHeight * 0.5
                            }\n`;
                        dxfContent += "30\n0\n";
                        dxfContent += `40\n${dimensionTextHeight}\n`;
                        dxfContent += `1\n${room.width.toFixed(1)}m x ${room.height.toFixed(
                            1
                        )}m\n`;
                        dxfContent += "50\n0\n";
                        dxfContent += "72\n1\n";
                        dxfContent += "73\n2\n";
                    }
                }
            });

            const totalWidth = bounds.maxX - bounds.minX;
            const totalHeight = bounds.maxZ - bounds.minZ;

            dxfContent += "0\nLINE\n";
            dxfContent += "8\nDIMENSIONS\n";
            dxfContent += `10\n${bounds.minX}\n`;
            dxfContent += `20\n${bounds.minZ - baseTextHeight}\n`;
            dxfContent += "30\n0\n";
            dxfContent += `11\n${bounds.maxX}\n`;
            dxfContent += `21\n${bounds.minZ - baseTextHeight}\n`;
            dxfContent += "31\n0\n";

            const dimensionOffset = floorPlanWidth * 0.03;
            dxfContent += "0\nTEXT\n";
            dxfContent += "8\nDIMENSIONS\n";
            dxfContent += `10\n${(bounds.minX + bounds.maxX) / 2 - dimensionOffset
                }\n`;
            dxfContent += `20\n${bounds.minZ - baseTextHeight * 2.5}\n`;
            dxfContent += "30\n0\n";
            dxfContent += `40\n${dimensionTextHeight}\n`;
            dxfContent += `1\n${totalWidth.toFixed(1)} m\n`;
            dxfContent += "50\n0\n";
            dxfContent += "72\n1\n";
            dxfContent += "73\n2\n";

            dxfContent += "0\nLINE\n";
            dxfContent += "8\nDIMENSIONS\n";
            dxfContent += `10\n${bounds.minX - baseTextHeight}\n`;
            dxfContent += `20\n${bounds.maxZ}\n`;
            dxfContent += "30\n0\n";
            dxfContent += `11\n${bounds.minX - baseTextHeight}\n`;
            dxfContent += `21\n${bounds.minZ}\n`;
            dxfContent += "31\n0\n";

            dxfContent += "0\nTEXT\n";
            dxfContent += "8\nDIMENSIONS\n";
            dxfContent += `10\n${bounds.minX - baseTextHeight * 1.5}\n`;
            dxfContent += `20\n${(bounds.minZ + bounds.maxZ) / 2}\n`;
            dxfContent += "30\n0\n";
            dxfContent += `40\n${dimensionTextHeight}\n`;
            dxfContent += `1\n${totalHeight.toFixed(1)} m\n`;
            dxfContent += "50\n90\n";
            dxfContent += "72\n1\n";
            dxfContent += "73\n2\n";

            dxfContent += "0\nENDSEC\n0\nEOF\n";

            const blob = new Blob([dxfContent], { type: "application/dxf" });
            saveAs(blob, `floor-plan-${new Date().toISOString().split("T")[0]}.dxf`);
        } catch (error) {
            console.error("CAD export error:", error);
            throw error;
        }
    };

    return (
        <div
            className="panel-options exports-options"
            style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
            }}
        >
            <button
                className="export-button"
                onClick={() => handleExportOption("png")}
                disabled={isExporting}
            >
                PNG Image
            </button>
            <button
                className="export-button"
                onClick={() => handleExportOption("pdf")}
                disabled={isExporting}
            >
                PDF Document
            </button>
            <button
                className="export-button"
                onClick={() => handleExportOption("cad")}
                disabled={isExporting}
            >
                CAD File (DXF)
            </button>

            <div
                className="checkbox-control"
                style={{ position: "relative", left: "0.3rem" }}
            >
                <input
                    type="checkbox"
                    id="include-measurements"
                    checked={includeMeasurements}
                    onChange={(e) => setIncludeMeasurements(e.target.checked)}
                    disabled={isExporting}
                />
                <label htmlFor="include-measurements">Include Measurements</label>
            </div>

            {exportStatus && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "8px",
                        borderRadius: "4px",
                        backgroundColor: exportStatus.includes("failed")
                            ? "#ffebee"
                            : "#e8f5e9",
                        color: exportStatus.includes("failed") ? "#c62828" : "#2e7d32",
                        fontSize: "13px",
                        textAlign: "center",
                    }}
                >
                    {exportStatus}
                </div>
            )}
        </div>
    );
};

export default ExportsPanel;
