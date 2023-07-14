import path from 'path';
import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from '../tsconfig.json';

const initConfig = (): Config => {
  const { baseUrl, paths } = compilerOptions;
  const projectDir = path.resolve(__dirname, '../');

  return {
    testEnvironment: 'jest-environment-jsdom',
    rootDir: path.resolve(projectDir, baseUrl),
    displayName: 'test',
    testRegex: '\\.test\\.tsx?',
    transform: {
      '^.+\\.[tj]sx?$': [
        'ts-jest',
        {
          tsconfig: './tsconfig.json',
        },
      ],
    },
    moduleNameMapper: pathsToModuleNameMapper(
      Object.fromEntries(
        Object.getOwnPropertyNames(paths).map((name: string): [string, string[]] => {
          return [
            name,
            paths[name as keyof typeof paths].map((p: string): string => {
              return p.replace(/^\.\//g, '<rootDir>/');
            }),
          ];
        })
      )
    ),
  };
};

export default initConfig();
