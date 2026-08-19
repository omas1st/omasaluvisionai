import { WallKey, WindowOpening } from "../types";

/**
 * Generates realistic procedural canvas textures for raw cement blocks
 * and finished smooth plaster building walls, ensuring 1:1 mathematical alignment
 * with 3D window frame apertures.
 */

export function generateRawBlockworkTexture(
  wallKey: WallKey,
  openings: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }[]
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Raw Cement Tone across full wall
  ctx.fillStyle = "#8e939a";
  ctx.fillRect(0, 0, w, h);

  // 2. Concrete Block Courses (Standard 400x200mm scale)
  const blockH = 32;
  const blockW = 68;
  const rows = Math.ceil(h / blockH);
  const cols = Math.ceil(w / blockW) + 2;

  for (let r = 0; r < rows; r++) {
    const y = r * blockH;
    const offset = (r % 2) * (blockW / 2);

    for (let c = -1; c < cols; c++) {
      const x = c * blockW + offset;

      // Realistic color variance between individual cast concrete blocks
      const hash = Math.sin(r * 19.3 + c * 43.7) * 0.5 + 0.5;
      const baseGray = Math.round(136 + (hash * 18 - 9));
      ctx.fillStyle = `rgb(${baseGray}, ${baseGray + 2}, ${baseGray + 5})`;
      ctx.fillRect(x + 1, y + 1, blockW - 2, blockH - 2);

      // Concrete aggregate & texture specks
      ctx.fillStyle = "rgba(40,40,40,0.06)";
      for (let s = 0; s < 4; s++) {
        const sx = x + ((s * 17) % (blockW - 4));
        const sy = y + ((s * 11) % (blockH - 4));
        ctx.fillRect(sx, sy, 2, 2);
      }

      // Mortar Joint Lines
      ctx.strokeStyle = "#5a5f66";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, blockW, blockH);
    }
  }

  // 3. Concrete Tie-Beam / Lintel Courses
  ctx.fillStyle = "#757b83";
  ctx.fillRect(0, 0, w, 18);
  ctx.strokeStyle = "#4d5258";
  ctx.strokeRect(0, 0, w, 18);

  // 4. Cutout Window Openings (Exact black window holes)
  openings.forEach((op) => {
    const ox = (op.xPercent / 100) * w;
    const oy = (op.yPercent / 100) * h;
    const ow = (op.widthPercent / 100) * w;
    const oh = (op.heightPercent / 100) * h;

    // Concrete Lintel above opening
    ctx.fillStyle = "#636972";
    ctx.fillRect(ox - 6, oy - 14, ow + 12, 14);
    ctx.strokeStyle = "#3e4247";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(ox - 6, oy - 14, ow + 12, 14);

    // Deep Black Window Opening Void
    ctx.fillStyle = "#0c0e12";
    ctx.fillRect(ox, oy, ow, oh);

    // Rough cement block inner reveals / depth shadows
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(ox, oy, 8, oh);
    ctx.fillRect(ox, oy, ow, 8);

    // Rough block edge highlight at bottom sill
    ctx.fillStyle = "#9ba1a8";
    ctx.fillRect(ox, oy + oh - 3, ow, 3);
  });

  // 5. Subtle overall ambient lighting gradient
  const ambientGrad = ctx.createLinearGradient(0, 0, w, h);
  ambientGrad.addColorStop(0, "rgba(255,255,255,0.06)");
  ambientGrad.addColorStop(1, "rgba(0,0,0,0.18)");
  ctx.fillStyle = ambientGrad;
  ctx.fillRect(0, 0, w, h);

  return canvas.toDataURL("image/jpeg", 0.94);
}

export function generateFinishedPlasterTexture(
  wallKey: WallKey,
  openings: { xPercent: number; yPercent: number; widthPercent: number; heightPercent: number }[],
  wallColorHex: string = "#F5F0E1"
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const w = canvas.width;
  const h = canvas.height;

  // 1. Base Smooth Plaster Paint Layer (Fills entire wall plane)
  ctx.fillStyle = wallColorHex;
  ctx.fillRect(0, 0, w, h);

  // 2. Fine Architectural Micro-Texture (Stippling for realistic plaster finish)
  ctx.fillStyle = "rgba(0,0,0,0.02)";
  for (let i = 0; i < 4000; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // 3. Subtle Architectural Elevation Sun Gradient
  const sunGrad = ctx.createLinearGradient(0, 0, w, h);
  sunGrad.addColorStop(0, "rgba(255,255,255,0.15)");
  sunGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
  sunGrad.addColorStop(1, "rgba(0,0,0,0.12)");
  ctx.fillStyle = sunGrad;
  ctx.fillRect(0, 0, w, h);

  // 4. Subtle Architectural Reveal Grooves
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.48);
  ctx.lineTo(w, h * 0.48);
  ctx.stroke();

  // 5. Parapet Coping Line at Top
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillRect(0, 0, w, 6);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.fillRect(0, 6, w, 2);

  // 6. Deep Black Window Cavity Openings (Exact mathematical positions)
  openings.forEach((op) => {
    const ox = (op.xPercent / 100) * w;
    const oy = (op.yPercent / 100) * h;
    const ow = (op.widthPercent / 100) * w;
    const oh = (op.heightPercent / 100) * h;

    // Plaster reveal shadow bevel
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(ox - 2, oy - 2, ow + 4, oh + 4);

    // Deep Black Interior Void (Window Hole where 3D window sits)
    ctx.fillStyle = "#0c0e12";
    ctx.fillRect(ox, oy, ow, oh);

    // Ambient occlusion depth shadows inside reveal
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(ox, oy, ow, 6);
    ctx.fillRect(ox, oy, 6, oh);
  });

  return canvas.toDataURL("image/jpeg", 0.95);
}
