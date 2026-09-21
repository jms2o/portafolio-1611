"use client";

import { useEffect, useRef, type PointerEvent } from "react";

type Matrix = Float32Array;
type Point3D = [number, number, number];
type Edge = { from: Point3D; to: Point3D; color: [number, number, number]; delay: number };

const lime: [number, number, number] = [.78, 1, .3];
const blue: [number, number, number] = [.25, .7, 1];
const violet: [number, number, number] = [.68, .48, 1];
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
  ...inputs.map((from, index) => ({ from, to: sum, color: index % 2 ? blue : violet, delay: index * .16 })),
  { from: bias, to: sum, color: lime, delay: .31 },
  { from: sum, to: activation, color: blue, delay: .18 },
  { from: activation, to: output, color: lime, delay: .52 },
];

function identity(): Matrix {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

function multiply(a: Matrix, b: Matrix): Matrix {
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] =
        a[row] * b[column * 4] + a[4 + row] * b[column * 4 + 1] +
        a[8 + row] * b[column * 4 + 2] + a[12 + row] * b[column * 4 + 3];
    }
  }
  return out;
}

function translation(x: number, y: number, z: number): Matrix {
  const out = identity();
  out[12] = x; out[13] = y; out[14] = z;
  return out;
}

function rotationX(angle: number): Matrix {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]);
}

function rotationY(angle: number): Matrix {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 1]);
}

function perspective(fieldOfView: number, aspect: number, near: number, far: number): Matrix {
  const f = 1 / Math.tan(fieldOfView / 2), range = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * range, -1, 0, 0, near * far * range * 2, 0]);
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) return null;
  gl.shaderSource(result, source);
  gl.compileShader(result);
  return gl.getShaderParameter(result, gl.COMPILE_STATUS) ? result : null;
}

function vertexData(points: Array<{ position: Point3D; color: [number, number, number] }>) {
  return new Float32Array(points.flatMap(({ position, color }) => [...position, ...color]));
}

export function OrbitalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: -.08, y: -.16 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: true });
    if (!canvas || !gl) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      uniform mat4 uMvp;
      uniform float uPointSize;
      varying vec3 vColor;
      void main() {
        vColor = aColor;
        gl_Position = uMvp * vec4(aPosition, 1.0);
        gl_PointSize = uPointSize;
      }
    `);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform float uPoint;
      uniform float uOpacity;
      varying vec3 vColor;
      void main() {
        float alpha = uOpacity;
        if (uPoint > 0.5) {
          float distanceToCenter = length(gl_PointCoord - vec2(0.5));
          if (distanceToCenter > 0.5) discard;
          float core = 1.0 - smoothstep(0.04, 0.5, distanceToCenter);
          alpha *= 1.0 - smoothstep(0.34, 0.5, distanceToCenter);
          gl_FragColor = vec4(vColor + core * 0.34, alpha);
        } else {
          gl_FragColor = vec4(vColor, alpha);
        }
      }
    `);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const lineData = vertexData(edges.flatMap(({ from, to, color }) => [
      { position: from, color },
      { position: to, color },
    ]));
    const nodeData = vertexData([
      ...inputs.map((position, index) => ({ position, color: index % 2 ? blue : violet })),
      { position: bias, color: lime },
      { position: sum, color: lime },
      { position: activation, color: blue },
      { position: output, color: lime },
    ]);
    const lineBuffer = gl.createBuffer();
    const nodeBuffer = gl.createBuffer();
    const pulseBuffer = gl.createBuffer();
    if (!lineBuffer || !nodeBuffer || !pulseBuffer) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, lineData, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, nodeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, nodeData, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const colorLocation = gl.getAttribLocation(program, "aColor");
    const mvpLocation = gl.getUniformLocation(program, "uMvp");
    const pointSizeLocation = gl.getUniformLocation(program, "uPointSize");
    const pointLocation = gl.getUniformLocation(program, "uPoint");
    const opacityLocation = gl.getUniformLocation(program, "uOpacity");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0, currentX = -.08, currentY = -.16;

    const bindData = (buffer: WebGLBuffer) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(colorLocation);
      gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 24, 12);
    };

    function render(time: number) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas!.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas!.clientHeight * ratio));
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
      gl!.viewport(0, 0, width, height);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
      gl!.enable(gl!.DEPTH_TEST);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.SRC_ALPHA, gl!.ONE_MINUS_SRC_ALPHA);
      gl!.useProgram(program);

      currentX += (target.current.x - currentX) * .055;
      currentY += (target.current.y - currentY) * .055;
      const idle = reducedMotion ? 0 : Math.sin(time * .00032) * .07;
      const rotation = multiply(rotationY(currentY + idle), rotationX(currentX));
      const view = translation(0, .02, -7.7);
      const projection = perspective(Math.PI / 4.15, width / height, .1, 100);
      const mvp = multiply(projection, multiply(view, rotation));
      gl!.uniformMatrix4fv(mvpLocation, false, mvp);

      bindData(lineBuffer);
      gl!.uniform1f(pointLocation, 0);
      gl!.uniform1f(opacityLocation, .5);
      gl!.drawArrays(gl!.LINES, 0, lineData.length / 6);

      bindData(nodeBuffer);
      gl!.uniform1f(pointLocation, 1);
      gl!.uniform1f(opacityLocation, .18);
      gl!.uniform1f(pointSizeLocation, 54 * ratio);
      gl!.drawArrays(gl!.POINTS, 0, nodeData.length / 6);
      gl!.uniform1f(opacityLocation, .98);
      gl!.uniform1f(pointSizeLocation, 22 * ratio);
      gl!.drawArrays(gl!.POINTS, 0, 5);
      gl!.uniform1f(pointSizeLocation, 35 * ratio);
      gl!.drawArrays(gl!.POINTS, 5, 1);
      gl!.uniform1f(pointSizeLocation, 28 * ratio);
      gl!.drawArrays(gl!.POINTS, 6, 1);
      gl!.uniform1f(pointSizeLocation, 31 * ratio);
      gl!.drawArrays(gl!.POINTS, 7, 1);

      const pulses = edges.map((edge) => {
        const progress = reducedMotion ? .62 : (time * .00034 + edge.delay) % 1;
        const position: Point3D = [
          edge.from[0] + (edge.to[0] - edge.from[0]) * progress,
          edge.from[1] + (edge.to[1] - edge.from[1]) * progress,
          edge.from[2] + (edge.to[2] - edge.from[2]) * progress,
        ];
        return { position, color: edge.color };
      });
      const pulseData = vertexData(pulses);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, pulseBuffer);
      gl!.bufferData(gl!.ARRAY_BUFFER, pulseData, gl!.DYNAMIC_DRAW);
      bindData(pulseBuffer);
      gl!.uniform1f(opacityLocation, 1);
      gl!.uniform1f(pointSizeLocation, 10 * ratio);
      gl!.drawArrays(gl!.POINTS, 0, pulses.length);

      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    target.current.y = ((event.clientX - box.left) / box.width - .5) * .8;
    target.current.x = -.08 + ((event.clientY - box.top) / box.height - .5) * -.48;
  }

  function reset() {
    target.current = { x: -.08, y: -.16 };
  }

  return (
    <div className="orbital-scene" onPointerMove={move} onPointerLeave={reset} aria-label="Representación tridimensional interactiva de un perceptrón">
      <div className="model-halo" aria-hidden="true" />
      <canvas ref={canvasRef} className="model-canvas" aria-hidden="true" />
      <div className="model-interface" aria-hidden="true">
        <span className="interface-top">PERCEPTRON // WEBGL</span>
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
