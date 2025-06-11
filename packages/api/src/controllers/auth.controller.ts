import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "../services/auth.service";
import { LoginSchema, RegisterSchema } from "../dto/auth";
import type { LoginDto, RegisterDto } from "../dto/auth";
import { TypeBoxValidationPipe } from "../pipes/typebox-validation.pipe";
import { Public } from "../utils/auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  async register(
    @Body(new TypeBoxValidationPipe(RegisterSchema)) data: RegisterDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    try {
      const result = await this.authService.register(data);

      // Set HTTP-only cookie with the JWT token
      res.cookie("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Registration failed"
      );
    }
  }

  @Public()
  @Post("login")
  async login(
    @Body(new TypeBoxValidationPipe(LoginSchema)) data: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    try {
      const result = await this.authService.login(data);

      // Set HTTP-only cookie with the JWT token
      res.cookie("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    // Clear the auth cookie
    res.clearCookie("auth-token", {
      path: "/",
    });

    return {
      success: true,
      message: "Logged out successfully",
    };
  }

  @Get("me")
  async getCurrentUser(@Req() req: FastifyRequest) {
    try {
      // The user should be attached to the request by the AuthGuard
      const user = (req as any).user;
      if (!user) {
        throw new UnauthorizedException("User not authenticated");
      }

      const currentUser = await this.authService.getCurrentUser(user.sub);
      return currentUser;
    } catch (error) {
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }
}
