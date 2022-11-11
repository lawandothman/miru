import Link from "next/link";
import { trpc } from "utils/trpc";
import { FiCalendar, FiHeart, FiTrendingUp, FiUser } from "react-icons/fi";

export const Sidebar = () => {
  const { data: genres } = trpc.movies.getGenres.useQuery();
  return (
    <aside
      className="fixed top-0 bottom-0 left-0 h-full  w-60 overflow-auto border-r border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      aria-label="Sidenav"
    >
      <div>
        <h1 className="pl-4 pb-6 pt-4 text-lg text-white">見る Miru</h1>
      </div>
      <main className="flex flex-col p-2">
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
                href="#"
              >
                <FiHeart />
                <span className="ml-3 text-sm">Popular</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
                href="#"
              >
                <FiCalendar />
                <span className="ml-3 text-sm">Upcoming</span>
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
                href="#"
              >
                <FiTrendingUp />
                <span className="ml-3 text-sm">Top Rated</span>
              </Link>
            </li>
          </ul>
        </nav>
        <nav>
          <p className=" pl-3 pb-2 pt-4 text-sm text-white">Genres</p>
          <ul className="space-y-2">
            {genres?.map((genre) => (
              <li key={genre.id}>
                <Link
                  className="flex items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
                  href="#"
                >
                  <span className="ml-3 text-sm">{genre.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <footer className="sticky bottom-0 left-0 w-60">
        <div className="h-8 bg-gradient-to-t from-white dark:from-neutral-900"></div>
        <div className="p-4 dark:bg-neutral-900">
          <Link
            className="flex items-center rounded-lg p-2 text-sm font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-neutral-700"
            href="#"
          >
            <FiUser />
            <span className="ml-3 text-sm">Profile</span>
          </Link>
        </div>
      </footer>
    </aside>
  );
};
