import { LifecycleEvents } from '../lifecycleEventUseCase/types';
import { EntityReducers } from '@mic-rexjs/usecases';

export interface LifeCycleUseCaseOptions<T> extends Partial<LifecycleEvents<T>> {}

export type LifeCycleReducers<T> = EntityReducers<T, Record<never, never>>;
