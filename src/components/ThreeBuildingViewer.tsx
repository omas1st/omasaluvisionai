import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { FrameColorSpec, PaintColorSpec, WallKey, WindowOpening, WindowType } from "../types";

interface ThreeBuildingViewerProps {
  activeWallKey: WallKey;
  onSelectWall: (wallKey: WallKey) => void;
  wallsData: Record<WallKey, { finishedImageUrl?: string; previewUrl: string; detectedWindows: WindowOpening[] }>;
  selectedPaintColor: PaintColorSpec;
  selectedFrameColor: FrameColorSpec;
  selectedWindowId: string | null;
  onSelectWindow: (window: WindowOpening | null) => void;
  demoOpenAmount: number; // 0 to 1
  demoActiveWall?: WallKey;
  isDemonstrationPlaying?: boolean;
  zoomInTrigger?: number;
  zoomOutTrigger?: number;
  resetTrigger?: number;
}

export const ThreeBuildingViewer: React.FC<ThreeBuildingViewerProps> = ({
  activeWallKey,
  onSelectWall,
  wallsData,
  selectedPaintColor,
  selectedFrameColor,
  selectedWindowId,
  onSelectWindow,
  demoOpenAmount,
  demoActiveWall,
  isDemonstrationPlaying = false,
  zoomInTrigger,
  zoomOutTrigger,
  resetTrigger,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredWindow, setHoveredWindow] = useState<{ window: WindowOpening; screenX: number; screenY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isPointerActiveRef = useRef(false);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction & camera target states
  const targetCamAngleRef = useRef<number>(0);
  const currentCamAngleRef = useRef<number>(0);
  const targetCamDistanceRef = useRef<number>(14);
  const currentCamDistanceRef = useRef<number>(14);
  const targetCamHeightRef = useRef<number>(0);
  const currentCamHeightRef = useRef<number>(0);

  // Mesh registries
  const interactiveWindowsRef = useRef<Map<string, { group: THREE.Group; opening: WindowOpening; sashes: THREE.Group[] }>>(new Map());
  const wallMaterialsRef = useRef<Map<WallKey, THREE.MeshStandardMaterial>>(new Map());
  const frameMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Get wall rotation angle in radians
  const getWallAngle = (key: WallKey): number => {
    switch (key) {
      case "front": return 0;
      case "right": return Math.PI / 2;
      case "back": return Math.PI;
      case "left": return (3 * Math.PI) / 2;
    }
  };

  // Dynamically compute camera distance to guarantee full building is framed on mobile screens
  const getIdealDistance = (aspect: number): number => {
    if (aspect >= 1.4) return 14;
    if (aspect >= 1.1) return 15.5;
    return Math.min(23, 14 * (1.35 / Math.max(0.55, aspect)));
  };

  // Sync camera angle when activeWallKey or demoActiveWall changes
  useEffect(() => {
    const wall = demoActiveWall || activeWallKey;
    targetCamAngleRef.current = getWallAngle(wall);
  }, [activeWallKey, demoActiveWall]);

  // External Zoom In Trigger
  useEffect(() => {
    if (zoomInTrigger && zoomInTrigger > 0) {
      targetCamDistanceRef.current = Math.max(7, targetCamDistanceRef.current - 2);
    }
  }, [zoomInTrigger]);

  // External Zoom Out Trigger
  useEffect(() => {
    if (zoomOutTrigger && zoomOutTrigger > 0) {
      targetCamDistanceRef.current = Math.min(26, targetCamDistanceRef.current + 2);
    }
  }, [zoomOutTrigger]);

  // External Reset Trigger
  useEffect(() => {
    if (resetTrigger && resetTrigger > 0) {
      const container = mountRef.current;
      const aspect = container ? container.clientWidth / Math.max(container.clientHeight, 1) : 1;
      const idealDist = getIdealDistance(aspect);
      targetCamDistanceRef.current = idealDist;
      targetCamHeightRef.current = 0;
      targetCamAngleRef.current = getWallAngle(activeWallKey);
    }
  }, [resetTrigger, activeWallKey]);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;
    const aspect = width / height;
    const initialDistance = getIdealDistance(aspect);
    targetCamDistanceRef.current = initialDistance;
    currentCamDistanceRef.current = initialDistance;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f8fafc");
    scene.fog = new THREE.FogExp2("#f8fafc", 0.02);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    camera.position.set(0, 0, initialDistance);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.8);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight("#e2e8f0", "#94a3b8", 0.6);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const mainSun = new THREE.DirectionalLight("#fffbeb", 1.4);
    mainSun.position.set(12, 18, 14);
    mainSun.castShadow = true;
    mainSun.shadow.mapSize.width = 2048;
    mainSun.shadow.mapSize.height = 2048;
    mainSun.shadow.camera.near = 0.5;
    mainSun.shadow.camera.far = 50;
    mainSun.shadow.camera.left = -12;
    mainSun.shadow.camera.right = 12;
    mainSun.shadow.camera.top = 12;
    mainSun.shadow.camera.bottom = -12;
    mainSun.shadow.bias = -0.0005;
    scene.add(mainSun);

    const fillLight = new THREE.DirectionalLight("#93c5fd", 0.4);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: "#cbd5e1",
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3.8;
    ground.receiveShadow = true;
    scene.add(ground);

    // Architectural Ground Grid
    const gridHelper = new THREE.GridHelper(30, 30, "#94a3b8", "#e2e8f0");
    gridHelper.position.y = -3.79;
    scene.add(gridHelper);

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          const aspect = w / h;
          cameraRef.current.aspect = aspect;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);

          const idealDist = getIdealDistance(aspect);
          if (targetCamDistanceRef.current < idealDist) {
            targetCamDistanceRef.current = idealDist;
          }
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let lastTime = performance.now();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Smooth camera interpolation
      let angleDiff = targetCamAngleRef.current - currentCamAngleRef.current;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      currentCamAngleRef.current += angleDiff * Math.min(delta * 6, 1);
      currentCamDistanceRef.current += (targetCamDistanceRef.current - currentCamDistanceRef.current) * Math.min(delta * 6, 1);
      currentCamHeightRef.current += (targetCamHeightRef.current - currentCamHeightRef.current) * Math.min(delta * 6, 1);

      if (cameraRef.current) {
        const angle = currentCamAngleRef.current;
        const dist = currentCamDistanceRef.current;
        cameraRef.current.position.x = Math.sin(angle) * dist;
        cameraRef.current.position.z = Math.cos(angle) * dist;
        cameraRef.current.position.y = currentCamHeightRef.current + 0.5;
        cameraRef.current.lookAt(0, currentCamHeightRef.current * 0.5, 0);
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, []);

  // Helper to build 3D Aluminum Window Mesh with distinct visual hardware
  const buildWindow3DMesh = useCallback(
    (
      opening: WindowOpening,
      wallWidth3D: number,
      wallHeight3D: number,
      frameMat: THREE.MeshStandardMaterial,
      glassMat: THREE.MeshPhysicalMaterial
    ) => {
      const group = new THREE.Group();
      group.name = opening.id;

      // Convert percentage to exact 3D local coordinates
      const winW = (opening.widthPercent / 100) * wallWidth3D;
      const winH = (opening.heightPercent / 100) * wallHeight3D;

      // In 3D plane: center is (0,0), x goes left-to-right, y goes bottom-to-top
      const posX = (opening.xPercent / 100) * wallWidth3D + winW / 2 - wallWidth3D / 2;
      const posY = wallHeight3D / 2 - (opening.yPercent / 100) * wallHeight3D - winH / 2;

      group.position.set(posX, posY, 0.02);

      const frameDepth = 0.08;
      const frameThickness = 0.04;

      // 1. Outer Aluminum Frame Box (Precisely sized to opening hole winW x winH)
      const outerFrame = new THREE.Group();

      // Top bar
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(winW, frameThickness, frameDepth), frameMat);
      topBar.position.set(0, winH / 2 - frameThickness / 2, 0);
      topBar.castShadow = true;
      outerFrame.add(topBar);

      // Bottom sill
      const bottomBar = new THREE.Mesh(new THREE.BoxGeometry(winW, frameThickness, frameDepth), frameMat);
      bottomBar.position.set(0, -winH / 2 + frameThickness / 2, 0);
      bottomBar.castShadow = true;
      outerFrame.add(bottomBar);

      // Left jamb
      const jambHeight = Math.max(0.01, winH - frameThickness * 2);
      const leftBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, jambHeight, frameDepth), frameMat);
      leftBar.position.set(-winW / 2 + frameThickness / 2, 0, 0);
      leftBar.castShadow = true;
      outerFrame.add(leftBar);

      // Right jamb
      const rightBar = new THREE.Mesh(new THREE.BoxGeometry(frameThickness, jambHeight, frameDepth), frameMat);
      rightBar.position.set(winW / 2 - frameThickness / 2, 0, 0);
      rightBar.castShadow = true;
      outerFrame.add(rightBar);

      // Add Distinct Hardware Details for Window Style
      if (opening.currentType === "Sliding") {
        // Double Glide Horizontal Track Rails across top and bottom
        const topTrack = new THREE.Mesh(new THREE.BoxGeometry(winW - frameThickness * 2, 0.012, frameDepth * 0.9), frameMat);
        topTrack.position.set(0, winH / 2 - frameThickness - 0.006, 0);
        outerFrame.add(topTrack);

        const bottomTrack = new THREE.Mesh(new THREE.BoxGeometry(winW - frameThickness * 2, 0.012, frameDepth * 0.9), frameMat);
        bottomTrack.position.set(0, -winH / 2 + frameThickness + 0.006, 0);
        outerFrame.add(bottomTrack);
      } else if (opening.currentType === "Transom") {
        // Top Awning Transom Bar
        const transomBar = new THREE.Mesh(new THREE.BoxGeometry(winW - frameThickness * 2, 0.015, frameDepth * 0.8), frameMat);
        transomBar.position.set(0, winH / 2 - frameThickness - 0.01, 0);
        outerFrame.add(transomBar);
      }

      group.add(outerFrame);

      // 2. Interior Panels & Sashes
      const panelsCount = opening.currentPanels;
      const innerW = Math.max(0.01, winW - frameThickness * 2);
      const innerH = Math.max(0.01, winH - frameThickness * 2);
      const panelWidth = innerW / panelsCount;
      const panelDepth = frameDepth * 0.65;
      const sashThickness = 0.03;

      const sashes: THREE.Group[] = [];

      for (let i = 0; i < panelsCount; i++) {
        const sashGroup = new THREE.Group();
        const sashCenterX = -innerW / 2 + (i + 0.5) * panelWidth;

        // Visual distinction for Sliding: Staggered bypass z-depth
        const zOffset = opening.currentType === "Sliding" ? (i % 2 === 0 ? 0.014 : -0.014) : 0;

        // Panel inner frame
        const pTop = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, sashThickness, panelDepth), frameMat);
        pTop.position.set(0, innerH / 2 - sashThickness / 2, 0);
        sashGroup.add(pTop);

        const pBottom = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, sashThickness, panelDepth), frameMat);
        pBottom.position.set(0, -innerH / 2 + sashThickness / 2, 0);
        sashGroup.add(pBottom);

        const sashJambH = Math.max(0.01, innerH - sashThickness * 2);
        const pLeft = new THREE.Mesh(new THREE.BoxGeometry(sashThickness, sashJambH, panelDepth), frameMat);
        pLeft.position.set(-panelWidth / 2 + sashThickness / 2, 0, 0);
        sashGroup.add(pLeft);

        const pRight = new THREE.Mesh(new THREE.BoxGeometry(sashThickness, sashJambH, panelDepth), frameMat);
        pRight.position.set(panelWidth / 2 - sashThickness / 2, 0, 0);
        sashGroup.add(pRight);

        // Glass Pane with reflection
        const glassGeo = new THREE.BoxGeometry(
          Math.max(0.01, panelWidth - sashThickness * 2),
          Math.max(0.01, innerH - sashThickness * 2),
          0.01
        );
        const glassMesh = new THREE.Mesh(glassGeo, glassMat);
        glassMesh.castShadow = false;
        glassMesh.receiveShadow = true;
        sashGroup.add(glassMesh);

        // Visual Hardware:
        let hingeLeft = true;
        if (opening.currentType === "Casement") {
          if (panelsCount === 1) {
            hingeLeft = true;
          } else if (panelsCount === 2) {
            hingeLeft = i === 0;
          } else if (panelsCount === 3) {
            // 3-Panel Casement: Panel 0 (Left), Panel 1 (Left), Panel 2 (Right) - all 3 panels open outward
            hingeLeft = i === 0 || i === 1;
          } else if (panelsCount === 4) {
            // 4-Panel Casement: Symmetrical 2 French pairs [Left, Right], [Left, Right] - all 4 panels open outward
            hingeLeft = i === 0 || i === 2;
          }

          // Visible Hinges on Pivot Edge
          const hingeX = hingeLeft ? -panelWidth / 2 + 0.005 : panelWidth / 2 - 0.005;

          const topHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04), frameMat);
          topHinge.position.set(hingeX, innerH / 2 - 0.08, panelDepth / 2 + 0.008);
          sashGroup.add(topHinge);

          const bottomHinge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.04), frameMat);
          bottomHinge.position.set(hingeX, -innerH / 2 + 0.08, panelDepth / 2 + 0.008);
          sashGroup.add(bottomHinge);

          // Vertical Lever Handle on Operable Meeting Edge (opposite to hinge)
          const handle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.11, 0.035), frameMat);
          const handleX = hingeLeft ? panelWidth / 2 - 0.035 : -panelWidth / 2 + 0.035;
          handle.position.set(handleX, 0, panelDepth / 2 + 0.015);
          sashGroup.add(handle);
        } else if (opening.currentType === "Sliding") {
          // Recessed Vertical Flush Pull Handle
          const handle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.12, 0.01), frameMat);
          const handleX = i % 2 === 0 ? panelWidth / 2 - 0.025 : -panelWidth / 2 + 0.025;
          handle.position.set(handleX, 0, panelDepth / 2 + 0.006);
          sashGroup.add(handle);
        } else {
          // Transom: Bottom Awning Push Bar
          const pushBar = new THREE.Mesh(new THREE.BoxGeometry(panelWidth * 0.6, 0.012, 0.03), frameMat);
          pushBar.position.set(0, -innerH / 2 + 0.05, panelDepth / 2 + 0.015);
          sashGroup.add(pushBar);
        }

        // Set pivot point depending on window type for realistic opening action
        const pivotWrapper = new THREE.Group();

        if (opening.currentType === "Casement") {
          const hingeOffset = hingeLeft ? -panelWidth / 2 : panelWidth / 2;
          pivotWrapper.position.set(sashCenterX + hingeOffset, 0, zOffset);
          sashGroup.position.set(-hingeOffset, 0, 0);
          pivotWrapper.add(sashGroup);
          (pivotWrapper as any).userData = {
            type: "Casement",
            panelIndex: i,
            hingeLeft,
            panelWidth,
          };
        } else if (opening.currentType === "Sliding") {
          pivotWrapper.position.set(sashCenterX, 0, zOffset);
          sashGroup.position.set(0, 0, 0);
          pivotWrapper.add(sashGroup);
          (pivotWrapper as any).userData = {
            type: "Sliding",
            panelIndex: i,
            initialX: sashCenterX,
            panelWidth,
          };
        } else {
          // Transom: Top tilt hinge
          pivotWrapper.position.set(sashCenterX, innerH / 2, zOffset);
          sashGroup.position.set(0, -innerH / 2, 0);
          pivotWrapper.add(sashGroup);
          (pivotWrapper as any).userData = {
            type: "Transom",
            panelIndex: i,
            panelHeight: innerH,
          };
        }

        group.add(pivotWrapper);
        sashes.push(pivotWrapper);
      }

      // 3. Selection Highlight Border
      const isSelected = opening.id === selectedWindowId;
      if (isSelected) {
        const glowGeo = new THREE.BoxGeometry(winW + 0.03, winH + 0.03, 0.02);
        const glowMat = new THREE.MeshBasicMaterial({
          color: "#4f46e5",
          wireframe: true,
          wireframeLinewidth: 2,
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        glowMesh.position.set(0, 0, 0.05);
        group.add(glowMesh);
      }

      // Invisible Click Area for Raycasting
      const clickGeo = new THREE.BoxGeometry(winW, winH, 0.2);
      const clickMat = new THREE.MeshBasicMaterial({ visible: false });
      const clickMesh = new THREE.Mesh(clickGeo, clickMat);
      clickMesh.name = `clickable-${opening.id}`;
      (clickMesh as any).userData = { opening };
      group.add(clickMesh);

      return { group, sashes };
    },
    [selectedWindowId]
  );

  // Build / Update All 4 Building Walls and 3D Windows
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing building elements
    const oldBuilding = scene.getObjectByName("building-structure");
    if (oldBuilding) scene.remove(oldBuilding);

    interactiveWindowsRef.current.clear();
    wallMaterialsRef.current.clear();
    frameMaterialsRef.current = [];

    const buildingGroup = new THREE.Group();
    buildingGroup.name = "building-structure";

    // 3D Building Dimensions
    const wallW = 9.0;
    const wallH = 6.2;
    const buildingDepth = 7.0;

    // Create Frame Material from selected frame finish
    const frameMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedFrameColor.hex),
      metalness: selectedFrameColor.metalness,
      roughness: selectedFrameColor.roughness,
    });
    frameMaterialsRef.current.push(frameMat);

    // Architectural Glass Material with physical transmission
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#dbeafe",
      transmission: 0.88,
      opacity: 0.92,
      transparent: true,
      roughness: 0.05,
      metalness: 0.1,
      reflectivity: 0.95,
      ior: 1.52,
      thickness: 0.1,
    });

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const wallKeys: WallKey[] = ["front", "right", "back", "left"];

    wallKeys.forEach((key) => {
      const wallGroup = new THREE.Group();
      wallGroup.name = `wall-group-${key}`;

      const wallData = wallsData[key];
      const textureUrl = wallData?.finishedImageUrl || wallData?.previewUrl;

      // Base wall material (with texture if uploaded, or solid architectural plaster if unuploaded)
      let wallMat: THREE.MeshStandardMaterial;
      if (textureUrl) {
        const wallTexture = textureLoader.load(textureUrl);
        wallTexture.colorSpace = THREE.SRGBColorSpace;
        wallMat = new THREE.MeshStandardMaterial({
          map: wallTexture,
          color: new THREE.Color(selectedPaintColor.hex),
          roughness: 0.82,
          metalness: 0.05,
        });
      } else {
        wallMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(selectedPaintColor.hex),
          roughness: 0.9,
          metalness: 0.02,
        });
      }
      wallMaterialsRef.current.set(key, wallMat);

      // Wall Plane Mesh
      const planeGeo = new THREE.PlaneGeometry(wallW, wallH);
      const wallMesh = new THREE.Mesh(planeGeo, wallMat);
      wallMesh.receiveShadow = true;
      wallMesh.castShadow = true;
      wallGroup.add(wallMesh);

      // Back of wall / interior backing
      const backMat = new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.9 });
      const backMesh = new THREE.Mesh(planeGeo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -0.05;
      wallGroup.add(backMesh);

      // Add 3D Windows for this wall
      wallData.detectedWindows.forEach((opening) => {
        if (opening.isDeleted) {
          // Inpainted solid wall patch over deleted window
          const winW = (opening.widthPercent / 100) * wallW;
          const winH = (opening.heightPercent / 100) * wallH;
          const posX = (opening.xPercent / 100) * wallW + winW / 2 - wallW / 2;
          const posY = wallH / 2 - (opening.yPercent / 100) * wallH - winH / 2;

          const patchGeo = new THREE.PlaneGeometry(winW + 0.02, winH + 0.02);
          const patchMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(selectedPaintColor.hex),
            roughness: 0.85,
          });
          const patchMesh = new THREE.Mesh(patchGeo, patchMat);
          patchMesh.position.set(posX, posY, 0.01);
          wallGroup.add(patchMesh);
          return;
        }

        const { group: winGroup, sashes } = buildWindow3DMesh(opening, wallW, wallH, frameMat, glassMat);
        wallGroup.add(winGroup);
        interactiveWindowsRef.current.set(opening.id, { group: winGroup, opening, sashes });
      });

      // Position and Orient wall around 3D building core
      const halfW = wallW / 2;
      const halfD = buildingDepth / 2;

      if (key === "front") {
        wallGroup.position.set(0, 0, halfD);
        wallGroup.rotation.y = 0;
      } else if (key === "right") {
        wallGroup.position.set(halfW, 0, 0);
        wallGroup.rotation.y = Math.PI / 2;
      } else if (key === "back") {
        wallGroup.position.set(0, 0, -halfD);
        wallGroup.rotation.y = Math.PI;
      } else if (key === "left") {
        wallGroup.position.set(-halfW, 0, 0);
        wallGroup.rotation.y = -Math.PI / 2;
      }

      buildingGroup.add(wallGroup);
    });

    // Roof Slab
    const roofGeo = new THREE.BoxGeometry(wallW + 0.6, 0.25, buildingDepth + 0.6);
    const roofMat = new THREE.MeshStandardMaterial({ color: "#f8fafc", roughness: 0.6, metalness: 0.1 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = wallH / 2 + 0.12;
    roofMesh.castShadow = true;
    buildingGroup.add(roofMesh);

    scene.add(buildingGroup);
  }, [wallsData, selectedPaintColor, selectedFrameColor, selectedWindowId, buildWindow3DMesh]);

  // Animate Open/Close for Demonstration
  useEffect(() => {
    interactiveWindowsRef.current.forEach(({ sashes, opening }) => {
      const isWallActive = !demoActiveWall || opening.wallKey === demoActiveWall;
      const amount = isWallActive ? demoOpenAmount : 0;

      sashes.forEach((sash) => {
        const udata = (sash as any).userData;
        if (!udata) return;

        if (udata.type === "Casement") {
          const maxAngle = (Math.PI / 3) * 1.1; // ~66 degrees outward
          const sign = udata.hingeLeft ? -1 : 1;
          // All panels (including middle panels for 3 and 4 panel configurations) open outward properly
          sash.rotation.y = sign * maxAngle * amount;
        } else if (udata.type === "Sliding") {
          const maxSlide = udata.panelWidth * 0.88;
          if (opening.currentPanels === 2) {
            if (udata.panelIndex === 1) {
              sash.position.x = udata.initialX - maxSlide * amount;
            }
          } else if (opening.currentPanels === 3) {
            if (udata.panelIndex === 0) sash.position.x = udata.initialX + maxSlide * amount * 0.5;
            if (udata.panelIndex === 2) sash.position.x = udata.initialX - maxSlide * amount * 0.5;
          } else if (opening.currentPanels === 4) {
            if (udata.panelIndex === 1) sash.position.x = udata.initialX - maxSlide * amount;
            if (udata.panelIndex === 2) sash.position.x = udata.initialX + maxSlide * amount;
          }
        } else if (udata.type === "Transom") {
          const maxTilt = -Math.PI / 5.5; // ~33 deg tilt
          sash.rotation.x = maxTilt * amount;
        }
      });
    });
  }, [demoOpenAmount, demoActiveWall]);

  // Pointer Interaction & Raycasting (Click to select, Hover for tooltip)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    isPointerActiveRef.current = true;
    (mountRef.current as any).pointerStartX = e.clientX;
    (mountRef.current as any).pointerStartY = e.clientY;
    (mountRef.current as any).startAngle = targetCamAngleRef.current;
    (mountRef.current as any).startHeight = targetCamHeightRef.current;
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    // Check if dragging orbit (mouse or touch)
    if (isPointerActiveRef.current && (mountRef.current as any).pointerStartX !== undefined) {
      const dx = e.clientX - (mountRef.current as any).pointerStartX;
      const dy = e.clientY - (mountRef.current as any).pointerStartY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        setIsDragging(true);
        targetCamAngleRef.current = (mountRef.current as any).startAngle - dx * 0.007;
        targetCamHeightRef.current = Math.max(-2, Math.min(6, (mountRef.current as any).startHeight + dy * 0.015));
      }
      return;
    }

    // Raycast for hover tooltip (on desktop mouse hover)
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
    const hitClickable = intersects.find((hit) => hit.object.name.startsWith("clickable-"));

    if (hitClickable && (hitClickable.object as any).userData?.opening) {
      const op = (hitClickable.object as any).userData.opening as WindowOpening;
      setHoveredWindow({
        window: op,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
      });
      container.style.cursor = "pointer";
    } else {
      setHoveredWindow(null);
      container.style.cursor = "grab";
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    isPointerActiveRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }

    if (!container || !cameraRef.current || !sceneRef.current) return;

    if (!isDragging) {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      const hitClickable = intersects.find((hit) => hit.object.name.startsWith("clickable-"));

      if (hitClickable && (hitClickable.object as any).userData?.opening) {
        const op = (hitClickable.object as any).userData.opening as WindowOpening;
        onSelectWindow(op);
      } else {
        onSelectWindow(null);
      }
    }

    (mountRef.current as any).pointerStartX = undefined;
    setIsDragging(false);
  };

  // Zoom control via wheel
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    targetCamDistanceRef.current = Math.max(7, Math.min(26, targetCamDistanceRef.current + e.deltaY * 0.01));
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full flex-1 relative outline-none select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Floating Hover Tooltip (Only visible when pointing/hovering a window) */}
      {hoveredWindow && !isDemonstrationPlaying && (
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 bg-slate-900/95 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/80 space-y-1 animate-in fade-in"
          style={{ left: `${hoveredWindow.screenX}px`, top: `${hoveredWindow.screenY}px` }}
        >
          <div className="font-bold text-cyan-300 flex items-center justify-between gap-3">
            <span>{hoveredWindow.window.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 uppercase">
              {hoveredWindow.window.currentType}
            </span>
          </div>
          <div className="text-slate-300 text-[11px]">
            {hoveredWindow.window.roomType} &bull; {hoveredWindow.window.currentPanels} {hoveredWindow.window.currentPanels === 1 ? "Panel" : "Panels"}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            {hoveredWindow.window.pixelWidth} &times; {hoveredWindow.window.pixelHeight} px ({hoveredWindow.window.sizeCategory})
          </div>
          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-tight pt-0.5 border-t border-slate-800">
            Tap to customize this window
          </div>
        </div>
      )}
    </div>
  );
};
