import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    throw new Error("Mailer is not configured (missing EMAIL_HOST/EMAIL_USER/EMAIL_PASS).");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Gmail typically uses 587 with STARTTLS
    auth: { user, pass },
  });
}

export async function sendEmail(to, subject, html) {
  const transporter = getTransport();

  const from = process.env.EMAIL_USER;
  const message = {
    from,
    to,
    subject,
    html,
  };

  await transporter.sendMail(message);
}

