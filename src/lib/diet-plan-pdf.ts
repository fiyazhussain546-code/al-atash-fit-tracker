import type { DietPlan } from "@/lib/diet-plans";

export interface DietPlanPdfMeta {
  submissionId: string;
  packageLabel?: string;
}

const BRAND: [number, number, number] = [15, 74, 63];
const GOLD: [number, number, number] = [193, 154, 61];
const MUTED: [number, number, number] = [110, 110, 110];

function safe(v: string | undefined) {
  return (v ?? "").trim();
}

/** Builds and downloads a clean, patient-facing PDF of an approved diet plan. */
export async function downloadDietPlanPdf(plan: DietPlan, meta: DietPlanPdfMeta) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = pageW - M * 2;
  let y = 0;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 60) {
      doc.addPage();
      y = M;
    }
  };

  // Header band
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("AL-ATASH FIT", M, 46);
  doc.setTextColor(...GOLD);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Weight Assessment Clinic", M, 64);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text("Personal Diet Plan", pageW - M, 46, { align: "right" });
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString(), pageW - M, 64, { align: "right" });

  y = 120;

  // Title
  doc.setTextColor(...BRAND);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const title = safe(plan.planTitle) || "Diet Plan";
  const titleLines = doc.splitTextToSize(title, contentW);
  doc.text(titleLines, M, y);
  y += titleLines.length * 20 + 6;

  // Patient meta
  const rows: [string, string][] = [
    ["Patient name", safe(plan.patientName) || "—"],
    ["Plan / package", safe(meta.packageLabel) || "—"],
    ["Duration", safe(plan.durationLabel) || "—"],
    ["Reference ID", meta.submissionId],
  ];
  doc.setFontSize(10);
  rows.forEach(([k, v]) => {
    ensureSpace(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...MUTED);
    doc.text(`${k}:`, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(v, contentW - 110);
    doc.text(lines, M + 100, y);
    y += Math.max(16, lines.length * 13);
  });

  y += 8;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(M, y, pageW - M, y);
  y += 22;

  const section = (heading: string) => {
    ensureSpace(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BRAND);
    doc.text(heading, M, y);
    y += 16;
  };

  const item = (label: string, value: string) => {
    const text = safe(value);
    if (!text) return;
    const lines = doc.splitTextToSize(text, contentW - 12);
    ensureSpace(24 + lines.length * 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    doc.text(label, M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(lines, M + 12, y);
    y += lines.length * 13 + 8;
  };

  section("Daily Meal Schedule");
  item("Breakfast", plan.breakfast);
  item("Mid-morning snack", plan.midMorning);
  item("Lunch", plan.lunch);
  item("Evening snack", plan.eveningSnack);
  item("Dinner", plan.dinner);

  y += 6;
  section("Guidance");
  item("Water guidance", plan.waterGuidance);
  item("Activity guidance", plan.activityGuidance);
  item("Foods to prefer", plan.foodsPrefer);
  item("Foods to limit", plan.foodsLimit);

  // Consultant approval
  ensureSpace(90);
  y += 10;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.8);
  doc.line(M, y, pageW - M, y);
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BRAND);
  doc.text("Approved by consultant", M, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(safe(plan.consultantName) || "AL-ATASH FIT Consultant", M, y);
  y += 14;
  doc.setTextColor(...MUTED);
  const dateLine = plan.releasedAt
    ? `Approved / issued: ${new Date(plan.releasedAt).toLocaleDateString()}`
    : `Issued: ${new Date().toLocaleDateString()}`;
  doc.text(dateLine, M, y);

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      "AL-ATASH FIT — Weight Assessment Clinic · This plan is prepared for the named patient only.",
      M,
      pageH - 30,
    );
    doc.text(`Page ${i} of ${pages}`, pageW - M, pageH - 30, { align: "right" });
  }

  const slug =
    (safe(plan.patientName) || meta.submissionId).replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "plan";
  doc.save(`AL-ATASH-FIT-Diet-Plan-${slug}.pdf`);
}
