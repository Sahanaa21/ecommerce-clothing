import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import axios from "axios";

const generateInvoice = async (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  // 🖼️ Logo or Brand Fallback
  const logoPath = path.resolve("public/logo.png");
  const hasLogo = fs.existsSync(logoPath);

  if (hasLogo) {
    doc.image(logoPath, 50, 45, { width: 60 });
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("Gen Z", hasLogo ? 120 : 50, 50)
    .fontSize(10)
    .font("Helvetica")
    .text("www.customthreads.com", hasLogo ? 120 : 50, 72)
    .moveDown();

  // 🧾 Invoice Header
  doc
    .fontSize(18)
    .fillColor("#333")
    .text("INVOICE", { align: "center", underline: true })
    .moveDown();

  // 📦 Order Summary
  doc
    .fontSize(12)
    .fillColor("black")
    .text(`Order ID: ${order._id}`)
    .text(`Order Date: ${new Date(order.createdAt).toLocaleString()}`)
    .text(`Expected Delivery: ${new Date(order.expectedDelivery).toDateString()}`)
    .text(`Customer: ${order.user?.name || "Unknown"} (${order.user?.email || "N/A"})`)
    .text(`Shipping Address: ${order.address || "Not provided"}`)
    .moveDown();

  // 📋 Table Headers
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Product", 50)
    .text("Size", 200)
    .text("Color", 250)
    .text("Qty", 300)
    .text("Price", 350)
    .text("Subtotal", 420)
    .moveDown(0.5);

  // 🛍️ Items Table
  order.items.forEach((item) => {
    const name = item.product?.name || "Deleted Product";
    const price = item.product?.price || item.price || 0;
    const size = item.variant?.size || "N/A";
    const color = item.variant?.color || "N/A";
    const qty = item.quantity || 1;
    const subtotal = price * qty;

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(name, 50)
      .text(size, 200)
      .text(color, 250)
      .text(`${qty}`, 300)
      .text(`₹${price}`, 350)
      .text(`₹${subtotal}`, 420)
      .moveDown(0.3);
  });

  // 💰 Total
  doc
    .moveDown()
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(`Total Amount: ₹${order.total || 0}`, {
      align: "right",
      underline: true,
    });

  // 🎨 Design Preview
  if (order.designImage && order.designImage.startsWith("http")) {
    doc.addPage();
    doc.fontSize(16).text("🖼️ Uploaded Design", { align: "center" }).moveDown();

    try {
      const { data } = await axios.get(order.designImage, {
        responseType: "arraybuffer",
      });
      const imgBuffer = Buffer.from(data);
      doc.image(imgBuffer, {
        fit: [400, 400],
        align: "center",
        valign: "center",
      });
    } catch (err) {
      doc
        .fontSize(12)
        .fillColor("red")
        .text("⚠️ Failed to load uploaded design image from Cloudinary.", {
          align: "center",
        });
    }
  }

  // 🧡 Footer Page
  doc
    .addPage()
    .font("Helvetica")
    .fontSize(12)
    .fillColor("black")
    .text("Thank you for choosing Gen Z by Custom Threads!", {
      align: "center",
    })
    .moveDown()
    .fontSize(10)
    .text("Need help? Reach out: support@customthreads.com", {
      align: "center",
    });

  doc.end();
};

export default generateInvoice;
