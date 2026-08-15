import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('createsession')
  createSession(@Body() data: { name: string; password: string }) {
    return this.appService.createSession(data);
  }

  @Post('entersession')
  enterSession(
    @Body()
    data: {
      name: string;
      password: string;
      sessionId: number;
      enterAsExistingUser: boolean;
    },
  ) {
    return this.appService.enterSession(data);
  }

  @Post('transfer')
  transfer(
    @Body()
    data: {
      fromUserId: number;
      toUserId: number;
      amount: number;
    },
  ) {
    return this.appService.transfer(data);
  }

  @Post('receive')
  receive(
    @Body()
    data: {
      userId: number;
      amount: number;
    },
  ) {
    return this.appService.receive(data);
  }

  @Get('balance')
  balance(
    @Body()
    data: {
      userId: number;
      amount: number;
    },
  ) {
    return this.appService.balance(data);
  }

  @Get('history')
  history(
    @Body()
    data: {
      sessionId: number;
    },
  ) {
    return this.appService.history(data);
  }
}
