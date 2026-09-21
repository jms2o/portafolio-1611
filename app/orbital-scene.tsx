"use client";

import { useEffect, useRef } from "react";

type Matrix = Float32Array;
type ModelPart = { position: [number, number, number]; scale: [number, number, number]; color: [number, number, number] };

const cubePositions = new Float32Array([
  -1,-1, 1, 1,-1, 1, 1, 1, 1, -1,-1, 1, 1, 1, 1, -1, 1, 1,
   1,-1,-1,-1,-1,-1,-1, 1,-1, 1,-1,-1,-1, 1,-1, 1, 1,-1,
  -1, 1, 1, 1, 1, 1, 1, 1,-1,-1, 1, 1, 1, 1,-1,-1, 1,-1,
  -1,-1,-1, 1,-1,-1, 1,-1, 1,-1,-1,-1, 1,-1, 1,-1,-1, 1,
   1,-1, 1, 1,-1,-1, 1, 1,-1, 1,-1, 1, 1, 1,-1, 1, 1, 1,
  -1,-1,-1,-1,-1, 1,-1, 1, 1,-1,-1,-1,-1, 1, 1,-1, 1,-1,
]);

const cubeNormals = new Float32Array([
  0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
  0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
  0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
  0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
  1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
  -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
]);

function identity(): Matrix {
  return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
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
  const out = identity(); out[12] = x; out[13] = y; out[14] = z; return out;
}

function scaling(x: number, y: number, z: number): Matrix {
  const out = identity(); out[0] = x; out[5] = y; out[10] = z; return out;
}

function rotationX(angle: number): Matrix {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]);
}

function rotationY(angle: number): Matrix {
  const c = Math.cos(angle), s = Math.sin(angle);
  return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
}

function perspective(fieldOfView: number, aspect: number, near: number, far: number): Matrix {
  const f = 1 / Math.tan(fieldOfView / 2), range = 1 / (near - far);
  return new Float32Array([f / aspect,0,0,0, 0,f,0,0, 0,0,(near + far) * range,-1, 0,0,near * far * range * 2,0]);
}

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const result = gl.createShader(type);
  if (!result) return null;
  gl.shaderSource(result, source); gl.compileShader(result);
  return gl.getShaderParameter(result, gl.COMPILE_STATUS) ? result : null;
}

function buildModel(): ModelPart[] {
  const parts: ModelPart[] = [
    { position: [0,-1.05,.25], scale: [1.85,.11,1.25], color: [.08,.12,.18] },
    { position: [0,-1.16,1.42], scale: [1.85,.07,.12], color: [.16,.23,.32] },
    { position: [0,.18,-.95], scale: [1.72,1.28,.09], color: [.07,.1,.16] },
    { position: [0,.18,-.84], scale: [1.52,1.08,.025], color: [.03,.22,.3] },
    { position: [0,-.94,.72], scale: [.55,.025,.34], color: [.18,.25,.32] },
    { position: [-.82,.61,-.79], scale: [.48,.055,.025], color: [.78,1,.3] },
    { position: [-.48,.3,-.79], scale: [.82,.04,.025], color: [.32,.72,1] },
    { position: [-.69,.06,-.79], scale: [.61,.04,.025], color: [.68,.55,1] },
    { position: [-.37,-.18,-.79], scale: [.93,.04,.025], color: [.32,.72,1] },
    { position: [-.76,-.42,-.79], scale: [.54,.04,.025], color: [.78,1,.3] },
  ];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 10; column += 1) {
      parts.push({
        position: [-1.25 + column * .28, -.89, -.45 + row * .32],
        scale: [.105,.035,.105],
        color: column === 8 && row === 0 ? [.78,1,.3] : [.18,.28,.38],
      });
    }
  }
  return parts;
}

export function OrbitalScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef({ x: -.2, y: -.42 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: true });
    if (!canvas || !gl) return;

    const vertex = shader(gl, gl.VERTEX_SHADER, `
      attribute vec3 aPosition; attribute vec3 aNormal;
      uniform mat4 uMvp; uniform mat4 uModel;
      varying float vLight;
      void main() {
        vec3 normal = normalize(mat3(uModel) * aNormal);
        vLight = .38 + max(dot(normal, normalize(vec3(-.35, .8, 1.0))), 0.0) * .72;
        gl_Position = uMvp * vec4(aPosition, 1.0);
      }
    `);
    const fragment = shader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float; uniform vec3 uColor; varying float vLight;
      void main() { gl_FragColor = vec4(uColor * vLight, 1.0); }
    `);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer); gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);
    const normalLocation = gl.getAttribLocation(program, "aNormal");
    gl.enableVertexAttribArray(normalLocation); gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    const mvpLocation = gl.getUniformLocation(program, "uMvp");
    const modelLocation = gl.getUniformLocation(program, "uModel");
    const colorLocation = gl.getUniformLocation(program, "uColor");
    const modelParts = buildModel();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0, currentX = -.2, currentY = -.42;

    function render(time: number) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas!.clientWidth * ratio));
      const height = Math.max(1, Math.floor(canvas!.clientHeight * ratio));
      if (canvas!.width !== width || canvas!.height !== height) { canvas!.width = width; canvas!.height = height; }
      gl!.viewport(0, 0, width, height);
      gl!.clearColor(0, 0, 0, 0); gl!.clear(gl!.COLOR_BUFFER_BIT | gl!.DEPTH_BUFFER_BIT);
      gl!.enable(gl!.DEPTH_TEST); gl!.enable(gl!.CULL_FACE); gl!.useProgram(program);

      currentX += (target.current.x - currentX) * .055;
      currentY += (target.current.y - currentY) * .055;
      const idle = reducedMotion ? 0 : Math.sin(time * .00035) * .08;
      const rotation = multiply(rotationY(currentY + idle), rotationX(currentX));
      const view = translation(0, .1, -7.4);
      const projection = perspective(Math.PI / 4.2, width / height, .1, 100);

      for (const part of modelParts) {
        const local = multiply(translation(...part.position), scaling(...part.scale));
        const model = multiply(rotation, local);
        const mvp = multiply(projection, multiply(view, model));
        gl!.uniformMatrix4fv(mvpLocation, false, mvp);
        gl!.uniformMatrix4fv(modelLocation, false, model);
        gl!.uniform3fv(colorLocation, part.color);
        gl!.drawArrays(gl!.TRIANGLES, 0, 36);
      }
      frame = requestAnimationFrame(render);
    }

    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const box = event.currentTarget.getBoundingClientRect();
    target.current.y = ((event.clientX - box.left) / box.width - .5) * 1.05;
    target.current.x = -.2 + ((event.clientY - box.top) / box.height - .5) * -.6;
  }

  function reset() { target.current = { x: -.2, y: -.42 }; }

  return (
    <div className="orbital-scene" onPointerMove={move} onPointerLeave={reset} aria-label="Modelo tridimensional interactivo de una estación de desarrollo">
      <div className="model-halo" aria-hidden="true" />
      <canvas ref={canvasRef} className="model-canvas" aria-hidden="true" />
      <div className="model-interface" aria-hidden="true">
        <span className="interface-top">DEV_STATION // WEBGL</span>
        <div><b>WEB</b><b>DATOS</b><b>IA</b></div>
      </div>
      <div className="model-caption"><i /> Modelo 3D interactivo</div>
    </div>
  );
}
