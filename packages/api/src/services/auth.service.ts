import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { db } from "../db/db";
import { users } from "../db/schemas";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { createSigner, createVerifier } from "fast-jwt";
import type { LoginDto, RegisterDto } from "../dto/auth";

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private readonly signJwt = createSigner({ key: this.jwtSecret });
  private readonly verifyJwt = createVerifier({ key: this.jwtSecret });

  async register(data: RegisterDto) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        password: hashedPassword,
        name: data.name,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      });

    // Generate JWT token
    const token = this.signJwt({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    return {
      user: newUser,
      token,
    };
  }

  async login(data: LoginDto) {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid email or password");
    }

    // Generate JWT token
    const token = this.signJwt({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.verifyJwt(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }
  }

  async getCurrentUser(userId: number) {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
