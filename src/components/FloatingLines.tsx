import { useEffect, useRef } from "react";

type Props = {
  linesGradient?: string[];
  animationSpeed?: number;
  interactive?: boolean;
  parallax?: boolean;
  parallaxStrength?: number;
  background?: string;
};

export default function FloatingLines({
  linesGradient = ["#E945F5", "#2F4BC0", "#E945F5"],
  animationSpeed = 1,
  interactive = true,
  parallax = true,
  parallaxStrength = 0.2,
  background = "#060010",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    resize();
    window.addEventListener("resize", resize);
    if (interactive) window.addEventListener("mousemove", onMove);

    const gradient = (x0: number, y0: number, x1: number, y1: number) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      const n = Math.max(linesGradient.length, 2);
      for (let i = 0; i < n; i++) {
        g.addColorStop(i / (n - 1), linesGradient[i % linesGradient.length]);
      }
      return g;
    };

    const draw = () => {
      t += 0.008 * animationSpeed;

      const w = window.innerWidth;
      const h = window.innerHeight;

      // fondo
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, w, h);

      // parallax
      let px = 0;
      let py = 0;
      if (parallax) {
        px = (mouse.current.x - w / 2) * parallaxStrength * 0.05;
        py = (mouse.current.y - h / 2) * parallaxStrength * 0.05;
      }

      // líneas
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = linesGradient[0];

      const centerY = h * 0.55;
      const amp = h * 0.12;

      for (let k = 0; k < 6; k++) {
        ctx.beginPath();
        const phase = t + k * 0.6;

        for (let x = -20; x <= w + 20; x += 6) {
          const y =
            centerY +
            Math.sin(x * 0.008 + phase) * amp * (0.6 + k * 0.05) +
            Math.cos(x * 0.004 - phase) * amp * 0.25;

          const xx = x + px;
          const yy = y + py + k * 6;

          if (x === -20) ctx.moveTo(xx, yy);
          else ctx.lineTo(xx, yy);
        }

        ctx.strokeStyle = gradient(0, centerY, w, centerY);
        ctx.globalAlpha = 0.22 + k * 0.06;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (interactive) window.removeEventListener("mousemove", onMove);
    };
  }, [
    linesGradient,
    animationSpeed,
    interactive,
    parallax,
    parallaxStrength,
    background,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}

    />
  );
}
