import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"Unfold Laundry" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Login OTP",
    text: `Your OTP for login is: ${otp}. It expires in 5 minutes.`,
    html: `<b>Your OTP for login is: ${otp}</b><p>It expires in 5 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
}
