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
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import HomeIcon from '@mui/icons-material/Home';
import Slider from '@mui/material/Slider';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
// import LoadingIndicator from './LoadingIndicator';
import "./View3D.css"
import { Hidden } from "@mui/material";

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

interface CameraState {
    position: t.Vector3;
    quaternion: t.Quaternion;
    target: t.Vector3;
    distance: number;
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
let cameraState: CameraState | null = null;

let initialZoomDistance: number;

// function displayPosition(camera: t.PerspectiveCamera | null) {
//     initialZoomDistance = controls.getDistance();
//     if (camera) initialCameraPosition = camera.position.clone();
//     const cameraPosition = controls.object.position;
//     const cameraDirection = new t.Vector3();
//     if (camera) camera.getWorldDirection(cameraDirection);
//     const cameraRotation = new t.Euler().setFromQuaternion(controls.object.quaternion);
//     const cameraRotationY = cameraRotation.y * (180 / Math.PI);
//     const cameraRotationX = cameraRotation.x * (180 / Math.PI);
//     const cameraRotationZ = cameraRotation.z * (180 / Math.PI);
//     console.log("Camera Position:", cameraPosition);
//     console.log("Camera Direction:", cameraDirection);
//     console.log("Camera Rotation:", cameraRotation);
//     console.log("Camera Rotation Y:", cameraRotationY);
//     console.log("Camera Rotation X:", cameraRotationX);
//     console.log("Camera Rotation Z:", cameraRotationZ);
//     console.log("Camera Zoom Distance:", initialZoomDistance);
// }

function saveCameraState(camera: t.PerspectiveCamera) {
    cameraState = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
        target: controls.target.clone(),
        distance: controls.getDistance()
    };
}

function restoreCameraState(camera: t.PerspectiveCamera) {
    if (!cameraState) return;
    
    // Restore position and rotation
    camera.position.copy(cameraState.position);
    camera.quaternion.copy(cameraState.quaternion);
    
    // Restore controls target and update
    controls.target.copy(cameraState.target);
    controls.update();
}

function enableCameraMode(camera: t.PerspectiveCamera) {
    if (player && player.model)
        player.model.visible = false;
    // If we previously saved a camera state, restore it
    if (cameraState) {
        restoreCameraState(camera);
        const direction = new t.Vector3().subVectors(camera.position, controls.target).normalize();
        camera.position.copy(controls.target.clone().add(direction.multiplyScalar(200)));
    } else {
        // Default camera setup (first time)
        controls.target.set(center.x, center.y, center.z);
        camera.position.set(center.x, center.y + 200, center.z);

        initialZoomDistance = controls.getDistance();
        
        // Set default rotation (looking down)
        const euler = new t.Euler(-Math.PI / 2, 0, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);
        
        controls.update();

        // Save this initial state
        saveCameraState(camera);
    }
    // Set appropriate constraints
    controls.enableZoom = true;
    controls.maxDistance = 1000;
    controls.minDistance = 10;
}

function enablePlayerMode(camera: t.PerspectiveCamera) {
    if (!player || !player.model) return;
    saveCameraState(camera);
    
    // Set up player view
    player.model.visible = true;
    
    const playerPos = player.model.position.clone();
    const lookTarget = playerPos.clone();

    lookTarget.x += Math.sin(player.playerControl?.bodyOrientation || 0) * 5;
    lookTarget.z -= Math.cos(player.playerControl?.bodyOrientation || 0) * 20;
    lookTarget.y = playerPos.y - 50;

    controls.target.copy(lookTarget);

    controls.enableZoom = false;
    controls.maxDistance = 10;
    controls.update();
}

export default function View3D() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(50);
    const [viewMode, setViewMode] = useState<string>("orbit");
    const [camera, setCamera] = useState<t.PerspectiveCamera | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [assetsLoaded, setAssetsLoaded] = useState<boolean>(false);
    const cameraRef = useRef<t.PerspectiveCamera | null>(null);
    const [mode, setMode] = useState("orbit");

    useEffect(() => {
        if (containerRef.current?.firstChild) return;
        const scene = new t.Scene();
        scene.background = new t.Color(0xf1f0ec);

        // Main directional light (sun)
        const sunLight = new t.DirectionalLight(0xfffbf0, 1.2);
        sunLight.position.set(100, 100, 100);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        scene.add(sunLight);

        // Ambient light for overall illumination
        const ambientLight = new t.AmbientLight(0x9ebbff, 0.5);
        scene.add(ambientLight);

        // Fill light from another direction
        const fillLight = new t.DirectionalLight(0xdae8ff, 0.6);
        fillLight.position.set(-100, 50, -100);
        scene.add(fillLight);

        // Enable shadows in renderer
        const renderer = new t.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = t.PCFSoftShadowMap;

        const camera = new t.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        camera.position.set(30, 40, 10);
        cameraRef.current = camera;

        controls = new OrbitControls(camera, renderer.domElement);
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.5;

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
            camera.position.set(center.x, center.y + 200, center.z);
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
            if (player.model && player.model.visible) {
                player.update(clock.getDelta());
                const ppos = player.model.position.clone();
                ppos.y += 6;
                controls.target.set(ppos.x, ppos.y, ppos.z);
            }
            controls.update();

            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);
        containerRef.current?.appendChild(renderer.domElement);
    }, []);


    function CameraSwitchToggle() {
        const [mode, setMode] = useState("orbit");
        function onCameraModeChange(_event: React.MouseEvent<HTMLElement, MouseEvent>, newMode: string) {
            if (newMode == null || newMode === mode) return;
            const camera = cameraRef.current;
            if (!camera) return;
            
            if (newMode === "orbit") {
                enableCameraMode(camera);
            } else if (newMode === "person") {
                enablePlayerMode(camera);
            }
            
            setMode(newMode);
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
        <div ref={containerRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />
        <div
            className="three-d-icon"
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
                onClick={() => navigate("/playground")}
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
            {/* <div>
                <button onClick={() => displayPosition(camera)}>Hello</button>
            </div> */}
        </div>
        <CameraSwitchToggle />
    </>);
}
