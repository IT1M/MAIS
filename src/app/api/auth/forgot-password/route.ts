import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/db/client';
import { errorResponse, successResponse, ErrorCodes } from '@/lib/api-utils';

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').transform(val => val.trim().toLowerCase()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate email format
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid email address',
        400,
        validation.error.errors
      );
    }

    const { email } = validation.data;

    // Query database to check if user exists
    // Note: We don't reveal whether the email exists for security reasons
    try {
      await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      });

      // TODO: In a production environment, you would:
      // 1. Generate a secure password reset token
      // 2. Store the token with an expiration time
      // 3. Send an email with the reset link
      // For now, we just check if the user exists but don't reveal it

      // Always return success message regardless of whether user exists
      // This prevents email enumeration attacks
    } catch (dbError) {
      // Log the error but don't expose it to the client
      console.error('Database error in forgot password:', dbError);
      // Still return success to prevent information leakage
    }

    // Always return the same success message
    return successResponse(
      {
        message: 'If an account exists with this email, you will receive password reset instructions.',
      },
      200
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    
    // Handle database errors gracefully
    // Return a generic error message without revealing system details
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'An error occurred while processing your request. Please try again later.',
      500
    );
  }
}
