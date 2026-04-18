export const mailConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    to: process.env.MAIL_TO || "",
};

if (!mailConfig.user || !mailConfig.pass || !mailConfig.to) {
  console.warn("⚠️  Warning: SMTP credentials or recipient email not configured in .env");
}
