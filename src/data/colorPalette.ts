import { FrameColorSpec, PaintColorSpec } from "../types";

export const PAINT_COLORS: PaintColorSpec[] = [
  // Row 1
  { id: "pure-white", name: "Pure White", hex: "#FFFFFF", category: "neutral", row: 1 },
  { id: "warm-white", name: "Warm White", hex: "#F5F0E1", category: "neutral", row: 1 },
  { id: "ivory", name: "Ivory", hex: "#FFFFF0", category: "neutral", row: 1 },
  { id: "beige", name: "Beige", hex: "#F5F5DC", category: "neutral", row: 1 },

  // Row 2
  { id: "light-gray", name: "Light Gray", hex: "#D3D3D3", category: "soft", row: 2 },
  { id: "greige", name: "Greige", hex: "#C4C2C0", category: "soft", row: 2 },
  { id: "soft-blue", name: "Soft Blue", hex: "#B0D4E8", category: "soft", row: 2 },
  { id: "sage-green", name: "Sage Green", hex: "#B2C8A2", category: "soft", row: 2 },

  // Row 3
  { id: "pale-peach", name: "Pale Peach", hex: "#FFDAB9", category: "warm", row: 3 },
  { id: "lavender", name: "Lavender", hex: "#E6E6FA", category: "warm", row: 3 },
  { id: "terracotta", name: "Terracotta", hex: "#E2725B", category: "warm", row: 3 },
  { id: "sand", name: "Sand", hex: "#C2B280", category: "warm", row: 3 },

  // Row 4
  { id: "clay", name: "Clay", hex: "#B66A4D", category: "earth", row: 4 },
  { id: "navy-blue", name: "Navy Blue", hex: "#1B2A4A", category: "deep", row: 4 },
  { id: "charcoal", name: "Charcoal", hex: "#36454F", category: "deep", row: 4 },
  { id: "forest-green", name: "Forest Green", hex: "#228B22", category: "deep", row: 4 },
];

export const FRAME_COLORS: FrameColorSpec[] = [
  {
    id: "silver",
    name: "Silver",
    hex: "#D6D9DC",
    accentColor: "#E2E8F0",
    description: "Brushed architectural aluminum finish with crisp metallic luster",
    metalness: 0.88,
    roughness: 0.22,
  },
  {
    id: "black",
    name: "Black",
    hex: "#1E2024",
    accentColor: "#334155",
    description: "Architectural satin anodized matte black for ultra-modern contrast",
    metalness: 0.35,
    roughness: 0.55,
  },
  {
    id: "bronze",
    name: "Bronze",
    hex: "#4E3E34",
    accentColor: "#785340",
    description: "Deep bronze anodized metallic sheen with rich warm undertones",
    metalness: 0.82,
    roughness: 0.32,
  },
  {
    id: "white",
    name: "White",
    hex: "#F9FAFB",
    accentColor: "#FFFFFF",
    description: "Pure white electrostatically powder-coated clean aluminum profile",
    metalness: 0.12,
    roughness: 0.38,
  },
];

export const DEFAULT_PAINT_COLOR = PAINT_COLORS[1]; // Warm White #F5F0E1 as specified in prompt
export const DEFAULT_FRAME_COLOR = FRAME_COLORS[0]; // Silver
