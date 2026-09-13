import { body, validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { sendContactEmail } from '../services/mailer.service';

export const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido.')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido.')
    .isEmail().withMessage('Debes ingresar un email válido.')
    .normalizeEmail(),

  body('company')
    .trim()
    .notEmpty().withMessage('El nombre de la empresa es requerido.')
    .isLength({ min: 2, max: 150 }).withMessage('El nombre de la empresa debe tener entre 2 y 150 caracteres.'),

  body('projectType')
    .trim()
    .notEmpty().withMessage('El tipo de proyecto es requerido.')
    .isIn(['SaaS', 'Sistema de Gestión', 'Software a Medida'])
    .withMessage('El tipo de proyecto no es válido.'),

  body('message')
    .trim()
    .notEmpty().withMessage('El mensaje es requerido.')
    .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres.'),
];

export async function handleContact(req: Request, res: Response): Promise<void> {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: 'Los datos ingresados no son válidos.',
      errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'general', message: e.msg })),
    });
    return;
  }

  const { name, email, company, projectType, message } = req.body as {
    name: string;
    email: string;
    company: string;
    projectType: string;
    message: string;
  };

  try {
    await sendContactEmail({ name, email, company, projectType, message });

    res.status(200).json({
      success: true,
      message: 'Consulta recibida con éxito. Nos pondremos en contacto a la brevedad.',
    });
  } catch (error) {
    console.error('[Contact Controller] Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.',
    });
  }
}

export function handleHealth(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'biselia-web-back',
    timestamp: new Date().toISOString(),
  });
}
