import { create } from 'zustand'

export type AllowedAccess = 'VIEWABLE' | 'WRITEABLE' | 'PREVIEWABLE'

type SampleFilterState = {
  searchText: string
  debouncedSearchText: string
  page: number
  size: number
  allowedAccess?: AllowedAccess
  createdByIdEquals?: string
  totalCount: number
  setSearchText: (v: string) => void
  setPage: (v: number) => void
  setSize: (v: number) => void
  setAllowedAccess: (v: AllowedAccess | undefined) => void
  setCreatedByIdEquals: (v: string | undefined) => void
  setTotalCount: (n: number) => void
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
  totalCount: 0,
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
  setTotalCount: (n: number) => set({ totalCount: n }),
  clearFilters: () => set({ searchText: '', createdByIdEquals: undefined, page: 0 }),
}))

export function useSampleFilter(): SampleFilterState {
  return useSampleFilterStore()
}

// Dev-only subscription for debugging without middleware
if (import.meta.env.DEV && typeof window !== 'undefined') {
  const key = '__LS_SAMPLE_FILTER_SUB__'
  const g = window as any
  if (!g[key]) {
    g[key] = true
    useSampleFilterStore.subscribe((state) => {
      // eslint-disable-next-line no-console
      console.log('SampleFilter state:', state)
    })
  }
}

