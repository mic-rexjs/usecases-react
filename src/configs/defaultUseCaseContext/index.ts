import { createContext } from 'react';
import { EntityReducers } from '@mic-rexjs/usecases';
import { UseCaseContextValue } from './types';

export const defaultUseCaseContext = createContext<UseCaseContextValue<unknown, EntityReducers<unknown>, object>>({});
