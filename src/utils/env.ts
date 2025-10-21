import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Gemini AI
  GEMINI_API_KEY: z.string().startsWith('AIzaSy', 'Invalid Gemini API key format'),
  GEMINI_MODEL: z.string().default('gemini-1.5-pro'),

  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_AI_INSIGHTS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  NEXT_PUBLIC_ENABLE_AUTO_BACKUP: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),

  // Email (optional)
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Storage
  BACKUP_STORAGE_PATH: z.string().default('./backups'),
  REPORT_STORAGE_PATH: z.string().default('./public/reports'),

  // Rate Limiting
  API_RATE_LIMIT_PER_MINUTE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('100'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Security (optional)
  CSRF_SECRET: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Invalid environment variables:\n${missingVars.join('\n')}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;
