import {
  objectUseCase,
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducers,
  Reducers,
  ObjectReducers,
} from '@mic-rexjs/usecases';
import { describe, expect, jest, test } from '@jest/globals';
import { renderHook, act, render, fireEvent, screen } from '@testing-library/react';
import { useUseCase } from '.';
import { useDeepCompareEffect, useMemoizedFn, useUpdate, useUpdateEffect } from 'ahooks';
import { Dispatch, Fragment, useEffect, useRef, useState } from 'react';
import { CoreCollection } from './types';

interface TestFile {
  path: string;

  ext: string;

  size: number;
}

type TestReducers<T extends TestFile> = EntityReducers<
  T,
  {
    init(entity: T, newEntity: T): EntityGenerator<T, void>;

    setPath(entity: T, path: string): EntityGenerator<T, void>;

    readFile(entity: T, path: string): AsyncEntityGenerator<T, number>;

    isImage(entity: T): boolean;
  },
  ObjectReducers<T>
>;

interface MathUseCaseOptions {
  extraValue?: number;
}

type MathReducers = Reducers<{
  add(value1: number, value2: number): number;

  subtraction(value1: number, value2: number): number;
}>;

interface CommonProps {
  onUpdate?(): void;

  onPathChange?(path: string): void;
}

interface ParentProps extends CommonProps {
  stateless?: boolean;

  onSetPath?(): string;

  children?: React.ReactNode;
}

interface ChildProps extends CommonProps {
  textPrefix?: string;

  onUndefinedEntity?(): void;
}

interface FileUseCaseOptions {
  pathPrefix?: string;
}

interface MathParentProps extends CommonProps, MathUseCaseOptions {}

const EXT_1 = '.png';
const EXT_2 = '.jpg';
const PATH_1 = `hello${EXT_1}`;
const PARENT_BUTTON_TEXT = 'parent button';
const CHILD_BUTTON_TEXT = 'child button';

const defaultFile: TestFile = {
  path: '',
  ext: '',
  size: 0,
};

const fileUseCase = <T extends TestFile>(options: FileUseCaseOptions = {}): TestReducers<T> => {
  const entityReducers = objectUseCase<T>();
  const { pathPrefix = '' } = options;

  const init = function* (entity: T, newEntity = defaultFile as T): EntityGenerator<T, void> {
    yield (): T => {
      return newEntity;
    };
  };

  const setPath = function* (entity: T, path: string): EntityGenerator<T, void> {
    yield {
      ...entity,
      path: pathPrefix + path,
      ext: path.match(/\.[^.]+$/)?.[0] || '',
    };
  };

  const readFile = async function* (entity: T, path: string): AsyncEntityGenerator<T, number> {
    const size = 2000;

    yield* setPath(entity, path);
    await Promise.resolve(null);

    yield (prevEntity: T): T => {
      return {
        ...prevEntity,
        size,
      };
    };

    return size;
  };

  const isImage = (entity: T): boolean => {
    const { ext } = entity;

    return [EXT_1, EXT_2].includes(ext);
  };

  return { ...entityReducers, init, setPath, readFile, isImage };
};

const mathUseCase = (options: MathUseCaseOptions = {}): MathReducers => {
  const { extraValue = 0 } = options;

  const add = (value1: number, value2: number): number => {
    return value1 + value2 + extraValue;
  };

  const subtraction = (value1: number, value2: number): number => {
    return value1 - value2;
  };

  return { add, subtraction };
};

const Child = ({ textPrefix = '', onUpdate, onPathChange, onUndefinedEntity }: ChildProps): React.ReactElement => {
  const [file, { setPath }] = useUseCase(fileUseCase);
  const { path, ext } = file || {};

  const onClick = (): void => {
    setPath('');
  };

  const undefinedEntity = useMemoizedFn((): void => {
    onUndefinedEntity?.();
  });

  useUpdateEffect((): void => {
    onUpdate?.();
  });

  useEffect((): void => {
    if (file === void 0) {
      undefinedEntity();
    }
  }, [file, undefinedEntity]);

  const pathChange = useMemoizedFn((): void => {
    onPathChange?.(path);
  });

  useUpdateEffect(pathChange, [path, pathChange]);

  return (
    <div>
      <main>
        child path: {path}
        <br />
        child ext: {ext}
      </main>
      <footer>
        <button onClick={onClick}>{textPrefix + CHILD_BUTTON_TEXT}</button>
      </footer>
    </div>
  );
};

