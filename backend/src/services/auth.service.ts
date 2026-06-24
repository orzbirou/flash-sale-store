import { prisma } from '../lib/prisma';

export interface AuthUserDto {
  id: string;
  name: string;
}

export class AuthService {
  async login(name: string): Promise<AuthUserDto> {
    const trimmedName = name.trim();

    const existingUser = await prisma.user.findFirst({
      where: { name: trimmedName },
    });

    if (existingUser) {
      return { id: existingUser.id, name: existingUser.name };
    }

    const user = await prisma.user.create({
      data: { name: trimmedName },
    });

    return { id: user.id, name: user.name };
  }
}

export const authService = new AuthService();
