import Link from "next/link";
import {
  FiCalendar,
  FiHeart,
  FiMenu,
  FiPlay,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import type { FC, PropsWithChildren } from "react";
import React, { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { cn } from "utils/cn";
import { useRouter } from "next/router";
import { signIn, signOut } from "next-auth/react";
import { ProfilePicture } from "./Avatar";
import { useQuery, gql } from "@apollo/client";
import type { Genre } from "__generated__/resolvers-types";
import { useSession } from "next-auth/react";
import _ from "lodash";

interface NavItemProps {
  href: string;
  isSelected: boolean;
  icon?: React.ReactNode;
}
const NavItem: FC<PropsWithChildren<NavItemProps>> = ({
  href,
  isSelected,
  icon,
  children,
}) => {
  return (
    <li>
      <Link
        className={cn(
          "flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700",
          isSelected ? "bg-gray-100 dark:bg-neutral-700" : "bg-transparent"
        )}
        href={href}
      >
        {icon}
        <span className="ml-3 text-sm">{children}</span>
      </Link>
    </li>
  );
};

const GET_GENRES = gql`
  query Genres {
    genres {
      id
      name
    }
  }
`;

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useQuery<{ genres: Genre[] }>(GET_GENRES, {
    canonizeResults: true
  });
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      <OutsideClickHandler onOutsideClick={() => setIsOpen(false)}>
        <div className="m-4 flex items-center lg:hidden">
          <FiMenu
            className="h-5 w-5 cursor-pointer text-white "
            onClick={() => setIsOpen(true)}
          />
          <h1
            className={`mx-auto text-lg text-white ${
              isOpen && "opacity-0"
            } transition-opacity`}
          >
            ミル Miru
          </h1>
        </div>
        <aside
          className={cn(
            "z-30 h-full w-60 transform overflow-y-auto border-r border-gray-200 bg-white transition duration-200 ease-in-out dark:border-neutral-700 dark:bg-neutral-900 lg:z-auto lg:translate-x-0",
            isOpen
              ? "fixed inset-y-0 left-0 translate-x-0"
              : "fixed inset-y-0 -translate-x-full"
          )}
          aria-label="Sidenav"
        >
          <div className="mb-6 mt-4 flex items-center justify-between pl-4 dark:text-white">
            <h1 className="text-lg">ミル Miru</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="mr-2 rounded p-1 hover:bg-neutral-700 lg:hidden"
            >
              <FiX />
            </button>
          </div>
          <main className="flex flex-col p-2">
            <nav>
              <ul className="space-y-2">
                <NavItem
                  isSelected={router.pathname === "/watchlist"}
                  href="/watchlist"
                  icon={<FiPlay />}
                >
                  Watchlist
                </NavItem>
                <NavItem
                  isSelected={router.pathname === "/popular"}
                  href="/popular"
                  icon={<FiHeart />}
                >
                  Popular
                </NavItem>
                <NavItem
                  isSelected={router.pathname === "/upcoming"}
                  href="/upcoming"
                  icon={<FiCalendar />}
                >
                  Upcoming
                </NavItem>
                <NavItem
                  isSelected={router.pathname === "/top-rated"}
                  href="/top-rated"
                  icon={<FiTrendingUp />}
                >
                  Top Rated
                </NavItem>
              </ul>
            </nav>
            <nav>
              <p className="pl-3 pb-2 pt-4 text-sm text-white">Genres</p>
              <ul className="space-y-2">
                {_.sortBy(data?.genres, (genre) => genre.name).map((genre) => (
                  <NavItem
                    href={`/genre/${genre.id}`}
                    isSelected={router.asPath === `/genre/${genre.id}`}
                    key={genre.id}
                  >
                    {genre.name}
                  </NavItem>
                ))}
              </ul>
            </nav>
          </main>
          <footer className="sticky bottom-0 left-0">
            <div className="h-8 bg-gradient-to-t from-white dark:from-neutral-900"></div>
            <div className="p-4 dark:bg-neutral-900">
              {session?.user ? (
                <>
                  <div className="flex w-full items-center justify-between rounded-lg p-2 text-base font-normal text-gray-900  dark:text-white ">
                    <div>
                      <ProfilePicture user={session.user} />
                      <span className="ml-3 text-sm">
                        {session?.user?.name ?? "Profile"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="mx-auto mt-2 flex justify-center p-2 text-base font-normal text-red-500 dark:bg-neutral-900"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  className="mx-auto mt-2 flex justify-center rounded py-1 px-8 text-base font-normal dark:bg-white dark:text-black"
                  onClick={() => signIn()}
                >
                  Login
                </button>
              )}
            </div>
            <div className="p-4 dark:bg-neutral-900"></div>
          </footer>
        </aside>
      </OutsideClickHandler>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-10 transition duration-200 ease-in-out dark:bg-opacity-50 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />
    </>
  );
};
