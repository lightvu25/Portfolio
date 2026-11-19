import {
  Camera,
  Color,
  GLSL3,
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
import {
  CELL_FRAG,
  POST_FRAG,
  QUAD_VERT,
  SCENE_FRAG,
  SCENE_VERT,
} from "./shaders";
import { buildVoxelGeometry } from "./voxel-mark";

const FOV = 38;
const NEAR = 0.5;
const FAR = 40;
const CAMERA_DISTANCE = 6.4;
const OBJECT_SCALE = 3.25;
const SCENE_CELL_PX = 12;
const SAMPLES = 4;

export interface AsciiPose {
  azimuth: number;
  elevation: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  bob: number;
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

export class AsciiLogoRenderer {
  #renderer: WebGLRenderer;
  #scene = new Scene();
  #camera = new PerspectiveCamera(FOV, 1, NEAR, FAR);
  #mesh: Mesh<PlaneGeometry, ShaderMaterial>;
  #sceneMaterial: ShaderMaterial;
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

    const { geometry, size } = buildVoxelGeometry();
    this.#sceneMaterial = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: SCENE_VERT,
      fragmentShader: SCENE_FRAG,
      uniforms: { uPaper: { value: 1 } },
    });

    this.#mesh = new Mesh(
      geometry as unknown as PlaneGeometry,
      this.#sceneMaterial
    );
    this.#mesh.scale.setScalar(OBJECT_SCALE / size);
    this.#mesh.rotation.order = "YXZ";
    this.#scene.add(this.#mesh);

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
      uColor: { value: new Color(0.08, 0.08, 0.075) },
      uAccent: { value: new Color(0.17, 0.23, 0.91) },
    });

    this.#quad = new Mesh(new PlaneGeometry(2, 2), this.#cellMaterial);
    this.#quad.frustumCulled = false;
    this.#frame.add(this.#quad);
  }

  static create(
    canvas: HTMLCanvasElement,
    atlas: GlyphAtlas
  ): AsciiLogoRenderer | null {
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
      throw new Error("ascii-logo: shader failed to compile");
    };

    return new AsciiLogoRenderer(renderer, atlas);
  }

  setInk(color: Color, accent?: Color): void {
    (this.#postMaterial.uniforms.uColor.value as Color).copy(color);
    if (accent) {
      (this.#postMaterial.uniforms.uAccent.value as Color).copy(accent);
    }
  }

  setPaper(light: boolean): void {
    this.#sceneMaterial.uniforms.uPaper.value = light ? 1 : 0;
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

    this.#camera.aspect = sceneWidth / sceneHeight;
    this.#camera.updateProjectionMatrix();

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

  render(pose: AsciiPose): void {
    const renderer = this.#renderer;

    this.#orbit.set(
      CAMERA_DISTANCE,
      Math.PI / 2 - pose.elevation,
      pose.azimuth
    );
    this.#camera.position.setFromSpherical(this.#orbit);
    this.#camera.lookAt(0, 0, 0);

    this.#mesh.rotation.set(pose.rotateX, pose.rotateY, pose.rotateZ);
    this.#mesh.position.y = pose.bob;

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
    this.#mesh.geometry.dispose();
    this.#sceneMaterial.dispose();
    this.#quad.geometry.dispose();
    this.#cellMaterial.dispose();
    this.#postMaterial.dispose();
    this.#renderer.dispose();
    this.#renderer.forceContextLoss();
  }
}
