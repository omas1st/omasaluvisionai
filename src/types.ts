export type WallKey = "front" | "right" | "back" | "left";

export type WindowType = "Casement" | "Sliding" | "Transom";

export type FrameColorId = "silver" | "black" | "bronze" | "white";

export interface FrameColorSpec {
  id: FrameColorId;
  name: string;
  hex: string;
  accentColor: string;
  description: string;
  metalness: number;
  roughness: number;
}

export interface PaintColorSpec {
  id: string;
  name: string;
  hex: string;
  category: "neutral" | "soft" | "warm" | "earth" | "deep";
  row: number;
}

export type WindowSizeCategory = "Tiny" | "Small" | "Medium" | "Large" | "Extra Large" | "Tall";

export interface WindowOpening {
  id: string;
  wallKey: WallKey;
  label: string;
  roomType: string;
  xPercent: number; // 0-100% of wall width
  yPercent: number; // 0-100% of wall height
  widthPercent: number; // 0-100%
  heightPercent: number; // 0-100%
  pixelWidth: number;
  pixelHeight: number;
  sizeCategory: WindowSizeCategory;
  aspectRatio: number;
  recommendedPanels: 1 | 2 | 3 | 4;
  recommendedType: WindowType;
  currentType: WindowType;
  currentPanels: 1 | 2 | 3 | 4;
  isDeleted: boolean;
  notes?: string;
}

export interface WallPhotoUpload {
  wallKey: WallKey;
  label: string;
  description: string;
  cameraAngleDeg: number;
  file?: File;
  previewUrl?: string;
  finishedImageUrl?: string;
  status: "idle" | "uploading" | "validating" | "ready" | "error";
  progress: number;
  width?: number;
  height?: number;
  validationError?: string;
  detectedWindows: WindowOpening[];
}

export type AppPhase = "upload" | "processing" | "viewer";

export interface DemonstrationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPhaseIndex: number; // 0: Front, 1: Right, 2: Back, 3: Left, 4: Returning
  phaseProgress: number; // 0 to 1
  totalProgress: number; // 0 to 100%
  elapsedSeconds: number;
  totalSeconds: number;
  openAmount: number; // 0 (closed) to 1 (fully open)
  activeWallKey: WallKey;
  phaseLabel: string;
}

export interface BuildingProject {
  id: string;
  title: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  walls: Record<WallKey, WallPhotoUpload>;
  selectedPaintColor: PaintColorSpec;
  selectedFrameColor: FrameColorSpec;
  notes?: string;
}
