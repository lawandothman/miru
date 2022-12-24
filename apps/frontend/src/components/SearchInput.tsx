import { useRouter } from "next/router"
import type { ChangeEvent, FormEvent } from "react"
import { useRef, useState } from "react"
import { FiSearch } from "react-icons/fi"

export const SearchInput = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.length === 0) {
      return
    }
    router.push({
      pathname: "/search",
      query: {
        q: searchQuery,
        page: 1,
      },
    })
  }

  const onClick = () => {
    inputRef.current?.focus()
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div>
      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="relative mx-auto w-max"
      >
        <input
          type="text"
          onClick={onClick}
          placeholder="Search.."
          className="h-12 w-full cursor-auto bg-transparent pl-12 text-neutral-300 outline-none"
          onChange={onChange}
        />
        <FiSearch className="absolute inset-y-0 my-auto h-8 w-12 stroke-neutral-400 px-3.5" />
      </form>
    </div>
  )
}
