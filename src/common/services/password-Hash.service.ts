import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordHashService {
  async hashThePassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async compareThePassword(enteredPassword: string, hashedPassword: string) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  }
}
