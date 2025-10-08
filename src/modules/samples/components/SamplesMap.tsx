import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getSamplesGeoFeatureCollection, getSamplesCount } from '../features/api'
import { useSamplesCountQuery, useSamplesGeoFeatureCollectionQuery } from '../features/useSamplesQuery'
import { FullscreenIcon } from '../../../lib/icons'
import { useSampleSelection } from '../features/selection'
import { useSampleFilter } from '../features/sampleFilter'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function SamplesMap({ isVisible, onOpenDetail }: { isVisible?: boolean, onOpenDetail?: (id: string) => void }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { debouncedSearchText, allowedAccess, createdByIdEquals, setBbox, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()
  const { selectedIds, toggle, selectMany, deselectMany } = useSampleSelection()
  const [isLoading, setIsLoading] = useState(false)
  const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] } as const
  const MAX_FEATURES_FOR_MAP = 100000
  const [internalCount, setInternalCount] = useState<number | null>(null)
  const [styleId, setStyleId] = useState<'streets-v12' | 'outdoors-v12' | 'satellite-streets-v12' | 'light-v11' | 'dark-v11'>('light-v11')
  const lastAppliedStyleIdRef = useRef<string>('light-v11')
  const [projectionId, setProjectionId] = useState<'mercator' | 'equirectangular' | 'naturalEarth'>('mercator')
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectionAction, setSelectionAction] = useState<'select' | 'unselect'>('select')
  const selectionRef = useRef({ selectionMode, selectionAction })
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null)
  const selectedIdsRef = useRef<Set<string>>(new Set(Array.from(selectedIds).map(String)))

  // Keep latest params in refs for event handlers
  const paramsRef = useRef({ debouncedSearchText, allowedAccess, createdByIdEquals, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon })
  useEffect(() => {
    paramsRef.current = { debouncedSearchText, allowedAccess, createdByIdEquals, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon }
  }, [debouncedSearchText, allowedAccess, createdByIdEquals, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon])

  // Keep latest selection mode/action in a ref for map event handlers
  useEffect(() => {
    selectionRef.current = { selectionMode, selectionAction }
  }, [selectionMode, selectionAction])

  // Keep latest selected ids in a ref for immediate filter updates
  useEffect(() => {
    selectedIdsRef.current = new Set(Array.from(selectedIds).map(String))
  }, [selectedIds])

  function repositionMapboxControls() {
    const map = mapRef.current
    if (!map) return
    const container = map.getContainer()
    const topRight = container.querySelector('.mapboxgl-ctrl-top-right') as HTMLElement | null
    if (topRight) {
      topRight.style.top = '44px'
      topRight.style.right = '8px'
    }
  }

  function finishLoadingWithMinDelay(startedAtMs: number) {
    const MIN_VISIBLE_MS = 300
    const elapsed = performance.now() - startedAtMs
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
    window.setTimeout(() => {
      setIsLoading(false)
    }, remaining)
  }

  // Previously used to normalize and warn on duplicate IDs by sampleId.
  // No longer needed since we rely on feature.id consistently.
  function passthroughGeojson(g: any) { return g }

  function applySelectedFilter(ids: string[]) {
    const map = mapRef.current
    if (!map) return
    const selectedLayerId = 'samples-circle-selected'
    const baseLayerId = 'samples-circle'
    if (!map.getLayer(selectedLayerId)) return
    const filter: any = [
      'in',
      ['to-string', ['id']],
      ['literal', ids],
    ]
    map.setFilter(selectedLayerId, filter)
    // Exclude selected features from base layer to avoid overdraw hiding highlight
    if (map.getLayer(baseLayerId)) {
      if (ids.length > 0) {
        const baseFilter: any = [
          '!',
          [
            'in',
            ['to-string', ['id']],
            ['literal', ids],
          ],
        ]
        map.setFilter(baseLayerId, baseFilter)
      } else {
        // Clear filter to show all when nothing selected
        try { map.setFilter(baseLayerId, null as any) } catch {}
      }
    }
  }
  function applySelectedFilterIfPresent() {
    applySelectedFilter(Array.from(selectedIdsRef.current))
  }

  function escapeHtml(input: string): string {
    return input.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string))
  }

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${styleId}`,
      center: [133.7751, -25.2744],
      zoom: 3,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    // Push zoom controls down so our buttons don't overlap
    repositionMapboxControls()

    const onLoad = async () => {
      try {
        // Ensure the source/layer exist with empty data first
        if (!mapRef.current) return
        if (!mapRef.current.getSource('samples')) {
          mapRef.current.addSource('samples', {
            type: 'geojson',
            data: EMPTY_GEOJSON as any,
          })
          mapRef.current.addLayer({
            id: 'samples-circle',
            type: 'circle',
            source: 'samples',
            paint: {
              'circle-radius': 4,
              'circle-color': '#ffffff',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#777777',
            },
          })
          // Selected samples layer (on top)
          // Draw selected layer above base and above any clustering layers
          mapRef.current.addLayer({
            id: 'samples-circle-selected',
            type: 'circle',
            source: 'samples',
            paint: {
              'circle-radius': 4,
              'circle-color': '#2563eb',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
            },
            filter: [
              'in',
              ['to-string', ['id']],
              ['literal', []],
            ] as any,
            // Insert above base layer to ensure visibility
            // Note: Mapbox addLayer options signature allows beforeId; we achieve same by removing & re-adding if needed.
          })
          // Ensure selected layer is on top
          try { mapRef.current.moveLayer('samples-circle-selected') } catch {}
          // Initialize base layer filter to avoid hiding when selection toggles
          applySelectedFilterIfPresent()
          applySelectedFilterIfPresent()
          const showHover = (e: mapboxgl.MapMouseEvent & { features?: any[] }) => {
            if (!mapRef.current || !e.features || e.features.length === 0) return
            const feature = e.features[0]
            const id = feature?.id
            const name = feature?.properties?.name ?? feature?.properties?.sampleName ?? ''
            if (!hoverPopupRef.current) {
              hoverPopupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
              try {
                const el = hoverPopupRef.current.getElement()
                if (el) {
                  el.style.pointerEvents = 'none'
                }
              } catch {}
            }
            const safeName = typeof name === 'string' ? escapeHtml(name) : String(name ?? '')
            const safeId = escapeHtml(String(id ?? ''))
            hoverPopupRef.current
              .setLngLat(e.lngLat)
              .setHTML(`<div class="text-xs"><div><span class="text-gray-500">ID:</span> ${safeId}</div><div><span class="text-gray-500">Name:</span> ${safeName}</div></div>`)
              .addTo(mapRef.current)
          }
          const hideHover = () => {
            if (hoverPopupRef.current) hoverPopupRef.current.remove()
          }
          // Native click handler for non-selection mode navigation
          mapRef.current.on('click', (e) => {
            if (!mapRef.current) return
            if (selectionRef.current.selectionMode) return
            const features = mapRef.current.queryRenderedFeatures(e.point, {
              layers: ['samples-circle-selected', 'samples-circle'],
            })
            const feature = features && features[0]
            const id = feature && feature.id
            if (!id) return
            if (onOpenDetail) {
              onOpenDetail(String(id))
            } else {
              const url = `/samples/${id}`
              window.history.pushState({}, '', url)
              const navEvt = new PopStateEvent('popstate')
              dispatchEvent(navEvt)
            }
          })
          mapRef.current.on('mouseenter', 'samples-circle', () => {
            if (!mapRef.current) return
            const cur = selectionRef.current.selectionMode ? 'crosshair' : 'pointer'
            mapRef.current.getCanvas().style.cursor = cur
          })
          mapRef.current.on('mouseleave', 'samples-circle', () => {
            if (!mapRef.current) return
            const cur = selectionRef.current.selectionMode ? 'crosshair' : ''
            mapRef.current.getCanvas().style.cursor = cur
            hideHover()
          })
          mapRef.current.on('mouseenter', 'samples-circle-selected', () => {
            if (!mapRef.current) return
            const cur = selectionRef.current.selectionMode ? 'crosshair' : 'pointer'
            mapRef.current.getCanvas().style.cursor = cur
          })
          mapRef.current.on('mouseleave', 'samples-circle-selected', () => {
            if (!mapRef.current) return
            const cur = selectionRef.current.selectionMode ? 'crosshair' : ''
            mapRef.current.getCanvas().style.cursor = cur
            hideHover()
          })
          mapRef.current.on('mousemove', 'samples-circle', showHover)
          mapRef.current.on('mousemove', 'samples-circle-selected', showHover)
        }

        // Do not fetch data here; fetching is handled by the debounced, gated effect below
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load GeoJSON', e)
      }
    }

    mapRef.current.on('load', onLoad)
    mapRef.current.on('style.load', onLoad)
    mapRef.current.on('style.load', repositionMapboxControls)
    mapRef.current.on('style.load', () => {
      if (mapRef.current) {
        try { mapRef.current.setProjection(projectionId as any) } catch {}
      }
    })
    mapRef.current.on('moveend', () => {
      const map = mapRef.current
      if (!map) return
      const bounds = map.getBounds() as mapboxgl.LngLatBounds
      // Mapbox returns sw (minLat/minLng) and ne (maxLat/maxLng)
      const minLon = bounds.getWest()
      const minLat = bounds.getSouth()
      const maxLon = bounds.getEast()
      const maxLat = bounds.getNorth()
      // setBbox(minLon, minLat, maxLon, maxLat)
    })

    // Selection rubber band (mouse/touch) when selectionMode is active
    const onPointerDown = (e: any) => {
      /*
      I removed the native map click handler (which could conflict with our rubber-band flow) and moved all selection toggling into the unified pointer handlers:
      On mousedown: we wait for small movement; if none, treat as a click on mouseup; if movement, do box selection.
      On mouseup: we perform a click toggle for the feature under the cursor if it was a click-like gesture; otherwise, apply the rectangle selection. Threshold is 3px to avoid accidental drags.
      Kept popup pointer-events disabled so it can't block clicks.
      This should make every click reliably toggle selection while in selection mode.
      */
      if (!selectionRef.current.selectionMode) return
      if (!mapRef.current) return
      const map = mapRef.current
      const oe = (e as any).originalEvent
      if (oe && typeof oe.preventDefault === 'function') oe.preventDefault()
      const boxZoomWasEnabled = (map as any).boxZoom && (map as any).boxZoom.isEnabled && (map as any).boxZoom.isEnabled()
      const dragRotateWasEnabled = map.dragRotate && (map.dragRotate as any).isEnabled && (map.dragRotate as any).isEnabled()
      if (map.boxZoom && map.boxZoom.disable) map.boxZoom.disable()
      map.dragPan.disable()
      if (map.dragRotate && map.dragRotate.disable) map.dragRotate.disable()
      const start = e.point
      let isDragging = false
      setBox(null)

      const onPointerMove = (me: any) => {
        const p = me.point
        const dx = Math.abs(p.x - start.x)
        const dy = Math.abs(p.y - start.y)
        if (!isDragging && (dx > 3 || dy > 3)) {
          isDragging = true
          setBox({ x0: start.x, y0: start.y, x1: p.x, y1: p.y })
        } else if (isDragging) {
          setBox((b) => (b ? { ...b, x1: p.x, y1: p.y } : b))
        }
      }
      const onPointerUp = (ue: any) => {
        if (!mapRef.current) return
        const layers = ['samples-circle-selected', 'samples-circle']
        const clickLike = !isDragging || (Math.abs(ue.point.x - start.x) <= 3 && Math.abs(ue.point.y - start.y) <= 3)
        if (clickLike) {
          // Treat as click-toggle in selection mode
          const features = mapRef.current.queryRenderedFeatures(ue.point, { layers })
          const feature = features && features[0]
          const id = feature && feature.id
          if (id) {
            const idStr = String(id)
            // Optimistically update ref to avoid closure lag
            const next = new Set(selectedIdsRef.current)
            if (next.has(idStr)) next.delete(idStr); else next.add(idStr)
            selectedIdsRef.current = next
            applySelectedFilter(Array.from(next))
            toggle(idStr)
          }
        } else {
          const xMin = Math.min(start.x, ue.point.x)
          const yMin = Math.min(start.y, ue.point.y)
          const xMax = Math.max(start.x, ue.point.x)
          const yMax = Math.max(start.y, ue.point.y)
          const features = mapRef.current.queryRenderedFeatures([ { x: xMin, y: yMin } as any, { x: xMax, y: yMax } as any ], { layers })
          const ids = features
            .map((f) => f.id)
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v as any))
          if (ids.length > 0) {
            const next = new Set(selectedIdsRef.current)
            if (selectionRef.current.selectionAction === 'unselect') {
              ids.forEach((i) => next.delete(i))
              deselectMany(ids)
            } else {
              ids.forEach((i) => next.add(i))
              selectMany(ids)
            }
            selectedIdsRef.current = next
            applySelectedFilter(Array.from(next))
          }
        }
        setBox(null)
        mapRef.current.off('mousemove', onPointerMove)
        mapRef.current.off('mouseup', onPointerUp)
        mapRef.current.off('touchmove', onPointerMove)
        mapRef.current.off('touchend', onPointerUp)
        if (boxZoomWasEnabled && map.boxZoom && map.boxZoom.enable) map.boxZoom.enable()
        map.dragPan.enable()
        if (dragRotateWasEnabled && map.dragRotate && map.dragRotate.enable) map.dragRotate.enable()
      }
      mapRef.current.on('mousemove', onPointerMove)
      mapRef.current.on('mouseup', onPointerUp)
      mapRef.current.on('touchmove', onPointerMove)
      mapRef.current.on('touchend', onPointerUp)
    }
    mapRef.current.on('mousedown', onPointerDown)
    mapRef.current.on('touchstart', onPointerDown)

    return () => {
      if (mapRef.current) {
        mapRef.current.off('load', onLoad)
        mapRef.current.off('style.load', onLoad)
        mapRef.current.off('style.load', repositionMapboxControls)
        mapRef.current.off('mousedown', onPointerDown)
        mapRef.current.off('touchstart', onPointerDown)
        mapRef.current.remove()
      }
      mapRef.current = null
    }
  }, [])

  // While selection mode is active, set crosshair cursor and disable rotate to avoid conflicts
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.getCanvas().style.cursor = selectionMode ? 'crosshair' : ''
    if (selectionMode) {
      map.dragRotate.disable()
    } else {
      map.dragRotate.enable()
    }
  }, [selectionMode])

  // Reflect selected IDs on the selected layer filter
  useEffect(() => {
    applySelectedFilterIfPresent()
  }, [selectedIds])

  // Change style when styleId updates
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const desired = `mapbox://styles/mapbox/${styleId}`
    if (lastAppliedStyleIdRef.current === styleId) return
    lastAppliedStyleIdRef.current = styleId
    map.setStyle(desired)
  }, [styleId])

  // Apply projection when changed
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    try {
      map.setProjection(projectionId as any)
    } catch {
      // ignore unsupported projections for the current style/version
    }
  }, [projectionId])

  // Resize map when becoming visible to prevent rendering issues when hidden
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (isVisible) {
      map.resize()
    }
  }, [isVisible])

  // React Query-powered data flow: count -> gate geojson
  const {
    data: countData,
    isLoading: isCountLoading,
    isFetching: isCountFetching,
  } = useSamplesCountQuery()
  const allowGeo = (countData ?? 0) <= MAX_FEATURES_FOR_MAP
  const {
    data: geoData,
    isLoading: isGeoLoading,
    isFetching: isGeoFetching,
  } = useSamplesGeoFeatureCollectionQuery(allowGeo)

  useEffect(() => {
    setInternalCount(countData ?? null)
  }, [countData])

  useEffect(() => {
    const startedAt = performance.now()
    const loading = (isCountLoading || isCountFetching) || (allowGeo && (isGeoLoading || isGeoFetching))
    if (loading) setIsLoading(true)
    else finishLoadingWithMinDelay(startedAt)
  }, [isCountLoading, isCountFetching, isGeoLoading, isGeoFetching, allowGeo])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const source = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
    if (!allowGeo) {
      source?.setData(EMPTY_GEOJSON as any)
      return
    }
    if (geoData) {
      source?.setData(passthroughGeojson(geoData) as any)
      applySelectedFilterIfPresent()
    }
  }, [geoData, allowGeo])

  return (
    <div className={`relative w-full h-[70vh]`} id="samples-map-root">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg border" />
      {/* Selection controls (mobile-friendly) */}
      <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded bg-white/90 backdrop-blur px-2 py-1 text-xs text-gray-700 shadow border">
        <label className="flex items-center gap-1">
          <input type="checkbox" className="accent-emerald-600" checked={selectionMode} onChange={(e) => setSelectionMode(e.target.checked)} />
          <span>Selection</span>
        </label>
        {selectionMode && (
          <>
            <div className="ml-1 inline-flex rounded border overflow-hidden">
              <button type="button" className={`px-2 py-0.5 ${selectionAction === 'select' ? 'bg-emerald-600 text-white' : 'bg-white'}`} onClick={() => setSelectionAction('select')}>Add</button>
              <button type="button" className={`px-2 py-0.5 ${selectionAction === 'unselect' ? 'bg-rose-600 text-white' : 'bg-white'}`} onClick={() => setSelectionAction('unselect')}>Remove</button>
            </div>
            <button type="button" className="ml-1 rounded border px-2 py-0.5 bg-white hover:bg-gray-50" onClick={() => setSelectionMode(false)}>Done</button>
          </>
        )}
      </div>
      {box && (
        <div
          className="absolute z-30 border-2 border-emerald-500 bg-emerald-400/10"
          style={{
            left: `${Math.min(box.x0, box.x1)}px`,
            top: `${Math.min(box.y0, box.y1)}px`,
            width: `${Math.abs(box.x1 - box.x0)}px`,
            height: `${Math.abs(box.y1 - box.y0)}px`,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Controls group (top-right): style, projection, fullscreen */}
      <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
        <label htmlFor="basemap-style" className="sr-only">Basemap style</label>
        <select
          id="basemap-style"
          className="text-[10px] rounded-sm border bg-white/90 backdrop-blur px-1 py-0.5 shadow focus:outline-none"
          value={styleId}
          onChange={(e) => setStyleId(e.target.value as any)}
          title="Basemap style"
        >
          <option value="satellite-streets-v12">Satellite</option>
          <option value="streets-v12">Streets</option>
          <option value="outdoors-v12">Outdoors</option>
          <option value="light-v11">Light</option>
          <option value="dark-v11">Dark</option>
        </select>
        <label htmlFor="projection" className="sr-only">Projection</label>
        <select
          id="projection"
          className="text-[10px] rounded-sm border bg-white/90 backdrop-blur px-1 py-0.5 shadow focus:outline-none"
          value={projectionId}
          onChange={(e) => setProjectionId(e.target.value as any)}
          title="Projection"
        >
          <option value="mercator">Mercator</option>
          <option value="equirectangular">Equirectangular</option>
          <option value="naturalEarth">Natural Earth</option>
        </select>
        <button
          type="button"
          className="text-[10px] rounded-sm border bg-white/90 backdrop-blur px-1 py-0.5 shadow hover:bg-white inline-flex items-center gap-1"
          onClick={() => {
            const root = document.getElementById('samples-map-root')
            if (!root) return
            const doc: any = document
            if (!doc.fullscreenElement) {
              root.requestFullscreen?.()
            } else {
              doc.exitFullscreen?.()
            }
            setTimeout(() => mapRef.current?.resize(), 200)
          }}
          title="Toggle fullscreen"
        >
          <FullscreenIcon className="h-3 w-3" />
          <span className="hidden sm:inline">Full</span>
        </button>
      </div>
      {internalCount !== null && internalCount > MAX_FEATURES_FOR_MAP && (
        <div className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2">
          <div className="rounded-md border border-yellow-300 bg-yellow-50 text-yellow-800 px-3 py-2 text-sm shadow">
            Data exceeds 100k records, please filter down to see on map.
          </div>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 z-10 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center" aria-busy="true" aria-live="polite">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-400/30 border-t-gray-600" />
        </div>
      )}
    </div>
  )
}


