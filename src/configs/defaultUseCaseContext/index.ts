import { createContext } from 'react';
import { UseCaseContextValue } from './types';
import { Reducers } from '@mic-rexjs/usecases';

export const defaultUseCaseContext = createContext<UseCaseContextValue<Reducers> | null>(null);
