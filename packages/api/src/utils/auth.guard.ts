import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { createVerifier } from "fast-jwt";
import type { FastifyRequest } from "fastify";
import { Reflector } from "@nestjs/core";

export const Public = () => SetMetadata("isPublic", true);

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private readonly verifyJwt = createVerifier({ key: this.jwtSecret });

  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler()
    );

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      this.extractTokenFromCookie(request) ||
      this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("No authentication token provided");
    }

    try {
      const payload = this.verifyJwt(token);
      request["user"] = payload;
    } catch {
      throw new UnauthorizedException("Invalid authentication token");
    }
    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private extractTokenFromCookie(request: FastifyRequest): string | undefined {
    return request.cookies?.["auth-token"];
  }
}
