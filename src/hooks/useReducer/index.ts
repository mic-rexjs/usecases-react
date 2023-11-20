import { isSameArray } from '@/methods/isSameArray';
import { Reducer } from '@mic-rexjs/usecases';
import { useMemoizedFn } from 'ahooks';
import { useRef } from 'react';

export const useReducer = <T extends Reducer>(reducer: T): T => {
  const prevReducerRef = useRef<T>();
  const prevArgsRef = useRef([] as Parameters<T>);
  const prevReturnValueRef = useRef<ReturnType<T>>();

  return useMemoizedFn((...args: Parameters<T>): ReturnType<T> => {
    let { current: returnValue } = prevReturnValueRef;
    const { current: prevReducer } = prevReducerRef;
    const { current: prevArgs } = prevArgsRef;

    if (reducer !== prevReducer || !isSameArray(args, prevArgs)) {
      returnValue = reducer(...args) as ReturnType<T>;
    }

    prevReducerRef.current = reducer;
    prevArgsRef.current = args;
    prevReturnValueRef.current = returnValue;

    return returnValue as ReturnType<T>;
  }) as T;
};
