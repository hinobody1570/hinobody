import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string; // Apple user ID
  email?: string;
  email_verified?: boolean;
  nonce?: string;
  nonce_supported?: boolean;
}

@Injectable()
export class AppleAuthService {
  private readonly appleClientId: string;
  private readonly appleTeamId: string;
  private readonly appleKeyId: string;
  private readonly applePrivateKey: string;
  private readonly jwksClient: jwksClient.JwksClient;

  constructor(private configService: ConfigService) {
    this.appleClientId = this.configService.get<string>('APPLE_CLIENT_ID') || '';
    this.appleTeamId = this.configService.get<string>('APPLE_TEAM_ID') || '';
    this.appleKeyId = this.configService.get<string>('APPLE_KEY_ID') || '';
    
    // Load Apple private key directly from environment variable
    // Normalize newlines for Windows compatibility (handle both \n and actual newlines)
    let privateKey = this.configService.get<string>('APPLE_PRIVATE_KEY') || '';
    
    // Replace escaped newlines with actual newlines if needed
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    // If key is raw base64 without PEM headers (e.g. from .env), wrap it
    if (privateKey && !privateKey.includes('-----BEGIN')) {
      const b64 = privateKey.replace(/\s/g, '').trim();
      privateKey = `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----`;
    }

    // Handle multi-line keys from .env file (Windows compatibility)
    if (privateKey.includes('\n')) {
      privateKey = privateKey
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .join('\n');
    }

    // Ensure proper formatting if key is on single line but has PEM headers
    if (privateKey && !privateKey.includes('\n') && privateKey.includes('-----')) {
      privateKey = privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
        .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----')
        .replace(/\n+/g, '\n');
    }

    this.applePrivateKey = privateKey.trim();

    // Initialize JWKS client for verifying Apple tokens
    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  /**
   * Verify Apple ID token
   */
  async verifyAppleToken(idToken: string): Promise<AppleIdTokenPayload> {
    try {
      // Decode token without verification first to get the kid
      const decoded = jwt.decode(idToken, { complete: true }) as any;
      
      if (!decoded || !decoded.header || !decoded.header.kid) {
        throw new UnauthorizedException('Invalid Apple token format');
      }

      // Get the signing key from Apple's JWKS
      const key = await this.getSigningKey(decoded.header.kid);
      
      // Verify the token
      const payload = jwt.verify(idToken, key, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.appleClientId,
      }) as AppleIdTokenPayload;

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Apple token: ' + error.message);
    }
  }

  /**
   * Get signing key from Apple's JWKS
   */
  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(new UnauthorizedException('Failed to get Apple signing key'));
          return;
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }

  /**
   * Generate client_secret JWT for Apple token endpoint.
   * Must use: iss=Team ID, sub=Service ID, aud=https://appleid.apple.com, kid=Key ID.
   */
  generateClientSecret(): string {
    if (!this.applePrivateKey || !this.appleTeamId || !this.appleClientId || !this.appleKeyId) {
      throw new Error('Apple configuration is incomplete');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.appleTeamId,
      iat: now,
      exp: now + 3600, // 1 hour (max 6 months)
      aud: 'https://appleid.apple.com',
      sub: this.appleClientId, // Service ID
    };

    return jwt.sign(payload, this.applePrivateKey, {
      algorithm: 'ES256',
      keyid: this.appleKeyId,
    });
  }
}

