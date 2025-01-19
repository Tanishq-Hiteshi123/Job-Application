import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from 'src/common/decorator/role.decorator';
import { UserRole } from 'src/common/entity/userRole.entity';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      console.log(this.reflector);
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
        ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (!requiredRoles) {
        return true; // any one can access
      }

      console.log(requiredRoles);

      const request = context.switchToHttp().getRequest();
      console.log('In Rol,e ', request['user']);
      const isAllowed = requiredRoles.some(
        (availableRole) => request['user'].userRole == availableRole,
      );
      console.log(isAllowed);

      if (!isAllowed) {
        throw new ForbiddenException('Not Allowed');
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}