const Parent = ({ children, stateless, onUpdate, onSetPath }: ParentProps): React.ReactElement => {
  const [{ path, ext }, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, { stateless });

  const onClick = (): void => {
    setPath(onSetPath?.() || '');
  };

  useUpdateEffect((): void => {
    onUpdate?.();
  });

  return (
    <Provider>
      <div>
        <header>
          parent path: {path}
          <br />
          parent ext: {ext}
        </header>
        <main>{children}</main>
        <footer>
          <button onClick={onClick}>{PARENT_BUTTON_TEXT}</button>
        </footer>
      </div>
    </Provider>
  );
};

const MathParent = ({ extraValue = 0, onUpdate }: MathParentProps): React.ReactElement => {
  const { add } = useUseCase(mathUseCase, { extraValue }, [extraValue]);

  const onClick = (): void => {
    add(1, 2);
  };

  useUpdateEffect((): void => {
    onUpdate?.();
  });

  return (
    <div>
      <button onClick={onClick}>{PARENT_BUTTON_TEXT}</button>
    </div>
  );
};

const useDeepCompareUpdate = (callback: VoidFunction, deps: unknown[]): void => {
  const isFirstRef = useRef(true);

  useEffect((): VoidFunction => {
    return (): void => {
      isFirstRef.current = false;
    };
  });

  useDeepCompareEffect.call(
    null,
    (): void => {
      if (isFirstRef.current) {
        return;
      }

      callback();
    },
    deps
  );
};

