/**
 * ConstellationCanvas — fundo interativo de pontos (constellation) que
 * reagem ao mouse. Renderizado em <canvas> com requestAnimationFrame.
 *
 * Performance / acessibilidade:
 *  - Pausa quando aba inativa (visibilitychange).
 *  - Pausa quando fora da viewport (IntersectionObserver).
 *  - Desativado em prefers-reduced-motion e em viewports < 768px
 *    (substituído por gradient estático via CSS no parent).
 *  - Resolução limitada (devicePixelRatio capado em 1.5) para evitar GPU pesada.
 */
import { useEffect, useRef } from "react";

interface Point { x: number; y: number; vx: number; vy: number; }

export function ConstellationCanvas({
  className = "",
  density = 0.00008,
  linkDistance = 130,
  color = "rgba(183, 151, 90, 0.55)",
}: {
  className?: string;
  density?: number;
  linkDistance?: number;
  color?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 767px)");
    if (mq.matches || small.matches) return; // fallback CSS

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let points: Point[] = [];
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.floor(r.width * dpr);
      canvas.height = Math.floor(r.height * dpr);
      const count = Math.max(30, Math.min(120, Math.floor(r.width * r.height * density)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35 * dpr,
        vy: (Math.random() - 0.5) * 0.35 * dpr,
      }));
    };

    const onMouse = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) * dpr;
      mouse.y = (e.clientY - r.top) * dpr;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = mouse.y = -9999; };

    const tick = () => {
      if (!running) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      // pontos
      for (const p of points) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        // atração suave ao mouse
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 28000) { p.vx += dx * 0.00003; p.vy += dy * 0.00003; }
        }
        // amortecimento
        p.vx *= 0.995; p.vy *= 0.995;
        ctx.fillStyle = color;
        ctx.fillRect(p.x, p.y, 1.4 * dpr, 1.4 * dpr);
      }
      // linhas
      const ld = linkDistance * dpr;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < ld * ld) {
            const alpha = 1 - Math.sqrt(d2) / ld;
            ctx.strokeStyle = `rgba(183, 151, 90, ${alpha * 0.35})`;
            ctx.lineWidth = 0.5 * dpr;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => { if (!running) { running = true; tick(); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const onVis = () => (document.hidden ? stop() : start());
    const io = new IntersectionObserver(
      (ents) => ents[0]?.isIntersecting ? start() : stop(),
      { threshold: 0 },
    );

    resize();
    tick();
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseout", onLeave);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseout", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density, linkDistance, color]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full opacity-50 ${className}`}
    />
  );
}
