import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { LoggedUserProps } from '../shared/types/logged-user.types';

export const UserRequest = createParamDecorator(
  (data: keyof any | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: LoggedUserProps = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
