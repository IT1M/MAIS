import { NextRequest } from 'next/server';
import { prisma } from '@/db/client';
import { updateSettingsSchema } from '@/lib/validation';
import {
  errorResponse,
  successResponse,
  requireAuth,
  requireRole,
  ErrorCodes,
} from '@/lib/api-utils';
import { createAuditLog } from '@/services/audit';
import { AuditAction } from '@prisma/client';

// Sensitive keys that should be hidden from non-admin users
const SENSITIVE_KEYS = ['api_keys', 'secrets', 'credentials'];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Fetch all settings
    const settings = await prisma.systemSettings.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Filter sensitive settings for non-admin users
    const isAdmin = user.role === 'ADMIN';
    const filteredSettings = settings.filter(setting => {
      if (isAdmin) return true;
      return !SENSITIVE_KEYS.some(key => setting.key.includes(key));
    });

    // Group by category
    const grouped = filteredSettings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        value: setting.value,
        updatedBy: setting.user.name,
        updatedAt: setting.updatedAt,
      });
      return acc;
    }, {} as Record<string, any[]>);

    return successResponse(grouped);
  } catch (error) {
    console.error('Get settings error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch settings',
      500,
      error
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole(req, 'ADMIN');
    const body = await req.json();

    const validation = updateSettingsSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const updates = validation.data;
    const updatedSettings = [];

    // Update each setting
    for (const [key, value] of Object.entries(updates)) {
      const setting = await prisma.systemSettings.upsert({
        where: { key },
        update: {
          value,
          updatedBy: user.id,
        },
        create: {
          key,
          value,
          category: 'general',
          updatedBy: user.id,
        },
      });
      updatedSettings.push(setting);

      // Log change
      await createAuditLog({
        userId: user.id,
        action: AuditAction.UPDATE,
        entityType: 'SystemSettings',
        entityId: setting.id,
        newValue: { key, value },
        ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      });
    }

    return successResponse(updatedSettings);
  } catch (error) {
    console.error('Update settings error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
      }
      if (error.message === 'Insufficient permissions') {
        return errorResponse(ErrorCodes.FORBIDDEN, error.message, 403);
      }
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to update settings',
      500,
      error
    );
  }
}
