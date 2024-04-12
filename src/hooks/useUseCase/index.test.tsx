import {
  objectUseCase,
  AsyncEntityGenerator,
  EntityGenerator,
  EntityReducers,
  Reducers,
  ObjectReducers,
  entityUseCase,
} from '@mic-rexjs/usecases';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { renderHook, act, render, fireEvent, screen } from '@testing-library/react';
import { useUseCase } from '.';
import { useDeepCompareEffect, useMemoizedFn, useMount, useUpdate, useUpdateEffect } from 'ahooks';
import { Dispatch, Fragment, useEffect, useRef, useState } from 'react';
import { RootCoreCollection } from './types';
import { UseCaseModes } from '@/enums/UseCaseModes';

interface TestFile {
  path: string;

  ext: string;

  size: number;
}

type TestReducers<T extends TestFile> = EntityReducers<
  T,
  {
    init<S extends T>(entity: S, newEntity: S): EntityGenerator<S, void>;

    setPath<S extends T>(entity: S, path: string): EntityGenerator<S, void>;

    readFile<S extends T>(entity: S, path: string): AsyncEntityGenerator<S, number>;

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

type StringReducers = EntityReducers<
  string,
  {
    add(entity: string, substring: string): string;
  }
>;

interface CommonProps {
  onUpdate?(): void;

  onPathChange?(path: string): void;
}

interface ParentProps extends CommonProps {
  mode?: UseCaseModes;

  onSetPath?(): string;

  children?: React.ReactNode;
}

interface ChildProps extends CommonProps {
  textPrefix?: string;

  onUndefinedEntity?(): void;
}

interface FileUseCaseOptions {
  pathPrefix?: string;

  onPathChange?(newPath: string, oldPath: string): void;
}

interface MathParentProps extends CommonProps, MathUseCaseOptions {}

const EXT_1 = '.png';
const EXT_2 = '.jpg';
const PATH_1 = `hello${EXT_1}`;
const PATH_2 = `hello${EXT_2}`;
const PARENT_BUTTON_TEXT = 'parent button';
const CHILD_BUTTON_TEXT = 'child button';

const defaultFile: TestFile = {
  path: '',
  ext: '',
  size: 0,
};

const fileUseCase = <T extends TestFile>(options: FileUseCaseOptions = {}): TestReducers<T> => {
  const entityReducers = objectUseCase<T>();
  const { pathPrefix = '', onPathChange } = options;

  const init = function* <S extends T>(entity: S, newEntity = defaultFile as S): EntityGenerator<S, void> {
    yield (): S => {
      return newEntity;
    };
  };

  const setPath = function* <S extends T>(entity: S, path: string): EntityGenerator<S, void> {
    const { path: oldPath } = entity;
    const newPath = pathPrefix + path;

    yield {
      ...entity,
      path: newPath,
      ext: path.match(/\.[^.]+$/)?.[0] || '',
    };

    onPathChange?.(newPath, oldPath);
  };

  const readFile = async function* <S extends T>(entity: S, path: string): AsyncEntityGenerator<S, number> {
    const size = 2000;

    yield* setPath(entity, path);
    await Promise.resolve(null);

    yield (oldEntity: S): S => {
      return {
        ...oldEntity,
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

const subtractionReducer = jest.fn((value1: number, value2: number): number => {
  return value1 - value2;
});

const mathUseCase = (options: MathUseCaseOptions = {}): MathReducers => {
  const { extraValue = 0 } = options;

  const add = (value1: number, value2: number): number => {
    return value1 + value2 + extraValue;
  };

  return { add, subtraction: subtractionReducer };
};

const Child = ({ textPrefix = '', onUpdate, onPathChange, onUndefinedEntity }: ChildProps): React.ReactElement => {
  const [file, { setPath }] = useUseCase(fileUseCase);
  const { path, ext } = file || {};

  const onClick = (): void => {
    setPath(PATH_2);
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

const Parent = ({ children, mode = UseCaseModes.Normal, onUpdate, onSetPath }: ParentProps): React.ReactElement => {
  const [{ path, ext }, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase, mode);

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
    deps,
  );
};

beforeEach((): void => {
  subtractionReducer.mockClear();
});

describe('useUseCase', (): void => {
  describe('`useUseCase` should work the same as `useRootCoreCollection`', (): void => {
    test('check context type', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;

      expect(Array.isArray(cores)).toBe(true);
      expect(cores).toHaveLength(3);
    });

    test('`entity` should equal `defaultFile`', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [entity] = cores;

      expect(entity).toBe(defaultFile);
    });

    test('`reducers` should be returned as an object', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [, reducers] = cores;

      expect(typeof reducers).toBe('object');
    });

    test('`Provider` should be returned as a function', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [, , Provider] = cores;

      expect(typeof Provider).toBe('function');
    });

    test('`usecase` should be called only once if deps has not provided', (): void => {
      const mockUseCase = jest.fn(fileUseCase);

      const { result, rerender } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, mockUseCase);
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      act((): void => {
        setEntity({
          ...defaultFile,
        });
      });

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    test('`usecase` should be called only once if deps has not changed', (): void => {
      const mockUseCase = jest.fn(fileUseCase);

      const { result, rerender } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, mockUseCase, {}, [1, 'x']);
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      act((): void => {
        setEntity({
          ...defaultFile,
        });
      });

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    test('`usecase` should be called if deps has changed', (): void => {
      let i = 0;
      const mockUseCase = jest.fn(fileUseCase);

      const { result, rerender } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, mockUseCase, {}, [i++, 'x']);
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      act((): void => {
        setEntity({
          ...defaultFile,
        });
      });

      expect(mockUseCase).toHaveBeenCalledTimes(2);

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(3);
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

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [entity, reducers] = cores;
      const { setPath, setEntity } = reducers;

      act((): void => {
        setPath(PATH_1);
        setEntity({ size: 5000 });
      });

      expect(result.current).not.toBe(cores);
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

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [entity, reducers] = cores;
      const { readFile } = reducers;

      const promise = act((): Promise<number> => {
        return readFile(PATH_1);
      });

      expect(result.current).toBe(cores);
      expect(result.current).toEqual(cores);
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

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: cores } = result;
      const [, reducers] = cores;
      const { init } = reducers;

      act((): void => {
        init({ ...defaultFile, size: 5000 });
      });

      expect(result.current[0].size).toBe(5000);
      expect(result.current[1]).not.toBe(reducers);
      expect(result.current[1].init).not.toBe(init);
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    test('reducer call should be cached if component is at rendering phase', (): void => {
      const buttonText = 'button';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const CacheTestComponent = (): React.ReactElement => {
        const [, { add }] = useUseCase('', stringUseCase);
        const update = useUpdate();

        const onClick = (): void => {
          update();
        };

        add('x');

        return <button onClick={onClick}>{buttonText}</button>;
      };

      render(<CacheTestComponent />);

      expect(addReducer).toHaveBeenCalledTimes(1);
      expect(addReducer).toHaveBeenCalledWith('', 'x');
      expect(addReducer).toHaveReturnedWith('x');

      fireEvent.click(screen.getByText(buttonText));
      expect(addReducer).toHaveBeenCalledTimes(1);
    });

    test('reducer call should not be cached if component is not at rendering phase', (): void => {
      const buttonText = 'button';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const CacheTestComponent = (): React.ReactElement => {
        const [, { add }] = useUseCase('', stringUseCase);

        const onClick = (): void => {
          add('x');
        };

        useMount((): void => {
          add('x');
          add('x');
        });

        return <button onClick={onClick}>{buttonText}</button>;
      };

      render(<CacheTestComponent />);

      expect(addReducer).toHaveBeenCalledTimes(2);
      expect(addReducer).toHaveBeenNthCalledWith(1, '', 'x');
      expect(addReducer).toHaveBeenNthCalledWith(2, '', 'x');

      fireEvent.click(screen.getByText(buttonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
      expect(addReducer).toHaveBeenNthCalledWith(3, '', 'x');
    });

    test('reducer call should not be cached if entity or parameters have changed', (): void => {
      let count = 0;
      let addedText = 'x';
      const setButtonText = 'button';
      const updateButtonText = 'update';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const CacheTestComponent = (): React.ReactElement => {
        const [, { add, setEntity }] = useUseCase('', stringUseCase);
        const update = useUpdate();

        add(addedText);

        const onSet = (): void => {
          setEntity(`${count++}`);
        };

        const onUpdate = (): void => {
          update();
        };

        return (
          <div>
            <button onClick={onSet}>{setButtonText}</button>
            <button onClick={onUpdate}>{updateButtonText}</button>
          </div>
        );
      };

      render(<CacheTestComponent />);

      expect(addReducer).toHaveBeenCalledTimes(1);
      expect(addReducer).toHaveBeenCalledWith('', 'x');

      fireEvent.click(screen.getByText(setButtonText));
      expect(addReducer).toHaveBeenCalledTimes(2);
      expect(addReducer).toHaveBeenCalledWith('0', 'x');
      expect(addReducer).toHaveReturnedWith('0x');

      addedText = 'y';
      fireEvent.click(screen.getByText(updateButtonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
      expect(addReducer).toHaveBeenCalledWith('0', 'y');
      expect(addReducer).toHaveReturnedWith('0y');

      fireEvent.click(screen.getByText(updateButtonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
    });

    test('`options.onChange` should be trigger when entity has changed', (): void => {
      const onChange = jest.fn<(newEntity: TestFile, oldEntity: TestFile) => void>();

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, { onChange });
      });

      const { current: cores } = result;
      const [, reducers] = cores;
      const { setPath } = reducers;

      expect(onChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith({ ...defaultFile, path: PATH_1, ext: EXT_1 }, defaultFile);
    });

    test('`options.onChange` should always trigger the latest one', (): void => {
      const onChange1 = jest.fn<(newEntity: TestFile, oldEntity: TestFile) => void>();
      const onChange2 = jest.fn<(newEntity: TestFile, oldEntity: TestFile) => void>();
      let onChange = onChange1;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, { onChange }, []);
      });

      const { current: cores } = result;
      const [, reducers] = cores;
      const { setPath } = reducers;

      expect(onChange1).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);

        onChange = onChange2;
      });

      expect(onChange2).toHaveBeenCalledTimes(0);
      expect(onChange1).toHaveBeenCalledTimes(1);
      expect(onChange1).toHaveBeenLastCalledWith({ ...defaultFile, path: PATH_1, ext: EXT_1 }, defaultFile);

      act((): void => {
        setPath(PATH_2);
      });

      expect(onChange1).toHaveBeenCalledTimes(1);
      expect(onChange2).toHaveBeenCalledTimes(1);

      expect(onChange2).toHaveBeenLastCalledWith(
        { ...defaultFile, path: PATH_2, ext: EXT_2 },
        { ...defaultFile, path: PATH_1, ext: EXT_1 },
      );
    });

    test('`options.options` should override rest options', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, {
          pathPrefix: 'xyz/',
          options: { pathPrefix: '123/' },
        });
      });

      const { current: cores } = result;
      const [{ path }, reducers] = cores;
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

    test(`should call latest functions of usecase options even deps has not change`, (): void => {
      const onPathChange1 = jest.fn();
      const onPathChange2 = jest.fn();
      let onPathChange = onPathChange1;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, { onPathChange });
      });

      const { current: context } = result;
      const [, { setPath }] = context;

      act((): void => {
        setPath(PATH_1);

        onPathChange = onPathChange2;
      });

      expect(onPathChange1).toHaveBeenCalledTimes(1);
      expect(onPathChange2).toHaveBeenCalledTimes(0);

      expect(onPathChange1).toHaveBeenLastCalledWith(PATH_1, '');

      act((): void => {
        setPath(PATH_2);
      });

      expect(onPathChange1).toHaveBeenCalledTimes(1);
      expect(onPathChange2).toHaveBeenCalledTimes(1);

      expect(onPathChange2).toHaveBeenLastCalledWith(PATH_2, PATH_1);
    });

    test('multiple `Provider` should work', (): void => {
      const onNumberMount = jest.fn();
      const onStringMount = jest.fn();
      const onBooleanMount = jest.fn();

      const numberUseCase = (): EntityReducers<number> => {
        return objectUseCase();
      };

      const stringUseCase = (): EntityReducers<string> => {
        return objectUseCase();
      };

      const booleanUseCase = (): EntityReducers<boolean> => {
        return objectUseCase();
      };

      const TestChildComponent = (): null => {
        const [numberValue] = useUseCase(numberUseCase);
        const [stringValue] = useUseCase(stringUseCase);
        const [booleanValue] = useUseCase(booleanUseCase);

        useMount((): void => {
          onNumberMount(numberValue);
          onStringMount(stringValue);
          onBooleanMount(booleanValue);
        });

        return null;
      };

      const TestParentComponent = (): React.ReactElement => {
        const [, , NumberProvider] = useUseCase(11, numberUseCase);
        const [, , StringProvider] = useUseCase('hello', stringUseCase);
        const [, , BooleanProvider] = useUseCase(true, booleanUseCase);

        return (
          <NumberProvider with={[StringProvider, BooleanProvider]}>
            <TestChildComponent />
          </NumberProvider>
        );
      };

      render(<TestParentComponent />);

      expect(onNumberMount).toHaveBeenCalledWith(11);
      expect(onStringMount).toHaveBeenCalledWith('hello');
      expect(onBooleanMount).toHaveBeenCalledWith(true);
    });
  });

  describe('`useUseCase` should work the same as `ModeCoreCollectionHook`', (): void => {
    test.each([UseCaseModes.Normal, UseCaseModes.Stateless])(
      '[mode=%s]: check context type',
      (mode: UseCaseModes): void => {
        const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
          return useUseCase(defaultFile, fileUseCase, mode);
        });

        const { current: cores } = result;

        expect(Array.isArray(cores)).toBe(true);
        expect(cores).toHaveLength(3);
      },
    );

    test('stateless mode should not generate new reducers when `yeild entity`', (): void => {
      const onUpdate = jest.fn();

      const { result, rerender } = renderHook(
        (file: TestFile = defaultFile): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
          useUpdateEffect((): void => {
            onUpdate();
          });

          return useUseCase(file, fileUseCase, UseCaseModes.Stateless);
        },
      );

      const { current: cores } = result;
      const [, { setPath }] = cores;

      setPath(PATH_1);
      expect(onUpdate).toHaveBeenCalledTimes(0);

      expect(result.current[0].path).toBe('');
      expect(result.current[1].setPath).toBe(setPath);

      rerender({ ...defaultFile, path: PATH_1 });

      expect(result.current[0].path).toBe(PATH_1);
      expect(result.current[1].setPath).not.toBe(setPath);
    });

    test('stateless mode should not trigger update when after `yield entity`', (): void => {
      const onUpdate = jest.fn();

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        useUpdateEffect((): void => {
          onUpdate();
        });

        return useUseCase(defaultFile, fileUseCase, UseCaseModes.Stateless);
      });

      const { current: cores } = result;
      const [, reducers] = cores;
      const { setPath } = reducers;

      act((): void => {
        setPath(PATH_1);
      });

      expect(result.current).toBe(cores);
      expect(result.current).toEqual(cores);
      expect(onUpdate).toHaveBeenCalledTimes(0);
    });
  });

  describe('`useUseCase` should work the same as useContextualCoreCollection', (): void => {
    test.each([void 0, UseCaseModes.Normal])(
      '[mode=%s]: normal mode should trigger Parent & Child to update',
      (mode?: UseCaseModes): void => {
        const onParentUpdate = jest.fn();
        const onChildUpdate = jest.fn();
        const onPathChange = jest.fn();
        const onUndefinedEntity = jest.fn();

        const onSetPath = jest.fn((): string => {
          return PATH_1;
        });

        render(
          <div>
            <Parent mode={mode} onSetPath={onSetPath} onUpdate={onParentUpdate}>
              <Child onUpdate={onChildUpdate} onPathChange={onPathChange} onUndefinedEntity={onUndefinedEntity} />
            </Parent>
          </div>,
        );

        fireEvent.click(screen.getByText(PARENT_BUTTON_TEXT));
        expect(onSetPath).toHaveBeenCalledTimes(1);
        expect(onParentUpdate).toHaveBeenCalledTimes(1);
        expect(onChildUpdate).toHaveBeenCalledTimes(1);
        expect(onPathChange).toHaveBeenCalledWith(PATH_1);

        fireEvent.click(screen.getByText(CHILD_BUTTON_TEXT));
        expect(onSetPath).toHaveBeenCalledTimes(1);
        expect(onParentUpdate).toHaveBeenCalledTimes(2);
        expect(onChildUpdate).toHaveBeenCalledTimes(2);
        expect(onPathChange).toHaveBeenCalledWith(PATH_2);
        expect(onUndefinedEntity).toHaveBeenCalledTimes(0);
      },
    );

    test.each([UseCaseModes.Stateless])(
      '[mode=%s]: stateless mode should not trigger Parent & Child to update',
      (): void => {
        const onParentUpdate = jest.fn();
        const onChildUpdate = jest.fn();

        const onSetPath = jest.fn((): string => {
          return PATH_1;
        });

        render(
          <div>
            <Parent mode={UseCaseModes.Stateless} onSetPath={onSetPath} onUpdate={onParentUpdate}>
              <Child onUpdate={onChildUpdate} />
            </Parent>
          </div>,
        );

        fireEvent.click(screen.getByText(PARENT_BUTTON_TEXT));
        expect(onSetPath).toHaveBeenCalledTimes(1);
        expect(onParentUpdate).toHaveBeenCalledTimes(0);
        expect(onChildUpdate).toHaveBeenCalledTimes(0);

        fireEvent.click(screen.getByText(CHILD_BUTTON_TEXT));
        expect(onSetPath).toHaveBeenCalledTimes(1);
        expect(onParentUpdate).toHaveBeenCalledTimes(0);
        expect(onChildUpdate).toHaveBeenCalledTimes(0);
      },
    );

    test('`usecase` should not be called at child component', (): void => {
      const mockUseCase = jest.fn(fileUseCase);

      const A = (): React.ReactElement => {
        useUseCase(mockUseCase);
        return <Fragment />;
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase(defaultFile, mockUseCase);

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    test('reducer call should be cached if component is at rendering phase in child components', (): void => {
      const buttonText = 'button';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const A = (): React.ReactElement => {
        const [, { add }] = useUseCase(stringUseCase);
        const update = useUpdate();

        const onClick = (): void => {
          update();
        };

        add('x');

        return <button onClick={onClick}>{buttonText}</button>;
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase('', stringUseCase);

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);

      expect(addReducer).toHaveBeenCalledTimes(1);
      expect(addReducer).toHaveBeenCalledWith('', 'x');
      expect(addReducer).toHaveReturnedWith('x');

      fireEvent.click(screen.getByText(buttonText));
      expect(addReducer).toHaveBeenCalledTimes(1);
    });

    test('reducer call should not be cached if component is not at rendering phase in child components', (): void => {
      const buttonText = 'button';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const A = (): React.ReactElement => {
        const [, { add }] = useUseCase(stringUseCase);

        const onClick = (): void => {
          add('x');
        };

        useMount((): void => {
          add('x');
          add('x');
        });

        return <button onClick={onClick}>{buttonText}</button>;
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase('', stringUseCase);

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);

      expect(addReducer).toHaveBeenCalledTimes(2);
      expect(addReducer).toHaveBeenNthCalledWith(1, '', 'x');
      expect(addReducer).toHaveBeenNthCalledWith(2, '', 'x');

      fireEvent.click(screen.getByText(buttonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
      expect(addReducer).toHaveBeenNthCalledWith(3, '', 'x');
    });

    test('reducer call should not be cached if entity or parameters have changed in child components', (): void => {
      let count = 0;
      let addedText = 'x';
      const setButtonText = 'button';
      const updateButtonText = 'update';

      const addReducer = jest.fn((entity: string, substring: string): string => {
        return entity + substring;
      });

      const stringUseCase = (): StringReducers => {
        const entityReducers = entityUseCase<string>();

        return {
          ...entityReducers,
          add: addReducer,
        };
      };

      const A = (): React.ReactElement => {
        const [, { add, setEntity }] = useUseCase(stringUseCase);
        const update = useUpdate();

        add(addedText);

        const onSet = (): void => {
          setEntity(`${count++}`);
        };

        const onUpdate = (): void => {
          update();
        };

        return (
          <div>
            <button onClick={onSet}>{setButtonText}</button>
            <button onClick={onUpdate}>{updateButtonText}</button>
          </div>
        );
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase('', stringUseCase);

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);

      expect(addReducer).toHaveBeenCalledTimes(1);
      expect(addReducer).toHaveBeenCalledWith('', 'x');

      fireEvent.click(screen.getByText(setButtonText));
      expect(addReducer).toHaveBeenCalledTimes(2);
      expect(addReducer).toHaveBeenCalledWith('0', 'x');
      expect(addReducer).toHaveReturnedWith('0x');

      addedText = 'y';
      fireEvent.click(screen.getByText(updateButtonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
      expect(addReducer).toHaveBeenCalledWith('0', 'y');
      expect(addReducer).toHaveReturnedWith('0y');

      fireEvent.click(screen.getByText(updateButtonText));
      expect(addReducer).toHaveBeenCalledTimes(3);
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

    test.each([UseCaseModes.Normal, UseCaseModes.Stateless])(
      '[mode=%s]: `options.onChange` should always trigger the latest one in child components',
      (mode: UseCaseModes): void => {
        const onFirstChange = jest.fn<(newEntity: TestFile, oldEntity: TestFile) => void>();
        const onSecondChange = jest.fn<(newEntity: TestFile, oldEntity: TestFile) => void>();

        let onChange = onFirstChange;
        const firstButtonText = 'first button';
        const secondButtonText = 'second button';

        const A = (): React.ReactElement => {
          const [, { setPath }] = useUseCase(fileUseCase, {
            onChange,
          });

          const onFirstClick = (): void => {
            setPath(PATH_1);

            onChange = onSecondChange;
          };

          const onSecondClick = (): void => {
            setPath('');
          };

          return (
            <Fragment>
              <button onClick={onFirstClick}>{firstButtonText}</button>
              <button onClick={onSecondClick}>{secondButtonText}</button>
            </Fragment>
          );
        };

        const B = (): React.ReactElement => {
          const [file, setFile] = useState(defaultFile);

          const [, , Provider] = useUseCase(file, fileUseCase, mode, {
            onChange(newFile: TestFile): void {
              if ((mode & UseCaseModes.Stateless) !== UseCaseModes.Stateless) {
                return;
              }

              // `stateless` 不会保存状态，所以需要手动保存
              setFile(newFile);
            },
          });

          return (
            <Provider>
              <A />
            </Provider>
          );
        };

        render(<B />);

        expect(onFirstChange).toHaveBeenCalledTimes(0);

        fireEvent.click(screen.getByText(firstButtonText));
        expect(onFirstChange).toHaveBeenCalledTimes(1);
        expect(onSecondChange).toHaveBeenCalledTimes(0);

        fireEvent.click(screen.getByText(secondButtonText));
        expect(onFirstChange).toHaveBeenCalledTimes(1);
        expect(onSecondChange).toHaveBeenCalledTimes(1);

        expect(onSecondChange).toHaveBeenLastCalledWith(defaultFile, { ...defaultFile, ext: EXT_1, path: PATH_1 });
      },
    );
  });

  describe('`useUseCase` should work the same as `useReducers`', (): void => {
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

    test('`usecase` should be called only once if deps has not provided', (): void => {
      const mockUseCase = jest.fn(mathUseCase);

      const { rerender } = renderHook((): MathReducers => {
        return useUseCase(mockUseCase);
      });

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    test('`usecase` should be called only once if deps has not changed', (): void => {
      const mockUseCase = jest.fn(mathUseCase);

      const { rerender } = renderHook((): MathReducers => {
        return useUseCase(mockUseCase, {}, [1, 'x']);
      });

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(1);
    });

    test('`usecase` should be called if deps has changed', (): void => {
      let i = 0;
      const mockUseCase = jest.fn(mathUseCase);

      const { rerender } = renderHook((): MathReducers => {
        return useUseCase(mockUseCase, {}, [i++, 'x']);
      });

      expect(mockUseCase).toHaveBeenCalledTimes(1);

      rerender();
      expect(mockUseCase).toHaveBeenCalledTimes(2);
    });

    test('reducer call should not be cached if component is at rendering phase', (): void => {
      const buttonText = 'button';

      const CacheTestComponent = (): React.ReactElement => {
        const { subtraction } = useUseCase(mathUseCase);
        const update = useUpdate();

        const onClick = (): void => {
          update();
        };

        subtraction(5, 3);

        return <button onClick={onClick}>{buttonText}</button>;
      };

      render(<CacheTestComponent />);

      expect(subtractionReducer).toHaveBeenCalledTimes(1);
      expect(subtractionReducer).toHaveBeenCalledWith(5, 3);
      expect(subtractionReducer).toHaveReturnedWith(2);

      fireEvent.click(screen.getByText(buttonText));
      expect(subtractionReducer).toHaveBeenCalledTimes(2);

      fireEvent.click(screen.getByText(buttonText));
      expect(subtractionReducer).toHaveBeenCalledTimes(3);
    });

    test('reducer call should not be cached if component is not at rendering phase', (): void => {
      const buttonText = 'button';

      const CacheTestComponent = (): React.ReactElement => {
        const { subtraction } = useUseCase(mathUseCase);

        const onClick = (): void => {
          subtraction(5, 3);
        };

        useMount((): void => {
          subtraction(5, 3);
          subtraction(5, 3);
        });

        return <button onClick={onClick}>{buttonText}</button>;
      };

      render(<CacheTestComponent />);

      expect(subtractionReducer).toHaveBeenCalledTimes(2);
      expect(subtractionReducer).toHaveBeenNthCalledWith(1, 5, 3);
      expect(subtractionReducer).toHaveNthReturnedWith(1, 2);
      expect(subtractionReducer).toHaveBeenNthCalledWith(2, 5, 3);
      expect(subtractionReducer).toHaveNthReturnedWith(2, 2);

      fireEvent.click(screen.getByText(buttonText));
      expect(subtractionReducer).toHaveBeenCalledTimes(3);
      expect(subtractionReducer).toHaveBeenNthCalledWith(3, 5, 3);
      expect(subtractionReducer).toHaveNthReturnedWith(3, 2);
    });

    test('reducer call should not be cached if parameters have changed', (): void => {
      let count = 0;
      const buttonText = 'button';

      const StringUseCaseTestComponent = (): React.ReactElement => {
        const { subtraction } = useUseCase(mathUseCase);
        const update = useUpdate();

        subtraction(5, count++);

        const onUpdate = (): void => {
          update();
        };

        return (
          <div>
            <button onClick={onUpdate}>{buttonText}</button>
          </div>
        );
      };

      render(<StringUseCaseTestComponent />);

      expect(subtractionReducer).toHaveBeenCalledTimes(1);
      expect(subtractionReducer).toHaveBeenCalledWith(5, 0);

      fireEvent.click(screen.getByText(buttonText));
      expect(subtractionReducer).toHaveBeenCalledTimes(2);
      expect(subtractionReducer).toHaveBeenCalledWith(5, 1);
      expect(subtractionReducer).toHaveReturnedWith(4);
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
});
