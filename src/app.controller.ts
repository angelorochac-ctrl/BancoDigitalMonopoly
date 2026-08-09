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
  transfer() {
    this.appService.transfer();
  }

  @Post('receive')
  receive() {
    this.appService.receive();
  }

  @Get('balance')
  balance() {
    this.appService.balance();
  }

  @Get('history')
  history() {
    this.appService.history();
  }
}
