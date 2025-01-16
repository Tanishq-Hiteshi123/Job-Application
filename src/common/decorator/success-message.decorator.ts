import { SetMetadata } from '@nestjs/common';

export const SUCCESS_MESSAGE_KEY = 'success-message';

export const SuccessMessage = (message: string) => {
  return SetMetadata(SUCCESS_MESSAGE_KEY, message);
};
