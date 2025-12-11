import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Stars data
    const stars: {x: number, y: number, size: number, opacity: number, speed: number}[] = [];
    // Meteors data
    const meteors: {x: number, y: number, len: number, speed: number, angle: number, active: boolean}[] = [];

    // Initialize Stars
    const initStars = () => {
        stars.length = 0;
        for(let i=0; i<300; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5,
                opacity: Math.random(),
                speed: Math.random() * 0.02
            });
        }
    };
    initStars();

    const createMeteor = () => {
        meteors.push({
            x: Math.random() * width,
            y: Math.random() * (height * 0.4), // Start in upper half
            len: Math.random() * 80 + 20,
            speed: Math.random() * 15 + 10,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.5, // Approx 45 degrees
            active: true
        });
    };

    let frameId = 0;

    const animate = () => {
        // Clear with background color
        ctx.fillStyle = '#030712'; // Slate 950 base
        ctx.fillRect(0, 0, width, height);

        // Draw Deep Space Gradient
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.8);
        gradient.addColorStop(0, '#172554'); // blue-950
        gradient.addColorStop(0.5, '#0f172a'); // slate-900
        gradient.addColorStop(1, '#020617'); // slate-950
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;

        // Draw Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            // Twinkle
            star.opacity += (Math.random() - 0.5) * 0.05;
            if(star.opacity < 0.1) star.opacity = 0.1;
            if(star.opacity > 1) star.opacity = 1;
            
            ctx.globalAlpha = star.opacity;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Handle Meteors
        if(Math.random() < 0.015) { // 1.5% chance per frame
            createMeteor();
        }

        meteors.forEach((m, i) => {
            if(!m.active) return;
            
            const dx = Math.cos(m.angle) * m.speed;
            const dy = Math.sin(m.angle) * m.speed;
            m.x += dx;
            m.y += dy;

            // Draw Meteor Trail
            const gradient = ctx.createLinearGradient(m.x, m.y, m.x - Math.cos(m.angle)*m.len, m.y - Math.sin(m.angle)*m.len);
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - Math.cos(m.angle)*m.len, m.y - Math.sin(m.angle)*m.len);
            ctx.stroke();

            // Remove if out of bounds
            if(m.x > width + 100 || m.y > height + 100) {
                m.active = false;
                meteors.splice(i, 1);
            }
        });

        frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initStars();
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};

export default StarBackground;
