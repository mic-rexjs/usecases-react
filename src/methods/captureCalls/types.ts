import { RestArguments } from '@mic-rexjs/usecases/es/types';

export interface CaptureCallFactory {
  <T>(key: string, args: RestArguments): T;
}
