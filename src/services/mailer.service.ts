import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '465', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';

const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export async function sendContactEmail(data: {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}): Promise<void> {
  const { name, email, company, projectType, message } = data;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? '';

  const htmlBody = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0910; color: #e2e8f0; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
      <h2 style="color: #8F79B3; margin-top: 0;">Nueva consulta desde Biselia Web</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; width: 120px; font-weight: 600;">Nombre</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Email</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Empresa</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${company}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Proyecto</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${projectType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600; vertical-align: top;">Mensaje</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${message.replace(/\n/g, '<br/>')}</td>
        </tr>
      </table>
      <p style="margin-bottom: 0; font-size: 12px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 24px;">
        Enviado desde el formulario de contacto de <strong style="color: #8F79B3;">biselia.com</strong>
      </p>
    </div>
  `;

  if (!isSmtpConfigured || !transporter) {
    // Development mode: simulate email and log details
    console.log('\n══════════════════════════════════════════════════');
    console.log('  📧  [MAILER — DEV MODE] Simulating email send');
    console.log('══════════════════════════════════════════════════');
    console.log(`  To:           ${toEmail || '(CONTACT_TO_EMAIL not set)'}`);
    console.log(`  From:         ${name} <${email}>`);
    console.log(`  Company:      ${company}`);
    console.log(`  Project type: ${projectType}`);
    console.log(`  Message:\n    ${message.split('\n').join('\n    ')}`);
    console.log('══════════════════════════════════════════════════\n');
    return;
  }

  const mailOptions: MailOptions = {
    to: toEmail,
    subject: `[Biselia] Nueva consulta de ${name} — ${company}`,
    html: htmlBody,
  };

  await transporter.sendMail({
    from: `"Biselia Contact" <${SMTP_USER}>`,
    ...mailOptions,
  });

  console.log(`[Mailer] Email sent successfully to ${toEmail}`);
}
