import Link from "next/link";
import { useRouter } from "next/router";
import type { FC } from "react";

interface PaginationProps {
  page: number;
}
export const Pagination: FC<PaginationProps> = ({ page }) => {
  const { pathname, query } = useRouter();

  return (
    <>
      <div className="mb-8 flex w-full items-center justify-center gap-5 lg:px-20">
        {page && page > 1 && (
          <Link
            href={{
              pathname,
              query: {
                ...query,
                page: page - 1,
              },
            }}
            className="flex  h-10 items-center rounded bg-neutral-800 px-10 text-white dark:bg-neutral-100 dark:text-black"
          >
            Prev
          </Link>
        )}
        <Link
          href={{
            pathname,
            query: {
              ...query,
              page: page + 1,
            },
          }}
          className="flex h-10 items-center rounded bg-neutral-800 px-10 text-white dark:bg-neutral-100 dark:text-black"
        >
          Next
        </Link>
      </div>
    </>
  );
};
