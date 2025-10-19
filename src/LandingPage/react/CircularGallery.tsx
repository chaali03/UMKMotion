import React, { useEffect, useRef } from 'react';
import { Renderer, Geometry, Program, Mesh, Texture, Vec2, Camera, Transform } from 'ogl';

type GalleryItem = {
  image: string;
  text?: string;
};

type CircularGalleryProps = {
  images?: string[];
  items?: GalleryItem[];
  radius?: number;
  bend?: number; // curvature strength
  autoRotate?: boolean;
  width?: number;
  height?: number;
};

// Lightweight circular gallery inspired by react-bits examples, using OGL directly
export default function CircularGallery({
  images,
  items,
  radius = 2.8,
  bend = 2.6,
  autoRotate = true,
  width = 680,
  height = 280,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const galleryItems: GalleryItem[] = (items && items.length
      ? items
      : (images || []).map((src) => ({ image: src })));

    const renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio || 1), alpha: true, width, height });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    // Resize canvas to container
    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width || width, height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const scene = new Transform();
    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 6;

    // Simple textured plane shader with bend
    const vertex = /* glsl */`
      attribute vec2 uv;
      attribute vec3 position;
      uniform float uBend;
      uniform float uRadius;
      uniform vec2 uOffset;
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;
      uniform mat4 projectionMatrix;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float theta = (pos.x + uOffset.x) / uRadius;
        float c = cos(theta);
        float s = sin(theta);
        pos.x = uRadius * s;
        pos.z = uRadius * (1.0 - c) * uBend;
        pos.y += uOffset.y;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
      }
    `;

    const fragment = /* glsl */`
      precision highp float;
      uniform sampler2D tMap;
      varying vec2 vUv;
      void main() {
        vec4 c = texture2D(tMap, vUv);
        if (c.a < 0.01) discard;
        gl_FragColor = c;
      }
    `;

    const plane = new Geometry(gl, {
      position: { size: 3, data: new Float32Array([
        -1, -0.6, 0, 1, -0.6, 0, -1, 0.6, 0,
        -1, 0.6, 0, 1, -0.6, 0, 1, 0.6, 0,
      ]) },
      uv: { size: 2, data: new Float32Array([
        0, 0, 1, 0, 0, 1,
        0, 1, 1, 0, 1, 1,
      ]) }
    });

    const meshes: Mesh[] = [];
    const count = Math.max(1, galleryItems.length);
    const step = (Math.PI * 2) / count;

    galleryItems.forEach((item, i) => {
      const texture = new Texture(gl);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { texture.image = img; };
      img.src = item.image;

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          uBend: { value: bend },
          uRadius: { value: radius },
          uOffset: { value: new Vec2(i * step, 0) },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { geometry: plane, program });
      // @ts-ignore
      mesh.userData = { angle: i * step };
      scene.addChild(mesh as unknown as any);
      meshes.push(mesh);
    });

    let t = 0;
    const render = () => {
      if (autoRotate) t += 0.0035;
      meshes.forEach((m, idx) => {
        // @ts-ignore
        const a = m.userData.angle + t;
        (m.program.uniforms.uOffset.value as Vec2).x = a;
      });
      renderer.render({ scene, camera });
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      try { container.removeChild(gl.canvas); } catch {}
    };
  }, [images, items, radius, bend, autoRotate, width, height]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div ref={containerRef} style={{ width: '100%', maxWidth: width, height }} />
    </div>
  );
}


