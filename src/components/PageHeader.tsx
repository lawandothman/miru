import type { FC } from "react";

interface PageHeaderProps {
  title: string;
}
export const PageHeader: FC<PageHeaderProps> = ({ title }) => {
  return (
    <>
      <h1 className="text-3xl font-thin uppercase tracking-widest dark:text-white">
        {title}
      </h1>
      <p className="mt-1 font-thin dark:text-white">Movies</p>
    </>
  );
};