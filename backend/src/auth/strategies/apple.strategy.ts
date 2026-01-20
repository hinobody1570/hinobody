import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

@Injectable()
export class AppleStrategy {
  private jwksClient: jwksClient.JwksClient;

  constructor(private configService: ConfigService) {
    this.jwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
    });
  }

  async validate(idToken: string): Promise<any> {
    try {
      // Decode the token to get the header
      const decoded = jwt.decode(idToken, { complete: true });
      if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid token');
      }

      const kid = decoded.header.kid;
      if (!kid) {
        throw new Error('Token missing kid');
      }

      // Get the signing key from Apple
      const key = await this.getSigningKey(kid);
      
      // Verify and decode the token
      const payload = jwt.verify(idToken, key, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.configService.get<string>('APPLE_CLIENT_ID'),
      }) as any;

      return {
        provider: 'apple',
        providerId: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified === 'true' || payload.email_verified === true,
        firstName: payload.given_name,
        lastName: payload.family_name,
        idToken,
      };
    } catch (error) {
      throw new Error(`Apple token validation failed: ${error.message}`);
    }
  }

  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          return reject(err);
        }
        const signingKey = key.getPublicKey();
        resolve(signingKey);
      });
    });
  }
}

