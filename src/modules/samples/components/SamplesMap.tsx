import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getSamplesGeoFeatureCollection } from '../features/api'
import { useSampleFilter } from '../features/sampleFilter'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function SamplesMap({ totalCount }: { totalCount?: number }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { debouncedSearchText, allowedAccess, createdByIdEquals, setBbox, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon } = useSampleFilter()
  const [isLoading, setIsLoading] = useState(false)
  const latestRequestIdRef = useRef(0)
  const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] } as const
  const MAX_FEATURES_FOR_MAP = 100000
  const exceedsLimit = (totalCount ?? 0) > MAX_FEATURES_FOR_MAP
  const [styleId, setStyleId] = useState<'streets-v12' | 'outdoors-v12' | 'satellite-streets-v12' | 'light-v11' | 'dark-v11'>('satellite-streets-v12')
  const lastAppliedStyleIdRef = useRef<string>('satellite-streets-v12')

  // Keep latest params in refs for event handlers
  const paramsRef = useRef({ debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon })
  useEffect(() => {
    paramsRef.current = { debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon }
  }, [debouncedSearchText, allowedAccess, createdByIdEquals, exceedsLimit, bboxMinLat, bboxMaxLat, bboxMinLon, bboxMaxLon])

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

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${styleId}`,
      center: [133.7751, -25.2744],
      zoom: 3,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

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
              'circle-color': '#2563eb',
              'circle-stroke-width': 1,
              'circle-stroke-color': '#ffffff',
            },
          })
          mapRef.current.on('click', 'samples-circle', (e) => {
            const feature = e.features && e.features[0]
            const id = feature && (feature.properties?.id || feature.properties?.sampleId)
            if (id) {
              const url = `/samples/${id}`
              window.history.pushState({}, '', url)
              const navEvt = new PopStateEvent('popstate')
              dispatchEvent(navEvt)
            }
          })
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
        finishLoadingWithMinDelay(startedAt, requestId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load GeoJSON', e)
      }
    }

    mapRef.current.on('load', onLoad)
    mapRef.current.on('style.load', onLoad)
    mapRef.current.on('moveend', () => {
      const map = mapRef.current
      if (!map) return
      const bounds = map.getBounds() as mapboxgl.LngLatBounds
      // Mapbox returns sw (minLat/minLng) and ne (maxLat/maxLng)
      const minLon = bounds.getWest()
      const minLat = bounds.getSouth()
      const maxLon = bounds.getEast()
      const maxLat = bounds.getNorth()
      setBbox(minLon, minLat, maxLon, maxLat)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.off('load', onLoad)
        mapRef.current.off('style.load', onLoad)
        mapRef.current.remove()
      }
      mapRef.current = null
    }
  }, [])

  // Change style when styleId updates
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const desired = `mapbox://styles/mapbox/${styleId}`
    if (lastAppliedStyleIdRef.current === styleId) return
    lastAppliedStyleIdRef.current = styleId
    map.setStyle(desired)
  }, [styleId])

  useEffect(() => {
    if (!mapRef.current) return
    ;(async () => {
      try {
        const map = mapRef.current
        if (!map) return
        const existingSource = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
        if (exceedsLimit) {
          // Clear data and skip fetch when exceeding limit
          existingSource?.setData(EMPTY_GEOJSON as any)
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        const requestId = ++latestRequestIdRef.current
        const startedAt = performance.now()
        // Clear outdated data while fetching
        existingSource?.setData(EMPTY_GEOJSON as any)
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: debouncedSearchText || undefined,
          allowedAccess: allowedAccess,
          createdByIdEquals,
        })
        const source = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
        // Only update if this is still the latest request
        if (requestId === latestRequestIdRef.current) {
          source?.setData(geojson as any)
        }
        finishLoadingWithMinDelay(startedAt, requestId)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh GeoJSON', e)
      }
    })()
  }, [debouncedSearchText, allowedAccess, createdByIdEquals, totalCount])

  return (
    <div className="relative w-full h-[70vh]">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg border" />
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


