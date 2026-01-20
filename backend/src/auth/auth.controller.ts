import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login.dto';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { AppleStrategy } from './strategies/apple.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly appleStrategy: AppleStrategy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Verification email sent.',
  })
  @ApiResponse({ status: 409, description: 'Email or nickname already exists' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    // Get the user with OTP to send email
    const userWithOtp = await this.userService.findByEmail(createUserDto.email);

    // Send verification email with OTP
    if (userWithOtp?.emailVerificationOTP) {
      await this.emailService.sendVerificationEmail(
        createUserDto.email,
        userWithOtp.emailVerificationOTP,
        user.nickname,
      );
    }

    return {
      message:
        'Registration successful. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        emailVerified: user.emailVerified,
      },
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or email not verified',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address with OTP' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend OTP verification code' })
  @ApiResponse({ status: 200, description: 'OTP resent successfully' })
  @ApiResponse({ status: 400, description: 'Email already verified' })
  @ApiBody({ type: ResendOtpDto })
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.authService.resendOtp(resendOtpDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent if email exists',
  })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Check if Google OAuth is configured
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientID || !clientSecret || clientID === 'your-google-client-id') {
      throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.');
    }
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new Error('No user data received from Google');
      }

      const result = await this.authService.googleLogin(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const token = result.access_token;
      const user = JSON.stringify(result.user);

      // Redirect to frontend with token
      res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(user)}`,
      );
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error.message || 'Google authentication failed';
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Post('google/mobile')
  @ApiOperation({ summary: 'Google OAuth login for mobile apps' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
        accessToken: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        picture: { type: 'string' },
        providerId: { type: 'string' },
      },
    },
  })
  async googleMobileLogin(@Body() body: any) {
    const user = {
      providerId: body.providerId,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      picture: body.picture,
    };
    return this.authService.googleLogin(user);
  }

  @Get('apple')
  @ApiOperation({ summary: 'Initiate Apple OAuth login (server-side flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to Apple Sign In' })
  async appleAuth(@Res() res: Response) {
    // Check if Apple OAuth is configured
    const clientID = process.env.APPLE_CLIENT_ID;
    if (!clientID || clientID === 'your-apple-client-id') {
      throw new Error('Apple OAuth is not configured. Please set APPLE_CLIENT_ID in your .env file.');
    }

    const callbackURL = process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/auth/apple/callback';
    
    // Debug logging (remove in production or use proper logger)
    console.log('Apple OAuth Debug:', {
      clientID,
      callbackURL,
      teamID: process.env.APPLE_TEAM_ID ? 'Set' : 'Missing',
      keyID: process.env.APPLE_KEY_ID ? 'Set' : 'Missing',
      privateKey: process.env.APPLE_PRIVATE_KEY ? 'Set' : 'Missing',
    });
    
    // Ensure callback URL doesn't have trailing slash and matches exactly
    const normalizedCallbackURL = callbackURL.replace(/\/$/, '');
    const redirectURI = encodeURIComponent(normalizedCallbackURL);
    const state = Math.random().toString(36).substring(7); // Generate state for CSRF protection
    
    // Build Apple authorization URL
    // Note: For localhost, Apple requires exact match in Service ID configuration
    const appleAuthURL = `https://appleid.apple.com/auth/authorize?client_id=${encodeURIComponent(clientID)}&redirect_uri=${redirectURI}&response_type=code&scope=email%20name&state=${state}&response_mode=form_post`;
    
    console.log('Redirecting to Apple:', appleAuthURL);
    
    res.redirect(appleAuthURL);
  }

  @Post('apple/callback')
  @ApiOperation({ summary: 'Apple OAuth callback (server-side flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async appleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const { code, state } = req.body;
      
      if (!code) {
        throw new Error('Authorization code not provided');
      }

      // Exchange code for tokens
      const tokenResponse = await this.exchangeAppleCode(code);
      const idToken = tokenResponse.id_token;

      // Validate and process the idToken
      const userData = await this.appleStrategy.validate(idToken);
      const result = await this.authService.appleLoginWithUser(userData);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const token = result.access_token;
      const user = JSON.stringify(result.user);

      // Redirect to frontend with token
      res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(user)}`,
      );
    } catch (error) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(error.message)}`);
    }
  }

  @Post('apple/token')
  @ApiOperation({ summary: 'Apple Sign In (client-side flow with idToken)' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 400, description: 'Invalid ID token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idToken: { type: 'string' },
      },
      required: ['idToken'],
    },
  })
  async appleLogin(@Body() body: { idToken: string }) {
    try {
      const userData = await this.appleStrategy.validate(body.idToken);
      return this.authService.appleLoginWithUser(userData);
    } catch (error) {
      throw new Error(`Apple login failed: ${error.message}`);
    }
  }

  private async exchangeAppleCode(code: string): Promise<any> {
    const clientID = process.env.APPLE_CLIENT_ID;
    const teamID = process.env.APPLE_TEAM_ID;
    const keyID = process.env.APPLE_KEY_ID;
    let privateKey = process.env.APPLE_PRIVATE_KEY || '';
    const callbackURL = process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/auth/apple/callback';

    if (!clientID || !teamID || !keyID || !privateKey) {
      throw new Error('Apple OAuth credentials not fully configured');
    }

    // Normalize private key newlines for Windows compatibility
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Ensure proper formatting if key is on single line
    if (privateKey && !privateKey.includes('\n') && privateKey.includes('-----')) {
      privateKey = privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n')
        .replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----')
        .replace(/\n+/g, '\n');
    }

    // Create client secret (JWT)
    const jwt = require('jsonwebtoken');
    const clientSecret = jwt.sign(
      {
        iss: teamID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        aud: 'https://appleid.apple.com',
        sub: clientID,
      },
      privateKey.trim(),
      {
        algorithm: 'ES256',
        keyid: keyID,
      },
    );

    // Exchange authorization code for tokens
    const response = await fetch('https://appleid.apple.com/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: callbackURL,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Apple token exchange failed: ${error}`);
    }

    return response.json();
  }

  @Get('apple/debug')
  @ApiOperation({ summary: 'Debug Apple OAuth configuration (development only)' })
  @ApiResponse({ status: 200, description: 'Returns configuration status' })
  async appleDebug() {
    const clientID = process.env.APPLE_CLIENT_ID;
    const teamID = process.env.APPLE_TEAM_ID;
    const keyID = process.env.APPLE_KEY_ID;
    const privateKey = process.env.APPLE_PRIVATE_KEY;
    const callbackURL = process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/auth/apple/callback';

    const config = {
      clientID: clientID ? (clientID.length > 0 ? '✓ Set' : '✗ Empty') : '✗ Missing',
      teamID: teamID ? '✓ Set' : '✗ Missing',
      keyID: keyID ? '✓ Set' : '✗ Missing',
      privateKey: privateKey ? (privateKey.length > 0 ? '✓ Set' : '✗ Empty') : '✗ Missing',
      callbackURL,
      privateKeyLength: privateKey ? privateKey.length : 0,
      privateKeyStartsWith: privateKey ? privateKey.substring(0, 30) + '...' : 'N/A',
      privateKeyEndsWith: privateKey && privateKey.length > 30 ? '...' + privateKey.substring(privateKey.length - 30) : 'N/A',
      hasNewlines: privateKey ? privateKey.includes('\n') : false,
      hasEscapedNewlines: privateKey ? privateKey.includes('\\n') : false,
    };

    // Don't expose full private key in response
    const safeConfig = {
      ...config,
      privateKey: privateKey ? '✓ Present (hidden for security)' : '✗ Missing',
    };

    return {
      message: 'Apple OAuth Configuration Status',
      config: safeConfig,
      allConfigured: !!(clientID && teamID && keyID && privateKey),
      troubleshooting: {
        invalidClientError: [
          '1. Verify your Service ID exists in Apple Developer Portal',
          '2. Ensure "Sign in with Apple" is enabled for the Service ID',
          `3. Check that the callback URL "${callbackURL}" is added to your Service ID\'s Return URLs`,
          '4. Verify you\'re using a Service ID (not App ID) for web authentication',
          '5. Wait a few minutes after making changes in Apple Developer Portal (changes can take time to propagate)',
        ],
        callbackUrlMismatch: [
          `Make sure "${callbackURL}" exactly matches (including http:// and no trailing slash)`,
          'what you configured in Apple Developer Portal > Service ID > Return URLs',
        ],
      },
    };
  }
}
