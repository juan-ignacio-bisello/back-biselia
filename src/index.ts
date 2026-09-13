import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import contactRouter from './routes/contact.routes';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', contactRouter);

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado.' });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Biselia API running at http://localhost:${PORT}`);
  console.log(`   CORS allowed origin: ${CORS_ORIGIN}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

export default app;
