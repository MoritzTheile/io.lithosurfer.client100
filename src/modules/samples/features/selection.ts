import { create } from 'zustand'

type SelectionState = {
  selectedIds: Set<string>
  toggle: (id: string) => void
  selectMany: (ids: string[]) => void
  clear: () => void
}

export const useSampleSelection = create<SelectionState>((set) => ({
  selectedIds: new Set<string>(),
  toggle: (id: string) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),
  selectMany: (ids: string[]) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      ids.forEach((id) => next.add(id))
      return { selectedIds: next }
    }),
  clear: () => set({ selectedIds: new Set<string>() }),
}))


