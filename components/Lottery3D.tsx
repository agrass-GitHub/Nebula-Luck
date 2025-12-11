import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { User, AppState } from '../types';
import { getDeterministicEmoji } from '../utils';

interface Lottery3DProps {
  users: User[];
  appState: AppState;
  winners: User[];
  prizeName: string;
}

const NEON_COLORS = [
  0x22d3ee, // Cyan
  0xe879f9, // Fuchsia
  0x34d399, // Emerald
  0xfbbf24, // Amber
  0xfb7185, // Rose
];

// Helper to create a text sprite
const createTextSprite = (text: string, colorHex: number, fontSize: number = 48) => {
  const canvas = document.createElement('canvas');
  const size = 512; 
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.font = `bold ${fontSize}px "Orbitron", "Segoe UI Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Text Shadow/Glow
    ctx.shadowColor = new THREE.Color(colorHex).getStyle();
    ctx.shadowBlur = 20;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, size / 2, size / 2);
    ctx.shadowBlur = 0;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  
  const material = new THREE.SpriteMaterial({ 
    map: texture, 
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false
  });
  
  const sprite = new THREE.Sprite(material);
  return sprite;
};

const Lottery3D: React.FC<Lottery3DProps> = ({ users, appState, winners, prizeName }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  
  // ThreeJS Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  // Removed internal starsRef/tunnelRef to avoid duplication with overlays
  
  // Objects Map
  const userObjectsRef = useRef<Map<string, { group: THREE.Group, originalPos: THREE.Vector3 }>>(new Map());
  
  // Animation state
  const rotationSpeedRef = useRef(0.002);
  const targetRotationSpeedRef = useRef(0.002);
  const frameIdRef = useRef<number>(0);
  const timeRef = useRef(0);
  
  const animationPhaseRef = useRef<'idle' | 'gathering' | 'expanding' | 'spinning'>('idle');
  const scaleRef = useRef(1); // Global scale of the group

  // Mouse
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const targetRotationRef = useRef(new THREE.Vector2(0, 0));

  // Init Scene
  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.001); 
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 4000);
    camera.position.z = 500;
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(200, 200, 400);
    scene.add(pointLight);

    // 5. Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Handlers
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (event: MouseEvent) => {
        mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (mountRef.current) mountRef.current.innerHTML = '';
      cancelAnimationFrame(frameIdRef.current);
    };
  }, []);

  // Sync Users to 3D Objects
  useEffect(() => {
    if (!groupRef.current) return;
    
    // Cleanup old children
    const group = groupRef.current;
    while(group.children.length > 0){ 
        group.remove(group.children[0]);
    }
    userObjectsRef.current.clear();

    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const sphereRadius = 240; // Slightly larger
    const geometry = new THREE.SphereGeometry(14, 32, 32); 
    const count = users.length;

    users.forEach((user, i) => {
        // Safe calculation for Y
        const y = count > 1 ? (1 - (i / (count - 1)) * 2) * 0.7 : 0;
        
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius * sphereRadius;
        const z = Math.sin(theta) * radius * sphereRadius;
        const yPos = y * sphereRadius;

        const colorHex = NEON_COLORS[i % NEON_COLORS.length];
        
        const userGroup = new THREE.Group();
        userGroup.position.set(x, yPos, z);
        userGroup.lookAt(0, 0, 0); 
        
        // 1. Planet
        const material = new THREE.MeshStandardMaterial({ 
            color: colorHex, 
            emissive: colorHex,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.8,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'planet';
        userGroup.add(mesh);

        // 2. Name
        const textSprite = createTextSprite(user.name, colorHex, 60);
        textSprite.scale.set(60, 60, 1);
        textSprite.position.set(0, 0, 0); 
        textSprite.name = 'name';
        userGroup.add(textSprite);

        // 3. Emoji
        const emojiChar = getDeterministicEmoji(user.id);
        const emojiSprite = createTextSprite(emojiChar, 0xffffff, 100);
        emojiSprite.scale.set(40, 40, 1);
        emojiSprite.position.set(12, 16, 10); 
        emojiSprite.name = 'emoji';
        userGroup.add(emojiSprite);

        group.add(userGroup);
        userObjectsRef.current.set(user.id, { 
            group: userGroup, 
            originalPos: new THREE.Vector3(x, yPos, z) 
        });
    });

  }, [users]);

  // Handle State Changes for Animation Triggers
  useEffect(() => {
    if (appState === AppState.RUNNING) {
        // Trigger "Gather -> Explode" sequence
        animationPhaseRef.current = 'gathering';
    } else if (appState === AppState.IDLE) {
        animationPhaseRef.current = 'idle';
        targetRotationSpeedRef.current = 0.002;
    } else if (appState === AppState.SHOW_WINNER) {
        animationPhaseRef.current = 'idle'; // Stop special animation
        targetRotationSpeedRef.current = 0.002; // Slow down but keep moving
    } else if (appState === AppState.DRAWING) {
        animationPhaseRef.current = 'spinning';
        targetRotationSpeedRef.current = 0.04; // Faster spin during drawing
    }
  }, [appState]);

  // Animation Loop
  useEffect(() => {
    const animate = () => {
      if (!groupRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;
      
      timeRef.current += 0.01;

      // Handle Animation Phases
      if (animationPhaseRef.current === 'gathering') {
          // Implode
          scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 0.2, 0.05);
          targetRotationSpeedRef.current = 0.05;
          if (scaleRef.current < 0.25) {
              animationPhaseRef.current = 'expanding';
          }
      } else if (animationPhaseRef.current === 'expanding') {
          // Explode
          scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1.2, 0.1); 
          targetRotationSpeedRef.current = 0.15; // Fast spin
          if (scaleRef.current > 0.99) {
              scaleRef.current = 1;
              animationPhaseRef.current = 'spinning'; // Go to normal spinning
          }
      } else {
          // Normal Idle or Spinning (RUNNING/DRAWING/IDLE)
          scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, 1, 0.05);
      }
      
      // Apply scale to group
      groupRef.current.scale.setScalar(scaleRef.current);

      // Rotation Speed Smoothing
      rotationSpeedRef.current += (targetRotationSpeedRef.current - rotationSpeedRef.current) * 0.05;
      
      // Mouse interaction
      targetRotationRef.current.x = mouseRef.current.y * 0.2;
      targetRotationRef.current.y = mouseRef.current.x * 0.2;

      // Apply Rotation
      groupRef.current.rotation.y -= rotationSpeedRef.current;
      groupRef.current.rotation.x += (targetRotationRef.current.x - groupRef.current.rotation.x) * 0.05;
      
      // Update individual objects
      const winnerIds = new Set(winners.map(w => w.id));

      userObjectsRef.current.forEach(({ group, originalPos }, id) => {
            group.position.lerp(originalPos, 0.1);
            group.lookAt(0,0,0); 

            const isWinner = winnerIds.has(id);
            const mesh = group.getObjectByName('planet') as THREE.Mesh;
            
            if (appState === AppState.SHOW_WINNER) {
                 if (isWinner) {
                     const pulse = 1.5 + Math.sin(timeRef.current * 8) * 0.2;
                     group.scale.setScalar(pulse);
                     if (mesh) (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 2;
                 } else {
                     group.scale.lerp(new THREE.Vector3(0.5, 0.5, 0.5), 0.1);
                     if (mesh) (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
                 }
            } else {
                group.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                if (mesh) (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.5;
            }
      });

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      frameIdRef.current = requestAnimationFrame(animate);
    };

    frameIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [appState, winners]);

  return (
    <div ref={mountRef} className="w-full h-full relative overflow-hidden" style={{ cursor: 'crosshair' }}></div>
  );
};

export default Lottery3D;
