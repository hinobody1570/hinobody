import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT auth.
 * - If a valid JWT is provided, `req.user` will be populated.
 * - If no JWT is provided, the request is allowed through (guest).
 * - If an invalid JWT is provided, request is rejected.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info?: any) {
    if (err) {
      throw err;
    }

    // Passport-JWT uses `info` for auth failures.
    // We allow the "missing token" case, but reject invalid tokens.
    const infoMessage: string | undefined =
      typeof info?.message === 'string' ? info.message : undefined;

    const isMissingToken =
      !info ||
      infoMessage?.toLowerCase() === 'no auth token' ||
      infoMessage?.toLowerCase().includes('no authorization token');

    if (!user) {
      if (isMissingToken) return null;
      throw new UnauthorizedException(infoMessage || 'Unauthorized');
    }

    return user;
  }
}

