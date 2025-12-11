import React, { useEffect, useRef } from 'react';

const Celebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
      type: 'firework' | 'confetti';

      constructor(x: number, y: number, color: string, type: 'firework' | 'confetti') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        
        if (type === 'firework') {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 3; // Faster explosion
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed;
          this.alpha = 1;
          this.decay = Math.random() * 0.01 + 0.01;
          this.size = Math.random() * 3 + 2;
        } else {
          // Confetti - shot from corners or bottom
          this.vx = (Math.random() - 0.5) * 15; // Spread wide
          this.vy = -(Math.random() * 15 + 10); // Shoot up fast
          this.alpha = 1;
          this.decay = 0.003;
          this.size = Math.random() * 8 + 4;
        }
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.type === 'firework') {
           this.vy += 0.05; // Gravity
           this.vx *= 0.95; // Friction
        } else {
           this.vy += 0.2; // Gravity
           this.vx *= 0.99;
           // Spin effect simulation by changing size width slightly?
           // Keeping it simple for performance
        }
        
        this.alpha -= this.decay;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
      }
    }

    const colors = ['#22d3ee', '#e879f9', '#facc15', '#ffffff', '#34d399', '#f43f5e'];

    const createExplosion = (x: number, y: number) => {
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle(x, y, colors[Math.floor(Math.random() * colors.length)], 'firework'));
      }
    };

    const createConfetti = () => {
        // Shoot from bottom corners
        for(let i=0; i<5; i++) {
            particles.push(new Particle(0, canvas.height, colors[Math.floor(Math.random() * colors.length)], 'confetti'));
            particles.push(new Particle(canvas.width, canvas.height, colors[Math.floor(Math.random() * colors.length)], 'confetti'));
        }
    };

    let timer = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Random explosions higher up
      if (timer % 30 === 0) {
         createExplosion(Math.random() * canvas.width, Math.random() * (canvas.height * 0.5));
      }
      // Continuous confetti from bottom
      if (timer % 4 === 0) {
          createConfetti();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > canvas.height + 50) {
            particles.splice(i, 1);
        }
      }

      timer++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[110]" />; // z-index higher than modal (100)
};

export default Celebration;