import {
  Camera,
  Color,
  GLSL3,
  Group,
  LinearSRGBColorSpace,
  Mesh,
  NearestFilter,
  NoBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Spherical,
  type IUniform,
  Vector2,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

import type { GlyphAtlas } from "./glyph-atlas";
import { buildQuangWordGeometry } from "./quang-voxels";
import { CELL_FRAG, POST_FRAG, QUAD_VERT, SCENE_VERT } from "./shaders";

const FOV = 34;
const NEAR = 0.5;
const FAR = 60;
const SCENE_CELL_PX = 12;
const SAMPLES = 4;

const QUANG_SCENE_FRAG = /* glsl */ `
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
out vec4 outColor;
uniform float uBoost;
uniform float uReveal;

const vec3 KEY = normalize(vec3(-0.42, 0.85, 0.55));
const vec3 RIM = normalize(vec3(0.68, -0.18, -0.70));
const float ROUGHNESS = 0.28;

vec3 studio(vec3 d) {
  float up = d.y * 0.5 + 0.5;
  return mix(vec3(0.14), vec3(0.55), up * up)
    + pow(max(dot(d, KEY), 0.0), 5.0) * 1.9
    + pow(max(dot(d, RIM), 0.0), 30.0) * 4.2;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 encodeSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  if (uReveal <= 0.01) discard;
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 lobe = normalize(mix(reflect(-v, n), n, ROUGHNESS));
  float fresnel = 0.08 + 0.92 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.6);

  vec3 lit = encodeSrgb(aces(studio(n) * 0.65 + studio(lobe) * fresnel * 1.35));
  // Raise floor and respond to hover boost so hovered letters glow brighter in ASCII
  vec3 finalTone = clamp(mix(vec3(0.24), vec3(1.0), lit) + vec3(uBoost * 0.35), 0.0, 1.0);
  outColor = vec4(finalTone, clamp(uReveal, 0.0, 1.0));
}
`;

export interface QuangPose {
  azimuth: number;
  elevation: number;
  bob: number;
  letterBoosts: readonly [number, number, number, number, number];
  letterReveals: readonly [number, number, number, number, number];
  letterWaves: readonly [number, number, number, number, number];
}

function fullFrameMaterial(
  fragmentShader: string,
  uniforms: Record<string, IUniform>
): ShaderMaterial {
  return new ShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: QUAD_VERT,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
    blending: NoBlending,
  });
}

export class AsciiQuangRenderer {
  #renderer: WebGLRenderer;
  #scene = new Scene();
  #camera = new PerspectiveCamera(FOV, 1, NEAR, FAR);
  #wordGroup = new Group();
  #letterMeshes: Mesh<PlaneGeometry, ShaderMaterial>[] = [];
  #baseX: number[] = [];
  #wordWidth: number;
  #wordHeight: number;
  #cameraDistance = 10;
  #orbit = new Spherical();

  #frame = new Scene();
  #frameCamera = new Camera();
  #quad: Mesh<PlaneGeometry, ShaderMaterial>;
  #cellMaterial: ShaderMaterial;
  #postMaterial: ShaderMaterial;
  #sceneTarget: WebGLRenderTarget;
  #cellTarget: WebGLRenderTarget;

