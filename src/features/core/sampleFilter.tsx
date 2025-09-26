import { create } from 'zustand'

export type AllowedAccess = 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE'

type SampleFilterState = {
  searchText: string
  debouncedSearchText: string
  page: number
  size: number
  allowedAccess?: AllowedAccess
  createdByIdEquals?: string
  setSearchText: (v: string) => void
  setPage: (v: number) => void
  setSize: (v: number) => void
  setAllowedAccess: (v: AllowedAccess | undefined) => void
  setCreatedByIdEquals: (v: string | undefined) => void
  clearFilters: () => void
}

let debounceTimer: number | undefined

const useSampleFilterStore = create<SampleFilterState>((set) => ({
  searchText: '',
  debouncedSearchText: '',
  page: 0,
  size: 20,
  allowedAccess: 'VIEWABLE',
  createdByIdEquals: undefined,
  setSearchText: (v: string) => {
    if (typeof window !== 'undefined' && debounceTimer) {
      window.clearTimeout(debounceTimer)
    }
    set({ searchText: v, page: 0 })
    if (typeof window !== 'undefined') {
      debounceTimer = window.setTimeout(() => {
        set({ debouncedSearchText: v.trim() })
      }, 300)
    }
  },
  setPage: (v: number) => set({ page: v }),
  setSize: (v: number) => set({ size: v, page: 0 }),
  setAllowedAccess: (v: AllowedAccess | undefined) => set({ allowedAccess: v }),
  setCreatedByIdEquals: (v: string | undefined) => set({ createdByIdEquals: v, page: 0 }),
  clearFilters: () => set({ searchText: '', createdByIdEquals: undefined, page: 0 }),
}))

export function useSampleFilter(): SampleFilterState {
  return useSampleFilterStore()
}

