import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const generateInvoice = async (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  // 🔹 Add Logo or Store Name
  const logoPath = path.resolve("public/logo.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  } else {
    doc.fontSize(20).fillColor("blue").text("Gen Z", 50, 50);
  }

  doc
    .fontSize(20)
    .text("Custom Threads Store", 120, 50)
    .fontSize(10)
    .text("www.customthreads.com", 120, 70)
    .moveDown(2);

  // 🧾 Invoice Heading
  doc
    .fontSize(18)
    .fillColor("black")
    .text("INVOICE", { align: "center", underline: true })
    .moveDown();

  // 🧍 Customer & Order Info
  doc
    .fontSize(12)
    .text(`🆔 Order ID: ${order._id}`)
    .text(`📅 Order Date: ${new Date(order.createdAt).toLocaleString()}`)
    .text(`🚚 Expected Delivery: ${new Date(order.expectedDelivery).toDateString()}`)
    .text(`👤 Customer: ${order.user?.name || "Unknown"} (${order.user?.email || "N/A"})`)
    .text(`🏠 Shipping Address: ${order.address || "Not provided"}`)
    .moveDown();

  // 🛍️ Table Headers
  doc
    .fontSize(13)
    .text("Items Purchased", { underline: true })
    .moveDown(0.5);

  const tableTop = doc.y;
  const itemX = 50;
  const sizeX = 220;
  const colorX = 270;
  const qtyX = 330;
  const priceX = 380;
  const subtotalX = 450;

  // Table Column Titles
  doc
    .fontSize(11)
    .text("Product", itemX, tableTop)
    .text("Size", sizeX, tableTop)
    .text("Color", colorX, tableTop)
    .text("Qty", qtyX, tableTop)
    .text("Price", priceX, tableTop)
    .text("Subtotal", subtotalX, tableTop)
    .moveDown(0.5);

  // Items Loop
  order.items.forEach((item, idx) => {
    const y = doc.y;
    const name = item.name || "Deleted Product";
    const size = item.variant?.size || "N/A";
    const color = item.variant?.color || "N/A";
    const qty = item.quantity || 0;
    const price = item.price || 0;
    const subtotal = price * qty;

    doc
      .fontSize(10)
      .text(name, itemX, y)
      .text(size, sizeX, y)
      .text(color, colorX, y)
      .text(qty.toString(), qtyX, y)
      .text(`₹${price.toFixed(2)}`, priceX, y)
      .text(`₹${subtotal.toFixed(2)}`, subtotalX, y)
      .moveDown(0.3);
  });

  doc.moveDown();

  // 💰 Total
  doc
    .fontSize(12)
    .text(`Total Amount: ₹${order.total.toFixed(2)}`, {
      align: "right",
      underline: true,
    });

  // 👕 Optional Design Upload
  if (order.designImage && order.designImage.startsWith("http")) {
    doc.addPage();
    doc.fontSize(16).text("🎨 Uploaded Design", { align: "center" }).moveDown();

    try {
      const response = await fetch(order.designImage);
      const buffer = await response.buffer();
      doc.image(buffer, {
        fit: [400, 400],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      doc.fontSize(12).fillColor("red").text("⚠️ Failed to load uploaded design image.");
    }
  }

  // 💌 Footer
  doc
    .addPage()
    .fontSize(12)
    .text("Thank you for choosing Custom Threads!", { align: "center" })
    .moveDown()
    .fontSize(10)
    .text("For queries, contact: support@customthreads.com", { align: "center" });

  doc.end();
};

export default generateInvoice;
