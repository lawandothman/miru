export function offsetPageParam(pageSize: number) {
  return (lastPage: unknown[], allPages: unknown[][]) =>
    lastPage.length === pageSize
      ? allPages.length * pageSize
      : undefined;
}
