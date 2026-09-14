import { LifecycleEvents } from '../lifecycleEventUseCase/types';
import { EntityReducers } from '@mic-rexjs/usecases';

export interface LifecycleUseCaseOptions<T> extends Partial<LifecycleEvents<T>> {}

export type LifecycleReducers<T> = EntityReducers<T, Record<never, never>>;
