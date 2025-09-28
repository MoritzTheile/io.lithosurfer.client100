import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getSamplesGeoFeatureCollection } from '../features/api'
import { FullscreenIcon } from '../../../lib/icons'
import { useSampleSelection } from '../features/selection'
import { useSampleFilter } from '../features/sampleFilter'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function SamplesMap({ totalCount, isVisible, onOpenDetail }: { totalCount?: number, isVisible?: boolean, onOpenDetail?: (id: string) => void }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { debouncedSearchText, allowedAccess, createdByIdEquals, setBbox, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()
  const { selectedIds, toggle, selectMany, deselectMany } = useSampleSelection()
  const [isLoading, setIsLoading] = useState(false)
  const latestRequestIdRef = useRef(0)
  const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] } as const
  const MAX_FEATURES_FOR_MAP = 100000
  const exceedsLimit = (totalCount ?? 0) > MAX_FEATURES_FOR_MAP
  const [styleId, setStyleId] = useState<'streets-v12' | 'outdoors-v12' | 'satellite-streets-v12' | 'light-v11' | 'dark-v11'>('satellite-streets-v12')
  const lastAppliedStyleIdRef = useRef<string>('satellite-streets-v12')
  const [box, setBox] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectionAction, setSelectionAction] = useState<'select' | 'unselect'>('select')
  const selectionRef = useRef({ selectionMode, selectionAction })
  const hoverPopupRef = useRef<mapboxgl.Popup | null>(null)

  // Keep latest params in refs for event handlers
  const paramsRef = useRef({ debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon })
  useEffect(() => {
    paramsRef.current = { debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon }
  }, [debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon])

  // Keep latest selection mode/action in a ref for map event handlers
  useEffect(() => {
    selectionRef.current = { selectionMode, selectionAction }
  }, [selectionMode, selectionAction])

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

  function finishLoadingWithMinDelay(startedAtMs: number, requestId: number) {
    const MIN_VISIBLE_MS = 300
    const elapsed = performance.now() - startedAtMs
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
    window.setTimeout(() => {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false)
      }
    }, remaining)
  }

  function applySelectedFilterIfPresent() {
    const map = mapRef.current
    if (!map) return
    const layerId = 'samples-circle-selected'
    if (!map.getLayer(layerId)) return
    const ids = Array.from(selectedIds || []).map(String)
    const filter: any = [
      'in',
      ['to-string', ['coalesce', ['get', 'id'], ['get', 'sampleId']]],
      ['literal', ids],
    ]
    map.setFilter(layerId, filter)
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
              ['coalesce', ['get', 'id'], ['get', 'sampleId']],
              ['literal', []],
            ] as any,
          })
          applySelectedFilterIfPresent()
          const showHover = (e: mapboxgl.MapMouseEvent & { features?: any[] }) => {
            if (!mapRef.current || !e.features || e.features.length === 0) return
            const feature = e.features[0]
            const id = feature?.properties?.id ?? feature?.properties?.sampleId
            const name = feature?.properties?.name ?? feature?.properties?.sampleName ?? ''
            if (!hoverPopupRef.current) {
              hoverPopupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
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
          mapRef.current.on('click', (e) => {
            if (!mapRef.current) return
            const features = mapRef.current.queryRenderedFeatures(e.point, {
              layers: ['samples-circle-selected', 'samples-circle'],
            })
            const feature = features && features[0]
            const id = feature && (feature.properties?.id || feature.properties?.sampleId)
            if (!id) return
            if (selectionRef.current.selectionMode) {
              toggle(String(id))
            } else if (onOpenDetail) {
              onOpenDetail(String(id))
            } else {
              const url = `/samples/${id}`
              window.history.pushState({}, '', url)
              const navEvt = new PopStateEvent('popstate')
              dispatchEvent(navEvt)
            }
          })
          mapRef.current.on('mouseenter', 'samples-circle', () => {
            mapRef.current && (mapRef.current.getCanvas().style.cursor = 'pointer')
          })
          mapRef.current.on('mouseleave', 'samples-circle', () => {
            mapRef.current && (mapRef.current.getCanvas().style.cursor = '')
            hideHover()
          })
          mapRef.current.on('mouseenter', 'samples-circle-selected', () => {
            mapRef.current && (mapRef.current.getCanvas().style.cursor = 'pointer')
          })
          mapRef.current.on('mouseleave', 'samples-circle-selected', () => {
            mapRef.current && (mapRef.current.getCanvas().style.cursor = '')
            hideHover()
          })
          mapRef.current.on('mousemove', 'samples-circle', showHover)
          mapRef.current.on('mousemove', 'samples-circle-selected', showHover)
        }

        const { debouncedSearchText: dText, allowedAccess: access, createdByIdEquals: createdBy, exceedsLimit: limitNow, bboxMinLat: minLat, bboxMaxLat: maxLat, bboxMinLon: minLon, bboxMaxLon: maxLon } = paramsRef.current
        if (limitNow) {
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        const requestId = ++latestRequestIdRef.current
        const startedAt = performance.now()
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: dText || undefined,
          allowedAccess: access,
          createdByIdEquals: createdBy,
          minLat,
          maxLat,
          minLon,
          maxLon,
        })
        if (!mapRef.current) return
        const source = mapRef.current.getSource('samples') as mapboxgl.GeoJSONSource
        if (requestId === latestRequestIdRef.current) {
          source.setData(geojson as any)
        }
        applySelectedFilterIfPresent()
        finishLoadingWithMinDelay(startedAt, requestId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load GeoJSON', e)
      }
    }

    mapRef.current.on('load', onLoad)
    mapRef.current.on('style.load', onLoad)
    mapRef.current.on('style.load', repositionMapboxControls)
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
      setBox({ x0: start.x, y0: start.y, x1: start.x, y1: start.y })

      const onPointerMove = (me: any) => {
        const p = me.point
        setBox((b) => (b ? { ...b, x1: p.x, y1: p.y } : b))
      }
      const onPointerUp = (ue: any) => {
        if (!mapRef.current) return
        const layers = ['samples-circle-selected', 'samples-circle']
        const xMin = Math.min(start.x, ue.point.x)
        const yMin = Math.min(start.y, ue.point.y)
        const xMax = Math.max(start.x, ue.point.x)
        const yMax = Math.max(start.y, ue.point.y)
        const features = mapRef.current.queryRenderedFeatures([ { x: xMin, y: yMin } as any, { x: xMax, y: yMax } as any ], { layers })
        const ids = features
          .map((f) => (f.properties?.id ?? f.properties?.sampleId))
          .filter((v) => v !== undefined)
          .map((v) => String(v as any))
        if (ids.length > 0) {
          if (selectionRef.current.selectionAction === 'unselect') deselectMany(ids)
          else selectMany(ids)
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
    const map = mapRef.current
    if (!map) return
    const layerId = 'samples-circle-selected'
    if (!map.getLayer(layerId)) return
    const ids = Array.from(selectedIds || []).map(String)
    const filter: any = [
      'in',
      ['to-string', ['coalesce', ['get', 'id'], ['get', 'sampleId']]],
      ['literal', ids],
    ]
    map.setFilter(layerId, filter)
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

  // Resize map when becoming visible to prevent rendering issues when hidden
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (isVisible) {
      map.resize()
    }
  }, [isVisible])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    const existingSource = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
    if (exceedsLimit) {
      existingSource?.setData(EMPTY_GEOJSON as any)
      setIsLoading(false)
      return
    }

    const debounceMs = 1800
    const timerId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        const requestId = ++latestRequestIdRef.current
        const startedAt = performance.now()
        // Clear outdated data while fetching
        existingSource?.setData(EMPTY_GEOJSON as any)
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: debouncedSearchText || undefined,
          allowedAccess: allowedAccess,
          createdByIdEquals,
          minLat: bboxMinLat,
          maxLat: bboxMaxLat,
          minLon: bboxMinLon,
          maxLon: bboxMaxLon,
        })
        const source = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
        if (requestId === latestRequestIdRef.current) {
          source?.setData(geojson as any)
        }
        applySelectedFilterIfPresent()
        finishLoadingWithMinDelay(startedAt, requestId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh GeoJSON', e)
      }
    }, debounceMs)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [debouncedSearchText, allowedAccess, createdByIdEquals, totalCount, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon])

  return (
    <div className={`relative w-full h-[70vh]`} id="samples-map-root">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg border" />
      {/* Selection controls (mobile-friendly) */}
      <div className="absolute left-2 top-12 z-20 flex items-center gap-1 rounded bg-white/90 backdrop-blur px-2 py-1 text-xs text-gray-700 shadow border">
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
            <button type="button" className="ml-1 rounded border px-2 py-0.5 bg-white hover:bg-gray-50" onClick={() => {
              const map = mapRef.current
              if (!map) return
              const features = map.queryRenderedFeatures({ layers: ['samples-circle', 'samples-circle-selected'] }) as any
              const ids: string[] = Array.from(new Set((features as any[])
                .map((f: any) => f?.properties?.id ?? f?.properties?.sampleId)
                .filter((v: any): v is string | number => v !== undefined && v !== null)
                .map((v: any) => String(v))))
              if (ids.length > 0) {
                if (selectionAction === 'unselect') deselectMany(ids)
                else selectMany(ids)
              }
            }}>All in view</button>
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
      {/* Basemap style switcher (compact select) */}
      <div className="absolute left-2 top-2 z-20">
        <label htmlFor="basemap-style" className="sr-only">Basemap style</label>
        <select
          id="basemap-style"
          className="text-xs rounded border bg-white/90 backdrop-blur px-2 py-1 shadow focus:outline-none"
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
      </div>
      {/* Fullscreen toggle */}
      <div className="absolute right-2 top-2 z-20">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded border bg-white/90 backdrop-blur px-2 py-1 text-xs shadow hover:bg-white"
          onClick={() => {
            const root = document.getElementById('samples-map-root')
            if (!root) return
            const doc: any = document
            if (!doc.fullscreenElement) {
              root.requestFullscreen?.()
            } else {
              doc.exitFullscreen?.()
            }
            // Resize after enter/exit fullscreen to reflow map
            setTimeout(() => mapRef.current?.resize(), 200)
          }}
          title="Toggle fullscreen"
        >
          <FullscreenIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Fullscreen</span>
        </button>
      </div>
      {exceedsLimit && (
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


