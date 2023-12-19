import { createContext } from 'react';
import { EntityReducers } from '@mic-rexjs/usecases';
import { UseCaseContext } from './types';

export const defaultUseCaseContext = createContext(null) as UseCaseContext<unknown, EntityReducers<unknown>>;
