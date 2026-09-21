"use client";

import { useEffect, useRef, type PointerEvent } from "react";

type Point3D = [number, number, number];
type Color = [number, number, number];
type Edge = { from: Point3D; to: Point3D; color: Color; delay: number; weight: string };
type ProjectedPoint = { x: number; y: number; depth: number; scale: number };

const lime: Color = [200, 255, 77];
const blue: Color = [64, 178, 255];
const violet: Color = [174, 122, 255];
const inputs: Point3D[] = [
  [-2.25, 1.32, -.35],
  [-2.45, .43, .28],
  [-2.42, -.48, -.12],
  [-2.18, -1.36, .38],
];
const bias: Point3D = [-.82, 1.83, -.42];
const sum: Point3D = [-.18, 0, 0];
const activation: Point3D = [1.25, 0, .22];
const output: Point3D = [2.38, 0, -.08];

const edges: Edge[] = [
  ...inputs.map((from, index) => ({
    from,
    to: sum,
    color: index % 2 ? blue : violet,
    delay: index * .16,
    weight: `w${index + 1}`,
  })),
  { from: bias, to: sum, color: lime, delay: .31, weight: "b" },
  { from: sum, to: activation, color: blue, delay: .18, weight: "z" },
  { from: activation, to: output, color: lime, delay: .52, weight: "ŷ" },
];

const rgba = (color: Color, alpha: number) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

function rotateAndProject(
  point: Point3D,
  rotationX: number,
  rotationY: number,
  width: number,
  height: number,
): ProjectedPoint {
  const cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);
  const cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
  const x = point[0] * cosY + point[2] * sinY;
  const zAfterY = -point[0] * sinY + point[2] * cosY;
  const y = point[1] * cosX - zAfterY * sinX;
  const z = point[1] * sinX + zAfterY * cosX;
  const perspective = 5.8 / (5.8 + z);
  const unit = Math.min(width, height) * .155;

  return {
    x: width / 2 + x * unit * perspective,
    y: height / 2 - y * unit * perspective,
    depth: z,
    scale: perspective,
  };
}

function interpolate(from: Point3D, to: Point3D, progress: number): Point3D {
  return [
    from[0] + (to[0] - from[0]) * progress,
    from[1] + (to[1] - from[1]) * progress,
    from[2] + (to[2] - from[2]) * progress,
  ];
}

