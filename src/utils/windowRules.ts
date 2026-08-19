import { WindowOpening, WindowSizeCategory, WindowType } from "../types";

/**
 * Intelligent recommendation rule for window panel configuration based on dimensions & proportions:
 * - Width < 80px OR Tall/Narrow (aspect ratio < 0.7) -> 1 Panel
 * - Width 80-150px OR Standard aspect ratio -> 2 Panels
 * - Width 150-250px OR Slightly wide (1.0-1.5) -> 3 Panels
 * - Width > 250px OR Very wide (> 1.5) -> 4 Panels
 * - Extra Large (> 400px) -> 4 Panels
 */
export function calculateWindowRecommendation(
  pixelWidth: number,
  pixelHeight: number,
  aspectRatio?: number
): {
  recommendedPanels: 1 | 2 | 3 | 4;
  sizeCategory: WindowSizeCategory;
  calculatedAspectRatio: number;
} {
  const ratio = aspectRatio || (pixelHeight > 0 ? pixelWidth / pixelHeight : 1.0);

  let sizeCategory: WindowSizeCategory = "Medium";
  if (pixelWidth > 400 || pixelHeight > 350) {
    sizeCategory = "Extra Large";
  } else if (pixelWidth >= 250 || pixelHeight >= 250) {
    sizeCategory = "Large";
  } else if (ratio < 0.6) {
    sizeCategory = "Tall";
  } else if (pixelWidth < 100) {
    sizeCategory = "Small";
  } else if (pixelWidth < 70) {
    sizeCategory = "Tiny";
  }

  let panels: 1 | 2 | 3 | 4 = 2;

  if (pixelWidth >= 400) {
    panels = 4;
  } else if (pixelWidth > 250 || ratio > 1.5) {
    panels = 4;
  } else if (pixelWidth >= 150 || (ratio >= 1.0 && ratio <= 1.5)) {
    panels = 3;
  } else if (pixelWidth >= 80 || (ratio >= 0.7 && ratio < 1.0)) {
    panels = 2;
  } else {
    // Width < 80px OR Tall/Narrow (ratio < 0.7)
    panels = 1;
  }

  return {
    recommendedPanels: panels,
    sizeCategory,
    calculatedAspectRatio: Number(ratio.toFixed(2)),
  };
}

export function getWindowTypeDescription(type: WindowType, panels: number): string {
  switch (type) {
    case "Casement":
      if (panels === 1) return "Single outward side-hung swinging sash";
      if (panels === 2) return "Dual outward side-hung swinging sashes";
      if (panels === 3) return "Outer dual swinging sashes with center fixed view pane";
      return "Quad casement: outer dual swinging sashes + inner fixed picture panes";
    case "Sliding":
      if (panels === 1) return "Single fixed horizontal aluminum framed pane";
      if (panels === 2) return "2-track single horizontal sliding sash with fixed mate";
      if (panels === 3) return "3-track multi-slide stacker sash system";
      return "4-panel double center-parting smooth sliding aluminum system";
    case "Transom":
      if (panels === 1) return "Top-hung outward hopper ventilation transom";
      if (panels === 2) return "Twin-section hopper/awning transom ventilation window";
      if (panels === 3) return "Triple modular transom clerestory window";
      return "Quad architectural clerestory transom strip";
  }
}
