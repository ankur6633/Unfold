import nodemailer from "nodemailer";

console.log("Mailer: Initializing transporter with user:", process.env.EMAIL_USER);
if (!process.env.EMAIL_PASS) console.error("Mailer: EMAIL_PASS is missing!");

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  debug: true,
  logger: true
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter Verification Error:", error.message);
  } else {
    console.log("Server is ready to take our messages");
  }
});

export async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"Unfold Laundry" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Login OTP: ${otp}`,
    text: `Your OTP for login is: ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #2563eb; margin: 0 0 16px 0;">UNFOLD</h2>
        <p style="color: #4b5563; font-size: 14px;">Your verification code for login is below. Please enter it to continue.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${otp}</span>
        </div>
        <p style="color: #9ca3af; font-size: 11px;">This code expires in 5 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