function drawNode(
  context: CanvasRenderingContext2D,
  point: ProjectedPoint,
  color: Color,
  radius: number,
  label: string,
  ratio: number,
) {
  const size = radius * point.scale;
  const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 2.4);
  glow.addColorStop(0, rgba(color, .34));
  glow.addColorStop(.45, rgba(color, .12));
  glow.addColorStop(1, rgba(color, 0));
  context.fillStyle = glow;
  context.beginPath();
  context.arc(point.x, point.y, size * 2.4, 0, Math.PI * 2);
  context.fill();

  const sphere = context.createRadialGradient(
    point.x - size * .3,
    point.y - size * .35,
    size * .08,
    point.x,
    point.y,
    size,
  );
  sphere.addColorStop(0, "rgba(255,255,255,.96)");
  sphere.addColorStop(.18, rgba(color, .98));
  sphere.addColorStop(.72, rgba(color, .5));
  sphere.addColorStop(1, rgba(color, .12));
  context.shadowColor = rgba(color, .72);
  context.shadowBlur = 14 * ratio;
  context.fillStyle = sphere;
  context.beginPath();
  context.arc(point.x, point.y, size, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.strokeStyle = rgba(color, .95);
  context.lineWidth = 1.25;
  context.stroke();

  context.fillStyle = "#071018";
  context.font = `800 ${Math.max(10, size * .72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, point.x, point.y + .5);
}

export function OrbitalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: -.08, y: -.16 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let currentX = -.08;
    let currentY = -.16;

    function render(time: number) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, canvas!.clientWidth);
      const height = Math.max(1, canvas!.clientHeight);
      const pixelWidth = Math.floor(width * ratio);
      const pixelHeight = Math.floor(height * ratio);
      if (canvas!.width !== pixelWidth || canvas!.height !== pixelHeight) {
        canvas!.width = pixelWidth;
        canvas!.height = pixelHeight;
      }

      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      context!.clearRect(0, 0, width, height);
      currentX += (target.current.x - currentX) * .055;
      currentY += (target.current.y - currentY) * .055;
      const idle = reducedMotion ? 0 : Math.sin(time * .00032) * .07;
      const project = (point: Point3D) => rotateAndProject(point, currentX, currentY + idle, width, height);

      for (const edge of edges) {
        const from = project(edge.from);
        const to = project(edge.to);
        const gradient = context!.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, rgba(edge.color, .2));
        gradient.addColorStop(.45, rgba(edge.color, .82));
        gradient.addColorStop(1, rgba(edge.color, .35));
        context!.strokeStyle = gradient;
        context!.lineWidth = 1.7;
        context!.shadowColor = rgba(edge.color, .35);
        context!.shadowBlur = 8;
        context!.beginPath();
        context!.moveTo(from.x, from.y);
        context!.lineTo(to.x, to.y);
        context!.stroke();
        context!.shadowBlur = 0;

        const labelX = from.x + (to.x - from.x) * .58;
        const labelY = from.y + (to.y - from.y) * .58;
        context!.fillStyle = rgba(edge.color, .76);
        context!.font = "700 9px ui-monospace, SFMono-Regular, Menlo, monospace";
        context!.textAlign = "center";
        context!.fillText(edge.weight, labelX, labelY - 7);

        const progress = reducedMotion ? .62 : (time * .00034 + edge.delay) % 1;
        const pulse = project(interpolate(edge.from, edge.to, progress));
        const pulseGlow = context!.createRadialGradient(pulse.x, pulse.y, 0, pulse.x, pulse.y, 11);
        pulseGlow.addColorStop(0, "rgba(255,255,255,1)");
        pulseGlow.addColorStop(.22, rgba(edge.color, 1));
        pulseGlow.addColorStop(1, rgba(edge.color, 0));
        context!.fillStyle = pulseGlow;
        context!.beginPath();
        context!.arc(pulse.x, pulse.y, 11, 0, Math.PI * 2);
        context!.fill();
      }

      inputs.forEach((point, index) => drawNode(context!, project(point), index % 2 ? blue : violet, 13, `x${index + 1}`, ratio));
      drawNode(context!, project(bias), lime, 12, "b", ratio);
      drawNode(context!, project(sum), lime, 24, "Σ", ratio);
      drawNode(context!, project(activation), blue, 20, "ƒ", ratio);
      drawNode(context!, project(output), lime, 22, "ŷ", ratio);

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    target.current.y = ((event.clientX - box.left) / box.width - .5) * .78;
    target.current.x = -.08 + ((event.clientY - box.top) / box.height - .5) * -.46;
  }

  function reset() {
    target.current = { x: -.08, y: -.16 };
  }

  return (
    <div className="orbital-scene" onPointerMove={move} onPointerLeave={reset} aria-label="Representación tridimensional interactiva de un perceptrón">
      <div className="model-halo" aria-hidden="true" />
      <canvas ref={canvasRef} className="model-canvas" aria-hidden="true" />
      <div className="model-interface" aria-hidden="true">
        <span className="interface-top">PERCEPTRON // CANVAS 3D</span>
        <div><b>xᵢ</b><b>wᵢ</b><b>ƒ</b></div>
      </div>
      <div className="perceptron-label label-inputs" aria-hidden="true"><b>ENTRADAS</b><span>x₁ · x₂ · x₃ · x₄</span></div>
      <div className="perceptron-label label-sum" aria-hidden="true"><b>SUMA</b><span>Σ wᵢxᵢ + b</span></div>
      <div className="perceptron-label label-output" aria-hidden="true"><b>SALIDA</b><span>ŷ</span></div>
      <div className="perceptron-equation" aria-hidden="true">ŷ = ƒ(Σ wᵢxᵢ + b)</div>
      <div className="model-caption"><i /> Perceptrón 3D interactivo</div>
    </div>
  );
}
