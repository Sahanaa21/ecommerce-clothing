import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  // ✅ Use correct logo path (cross-platform)
  const logoPath = path.resolve("public/logo.png");

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  // 🏪 Store Header
  doc
    .fontSize(20)
    .text("Custom Threads Store", 120, 50)
    .fontSize(10)
    .text("www.customthreads.com", 120, 70)
    .moveDown();

  // 📋 Invoice Title
  doc
    .fontSize(18)
    .text("🧾 INVOICE", { align: "center", underline: true })
    .moveDown();

  // 🧍 Customer + Order Info
  doc.fontSize(12);
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Expected Delivery: ${new Date(order.expectedDelivery).toDateString()}`);
  doc.text(
    `Customer: ${order.user?.name || "Unknown"} (${order.user?.email || "N/A"})`
  );
  doc.text(`Shipping Address: ${order.address || "Not provided"}`);
  doc.moveDown();

  // 🛍️ Items Table Header
  doc
    .fontSize(13)
    .text("Items", { underline: true })
    .moveDown(0.3)
    .fontSize(11)
    .text("Product", 50)
    .text("Size", 200)
    .text("Color", 250)
    .text("Qty", 300)
    .text("Price", 350)
    .text("Subtotal", 420)
    .moveDown(0.2);

  // ➕ Items List
  order.items.forEach((item, i) => {
    const productName = item.product?.name || "Deleted Product";
    const quantity = item.quantity || 0;
    const price = item.product?.price || item.price || 0;
    const size = item.variant?.size || "N/A";
    const color = item.variant?.color || "N/A";
    const subtotal = price * quantity;

    doc
      .fontSize(11)
      .text(`${productName}`, 50)
      .text(`${size}`, 200)
      .text(`${color}`, 250)
      .text(`${quantity}`, 300)
      .text(`₹${price}`, 350)
      .text(`₹${subtotal}`, 420)
      .moveDown(0.3);
  });

  doc.moveDown();

  // 💰 Total
  doc
    .fontSize(13)
    .text(`Total Amount: ₹${order.total || 0}`, {
      align: "right",
      underline: true,
    });

  // 👕 Uploaded Design Image (if present)
  if (order.designImage) {
    doc.addPage();
    doc.fontSize(16).text("🖼️ Uploaded Design", { align: "center" }).moveDown();

    try {
      doc.image(order.designImage, {
        fit: [400, 400],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      doc.fontSize(12).text("⚠️ Failed to load uploaded design image.");
    }
  }

  // ❤️ Footer
  doc
    .addPage()
    .fontSize(12)
    .text("Thank you for choosing Custom Threads!", { align: "center" })
    .moveDown()
    .fontSize(10)
    .text("For any queries, contact support@customthreads.com", {
      align: "center",
    });

  doc.end();
};

export default generateInvoice;
