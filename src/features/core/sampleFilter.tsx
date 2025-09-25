import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'

export type AllowedAccess = 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE'

type SampleFilterState = {
  searchText: string
  debouncedSearchText: string
  page: number
  size: number
  allowedAccess?: AllowedAccess
  setSearchText: (v: string) => void
  setPage: (v: number) => void
  setSize: (v: number) => void
  setAllowedAccess: (v: AllowedAccess | undefined) => void
}

const SampleFilterContext = createContext<SampleFilterState | undefined>(undefined)

export function SampleFilterProvider({ children }: PropsWithChildren) {
  const [searchText, setSearchText] = useState<string>('')
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [size, setSize] = useState<number>(20)
  const [allowedAccess, setAllowedAccess] = useState<AllowedAccess | undefined>('VIEWABLE')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearchText(searchText.trim()), 300)
    return () => clearTimeout(id)
  }, [searchText])

  const value = useMemo<SampleFilterState>(() => ({
    searchText,
    debouncedSearchText,
    page,
    size,
    allowedAccess,
    setSearchText: (v: string) => {
      setSearchText(v)
      setPage(0)
    },
    setPage,
    setSize: (v: number) => {
      setSize(v)
      setPage(0)
    },
    setAllowedAccess,
  }), [searchText, debouncedSearchText, page, size, allowedAccess])

  return <SampleFilterContext.Provider value={value}>{children}</SampleFilterContext.Provider>
}

export function useSampleFilter(): SampleFilterState {
  const ctx = useContext(SampleFilterContext)
  if (!ctx) throw new Error('useSampleFilter must be used within SampleFilterProvider')
  return ctx
}


