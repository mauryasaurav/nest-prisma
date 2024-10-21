import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getCurrentVersion(): string {
    return 'v1.0';
  }
}
