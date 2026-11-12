import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Debe ser una dirección de un dominio verificado en Resend.
// Para pruebas sin dominio verificado se puede usar onboarding@resend.dev
// (solo permite enviar al email de la cuenta de Resend).
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  company: string;
  projectType: string;
  message: string;
}): Promise<void> {
  const { name, email, company, projectType, message } = data;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? '';

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    projectType: escapeHtml(projectType),
    message: escapeHtml(message).replace(/\n/g, '<br/>'),
  };

  const htmlBody = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0A0910; color: #e2e8f0; padding: 32px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
      <h2 style="color: #8F79B3; margin-top: 0;">Nueva consulta desde Biselia Web</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; width: 120px; font-weight: 600;">Nombre</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Email</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${safe.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Empresa</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${safe.company}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600;">Proyecto</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${safe.projectType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #94a3b8; font-weight: 600; vertical-align: top;">Mensaje</td>
          <td style="padding: 8px 0; color: #e2e8f0;">${safe.message}</td>
        </tr>
      </table>
      <p style="margin-bottom: 0; font-size: 12px; color: #475569; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 24px;">
        Enviado desde el formulario de contacto de <strong style="color: #8F79B3;">biselia.com</strong>
      </p>
    </div>
  `;

  if (!resend) {
    // Development mode: simulate email and log details
    console.log('\n══════════════════════════════════════════════════');
    console.log('  📧  [MAILER — DEV MODE] Simulating email send');
    console.log('       (RESEND_API_KEY not set)');
    console.log('══════════════════════════════════════════════════');
    console.log(`  To:           ${toEmail || '(CONTACT_TO_EMAIL not set)'}`);
    console.log(`  From:         ${name} <${email}>`);
    console.log(`  Company:      ${company}`);
    console.log(`  Project type: ${projectType}`);
    console.log(`  Message:\n    ${message.split('\n').join('\n    ')}`);
    console.log('══════════════════════════════════════════════════\n');
    return;
  }

  if (!toEmail) {
    throw new Error('CONTACT_TO_EMAIL is not configured');
  }

  const { data: result, error } = await resend.emails.send({
    from: `Biselia Contact <${RESEND_FROM_EMAIL}>`,
    to: [toEmail],
    replyTo: email,
    subject: `[Biselia] Nueva consulta de ${name} — ${company}`,
    html: htmlBody,
  });

  if (error) {
    throw new Error(`Resend error (${error.name}): ${error.message}`);
  }

  console.log(`[Mailer] Email sent successfully to ${toEmail} (id: ${result?.id})`);
}
