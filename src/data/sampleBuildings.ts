import { WallKey, WallPhotoUpload, WindowOpening } from "../types";
import { generateRawBlockworkTexture, generateFinishedPlasterTexture } from "../utils/textureGenerator";
import { calculateWindowRecommendation } from "../utils/windowRules";

/**
 * Initial empty state where user has not uploaded any images yet.
 */
export function createEmptyWallState(): Record<WallKey, WallPhotoUpload> {
  return {
    front: {
      wallKey: "front",
      label: "Front View",
      description: "Main building facade (Elevations, Front Entry)",
      cameraAngleDeg: 0,
      status: "idle",
      progress: 0,
      detectedWindows: [],
    },
    right: {
      wallKey: "right",
      label: "Right Side View",
      description: "Right elevation (Side Wall, Driveway/Side Yard)",
      cameraAngleDeg: 90,
      status: "idle",
      progress: 0,
      detectedWindows: [],
    },
    back: {
      wallKey: "back",
      label: "Back View",
      description: "Rear facade (Backyard, Garden, Patio)",
      cameraAngleDeg: 180,
      status: "idle",
      progress: 0,
      detectedWindows: [],
    },
    left: {
      wallKey: "left",
      label: "Left Side View",
      description: "Left elevation (Side Wall, Passageway)",
      cameraAngleDeg: 270,
      status: "idle",
      progress: 0,
      detectedWindows: [],
    },
  };
}

export function createInitialWallState(): Record<WallKey, WallPhotoUpload> {
  const frontOpeningsData = [
    { xPercent: 16, yPercent: 40, widthPercent: 30, heightPercent: 34, roomType: "Living Room (Main Bay)", label: "Window 1" },
    { xPercent: 56, yPercent: 40, widthPercent: 26, heightPercent: 32, roomType: "Master Bedroom Suite", label: "Window 2" },
    { xPercent: 22, yPercent: 12, widthPercent: 16, heightPercent: 18, roomType: "Upper Balcony View", label: "Window 3" },
    { xPercent: 62, yPercent: 12, widthPercent: 10, heightPercent: 18, roomType: "Entry Foyer Light", label: "Window 4" },
  ];

  const rightOpeningsData = [
    { xPercent: 20, yPercent: 42, widthPercent: 24, heightPercent: 28, roomType: "Dining Area Bay", label: "Window 1" },
    { xPercent: 58, yPercent: 44, widthPercent: 18, heightPercent: 22, roomType: "Kitchen Workstation", label: "Window 2" },
    { xPercent: 36, yPercent: 14, widthPercent: 22, heightPercent: 20, roomType: "Guest Bedroom", label: "Window 3" },
  ];

  const backOpeningsData = [
    { xPercent: 16, yPercent: 38, widthPercent: 28, heightPercent: 34, roomType: "Rear Patio Garden View", label: "Window 1" },
    { xPercent: 54, yPercent: 40, widthPercent: 20, heightPercent: 26, roomType: "Breakfast Nook", label: "Window 2" },
    { xPercent: 22, yPercent: 14, widthPercent: 24, heightPercent: 20, roomType: "Children Bedroom", label: "Window 3" },
    { xPercent: 66, yPercent: 16, widthPercent: 10, heightPercent: 14, roomType: "Bathroom Ventilation", label: "Window 4" },
  ];

  const leftOpeningsData = [
    { xPercent: 22, yPercent: 38, widthPercent: 26, heightPercent: 32, roomType: "Library / Home Office", label: "Window 1" },
    { xPercent: 60, yPercent: 18, widthPercent: 12, heightPercent: 46, roomType: "Staircase Tower Light", label: "Window 2" },
  ];

  const mapToWindows = (wallKey: WallKey, rawList: typeof frontOpeningsData): WindowOpening[] => {
    return rawList.map((item, idx) => {
      const pxW = Math.round((item.widthPercent / 100) * 1024);
      const pxH = Math.round((item.heightPercent / 100) * 768);
      const rec = calculateWindowRecommendation(pxW, pxH);

      return {
        id: `${wallKey}-w${idx + 1}`,
        wallKey,
        label: item.label,
        roomType: item.roomType,
        xPercent: item.xPercent,
        yPercent: item.yPercent,
        widthPercent: item.widthPercent,
        heightPercent: item.heightPercent,
        pixelWidth: pxW,
        pixelHeight: pxH,
        sizeCategory: rec.sizeCategory,
        aspectRatio: rec.calculatedAspectRatio,
        recommendedPanels: rec.recommendedPanels,
        recommendedType: "Casement",
        currentType: "Casement",
        currentPanels: rec.recommendedPanels,
        isDeleted: false,
      };
    });
  };

  const frontWindows = mapToWindows("front", frontOpeningsData);
  const rightWindows = mapToWindows("right", rightOpeningsData);
  const backWindows = mapToWindows("back", backOpeningsData);
  const leftWindows = mapToWindows("left", leftOpeningsData);

  return {
    front: {
      wallKey: "front",
      label: "Front View",
      description: "Main building facade with living room bay and master suite openings",
      cameraAngleDeg: 0,
      previewUrl: generateRawBlockworkTexture("front", frontOpeningsData),
      finishedImageUrl: generateFinishedPlasterTexture("front", frontOpeningsData, "#FFFFFF"),
      status: "ready",
      progress: 100,
      width: 1200,
      height: 900,
      detectedWindows: frontWindows,
    },
    right: {
      wallKey: "right",
      label: "Right Side View",
      description: "Side elevation featuring dining bay, kitchen prep, and upper guest room",
      cameraAngleDeg: 90,
      previewUrl: generateRawBlockworkTexture("right", rightOpeningsData),
      finishedImageUrl: generateFinishedPlasterTexture("right", rightOpeningsData, "#FFFFFF"),
      status: "ready",
      progress: 100,
      width: 1200,
      height: 900,
      detectedWindows: rightWindows,
    },
    back: {
      wallKey: "back",
      label: "Back View",
      description: "Rear facade overlooking garden patio, breakfast nook, and upper bedrooms",
      cameraAngleDeg: 180,
      previewUrl: generateRawBlockworkTexture("back", backOpeningsData),
      finishedImageUrl: generateFinishedPlasterTexture("back", backOpeningsData, "#FFFFFF"),
      status: "ready",
      progress: 100,
      width: 1200,
      height: 900,
      detectedWindows: backWindows,
    },
    left: {
      wallKey: "left",
      label: "Left Side View",
      description: "Left elevation with architectural vertical staircase light & library bay",
      cameraAngleDeg: 270,
      previewUrl: generateRawBlockworkTexture("left", leftOpeningsData),
      finishedImageUrl: generateFinishedPlasterTexture("left", leftOpeningsData, "#FFFFFF"),
      status: "ready",
      progress: 100,
      width: 1200,
      height: 900,
      detectedWindows: leftWindows,
    },
  };
}
