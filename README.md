## Description
React-based solution for use usecases of Clean Architecture.

## Install
```bash
$ npm install --save @mic-rexjs/usecases-react
# -
$ yarn add --dev @mic-rexjs/usecases-react
```

## Links
- [Usage with Non-Entity Mode](#usage-with-non-entity-mode)
- [Useage with Entity Mode](#useage-with-entity-mode)
- [Test Demos](#test-demos)

## Usage with Non-Entity Mode
```tsx
// a.ts
import { Reducers } from '@mic-rexjs/usecases';

type MathReducers = Reducers<{
  add(value1: number, value2: number): number;

  subtraction(value1: number, value2: number): number;
}>;

const mathUseCase = (): MathReducers => {
  const add = (value1: number, value2: number): number => {
    return value1 + value2;
  };

  const subtraction = (value1: number, value2: number): number => {
    return value1 - value2;
  };

  return { add, subtraction };
};

// b.tsx
const MyComponent = (): React.ReactElement => {
	const { add, subtraction } = useUseCase(mathUseCase);

	// you can use these reducers any where, and they will be never updated.
	add(1, 2);
	subtraction(5, 3);

	// ...
};
```

## Useage with Entity Mode
```tsx
// a.ts
import {
	objectUseCase,
	ObjectReducers,
	EntityGenerator,
	EntityReducers
} from '@mic-rexjs/usecases';

interface File {
  path: string;
  content: string;
}

interface FileUseCaseOptions {
  maxContentLength?: number;
}

// All reducers should provide the first argument with an entity type T, such as `file: T`.
type FileReducers<T extends File> = EntityReducers<
  T,
  {
    writeFile(entity: T, content: string): EntityGenerator<T, string>;
    isTxt(entity: T): boolean;
  },
  // optional to extends an existed reducers
  ObjectReducers<T>
>;

const fileUseCase = <T extends File>({ maxContentLength = 2000 }: FileUseCaseOptions = {}): FileReducers<T> => {
  /**
   * if you have not extends an existed reducers,
   * you should call `entityUseCase` at here,
   * such as `const entityReducers = entityUseCase<T>()`.
   */
  const objectReducers = objectUseCase<T>();

  const writeFile = function* (entity: T, content: string): EntityGenerator<T, string> {
    const { content: oldContent } = entity;
    const newContent = oldContent + content;

    if (newContent.length > maxContentLength) {
      throw 'max length error';
    }

    // set new entity by yield expression
    yield {
      ...entity,
      content: newContent,
    };

    // return the new content
    return newContent;
  };

  const isTxt = (entity: T): boolean => {
    const { path } = entity;

    return path.endsWith('.txt');
  };

  return { ...objectReducers, writeFile, isTxt };
};

// b.tsx
import { useUseCase } from '@mic-rexjs/usecases-react';
import ReactDOM from 'react-dom';

const ParentComponent = ({ children }: React.PropsWithChildren): React.ReactElement => {
  // Pass a default entity to initialize usecase, this usecase must be unique, just like `react context`.
  const [entity, reducers, Provider] = useUseCase({ path: '', content: '' }, fileUseCase);
  const { path } = entity;
  const { writeFile } = reducers;

  const onClick = (): void => {
    // update entity
    writeFile('hello world');
  };

  return (
    // There's no need `value` property
    <Provider>
      <div>
        <header>file path is: {path}</header>
        <main>{children}</main>
        <footer>
          <button onClick={onClick}>write file</button>
        </footer>
      </div>
    </Provider>
  );
};

const ChildComponent = (): React.ReactElement => {
  /**
   * use a usecase which has initialzed in parent component,
   * just like `useContext()`, but the parameter is a usecase.
   */
  const [entity, reducers] = useUseCase(fileUseCase);
  const { content } = entity;
  const { isTxt, writeFile } = reducers;

  const onClick = (): void => {
    // also, you can update entity at child component
    writeFile('hello China');
  };

	/**
	 * reducers will be updated with entity change,
	 * so, you can add some reducers to deps.
	 */
	const ext = useMemo((): string => {
		return isTxt() ? '.txt' : '.js';
	}, [isTxt]);

  return (
    <div>
      <header>ext: {ext}</header>
      <main>{content}</main>
      <footer>
        <button onClick={onClick}>write file</button>
      </footer>
    </div>
  );
};

ReactDOM.render(
  <ParentComponent>
    <ChildComponent />
  </ParentComponent>,
  document.body
);
```

## Test Demos
- [useUseCase](https://github.com/mic-rexjs/usecases-react/blob/main/src/hooks/useUseCase/index.test.tsx)