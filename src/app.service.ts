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
          balance: 1500,
        },
      });
    }
    return { session, user };
  }

  async transfer(data: {
    fromUserId: number;
    toUserId: number;
    amount: number;
  }) {
    const fromUser = await this.prisma.user.findUnique({
      where: { id: data.fromUserId },
    });
    const toUser = await this.prisma.user.findUnique({
      where: { id: data.toUserId },
    });
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }
    if (fromUser.balance < data.amount) {
      throw new Error('Insufficient balance');
    }
    const transaction = await this.prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: data.fromUserId },
        data: { balance: { decrement: data.amount } },
      });
      await prisma.user.update({
        where: { id: data.toUserId },
        data: { balance: { increment: data.amount } },
      });
    });

    return transaction;
  }

  async receive(data: { userId: number; amount: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }
    await this.prisma.user.update({
      where: { id: data.userId },
      data: { balance: { increment: data.amount } },
    });

    return { message: data.amount + 'Received successfully' };
  }

  async balance(data: { userId: number}) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (user.balance < 0) {
      throw new Error('Balance cannot be negative');
    }
    return { balance: user.balance };
  }

  async history(data: { sessionId: number }) {
    const session = await this.prisma.session.findUnique({
      where: { id: data.sessionId },
    });
    if (!session) {
      throw new Error('Session not found');
    }

    
    const users = await this.prisma.user.findMany({
      where: { sessionId: data.sessionId },
    });
    const userIds = users.map(u => u.id);

    
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { originId: { in: userIds } },
          { destinationId: { in: userIds } }
        ]
      },
      orderBy: { time: 'desc' },
      include: {
        origin: true,
        destination: true,
      },
    });

    return transactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      time: transaction.time,
      origin: {
        id: transaction.origin.id,
        name: transaction.origin.name,
      },
      destination: {
        id: transaction.destination.id,
        name: transaction.destination.name,
      },
    }));
  }
}