  private constructor(renderer: WebGLRenderer, atlas: GlyphAtlas) {
    this.#renderer = renderer;

    const spec = buildQuangWordGeometry();
    this.#wordWidth = spec.wordWidth;
    this.#wordHeight = spec.wordHeight;

    for (const item of spec.letters) {
      const mat = new ShaderMaterial({
        glslVersion: GLSL3,
        vertexShader: SCENE_VERT,
        fragmentShader: QUANG_SCENE_FRAG,
        transparent: true,
        uniforms: {
          uBoost: { value: 0 },
          uReveal: { value: 1 },
        },
      });
      const mesh = new Mesh(item.geometry as unknown as PlaneGeometry, mat);
      mesh.position.set(item.xOffset, 0, 0);
      this.#wordGroup.add(mesh);
      this.#letterMeshes.push(mesh);
      this.#baseX.push(item.xOffset);
    }

    this.#scene.add(this.#wordGroup);

    this.#sceneTarget = new WebGLRenderTarget(1, 1, {
      samples: SAMPLES,
      depthBuffer: true,
      stencilBuffer: false,
    });

    this.#cellTarget = new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
      generateMipmaps: false,
    });

    this.#cellMaterial = fullFrameMaterial(CELL_FRAG, {
      tScene: { value: this.#sceneTarget.texture },
      tShapes: { value: atlas.shapes },
      uResolution: { value: new Vector2(1, 1) },
      uCellPx: { value: new Vector2(1, 1) },
      uGlyphCount: { value: atlas.count },
    });

    this.#postMaterial = fullFrameMaterial(POST_FRAG, {
      tCells: { value: this.#cellTarget.texture },
      tAtlas: { value: atlas.sheet },
      uCellsPerUv: { value: new Vector2(1, 1) },
      uGrid: { value: new Vector2(1, 1) },
      uAtlasGrid: { value: atlas.grid },
      uAtlasPad: { value: atlas.pad },
      uAtlasInner: { value: atlas.inner },
      uColor: { value: new Color(0.0, 0.94, 1.0) },
      uAccent: { value: new Color(0.0, 1.0, 0.53) },
    });

    this.#quad = new Mesh(new PlaneGeometry(2, 2), this.#cellMaterial);
    this.#quad.frustumCulled = false;
    this.#frame.add(this.#quad);
  }

  static create(
    canvas: HTMLCanvasElement,
    atlas: GlyphAtlas
  ): AsciiQuangRenderer | null {
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return null;
    }

    if (!renderer.capabilities.isWebGL2) {
      renderer.dispose();
      return null;
    }

    renderer.outputColorSpace = LinearSRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.debug.onShaderError = () => {
      throw new Error("ascii-quang: shader failed to compile");
    };

    return new AsciiQuangRenderer(renderer, atlas);
  }

  setInk(color: Color, accent?: Color): void {
    (this.#postMaterial.uniforms.uColor.value as Color).copy(color);
    if (accent) {
      (this.#postMaterial.uniforms.uAccent.value as Color).copy(accent);
    }
  }

  resize(
    width: number,
    height: number,
    dpr: number,
    cellWidth: number,
    cellHeight: number
  ): void {
    const cols = Math.max(Math.ceil(width / cellWidth), 1);
    const rows = Math.max(Math.ceil(height / cellHeight), 1);
    const scale = SCENE_CELL_PX / cellHeight;
    const sceneWidth = Math.max(Math.round(width * scale), 1);
    const sceneHeight = Math.max(Math.round(height * scale), 1);

    this.#renderer.setPixelRatio(dpr);
    this.#renderer.setSize(width, height, false);

    this.#sceneTarget.setSize(sceneWidth, sceneHeight);
    this.#cellTarget.setSize(cols, rows);

    const aspect = sceneWidth / sceneHeight;
    this.#camera.aspect = aspect;
    this.#camera.updateProjectionMatrix();

    // Auto-fit full word "QUANG" cleanly across any aspect ratio (320px -> 1920px+)
    const tanHalfFov = Math.tan(((FOV / 2) * Math.PI) / 180);
    const distByWidth = this.#wordWidth / (0.82 * 2 * tanHalfFov * aspect);
    const distByHeight = this.#wordHeight / (0.64 * 2 * tanHalfFov);
    this.#cameraDistance = Math.max(distByWidth, distByHeight, 4.4);

    (this.#cellMaterial.uniforms.uResolution.value as Vector2).set(
      sceneWidth,
      sceneHeight
    );
    (this.#cellMaterial.uniforms.uCellPx.value as Vector2).set(
      cellWidth * scale,
      cellHeight * scale
    );
    (this.#postMaterial.uniforms.uCellsPerUv.value as Vector2).set(
      width / cellWidth,
      height / cellHeight
    );
    (this.#postMaterial.uniforms.uGrid.value as Vector2).set(cols, rows);
  }

  render(pose: QuangPose): void {
    const renderer = this.#renderer;

    this.#orbit.set(
      this.#cameraDistance,
      Math.PI / 2 - pose.elevation,
      pose.azimuth
    );
    this.#camera.position.setFromSpherical(this.#orbit);
    this.#camera.lookAt(0, 0, 0);

    this.#wordGroup.position.y = pose.bob;

    for (let i = 0; i < this.#letterMeshes.length; i++) {
      const mesh = this.#letterMeshes[i];
      const boost = pose.letterBoosts[i] ?? 0;
      const reveal = pose.letterReveals[i] ?? 1;
      const wave = pose.letterWaves[i] ?? 0;

      mesh.position.set(
        this.#baseX[i],
        wave * 0.08 + boost * 0.05,
        boost * 0.42
      );
      const scale = (0.86 + 0.14 * reveal) * (1 + boost * 0.075);
      mesh.scale.setScalar(scale);
      mesh.rotation.y = boost * 0.12;
      mesh.material.uniforms.uBoost.value = boost;
      mesh.material.uniforms.uReveal.value = reveal;
    }

    renderer.setRenderTarget(this.#sceneTarget);
    renderer.render(this.#scene, this.#camera);

    this.#quad.material = this.#cellMaterial;
    renderer.setRenderTarget(this.#cellTarget);
    renderer.render(this.#frame, this.#frameCamera);

    this.#quad.material = this.#postMaterial;
    renderer.setRenderTarget(null);
    renderer.render(this.#frame, this.#frameCamera);
  }

  destroy(): void {
    this.#sceneTarget.dispose();
    this.#cellTarget.dispose();
    for (const mesh of this.#letterMeshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.#quad.geometry.dispose();
    this.#cellMaterial.dispose();
    this.#postMaterial.dispose();
    this.#renderer.dispose();
    this.#renderer.forceContextLoss();
  }
}
