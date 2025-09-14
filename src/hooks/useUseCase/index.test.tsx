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
import { EntityWatchEvent, RootCoreCollection } from './types';

interface TestFieldPathData {
  list?: TestFile[];

  nestedList?: TestFile[][][];

  obj?: Record<'file', Partial<TestFile>>;
}

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

type FiledPathReducers<T extends TestFieldPathData> = EntityReducers<T, Record<never, never>>;

interface CommonProps {
  onUpdate?(): void;

  onPathChange?(path: string): void;
}

interface ParentProps extends CommonProps {
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

const fieldPathUseCase = <T extends TestFieldPathData>(): FiledPathReducers<T> => {
  return objectUseCase();
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

const Parent = ({ children, onUpdate, onSetPath }: ParentProps): React.ReactElement => {
  const [{ path, ext }, { setPath }, Provider] = useUseCase(defaultFile, fileUseCase);

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

    test('Should return the `EntityStore.value` if root entity has not changed', (): void => {
      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase);
      });

      const { current: collection } = result;
      const [, { setPath }] = collection;

      act((): void => {
        setPath(PATH_1);
      });

      expect(result.current[0]).toEqual({ ...defaultFile, path: PATH_1, ext: EXT_1 });
    });

    test('Should return the root entity if root entity has changed', (): void => {
      let file = defaultFile;

      const { result, rerender } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(file, fileUseCase);
      });

      file = { ...defaultFile, path: PATH_2 };

      rerender();
      expect(result.current[0]).toEqual({ ...defaultFile, path: PATH_2 });
      // 渲染多一次，避免第二次渲染的 `entity` 没变化而取错缓存的情况
      rerender();
      expect(result.current[0]).toEqual({ ...defaultFile, path: PATH_2 });
    });

    test('Should return the root entity if root entity has changed even with entity state changed', (): void => {
      let file = defaultFile;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(file, fileUseCase);
      });

      const { current: collection } = result;
      const [, { setPath }] = collection;

      act((): void => {
        file = { ...defaultFile, path: PATH_2 };
        setPath(PATH_1);
      });

      expect(result.current[0]).toEqual({ ...defaultFile, path: PATH_2 });
    });

    test('Should support entity getter', (): void => {
      const file = defaultFile;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase((): TestFile => {
          return file;
        }, fileUseCase);
      });

      const {
        current: [currentFile],
      } = result;

      expect(currentFile).toEqual(file);
    });

    test('Entity getter should provide the first argument with current entity when deps has change.', (): void => {
      let entityArg;
      const file = defaultFile;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(
          (entity: TestFile = file): TestFile => {
            const { path } = entity;

            entityArg = entity;

            return {
              ...entity,
              path: path + '1',
            };
          },
          fileUseCase,
          {},
          [Date.now()],
        );
      });

      const { current: collection1 } = result;
      const [currentFile1, { setPath }] = collection1;

      expect(entityArg).toEqual(defaultFile);
      expect(currentFile1).toEqual({ ...defaultFile, path: '1' });

      act((): void => {
        setPath('2');
      });

      const { current: collection2 } = result;
      const [currentFile2] = collection2;

      expect(entityArg).toEqual({ ...defaultFile, path: '2' });
      expect(currentFile2).toEqual({ ...defaultFile, path: '21' });
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

    test('`options.watch` should be trigger after entity changed', (): void => {
      const onPathChange = jest.fn<(event: EntityWatchEvent<TestFile, string>) => void>();
      const onSizeChange = jest.fn();

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, {
          watch: {
            path: onPathChange,
            size: onSizeChange,
          },
        });
      });

      const { current: cores } = result;
      const [, { setPath }] = cores;

      expect(onPathChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);
      });

      expect(onPathChange).toHaveBeenCalledTimes(1);
      expect(onSizeChange).toHaveBeenCalledTimes(0);

      expect(onPathChange).toHaveBeenLastCalledWith({
        fieldPaths: ['path'],
        newEntity: { ...defaultFile, path: PATH_1, ext: EXT_1 },
        oldEntity: defaultFile,
        newValue: PATH_1,
        oldValue: '',
      });
    });

    test('`options.watch` should trigger the latest one', (): void => {
      const onPathChange1 = jest.fn();
      const onPathChange2 = jest.fn();
      let onPathChange = onPathChange1;

      const { result } = renderHook((): RootCoreCollection<TestFile, TestReducers<TestFile>> => {
        return useUseCase(defaultFile, fileUseCase, {
          watch: {
            path: onPathChange,
          },
        });
      });

      const { current: cores } = result;
      const [, { setPath, setEntity }] = cores;

      expect(onPathChange1).toHaveBeenCalledTimes(0);

      act((): void => {
        setPath(PATH_1);
        setEntity({ size: 5000 });

        onPathChange = onPathChange2;
      });

      expect(onPathChange1).toHaveBeenCalledTimes(1);

      expect(onPathChange1).toHaveBeenLastCalledWith({
        fieldPaths: ['path'],
        newEntity: { ...defaultFile, path: PATH_1, ext: EXT_1 },
        oldEntity: defaultFile,
        newValue: PATH_1,
        oldValue: '',
      });

      act((): void => {
        setPath('');
      });

      expect(onPathChange1).toHaveBeenCalledTimes(1);
      expect(onPathChange2).toHaveBeenCalledTimes(1);

      expect(onPathChange2).toHaveBeenLastCalledWith({
        fieldPaths: ['path'],
        newEntity: { ...defaultFile, size: 5000 },
        oldEntity: { ...defaultFile, path: PATH_1, ext: EXT_1, size: 5000 },
        newValue: '',
        oldValue: PATH_1,
      });
    });

    test('`options.watch` should work with array field path of array', (): void => {
      const initialData: TestFieldPathData = {};
      const onExtChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, string>) => void>();
      const onSizeChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, number>) => void>();

      const { result } = renderHook((): RootCoreCollection<TestFieldPathData, FiledPathReducers<TestFieldPathData>> => {
        return useUseCase(initialData, fieldPathUseCase, {
          watch: {
            'list.ext': onExtChange,
            'list.size': onSizeChange,
          },
        });
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      act((): void => {
        setEntity({ list: [defaultFile] });
      });

      expect(onExtChange).toHaveBeenCalledTimes(1);
      expect(onSizeChange).toHaveBeenCalledTimes(1);

      expect(onExtChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '0', 'ext'],
        newEntity: { list: [defaultFile] },
        oldEntity: {},
        newValue: '',
        oldValue: void 0,
      });

      expect(onSizeChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '0', 'size'],
        newEntity: { list: [defaultFile] },
        oldEntity: {},
        newValue: 0,
        oldValue: void 0,
      });

      act((): void => {
        setEntity({ list: [{ ...defaultFile, ext: EXT_1 }] });
      });

      expect(onExtChange).toHaveBeenCalledTimes(2);
      expect(onSizeChange).toHaveBeenCalledTimes(1);

      expect(onExtChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '0', 'ext'],
        newEntity: { list: [{ ...defaultFile, ext: EXT_1 }] },
        oldEntity: { list: [defaultFile] },
        newValue: EXT_1,
        oldValue: '',
      });

      act((): void => {
        setEntity({
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(3);
      expect(onSizeChange).toHaveBeenCalledTimes(2);

      expect(onExtChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '1', 'ext'],
        newEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
        },
        oldEntity: { list: [{ ...defaultFile, ext: EXT_1 }] },
        newValue: EXT_2,
        oldValue: void 0,
      });

      expect(onSizeChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '1', 'size'],
        newEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
        },
        oldEntity: { list: [{ ...defaultFile, ext: EXT_1 }] },
        newValue: 0,
        oldValue: void 0,
      });

      act((): void => {
        setEntity({
          nestedList: [],
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(3);
      expect(onSizeChange).toHaveBeenCalledTimes(2);

      act((): void => {
        setEntity((): TestFieldPathData => {
          return {
            list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
          };
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(6);
      expect(onSizeChange).toHaveBeenCalledTimes(3);

      expect(onExtChange).toHaveBeenNthCalledWith(4, {
        fieldPaths: ['list', '0', 'ext'],
        newEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        oldEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
          nestedList: [],
        },
        newValue: EXT_2,
        oldValue: EXT_1,
      });

      expect(onExtChange).toHaveBeenNthCalledWith(5, {
        fieldPaths: ['list', '1', 'ext'],
        newEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        oldEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
          nestedList: [],
        },
        newValue: EXT_1,
        oldValue: EXT_2,
      });

      expect(onExtChange).toHaveBeenNthCalledWith(6, {
        fieldPaths: ['list', '2', 'ext'],
        newEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        oldEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
          nestedList: [],
        },
        newValue: '',
        oldValue: void 0,
      });

      expect(onSizeChange).toHaveBeenCalledWith({
        fieldPaths: ['list', '2', 'size'],
        newEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        oldEntity: {
          list: [
            { ...defaultFile, ext: EXT_1 },
            { ...defaultFile, ext: EXT_2 },
          ],
          nestedList: [],
        },
        newValue: 0,
        oldValue: void 0,
      });

      act((): void => {
        setEntity((): TestFieldPathData => {
          return {};
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(9);
      expect(onSizeChange).toHaveBeenCalledTimes(6);

      expect(onExtChange).toHaveBeenNthCalledWith(7, {
        fieldPaths: ['list', '0', 'ext'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: EXT_2,
      });

      expect(onExtChange).toHaveBeenNthCalledWith(8, {
        fieldPaths: ['list', '1', 'ext'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: EXT_1,
      });

      expect(onExtChange).toHaveBeenNthCalledWith(9, {
        fieldPaths: ['list', '2', 'ext'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: '',
      });

      expect(onSizeChange).toHaveBeenNthCalledWith(4, {
        fieldPaths: ['list', '0', 'size'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: 0,
      });

      expect(onSizeChange).toHaveBeenNthCalledWith(5, {
        fieldPaths: ['list', '1', 'size'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: 0,
      });

      expect(onSizeChange).toHaveBeenNthCalledWith(6, {
        fieldPaths: ['list', '2', 'size'],
        newEntity: {},
        oldEntity: {
          list: [{ ...defaultFile, ext: EXT_2 }, { ...defaultFile, ext: EXT_1 }, defaultFile],
        },
        newValue: void 0,
        oldValue: 0,
      });
    });

    test('`options.watch` should work with field path of array length', (): void => {
      const onEntityLengthChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, number>) => void>();
      const onListLengthChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, number>) => void>();

      const lengthUseCase = (): EntityReducers<TestFieldPathData[]> => {
        return entityUseCase();
      };

      const { result } = renderHook(
        (): RootCoreCollection<TestFieldPathData[], EntityReducers<TestFieldPathData[]>> => {
          return useUseCase([] as TestFieldPathData[], lengthUseCase, {
            watch: {
              length: onEntityLengthChange,
              'list.length': onListLengthChange,
            },
          });
        },
      );

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(onEntityLengthChange).toHaveBeenCalledTimes(0);
      expect(onListLengthChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setEntity([{ list: [defaultFile, defaultFile] }]);
      });

      expect(onEntityLengthChange).toHaveBeenCalledTimes(1);
      expect(onListLengthChange).toHaveBeenCalledTimes(1);

      expect(onEntityLengthChange).toHaveBeenCalledWith({
        fieldPaths: ['length'],
        newEntity: [{ list: [defaultFile, defaultFile] }],
        oldEntity: [],
        newValue: 1,
        oldValue: 0,
      });

      expect(onListLengthChange).toHaveBeenCalledWith({
        fieldPaths: ['0', 'list', 'length'],
        newEntity: [{ list: [defaultFile, defaultFile] }],
        oldEntity: [],
        newValue: 2,
        oldValue: void 0,
      });
    });

    test('`options.watch` should work with field path of nested array', (): void => {
      const initialData: TestFieldPathData = {};
      const onChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, number>) => void>();

      const { result } = renderHook((): RootCoreCollection<TestFieldPathData, EntityReducers<TestFieldPathData>> => {
        return useUseCase(initialData, fieldPathUseCase, {
          watch: {
            'nestedList.size': onChange,
          },
        });
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(onChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setEntity({ nestedList: [[[defaultFile]]] });
      });

      expect(onChange).toHaveBeenCalledTimes(1);

      expect(onChange).toHaveBeenCalledWith({
        fieldPaths: ['nestedList', '0', '0', '0', 'size'],
        newEntity: { nestedList: [[[defaultFile]]] },
        oldEntity: {},
        newValue: 0,
        oldValue: void 0,
      });

      act((): void => {
        setEntity({
          nestedList: [
            [
              [
                { ...defaultFile, size: 100 },
                { ...defaultFile, size: 200 },
              ],
            ],
            [[{ ...defaultFile, size: 300 }]],
          ],
        });
      });

      expect(onChange).toHaveBeenCalledTimes(4);

      expect(onChange).toHaveBeenNthCalledWith(2, {
        fieldPaths: ['nestedList', '0', '0', '0', 'size'],
        newEntity: {
          nestedList: [
            [
              [
                { ...defaultFile, size: 100 },
                { ...defaultFile, size: 200 },
              ],
            ],
            [[{ ...defaultFile, size: 300 }]],
          ],
        },
        oldEntity: { nestedList: [[[defaultFile]]] },
        newValue: 100,
        oldValue: 0,
      });

      expect(onChange).toHaveBeenNthCalledWith(3, {
        fieldPaths: ['nestedList', '0', '0', '1', 'size'],
        newEntity: {
          nestedList: [
            [
              [
                { ...defaultFile, size: 100 },
                { ...defaultFile, size: 200 },
              ],
            ],
            [[{ ...defaultFile, size: 300 }]],
          ],
        },
        oldEntity: { nestedList: [[[defaultFile]]] },
        newValue: 200,
        oldValue: void 0,
      });

      expect(onChange).toHaveBeenNthCalledWith(4, {
        fieldPaths: ['nestedList', '1', '0', '0', 'size'],
        newEntity: {
          nestedList: [
            [
              [
                { ...defaultFile, size: 100 },
                { ...defaultFile, size: 200 },
              ],
            ],
            [[{ ...defaultFile, size: 300 }]],
          ],
        },
        oldEntity: { nestedList: [[[defaultFile]]] },
        newValue: 300,
        oldValue: void 0,
      });
    });

    test('`options.watch` should work with field path of object', (): void => {
      const initialData: TestFieldPathData = {};
      const onExtChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, string | undefined>) => void>();
      const onSizeChange = jest.fn<(event: EntityWatchEvent<TestFieldPathData, number | undefined>) => void>();

      const { result } = renderHook((): RootCoreCollection<TestFieldPathData, EntityReducers<TestFieldPathData>> => {
        return useUseCase(initialData, fieldPathUseCase, {
          watch: {
            'obj.file.ext': onExtChange,
            'obj.file.size': onSizeChange,
          },
        });
      });

      const { current: cores } = result;
      const [, { setEntity }] = cores;

      expect(onExtChange).toHaveBeenCalledTimes(0);

      act((): void => {
        setEntity({
          obj: {
            file: {
              ext: EXT_1,
            },
          },
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(1);
      expect(onSizeChange).toHaveBeenCalledTimes(0);

      expect(onExtChange).toHaveBeenCalledWith({
        fieldPaths: ['obj', 'file', 'ext'],
        newEntity: {
          obj: {
            file: {
              ext: EXT_1,
            },
          },
        },
        oldEntity: {},
        newValue: EXT_1,
        oldValue: void 0,
      });

      act((): void => {
        setEntity((): TestFieldPathData => {
          return {};
        });
      });

      expect(onExtChange).toHaveBeenCalledTimes(2);
      expect(onSizeChange).toHaveBeenCalledTimes(0);

      expect(onExtChange).toHaveBeenCalledWith({
        fieldPaths: ['obj', 'file', 'ext'],
        newEntity: {},
        oldEntity: {
          obj: {
            file: {
              ext: EXT_1,
            },
          },
        },
        newValue: void 0,
        oldValue: EXT_1,
      });
    });

    test('multiple `Provider` should work', (): void => {
      const onNumberMount = jest.fn();
      const onStringMount = jest.fn();
      const onBooleanMount = jest.fn();

      const numberUseCase = (): EntityReducers<number> => {
        return entityUseCase();
      };

      const stringUseCase = (): EntityReducers<string> => {
        return entityUseCase();
      };

      const booleanUseCase = (): EntityReducers<boolean> => {
        return entityUseCase();
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

  describe('`useUseCase` should work the same as `useContextualCoreCollection`', (): void => {
    test('Should trigger Parent & Child to update', (): void => {
      const onParentUpdate = jest.fn();
      const onChildUpdate = jest.fn();
      const onPathChange = jest.fn();
      const onUndefinedEntity = jest.fn();

      const onSetPath = jest.fn((): string => {
        return PATH_1;
      });

      render(
        <div>
          <Parent onSetPath={onSetPath} onUpdate={onParentUpdate}>
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
    });

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
      expect(onChangeB).toHaveReturnedWith(3);
      expect(onChangeC).toHaveReturnedWith(1);
    });

    test('`options.onChange` should always trigger the latest one in child components', (): void => {
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
        const [, , Provider] = useUseCase(defaultFile, fileUseCase);

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
    });

    test('`options.watch` should be trigger at child elements', (): void => {
      const onExtChange = jest.fn<(event: EntityWatchEvent<TestFile, string>) => void>();
      const firstButtonText = 'first button';

      const A = (): React.ReactElement => {
        const [, { setPath }] = useUseCase(fileUseCase, {
          watch: {
            ext: onExtChange,
          },
        });

        const onFirstClick = (): void => {
          setPath(PATH_1);
        };

        return <button onClick={onFirstClick}>{firstButtonText}</button>;
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase(defaultFile, fileUseCase, {});

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);

      expect(onExtChange).toHaveBeenCalledTimes(0);

      fireEvent.click(screen.getByText(firstButtonText));
      expect(onExtChange).toHaveBeenCalledTimes(1);

      expect(onExtChange).toHaveBeenLastCalledWith({
        fieldPaths: ['ext'],
        newEntity: { ...defaultFile, ext: EXT_1, path: PATH_1 },
        oldEntity: defaultFile,
        newValue: EXT_1,
        oldValue: '',
      });
    });

    test('`options.watch` should be trigger in orders', (): void => {
      let changeTimes = 0;

      const updateChangeTimes = (e: EntityWatchEvent<TestFile, string>): number => {
        void e;
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
      expect(onChangeB).toHaveReturnedWith(3);
      expect(onChangeC).toHaveReturnedWith(1);
    });

    test('`options.watch` should trigger the latest one in child components', (): void => {
      const onFirstExtChange = jest.fn<(event: EntityWatchEvent<TestFile, string>) => void>();
      const onSecondExtChange = jest.fn<(event: EntityWatchEvent<TestFile, string>) => void>();
      let onExtChange = onFirstExtChange;
      const firstButtonText = 'first button';
      const secondButtonText = 'second button';

      const A = (): React.ReactElement => {
        const [, { setPath }] = useUseCase(fileUseCase, {
          watch: {
            ext: onExtChange,
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
          <Fragment>
            <button onClick={onFirstClick}>{firstButtonText}</button>
            <button onClick={onSecondClick}>{secondButtonText}</button>
          </Fragment>
        );
      };

      const B = (): React.ReactElement => {
        const [, , Provider] = useUseCase(defaultFile, fileUseCase);

        return (
          <Provider>
            <A />
          </Provider>
        );
      };

      render(<B />);

      expect(onFirstExtChange).toHaveBeenCalledTimes(0);

      fireEvent.click(screen.getByText(firstButtonText));
      expect(onFirstExtChange).toHaveBeenCalledTimes(1);
      expect(onSecondExtChange).toHaveBeenCalledTimes(0);

      fireEvent.click(screen.getByText(secondButtonText));
      expect(onFirstExtChange).toHaveBeenCalledTimes(1);
      expect(onSecondExtChange).toHaveBeenCalledTimes(1);

      expect(onSecondExtChange).toHaveBeenLastCalledWith({
        fieldPaths: ['ext'],
        newEntity: defaultFile,
        oldEntity: { ...defaultFile, ext: EXT_1, path: PATH_1 },
        newValue: '',
        oldValue: EXT_1,
      });
    });
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
