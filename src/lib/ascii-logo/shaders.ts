export const QUAD_VERT = /* glsl */ `
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const SCENE_VERT = /* glsl */ `
out vec3 vNormal;
out vec3 vWorld;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);

  vWorld = world.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const SCENE_FRAG = /* glsl */ `
precision highp float;
in vec3 vNormal;
in vec3 vWorld;
out vec4 outColor;
uniform float uPaper;

const vec3 KEY = normalize(vec3(-0.48, 0.82, 0.52));
const vec3 RIM = normalize(vec3(0.65, -0.14, -0.74));
const float ROUGHNESS = 0.30;

vec3 studio(vec3 d) {
  float up = d.y * 0.5 + 0.5;
  return mix(vec3(0.06), vec3(0.42), up * up)
    + pow(max(dot(d, KEY), 0.0), 5.5) * 1.9
    + pow(max(dot(d, RIM), 0.0), 36.0) * 4.2;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

vec3 encodeSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec3 n = normalize(vNormal);
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 lobe = normalize(mix(reflect(-v, n), n, ROUGHNESS));
  float fresnel = 0.06 + 0.94 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 4.0);

  vec3 lit = encodeSrgb(aces(studio(n) * 0.62 + studio(lobe) * fresnel * 1.35));

  // Invert tone on light paper so shaded faces receive denser ASCII glyphs
  // while preserving a 0.20 minimum ink floor on sunlit facets.
  outColor = vec4(mix(lit, mix(vec3(0.20), vec3(1.0), 1.0 - lit), uPaper), 1.0);
}
`;

export const CELL_FRAG = /* glsl */ `
precision highp float;
out vec4 outColor;
uniform sampler2D tScene;
uniform sampler2D tShapes;
uniform vec2 uResolution;
uniform vec2 uCellPx;
uniform int uGlyphCount;

const float CONTRAST = 1.5;
const float EDGE_CONTRAST = 3.0;

const vec2 INNER[6] = vec2[6](
  vec2(0.28, 0.26), vec2(0.72, 0.14),
  vec2(0.28, 0.56), vec2(0.72, 0.44),
  vec2(0.28, 0.86), vec2(0.72, 0.74)
);
const vec2 OUTER[10] = vec2[10](
  vec2(0.28, -0.2), vec2(0.72, -0.2),
  vec2(-0.22, 0.25), vec2(1.22, 0.25),
  vec2(-0.22, 0.5), vec2(1.22, 0.5),
  vec2(-0.22, 0.75), vec2(1.22, 0.75),
  vec2(0.28, 1.2), vec2(0.72, 1.2)
);
const vec2 RING[6] = vec2[6](
  vec2(1.0, 0.0), vec2(0.5, 0.8660254), vec2(-0.5, 0.8660254),
  vec2(-1.0, 0.0), vec2(-0.5, -0.8660254), vec2(0.5, -0.8660254)
);

vec2 cellBase;

vec4 fetchTap(vec2 p) {
  vec2 uv = p / uResolution;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0);
  }

  return texture(tScene, uv);
}

vec4 sampleCircle(vec2 c) {
  vec2 middle = cellBase + vec2(c.x, 1.0 - c.y) * uCellPx;
  float r = uCellPx.y * 0.161;
  vec4 acc = fetchTap(middle);

  for (int k = 0; k < 6; k++) {
    acc += fetchTap(middle + RING[k] * r);
  }

  return acc / 7.0;
}

float circleLum(vec4 acc) {
  vec3 straight = acc.rgb / max(acc.a, 1e-4);
  return clamp(dot(straight, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0) * acc.a;
}

float dirContrast(float value, float ext) {
  float peak = max(value, ext);

  if (peak < 1e-4) {
    return value;
  }

  return pow(value / peak, EDGE_CONTRAST) * peak;
}

void main() {
  cellBase = floor(gl_FragCoord.xy) * uCellPx;

  float v[6];
  vec3 colAcc = vec3(0.0);
  float alphaAcc = 0.0;

  for (int i = 0; i < 6; i++) {
    vec4 acc = sampleCircle(INNER[i]);

    v[i] = circleLum(acc);
    colAcc += acc.rgb;
    alphaAcc += acc.a;
  }

  float e[10];

  for (int i = 0; i < 10; i++) {
    e[i] = circleLum(sampleCircle(OUTER[i]));
  }

  v[0] = dirContrast(v[0], max(max(e[0], e[1]), max(e[2], e[4])));
  v[1] = dirContrast(v[1], max(max(e[0], e[1]), max(e[3], e[5])));
  v[2] = dirContrast(v[2], max(e[2], max(e[4], e[6])));
  v[3] = dirContrast(v[3], max(e[3], max(e[5], e[7])));
  v[4] = dirContrast(v[4], max(max(e[4], e[6]), max(e[8], e[9])));
  v[5] = dirContrast(v[5], max(max(e[5], e[7]), max(e[8], e[9])));

  float peak = max(max(max(v[0], v[1]), max(v[2], v[3])), max(v[4], v[5]));

  if (peak > 1e-4) {
    for (int i = 0; i < 6; i++) {
      v[i] = pow(v[i] / peak, CONTRAST) * peak;
    }
  }

  int best = 0;
  float bestD = 1e9;

  for (int g = 0; g < uGlyphCount; g++) {
    float d = 0.0;

    for (int i = 0; i < 6; i++) {
      float diff = v[i] - texelFetch(tShapes, ivec2(i, g), 0).r;
      d += diff * diff;
    }

    if (d < bestD) {
      bestD = d;
      best = g;
    }
  }

  outColor = vec4(colAcc / max(alphaAcc, 1e-4), float(best) / 255.0);
}
`;

export const POST_FRAG = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tCells;
uniform sampler2D tAtlas;
uniform vec2 uCellsPerUv;
uniform vec2 uGrid;
uniform vec2 uAtlasGrid;
uniform vec2 uAtlasPad;
uniform vec2 uAtlasInner;
uniform vec3 uColor;
uniform vec3 uAccent;

void main() {
  vec2 cellPos = vUv * uCellsPerUv;
  vec2 cell = clamp(floor(cellPos), vec2(0.0), uGrid - 1.0);
  vec4 cellSample = texelFetch(tCells, ivec2(cell), 0);
  float glyph = floor(cellSample.a * 255.0 + 0.5);
  vec2 local = clamp(cellPos - cell, 0.0, 1.0);
  float gx = mod(glyph, uAtlasGrid.x);
  float gy = floor(glyph / uAtlasGrid.x);
  vec2 atlasUv = vec2(
    (gx + uAtlasPad.x + local.x * uAtlasInner.x) / uAtlasGrid.x,
    (uAtlasGrid.y - gy - 1.0 + uAtlasPad.y + local.y * uAtlasInner.y) / uAtlasGrid.y
  );
  vec2 atlasStep = uAtlasInner / uAtlasGrid;
  float mask = textureGrad(tAtlas, atlasUv, dFdx(cellPos) * atlasStep, dFdy(cellPos) * atlasStep).a;

  // Subtle cobalt shift on high-density shadow/rim edges while keeping primary ink crisp
  float tone = clamp(dot(cellSample.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
  float accentMix = smoothstep(0.76, 0.96, tone) * 0.42;
  vec3 ink = mix(uColor, uAccent, accentMix);

  outColor = vec4(ink * mask, mask);
}
`;
