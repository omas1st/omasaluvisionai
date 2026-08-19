import { jsPDF } from "jspdf";
import { BuildingProject, WallKey } from "../types";

export async function generateFabricationPDFReport(project: BuildingProject): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Header Theme Bar
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("OMAS ALU-VISION AI • FABRICATION & ARCHITECTURAL REPORT", margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Project Ref: #${project.id.slice(0, 8).toUpperCase()} • Generated: ${new Date().toLocaleDateString()}`, margin, 21);

  // Project Summary Box
  let currentY = 36;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PROJECT SPECIFICATIONS", margin + 6, currentY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const col1X = margin + 6;
  const col2X = margin + 65;
  const col3X = margin + 125;

  doc.text(`Client: ${project.clientName || "Valued Property Owner"}`, col1X, currentY + 16);
  doc.text(`Project: ${project.title || "Custom Building Visualization"}`, col1X, currentY + 23);

  doc.text(`Exterior Paint: ${project.selectedPaintColor.name} (${project.selectedPaintColor.hex})`, col2X, currentY + 16);
  doc.text(`Frame Finish: ${project.selectedFrameColor.name} Aluminum (${project.selectedFrameColor.description})`, col2X, currentY + 23);

  // Calculate total windows
  const allWindows = Object.values(project.walls).flatMap((w) => w.detectedWindows);
  const activeWindows = allWindows.filter((w) => !w.isDeleted);

  doc.text(`Total Wall Elevations: 4 (360° Facade)`, col3X, currentY + 16);
  doc.text(`Total Windows Count: ${activeWindows.length} Units`, col3X, currentY + 23);

  currentY += 42;

  // Window Schedule Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text("WINDOW SCHEDULE & FABRICATION SPECIFICATIONS", margin, currentY);
  currentY += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text("ID", margin + 3, currentY + 5.5);
  doc.text("ELEVATION", margin + 18, currentY + 5.5);
  doc.text("ROOM / LOCATION", margin + 45, currentY + 5.5);
  doc.text("OPENING SIZE", margin + 95, currentY + 5.5);
  doc.text("TYPE", margin + 130, currentY + 5.5);
  doc.text("PANELS", margin + 155, currentY + 5.5);

  currentY += 9;

  const wallKeys: WallKey[] = ["front", "right", "back", "left"];

  wallKeys.forEach((wKey) => {
    const wall = project.walls[wKey];
    wall.detectedWindows.forEach((win) => {
      if (currentY > pageHeight - 35) {
        doc.addPage();
        currentY = 20;
      }

      if (win.isDeleted) {
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "italic");
        doc.text(win.label, margin + 3, currentY + 4);
        doc.text(wall.label, margin + 18, currentY + 4);
        doc.text(`${win.roomType} (Removed / Solid Wall)`, margin + 45, currentY + 4);
        doc.text(`${win.pixelWidth} × ${win.pixelHeight} px`, margin + 95, currentY + 4);
        doc.text("---", margin + 130, currentY + 4);
        doc.text("0", margin + 155, currentY + 4);
      } else {
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "normal");
        doc.text(win.label, margin + 3, currentY + 4);
        doc.text(wall.label, margin + 18, currentY + 4);
        doc.text(win.roomType, margin + 45, currentY + 4);
        doc.text(`${win.pixelWidth} × ${win.pixelHeight} px (${win.sizeCategory})`, margin + 95, currentY + 4);
        doc.text(win.currentType, margin + 130, currentY + 4);
        doc.text(`${win.currentPanels} Panel${win.currentPanels > 1 ? "s" : ""}`, margin + 155, currentY + 4);
      }

      // Divider line
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + 6, margin + contentWidth, currentY + 6);
      currentY += 7;
    });
  });

  currentY += 6;

  // Aluminum Fabricator Contact Footer Box
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, "FD");

  doc.setTextColor(30, 27, 75);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("ALUMINUM FABRICATION & INSTALLATION SERVICES", margin + 6, currentY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(67, 56, 202);
  doc.text("Precision CNC cutting, heavy-gauge thermal broken frames, double glazing & warranty.", margin + 6, currentY + 13);
  doc.text("Contact our workshop for official quotation & on-site laser measurements.", margin + 6, currentY + 18);
  doc.text("Phone: +1 (800) 555-ALUM • Email: fabricate@architectural-aluminum.com", margin + 6, currentY + 23);

  // Save the PDF
  doc.save(`${project.title.toLowerCase().replace(/\s+/g, "-")}-window-schedule.pdf`);
}
