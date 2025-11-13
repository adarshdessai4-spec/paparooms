import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const response = await resend.emails.send({
      from: "OyoPlus <no-reply@oyo.plus>",
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent:", response);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return false;
  }
};
