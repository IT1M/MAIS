import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/db/client';
import { registerSchema } from '@/lib/validation';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/api-utils';
import { createAuditLog } from '@/services/audit';
import { AuditAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const { email, name, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'User with this email already exists',
        400
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'DATA_ENTRY',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Log registration
    await createAuditLog({
      userId: user.id,
      action: AuditAction.CREATE,
      entityType: 'User',
      entityId: user.id,
      newValue: { email: user.email, name: user.name, role: user.role },
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });

    return successResponse(user, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to register user',
      500,
      error
    );
  }
}
