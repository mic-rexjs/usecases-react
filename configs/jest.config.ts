import fs from 'fs';
import path from 'path';
import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

const initConfig = (): Config => {
  const { compilerOptions }: typeof import('../tsconfig.json') = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../tsconfig.json'), 'utf8'),
  );

  const { paths } = compilerOptions;
  const projectDir = path.resolve(__dirname, '../');

  return {
    testEnvironment: 'jest-environment-jsdom',
    rootDir: projectDir,
    displayName: 'test',
    cache: false,
    testRegex: '\\.test\\.tsx?',
    transform: {
      '^.+\\.[tj]sx?$': [
        'ts-jest',
        {
          tsconfig: './tsconfig.json',
        },
      ],
    },
    modulePathIgnorePatterns: ['<rootDir>/build/'],
    moduleNameMapper: pathsToModuleNameMapper(
      Object.fromEntries(
        Object.getOwnPropertyNames(paths).map((name: string): [string, string[]] => {
          return [
            name,
            paths[name as keyof typeof paths].map((p: string): string => {
              return p.replace(/^\.\//g, '<rootDir>/');
            }),
          ];
        }),
      ),
    ),
  };
};

export default initConfig();
