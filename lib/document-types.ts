export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  drivers_license: "Driver's License",
  lto_or: "LTO Official Receipt",
  lto_cr: "LTO Certificate of Registration",
  nbi_clearance: "NBI Clearance",
  vehicle_photo: "Vehicle Photo",
  selfie_with_id: "Selfie with ID",
};

export function getDocumentLabel(type: string): string {
  return DOCUMENT_TYPE_LABELS[type] ?? type;
}
