export interface UseCaseProviderProps {
  children?: React.ReactNode;

  with?: UseCaseProvider | UseCaseProvider[];
}

export interface UseCaseProvider extends React.FC<UseCaseProviderProps> {}
