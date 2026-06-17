/**
 * Automatically overrides legacy mock URLs or assigns consistent
 * unescaped/escaped paths for actual PDF documents in the public folder.
 * 
 * Includes robust fallbacks for all three document classes: Purchase Orders,
 * Packing Lists, and Vendor Invoices.
 * 
 * @param {object} file - The file metadata object representing an attached document.
 * @returns {string} The public URL path to request the real target PDF natively from the server.
 */
export default function getTrueDocPath(file) {
  if (!file) return "";
  const name = (file.filename || "").toLowerCase();
  const docType = (file.docType || "").toLowerCase();
  
  // 1. Purchase Order
  if (docType === "purchase order" || docType.includes("po") || name.includes("po")) {
    return "/GAR-PO-23-FY26-27-Rev%231%20(1).pdf";
  }
  
  // 2. Packing List
  if (docType === "packing list" || docType.includes("pl") || name.includes("packing") || name.includes("list") || name.includes("6556")) {
    return "/HOPSCOTCH%20PACKING%20LIST%20-%206556.pdf";
  }
  
  // 3. Vendor Invoice / Bill
  if (docType === "vendor bill" || docType.includes("invoice") || docType.includes("bill") || name.includes("invoice") || name.includes("bill") || name.includes("textile") || name.includes("arvind") || name.includes("fabrito") || name.includes("shree")) {
    const origName = file.filename || "";
    const idx = origName.length % 3;
    if (idx === 0) {
      return "/761%20Arvind%20Textile.pdf";
    } else if (idx === 1) {
      return "/Bill%20No%20-145%20Fabrito.pdf";
    } else {
      return "/Dummy_Fabric_Invoice_Fabrito_Fixed.pdf";
    }
  }

  // Fallback if no matching standard categories are designated
  return file.url || "";
}
