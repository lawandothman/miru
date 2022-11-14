import type { FC } from "react";
import { SearchInput } from "./SearchInput";

interface PageHeaderProps {
  title: string;
  subtitle?: string
}
export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle = "Movies",
}) => {
  return (
    <div className="flex justify-between">
      <div>
        <h1 className="text-3xl font-thin uppercase tracking-widest dark:text-white">
          {title}
        </h1>
        <p className="mt-1 font-thin dark:text-white">{subtitle}</p>
      </div>
      <SearchInput />
    </div>
  );
};