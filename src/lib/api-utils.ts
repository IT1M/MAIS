import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { UserRole } from '@prisma/client';

// Standard API error response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Standard API success response
export interface ApiSuccess<T = any> {
  success: true;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Error codes
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

// Create error response
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse<ApiError> {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(isDevelopment && details ? { details } : {}),
      },
    },
    { status }
  );
}

// Create success response
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

// Get authenticated user
export async function getAuthUser(req: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }
  
  return session.user;
}

// Check user permission
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    DATA_ENTRY: 1,
    AUDITOR: 2,
    SUPERVISOR: 3,
    MANAGER: 4,
    ADMIN: 5,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Require authentication
export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

// Require specific role
export async function requireRole(req: NextRequest, role: UserRole) {
  const user = await requireAuth(req);
  
  if (!hasPermission(user.role as UserRole, role)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

// Parse pagination params
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy,
    sortOrder,
  };
}

// Create pagination response
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 100): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}

// Extract client IP
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Extract user agent
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}

// Validate UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
