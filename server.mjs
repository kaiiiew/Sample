// ======================
// IMPORTS AND SETUP
// ======================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// PATH CONFIGURATION (for ES Modules)
// ======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// SERVE STATIC FRONTEND FILES
// ======================
app.use(express.static(path.join(__dirname, "public")));

// Default route — serves index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================
// SMTP CONFIGURATION
// ======================
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || smtpUser;
const toEmail = process.env.TO_EMAIL || smtpUser;

let transporter = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // use TLS if port 465
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Verify SMTP connection at startup
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP connection failed:", error.message);
    } else {
      console.log("✅ SMTP server is ready to send emails");
    }
  });
} else {
  console.warn("⚠️ SMTP not configured. Check your .env file values.");
}

// ======================
// CONTACT FORM ENDPOINT
// ======================
app.post("/api/send-contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    if (!transporter) {
      console.log("Contact form data (no SMTP):", { name, email, subject, message });
      return res.json({
        success: true,
        message: "Form received (email not sent — SMTP not configured).",
      });
    }

    const mailOptions = {
      from: `"${name}" <${fromEmail}>`,
      to: toEmail,
      subject: `[Website Contact] ${subject}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);

    return res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Error while sending email:", err.message);
    return res.status(500).json({ success: false, message: "Server error." });
  }
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
