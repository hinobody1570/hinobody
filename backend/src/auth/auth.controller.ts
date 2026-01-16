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
    const result = await this.authService.googleLogin(req.user);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const token = result.access_token;
    const user = JSON.stringify(result.user);

    // Redirect to frontend with token
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(user)}`,
    );
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
    const redirectURI = encodeURIComponent(callbackURL);
    const state = Math.random().toString(36).substring(7); // Generate state for CSRF protection
    
    // Store state in session or return it to client
    // For now, we'll include it in the redirect
    const appleAuthURL = `https://appleid.apple.com/auth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code&scope=email%20name&state=${state}&response_mode=form_post`;
    
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
    const keyFilePath = process.env.APPLE_KEY_FILE_PATH;
    const callbackURL = process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/auth/apple/callback';

    if (!clientID || !teamID || !keyID || !keyFilePath) {
      throw new Error('Apple OAuth credentials not fully configured');
    }

    // Read the private key file
    const fs = require('fs');
    const path = require('path');
    const privateKey = fs.readFileSync(path.resolve(keyFilePath), 'utf8');

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
      privateKey,
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
}
