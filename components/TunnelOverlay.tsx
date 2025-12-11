import React, { useEffect, useRef } from 'react';

interface TunnelOverlayProps {
  isActive: boolean;
  isAccelerating: boolean; // True during DRAWING phase
}

const TunnelOverlay: React.FC<TunnelOverlayProps> = ({ isActive, isAccelerating }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const speedRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: { x: number; y: number; z: number; angle: number }[] = [];
    const numStars = 800; // Increased count for density
    let width = window.innerWidth;
    let height = window.innerHeight;
    let cx = width / 2;
    let cy = height / 2;

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        // Randomly distribute, but we will filter visibility in draw loop
        stars.push({
          x: Math.random() * width - cx,
          y: Math.random() * height - cy,
          z: Math.random() * width, // depth
          angle: Math.atan2(Math.random() * height - cy, Math.random() * width - cx)
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      cx = width / 2;
      cy = height / 2;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };
    
    window.addEventListener('resize', resize);
    resize();

    const animate = () => {
      // CLEAR rect is crucial to see the layer behind (3D Planet)
      ctx.clearRect(0, 0, width, height);

      if (!isActive && speedRef.current <= 0.1) {
         if (!isActive) return;
      }

      // Smooth speed transition
      const targetSpeed = isActive ? (isAccelerating ? 60 : 5) : 0;
      speedRef.current += (targetSpeed - speedRef.current) * 0.05;
      const speed = speedRef.current;
      
      if (speed > 0.1) {
          ctx.lineWidth = isAccelerating ? 3 : 2;
          
          stars.forEach((star) => {
            star.z -= speed;

            if (star.z <= 0) {
              star.z = width;
              star.x = Math.random() * width - cx;
              star.y = Math.random() * height - cy;
            }

            const k = 128.0 / star.z;
            const px = star.x * k + cx;
            const py = star.y * k + cy;

            // --- TRANSPARENT CENTER LOGIC ---
            // Calculate distance from center
            const dx = px - cx;
            const dy = py - cy;
            const distFromCenter = Math.sqrt(dx*dx + dy*dy);
            
            // Define a "Safe Zone" radius in pixels where stars are hidden
            const safeZoneRadius = 300; 
            
            // Calculate opacity based on distance. 0 inside safe zone, fades to 1 outside.
            let alpha = 0;
            if (distFromCenter > safeZoneRadius) {
                alpha = Math.min(1, (distFromCenter - safeZoneRadius) / 100);
            }

            if (alpha > 0 && px >= 0 && px <= width && py >= 0 && py <= height) {
              const depthAlpha = (1 - star.z / width);
              const finalAlpha = Math.min(alpha, depthAlpha);

              if (finalAlpha <= 0.05) return;

              const shade = Math.floor(finalAlpha * 255);
              
              if (isAccelerating) {
                  // Warp lines
                  const prevK = 128.0 / (star.z + speed * 1.2);
                  const prevPx = star.x * prevK + cx;
                  const prevPy = star.y * prevK + cy;
                  
                  ctx.beginPath();
                  ctx.strokeStyle = `rgba(${shade}, ${255 - shade}, 255, ${finalAlpha})`;
                  ctx.moveTo(prevPx, prevPy);
                  ctx.lineTo(px, py);
                  ctx.stroke();
              } else {
                  // Idle moving dots
                  ctx.fillStyle = `rgba(${shade}, ${shade}, 255, ${finalAlpha})`;
                  const size = (1 - star.z / width) * 2;
                  ctx.beginPath();
                  ctx.arc(px, py, size, 0, Math.PI * 2);
                  ctx.fill();
              }
            }
          });
      }
      
      // Vignette Overlay (Only at edges, keeping center clear)
      if (speed > 2) {
         const glowOpacity = Math.min(0.5, speed / 80);
         const gradient = ctx.createRadialGradient(cx, cy, height * 0.4, cx, cy, height);
         gradient.addColorStop(0, 'rgba(0,0,0,0)'); // Transparent center
         gradient.addColorStop(0.5, 'rgba(0,0,0,0)'); // Transparent mid
         gradient.addColorStop(1, isAccelerating ? `rgba(34, 211, 238, ${glowOpacity})` : `rgba(88, 28, 135, ${glowOpacity})`);
         
         ctx.fillStyle = gradient;
         ctx.fillRect(0,0,width,height);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isAccelerating]);

  return (
    <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 pointer-events-none z-20 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

export default TunnelOverlay;
