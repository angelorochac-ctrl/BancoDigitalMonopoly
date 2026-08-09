import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async createSession(data: { name: string; password: string }) {
    const session = await this.prisma.session.create({
      data: {
        password: data.password,
      },
    });
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        sessionId: session.id,
      },
    });
    return { session, user };
  }

  async enterSession(data: {
    name: string;
    password: string;
    sessionId: number;
    enterAsExistingUser: boolean;
  }) {
    const session = await this.prisma.session.findFirst({
      where: {
        password: data.password,
        id: data.sessionId,
      },
    });
    if (!session) {
      throw new Error('Session not found');
    }

    let user;
    if (data.enterAsExistingUser) {
      user = await this.prisma.user.findFirst({
        where: {
          name: data.name,
          sessionId: data.sessionId,
        },
      });
      if (!user) {
        throw new Error('User not found in this session');
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          name: data.name,
          sessionId: data.sessionId,
        },
      });
    }
    return { session, user };
  }

  transfer() {
    // Implementation for transferring funds
  }

  receive() {
    // Implementation for receiving funds
  }

  balance() {
    // Implementation for checking balance
  }

  history() {
    // Implementation for checking transaction history
  }
}