describe('useUseCase', (): void => {
  describe('`useUseCase` should work with 2+ arguments on provider mode', (): void => {
    test('check `context.length`', (): void => {
      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;

      expect(context).toHaveLength(3);
    });

    test('`entity` should equal `defaultFile`', (): void => {
      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [entity] = context;

      expect(entity).toBe(defaultFile);
    });

    test('`reducers` should be returned as an object', (): void => {
      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [, reducers] = context;

      expect(typeof reducers).toBe('object');
    });

    test('`Provider` should be returned as a function', (): void => {
      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [, , Provider] = context;

      expect(typeof Provider).toBe('function');
    });

    test('after call non-generator reducer, it should not trigger update', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): ((shouldUpdate?: boolean) => void) => {
        const context = useUseCase(defaultFile, fileUseCase);
        const [, reducers] = context;
        const { isImage } = reducers;
        const update = useUpdate();

        useUpdateEffect((): void => {
          onUpdate();
        }, [context]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [context]);

        return (shouldUpdate?: boolean): void => {
          isImage();

          if (!shouldUpdate) {
            return;
          }

          update();
        };
      });

      act((): void => {
        result.current();
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current(true);
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);
    });

    test('after `yield entity`, it should trigger update', (): void => {
      const onUpdate = jest.fn();

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [entity, reducers] = context;
      const { setPath, setEntity } = reducers;

      act((): void => {
        setPath(PATH_1);
        setEntity({ size: 5000 });
      });

      expect(result.current).not.toBe(context);
      expect(result.current[0]).not.toBe(entity);
      expect(result.current[1]).not.toBe(reducers);
      expect(result.current[1].setPath).not.toBe(setPath);

      expect(result.current[0]).toEqual({
        ...defaultFile,
        path: PATH_1,
        ext: EXT_1,
        size: 5000,
      });

      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    test('after `yield entity` on async mode, it should trigger update', async (): Promise<void> => {
      const onUpdate = jest.fn();

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [entity, reducers] = context;
      const { readFile } = reducers;

      const promise = act((): Promise<number> => {
        return readFile(PATH_1);
      });

      expect(result.current).toBe(context);
      expect(result.current).toEqual(context);
      expect(onUpdate).toHaveBeenCalledTimes(0);

      await promise;

      expect(result.current[0]).not.toBe(entity);
      expect(result.current[1]).not.toBe(reducers);
      expect(result.current[1].readFile).not.toBe(readFile);
      expect(result.current[0].path).toBe(PATH_1);
      expect(result.current[0].ext).toBe(EXT_1);
      expect(result.current[0].size).toBe(2000);
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    test('after `yield entity` callbacks, it should trigger update', (): void => {
      const onUpdate = jest.fn();

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: context } = result;
      const [, reducers] = context;
      const { init } = reducers;

      act((): void => {
        init({ ...defaultFile, size: 5000 });
      });

      expect(result.current[0].size).toBe(5000);
      expect(result.current[1]).not.toBe(reducers);
      expect(result.current[1].init).not.toBe(init);
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    test('`options.stateless` should not generate new reducers when `yeild entity`', (): void => {
      const onUpdate = jest.fn();

      const { result, rerender } = renderHook(
        (file: TestFile = defaultFile): CoreCollection<TestFile, TestReducers<TestFile>> => {
          useUpdateEffect((): void => {
            onUpdate();
          });

          return useUseCase(file, fileUseCase, { stateless: true });
        }
      );

      const { current: context } = result;
      const [, { setPath }] = context;

      setPath(PATH_1);
      expect(onUpdate).toHaveBeenCalledTimes(0);

      expect(result.current[0].path).toBe('');
      expect(result.current[1].setPath).toBe(setPath);

      rerender({ ...defaultFile, path: PATH_1 });

      expect(result.current[0].path).toBe(PATH_1);
      expect(result.current[1].setPath).not.toBe(setPath);
    });

    test('`options.stateless` should not trigger update when after `yield entity`', (): void => {
      const onUpdate = jest.fn();

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase, { stateless: true });
      });

      const { current: context } = result;
      const [, reducers] = context;
      const { setPath } = reducers;

      act((): void => {
        setPath(PATH_1);
      });

      expect(result.current).toBe(context);
      expect(result.current).toEqual(context);
      expect(onUpdate).toHaveBeenCalledTimes(0);
    });

    test('`options.onChange` should be trigger when entity has changed', (): void => {
      const onChange = jest.fn<(newEntity: TestFile, prevEntity: TestFile) => void>();

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, { onChange });
      });
      ``;
      const { current: context } = result;
      const [, reducers] = context;
      const { setPath } = reducers;

      expect(onChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({ ...defaultFile, path: PATH_1, ext: EXT_1 }, defaultFile);
    });

    test('`options.options` should override rest options', (): void => {
      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, {
          pathPrefix: 'xyz/',
          options: { pathPrefix: '123/' },
        });
      });

      const { current: context } = result;
      const [{ path }, reducers] = context;
      const { setPath } = reducers;

      expect(path).toBe('');

      act((): void => {
        setPath(PATH_1);
      });

      expect(result.current[0].path).toBe('123/' + PATH_1);
    });

    test('when `options` has changed, it should not trigger update', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<string> => {
        const [pathPrefix, setPathPrefix] = useState('user/');
        const context = useUseCase(defaultFile, fileUseCase, { pathPrefix });

        useUpdateEffect((): void => {
          onUpdate();
        }, [context]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [context]);

        return setPathPrefix;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current('my/');
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);
    });

    test('when `entity` change, it should trigger watchers', (): void => {
      const onPathChange1 = jest.fn();
      const onPathChange2 = jest.fn();
      let onPathChange = onPathChange1;

      const { result } = renderHook((): CoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, {
          watch: {
            path: onPathChange,
          },
        });
      });

      const { current: context } = result;
      const [, { setPath, setEntity }] = context;

      onPathChange = onPathChange2;
      expect(onPathChange1).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);
        setEntity({ size: 5000 });
      });

      expect(onPathChange1).toHaveBeenCalledTimes(1);
      expect(onPathChange1).toHaveBeenLastCalledWith({ ...defaultFile, path: PATH_1, ext: EXT_1 }, defaultFile);

      act((): void => {
        setPath('');
      });

      expect(onPathChange2).toHaveBeenCalledTimes(1);

      expect(onPathChange2).toHaveBeenLastCalledWith(
        { ...defaultFile, size: 5000 },
        { ...defaultFile, path: PATH_1, size: 5000, ext: EXT_1 }
      );
    });

    test('when `deps` has changed, it should trigger update', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<string> => {
        const [pathPrefix, setPathPrefix] = useState('user/');
        const context = useUseCase(defaultFile, fileUseCase, { pathPrefix }, [pathPrefix]);

        useUpdateEffect((): void => {
          onUpdate();
        }, [context]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [context]);

        return setPathPrefix;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current('my/');
      });

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onDeepUpdate).toHaveBeenCalledTimes(1);
    });

    test('empty `deps` should not trigger update', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<string> => {
        const [pathPrefix, setPathPrefix] = useState('user/');
        const context = useUseCase(defaultFile, fileUseCase, { pathPrefix }, []);

        useUpdateEffect((): void => {
          onUpdate();
        }, [context]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [context]);

        return setPathPrefix;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current('my/');
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);
    });
  });

  describe('`useUseCase` should work with 1+ arguments on non-entity mode', (): void => {
    test('`entity` should equal `defaultFile`', (): void => {
      const { result } = renderHook((): MathReducers => {
        return useUseCase(mathUseCase);
      });

      const { current: reducers } = result;

      expect(Array.isArray(reducers)).toBe(false);
    });

    test('returned reducer should work', (): void => {
      const { result } = renderHook((): MathReducers => {
        return useUseCase(mathUseCase);
      });

      const { current: reducers } = result;
      const { add } = reducers;

      expect(add(1, 2)).toBe(3);
    });

    test('`options.extraValue` should be added after call `add` method', (): void => {
      const { result } = renderHook((): MathReducers => {
        return useUseCase(mathUseCase, { extraValue: 5 });
      });

      const { current: reducers } = result;
      const { add } = reducers;

      expect(add(1, 2)).toBe(8);
    });

    test('when `options` has changed, it should not trigger update', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<number> => {
        const [extraValue, setExtraValue] = useState(0);
        const reducers = useUseCase(mathUseCase, { extraValue });

        useUpdateEffect((): void => {
          onUpdate();
        }, [reducers]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [reducers]);

        return setExtraValue;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current(3);
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);
    });

    test('when `deps` change, it should update reducers', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<number> => {
        const [extraValue, setExtraValue] = useState(0);
        const reducers = useUseCase(mathUseCase, { extraValue }, [extraValue]);

        useUpdateEffect((): void => {
          onUpdate();
        }, [reducers]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [reducers]);

        return setExtraValue;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current(3);
      });

      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onDeepUpdate).toHaveBeenCalledTimes(1);
    });

    test('empty `deps` should not update reducers', (): void => {
      const onUpdate = jest.fn();
      const onDeepUpdate = jest.fn();

      const { result } = renderHook((): Dispatch<number> => {
        const [extraValue, setExtraValue] = useState(0);
        const reducers = useUseCase(mathUseCase, { extraValue }, []);

        useUpdateEffect((): void => {
          onUpdate();
        }, [reducers]);

        useDeepCompareUpdate((): void => {
          onDeepUpdate();
        }, [reducers]);

        return setExtraValue;
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);

      act((): void => {
        result.current(3);
      });

      expect(onUpdate).toHaveBeenCalledTimes(0);
      expect(onDeepUpdate).toHaveBeenCalledTimes(0);
    });

    test('should not trigger update', (): void => {
      const onUpdate = jest.fn();

      render(<MathParent onUpdate={onUpdate} />);
      fireEvent.click(screen.getByText(PARENT_BUTTON_TEXT));
      expect(onUpdate).toHaveBeenCalledTimes(0);
    });
  });

  describe('`useUseCase` should work with 1+ arguments on context mode', (): void => {
    test('should work within <Child /> which it is under <Parent />', (): void => {
      const textPrefix = '>>';

      const onUpdate = jest.fn();
      const onPathChange = jest.fn();
      const onUndefinedEntity = jest.fn();

      const onSetPath = jest.fn((): string => {
        return PATH_1;
      });

      render(
        <div>
          <Parent onSetPath={onSetPath}>
            <Child
              textPrefix={textPrefix}
              onUpdate={onUpdate}
              onPathChange={onPathChange}
              onUndefinedEntity={onUndefinedEntity}
            />
          </Parent>
        </div>
      );

      fireEvent.click(screen.getByText(PARENT_BUTTON_TEXT));
      expect(onSetPath).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledTimes(1);
      expect(onPathChange).toHaveBeenCalledWith(PATH_1);

      fireEvent.click(screen.getByText(textPrefix + CHILD_BUTTON_TEXT));
      expect(onSetPath).toHaveBeenCalledTimes(1);
      expect(onUpdate).toHaveBeenCalledTimes(2);
      expect(onPathChange).toHaveBeenCalledWith('');
      expect(onUndefinedEntity).toHaveBeenCalledTimes(0);
    });

    test('`options.onChange` event should be trigger at child elements', (): void => {
      const onFirstChange = jest.fn();
      const onSecondChange = jest.fn();
      const onParentPathChange = jest.fn<(newEntity: TestFile, prevEntity: TestFile) => void>();
      const firstButtonText = 'first button';
      const secondButtonText = 'second button';
      let onChange = onFirstChange;

      const A = (): React.ReactElement => {
        useUseCase(fileUseCase, { onChange });

        return <Fragment />;
      };

      const B = (): React.ReactElement => {
        const [, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, {
          onChange: onParentPathChange,
        });

        const onFirstClick = (): void => {
          setPath(PATH_1);
          onChange = onSecondChange;
        };

        const onSecondClick = (): void => {
          setPath('');
        };

        return (
          <Provider>
            <A />
            <button onClick={onFirstClick}>{firstButtonText}</button>
            <button onClick={onSecondClick}>{secondButtonText}</button>
          </Provider>
        );
      };

      render(<B />);

      expect(onFirstChange).toHaveBeenCalledTimes(0);
      fireEvent.click(screen.getByText(firstButtonText));
      expect(onFirstChange).toHaveBeenCalledTimes(1);
      expect(onFirstChange).toHaveBeenLastCalledWith({ ...defaultFile, ext: EXT_1, path: PATH_1 }, defaultFile);
      expect(onParentPathChange).toHaveBeenCalledTimes(1);

      expect(onSecondChange).toHaveBeenCalledTimes(0);
      fireEvent.click(screen.getByText(secondButtonText));
      expect(onSecondChange).toHaveBeenCalledTimes(1);
      expect(onSecondChange).toHaveBeenLastCalledWith(defaultFile, {
        ...defaultFile,
        ext: EXT_1,
        path: PATH_1,
      });
      expect(onFirstChange).toHaveBeenCalledTimes(1);
      expect(onParentPathChange).toHaveBeenCalledTimes(2);
    });

    test('`options.onChange` event should be trigger in orders', (): void => {
      let changeTimes = 0;

      const updateChangeTimes = (): number => {
        return ++changeTimes;
      };

      const onChangeA = jest.fn(updateChangeTimes);
      const onChangeB = jest.fn(updateChangeTimes);
      const onChangeC = jest.fn(updateChangeTimes);

      const buttonText = 'my button';

      const A = ({ children }: React.PropsWithChildren): React.ReactElement => {
        useUseCase(fileUseCase, { onChange: onChangeA });

        return <Fragment>{children}</Fragment>;
      };

      const B = (): React.ReactElement => {
        useUseCase(fileUseCase, { onChange: onChangeB });

        return <Fragment />;
      };

      const C = (): React.ReactElement => {
        const [, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, {
          onChange: onChangeC,
        });

        const onFirstClick = (): void => {
          setPath(PATH_1);
        };

        return (
          <Provider>
            <A>
              <B />
            </A>
            <button onClick={onFirstClick}>{buttonText}</button>
          </Provider>
        );
      };

      render(<C />);

      expect(changeTimes).toBe(0);
      fireEvent.click(screen.getByText(buttonText));
      expect(onChangeA).toHaveReturnedWith(2);
      expect(onChangeB).toHaveReturnedWith(1);
      expect(onChangeC).toHaveReturnedWith(3);
    });

    test('`options.watch` should be trigger at child elements', (): void => {
      const onFirstExtChange = jest.fn();
      const onSecondExtChange = jest.fn();
      const onParentExtChange = jest.fn();
      let onExtChange = onFirstExtChange;
      const firstButtonText = 'first button';
      const secondButtonText = 'second button';

      const A = (): React.ReactElement => {
        useUseCase(fileUseCase, {
          watch: {
            ext: onExtChange,
          },
        });

        return <Fragment />;
      };

      const B = (): React.ReactElement => {
        const [, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, {
          watch: {
            ext: onParentExtChange,
          },
        });

        const onFirstClick = (): void => {
          setPath(PATH_1);
          onExtChange = onSecondExtChange;
        };

        const onSecondClick = (): void => {
          setPath('');
        };

        return (
          <Provider>
            <A />
            <button onClick={onFirstClick}>{firstButtonText}</button>
            <button onClick={onSecondClick}>{secondButtonText}</button>
          </Provider>
        );
      };

      render(<B />);

      expect(onFirstExtChange).toHaveBeenCalledTimes(0);
      fireEvent.click(screen.getByText(firstButtonText));
      expect(onFirstExtChange).toHaveBeenCalledTimes(1);
      expect(onFirstExtChange).toHaveBeenLastCalledWith({ ...defaultFile, ext: EXT_1, path: PATH_1 }, defaultFile);
      expect(onParentExtChange).toHaveBeenCalledTimes(1);

      expect(onSecondExtChange).toHaveBeenCalledTimes(0);
      fireEvent.click(screen.getByText(secondButtonText));
      expect(onSecondExtChange).toHaveBeenCalledTimes(1);
      expect(onSecondExtChange).toHaveBeenLastCalledWith(defaultFile, {
        ...defaultFile,
        ext: EXT_1,
        path: PATH_1,
      });
      expect(onFirstExtChange).toHaveBeenCalledTimes(1);
      expect(onParentExtChange).toHaveBeenCalledTimes(2);
    });

    test('`options.watch` should be trigger in orders', (): void => {
      let changeTimes = 0;

      const updateChangeTimes = (): number => {
        return ++changeTimes;
      };

      const onChangeA = jest.fn(updateChangeTimes);
      const onChangeB = jest.fn(updateChangeTimes);
      const onChangeC = jest.fn(updateChangeTimes);

      const buttonText = 'my button';

      const A = ({ children }: React.PropsWithChildren): React.ReactElement => {
        useUseCase(fileUseCase, {
          watch: {
            ext: onChangeA,
          },
        });

        return <Fragment>{children}</Fragment>;
      };

      const B = (): React.ReactElement => {
        useUseCase(fileUseCase, {
          watch: {
            ext: onChangeB,
          },
        });

        return <Fragment />;
      };

      const C = (): React.ReactElement => {
        const [, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, {
          watch: {
            ext: onChangeC,
          },
        });

        const onFirstClick = (): void => {
          setPath(PATH_1);
        };

        return (
          <Provider>
            <A>
              <B />
            </A>
            <button onClick={onFirstClick}>{buttonText}</button>
          </Provider>
        );
      };

      render(<C />);

      expect(changeTimes).toBe(0);
      fireEvent.click(screen.getByText(buttonText));
      expect(onChangeA).toHaveReturnedWith(2);
      expect(onChangeB).toHaveReturnedWith(1);
      expect(onChangeC).toHaveReturnedWith(3);
    });
  });
});
