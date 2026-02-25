type ListStateProps = {
  isLoading: boolean;
  isError?: boolean;
  isEmpty: boolean;
  renderSkeleton: () => React.ReactNode;
  renderEmpty: () => React.ReactNode;
  renderContent: () => React.ReactNode;
  renderError?: () => React.ReactNode;
};

export function ListState({
  isLoading,
  isError = false,
  isEmpty,
  renderSkeleton,
  renderEmpty,
  renderContent,
  renderError
}: ListStateProps) {
  if (isLoading) return <>{renderSkeleton()}</>;
  if (isError && renderError) return <>{renderError()}</>;
  if (isEmpty) return <>{renderEmpty()}</>;
  return <>{renderContent()}</>;
}
