import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/db/client';
import { changePasswordSchema } from '@/lib/validation';
import { errorResponse, successResponse, requireAuth, ErrorCodes } from '@/lib/api-utils';
import { logUserAction } from '@/services/audit';
import { AuditAction } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(req);

    const body = await req.json();
    
    // Validate input
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid input',
        400,
        validation.error.errors
      );
    }

    const { oldPassword, newPassword } = validation.data;

    // Get user with password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return errorResponse(ErrorCodes.NOT_FOUND, 'User not found', 404);
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isValidPassword) {
      return errorResponse(
        ErrorCodes.BAD_REQUEST,
        'Current password is incorrect',
        400
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Log password change
    await logUserAction(
      user.id,
      AuditAction.UPDATE,
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      req.headers.get('user-agent') || 'unknown'
    );

    return successResponse({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return errorResponse(ErrorCodes.UNAUTHORIZED, error.message, 401);
    }
    
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to change password',
      500,
      error
    );
  }
}
