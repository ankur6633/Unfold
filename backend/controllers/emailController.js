import { sendEmail } from "../config/mailer.js";

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendOrderConfirmationEmail({ to, order }) {
  const subject = "Order Confirmation";

  const itemsHtml = (order?.items || [])
    .map(
      (item) => `
        <li>
          ${escapeHtml(item?.name)} x ${item?.quantity} - $${item?.price}
        </li>
      `
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.4;">
      <h2>Order Confirmation</h2>
      <p><strong>Order ID:</strong> ${escapeHtml(order?._id)}</p>
      <p><strong>Status:</strong> ${escapeHtml(order?.status)}</p>
      <p><strong>Total Price:</strong> $${order?.totalPrice}</p>

      <h3>Items</h3>
      <ul>${itemsHtml}</ul>
    </div>
  `;

  await sendEmail(to, subject, html);
}

