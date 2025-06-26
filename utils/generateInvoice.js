import PDFDocument from "pdfkit";

const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order._id}.pdf`
  );

  doc.pipe(res);

  // 🧾 Header
  doc.fontSize(20).text("🧾 Invoice", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.text(`Customer: ${order.user?.name || "Unknown"} (${order.user?.email || "N/A"})`);
  doc.text(`Shipping Address: ${order.address || "Not provided"}`);
  doc.moveDown();

  // 📦 Items List
  doc.fontSize(16).text("Items", { underline: true });
  doc.moveDown(0.5);

  order.items.forEach((item, i) => {
    const name = item.product?.name || "Deleted Product";
    const quantity = item.quantity;
    const price = item.price ?? "N/A";

    doc.fontSize(12).text(`${i + 1}. ${name} × ${quantity} - ₹${price}`, { indent: 20 });
  });

  doc.moveDown();

  // 💰 Total
  doc.fontSize(14).text(`Total Amount: ₹${order.total || 0}`, {
    align: "right",
    underline: true,
  });

  doc.moveDown(2);
  doc
    .fontSize(10)
    .text("Thanks for shopping with us!", {
      align: "center",
      italic: true,
    });

  doc.end();
};

export default generateInvoice;
