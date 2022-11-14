import { useRouter } from "next/router";
import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";

export const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.length === 0) {
      return;
    }
    setIsOpen(false);
    router.push({
      pathname: "/search",
      query: {
        q: searchQuery,
        page: 1,
      },
    });
  };

  const onClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form
      className="relative flex h-10 items-center  justify-center rounded border border-neutral-300 p-2 outline-none"
      onSubmit={onSubmit}
      onClick={onClick}
      ref={formRef}
    >
      <button aria-label="Search" className="pr-2">
        <FiSearch className="text-neutral-300 " />
      </button>
      <input
        placeholder="Search..."
        type="text"
        ref={inputRef}
        onChange={onChange}
        className="bg-transparent text-neutral-300 focus:outline-none "
      />
    </form>
  );
};
