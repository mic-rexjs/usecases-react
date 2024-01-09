import { UseCaseArgumentTypes } from '@/enums/UseCaseArgumentTypes';
import { UseCaseModes } from '@/enums/UseCaseModes';
import { useConstant } from '../useConstant';
import { UseCaseModeErrors } from '@/enums/UseCaseModeErrors';

export const useSafeMode = (unsafeMode: UseCaseModes, argumentTypes: UseCaseArgumentTypes): UseCaseModes => {
  return useConstant((): UseCaseModes => {
    if ((argumentTypes & UseCaseArgumentTypes.Entity) === UseCaseArgumentTypes.Entity) {
      if ((unsafeMode & UseCaseModes.Global) === UseCaseModes.Global) {
        throw UseCaseModeErrors.UnsupportedGlobal;
      }

      return unsafeMode;
    }

    if ((unsafeMode & UseCaseModes.Stateless) === UseCaseModes.Stateless) {
      throw UseCaseModeErrors.UnsupportedStateless;
    }

    return unsafeMode;
  });
};
