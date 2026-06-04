import nodemailer from 'nodemailer';

function getSmtpConfig() {
  return {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'PrepUp <noreply@prepup.app>',
  };
}

function isSmtpConfigured(): boolean {
  const cfg = getSmtpConfig();
  return Boolean(cfg.host && cfg.user && cfg.pass);
}

export async function sendPasswordResetCode(
  toEmail: string,
  code: string,
): Promise<void> {
  if (!isSmtpConfigured()) {
    console.log(
      `[PrepUp] Şifre sıfırlama kodu (SMTP yapılandırılmadı — geliştirme modu)\n` +
        `  E-posta : ${toEmail}\n` +
        `  Kod     : ${code}`,
    );
    return;
  }

  const cfg = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
  });

  await transporter.sendMail({
    from: cfg.from,
    to: toEmail,
    subject: 'PrepUp — Şifre Sıfırlama Kodunuz',
    text: `Şifre sıfırlama kodunuz: ${code}\n\nBu kod 15 dakika geçerlidir.\nKodu siz talep etmediyseniz bu e-postayı yoksayın.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#7C3AED">PrepUp Şifre Sıfırlama</h2>
        <p>Şifre sıfırlama kodunuz:</p>
        <div style="font-size:36px;font-weight:800;letter-spacing:8px;color:#7C3AED;padding:16px 0">${code}</div>
        <p style="color:#64748B;font-size:14px">Bu kod <strong>15 dakika</strong> geçerlidir.<br>Kodu siz talep etmediyseniz bu e-postayı yoksayın.</p>
      </div>
    `,
  });
}
