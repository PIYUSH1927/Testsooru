import * as t from "three";
import { useNavigate } from "react-router-dom";
import room from "./Room";
import { useRef, useEffect, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { initialFloorPlanData } from "../features/initialData";
import { Player } from "./Player";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PersonIcon from '@mui/icons-material/Person';
import CameraIcon from '@mui/icons-material/Camera';
import "./View3D.css"

interface Point {
    x: number;
    z: number;
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


function getCenter(points: Array<Point>) {
    const center = new t.Vector3();
    for (let i = 0; i < points.length; i++) {
        center.x += points[i].x;
        center.z += points[i].z;
    }
    center.x /= points.length;
    center.z /= points.length;
    return center;
}

let player: Player;
let controls: OrbitControls;
let center: t.Vector3;

function enableCameraMode() {
    if (player && player.model)
        player.model.visible = false;
    controls.target.set(center.x, center.y, center.z);
    controls.enableZoom = true;
    controls.maxDistance = 100;
    controls.update();
}

function enablePlayerMode() {
    if (!player || !player.model) return;
    player.model.visible = true;
    const tar = player.model.position.clone();
    tar.y += 6;
    controls.target.set(tar.x, tar.y, tar.z);
    controls.enableZoom = false;
    controls.maxDistance = 10;
    controls.update();
}

export default function View3D() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current?.firstChild) return;
        const scene = new t.Scene();
        scene.background = new t.Color(0xbfe3dd);

        const light = new t.PointLight(0xffffff, 50)
        light.position.set(140, 20, 140)
        scene.add(light)

        const ambientLight = new t.AmbientLight()
        scene.add(ambientLight)

        const camera = new t.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        camera.position.set(0, 0, 10);

        const renderer = new t.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        controls = new OrbitControls(camera, renderer.domElement);

        setRooms(initialFloorPlanData);

        function setRooms(data: FloorPlanData) {
            const points: Array<t.Vector3> = [];
            for (let i = 0; i < data.rooms.length; i++) {
                const rp = data.rooms[i].floor_polygon.map((pos: Point) => new t.Vector3(pos.x, 0, pos.z))
                const r = new room(rp);
                scene.add(r.group);
                points.push(...rp);
            }
            center = getCenter(points);
            controls.target.set(center.x, center.y, center.z);
            controls.update();
        }

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        player = new Player(scene);

        window.addEventListener("resize", handleResize);

        const clock = new t.Clock();
        function animate() {
            player.update(clock.getDelta());
            if (player.model && player.model.visible) {
                const ppos = player.model.position.clone();
                ppos.y += 6;
                controls.target.set(ppos.x, ppos.y, ppos.z);
                controls.update();
            }

            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);
        containerRef.current?.appendChild(renderer.domElement);
    }, []);


    function CameraSwitchToggle() {
        const [mode, setMode] = useState("orbit");
        function onCameraModeChange(_event: React.MouseEvent<HTMLElement, MouseEvent>, mode: string) {
            setMode(mode);
            if (mode === "orbit") enableCameraMode();
            else enablePlayerMode();
        }

        return (
            <div>
                <ToggleButtonGroup className="camera-toggle-group"
                    value={mode}
                    exclusive
                    onChange={onCameraModeChange}
                >
                    <ToggleButton value="orbit">
                        <CameraIcon />
                    </ToggleButton>
                    <ToggleButton value="person">
                        <PersonIcon />
                    </ToggleButton>
                </ToggleButtonGroup>
            </div>);
    }

    const navigate = useNavigate();

    return (<>
        <div ref={containerRef} style={{ width: "100vw", height: "100vh", zIndex: -1 }} />
        <div
        className="three-d-icon"
        onClick={() => navigate("/playground")}
        style={{
          display: "flex",
          border: "1px solid #ccc",
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
            backgroundColor: "transparent",
            color: "#555",
            fontWeight: "bold",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          2D
        </div>
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
          3D
        </div>
        </div>
        
        <CameraSwitchToggle />
    </>);
}
