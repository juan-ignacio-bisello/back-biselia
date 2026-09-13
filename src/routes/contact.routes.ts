import { Router } from 'express';
import {
  contactValidationRules,
  handleContact,
  handleHealth,
} from '../controllers/contact.controller';

const router = Router();

router.get('/health', handleHealth);
router.post('/contact', contactValidationRules, handleContact);

export default router;
