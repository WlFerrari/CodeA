import emailjs from "@emailjs/browser";

// Simple 6-digit numeric code
type VerificationRecord = {
  code: string;
  expiresAt: number; // epoch ms
  lastSentAt: number; // cooldown tracking
};

const STORAGE_KEY = (email: string) => `verification:${email.toLowerCase()}`;

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30s

export function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export function saveRecord(email: string, record: VerificationRecord): void {
  localStorage.setItem(STORAGE_KEY(email), JSON.stringify(record));
}

export function getRecord(email: string): VerificationRecord | null {
  const raw = localStorage.getItem(STORAGE_KEY(email));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VerificationRecord;
  } catch {
    return null;
  }
}

export function clearRecord(email: string): void {
  localStorage.removeItem(STORAGE_KEY(email));
}

export function canResend(email: string): boolean {
  const rec = getRecord(email);
  if (!rec) return true;
  return Date.now() - rec.lastSentAt >= RESEND_COOLDOWN_MS;
}

function getEnv() {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
  return { publicKey, serviceId, templateId };
}

async function sendEmailCode(email: string, code: string): Promise<{ simulated: boolean }> {
  const { publicKey, serviceId, templateId } = getEnv();

  // If not configured, simulate email by returning the code (DEV fallback)
  if (!publicKey || !serviceId || !templateId) {
    return { simulated: true };
  }

  // Initialize each time to be safe in SPA lifecycles
  emailjs.init({ publicKey });

  // Template variables must match your EmailJS template
  const templateParams: { to_email: string; code: string; app_name: string } = {
    to_email: email,
    code,
    app_name: "Project Code Academic",
  };

  await emailjs.send(serviceId, templateId, templateParams);
  return { simulated: false };
}

export async function sendVerificationCode(email: string): Promise<{ code: string; simulated: boolean }> {
  const code = generateCode(6);
  const record: VerificationRecord = {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    lastSentAt: Date.now(),
  };
  saveRecord(email, record);

  const result = await sendEmailCode(email, code);
  return { code, simulated: result.simulated };
}

export function verifyCode(email: string, codeInput: string): { ok: true } | { ok: false; reason: 'not_found' | 'expired' | 'mismatch' } {
  const rec = getRecord(email);
  if (!rec) return { ok: false, reason: "not_found" };
  if (Date.now() > rec.expiresAt) return { ok: false, reason: "expired" };
  const ok = rec.code === codeInput.trim();
  return ok ? { ok: true } : { ok: false, reason: "mismatch" };
}

export async function resendCode(email: string): Promise<{ ok: true; simulated: boolean } | { ok: false; waitMs: number }> {
  const rec = getRecord(email);
  if (rec && Date.now() - rec.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitMs = RESEND_COOLDOWN_MS - (Date.now() - rec.lastSentAt);
    return { ok: false, waitMs };
  }
  const code = generateCode(6);
  const next: VerificationRecord = {
    code,
    expiresAt: Date.now() + CODE_TTL_MS,
    lastSentAt: Date.now(),
  };
  saveRecord(email, next);
  const result = await sendEmailCode(email, code);
  return { ok: true, simulated: result.simulated };
}
