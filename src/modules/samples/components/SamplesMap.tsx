import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getSamplesGeoFeatureCollection } from '../features/api'
import { useSampleFilter } from '../features/sampleFilter'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function SamplesMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { debouncedSearchText, allowedAccess, createdByIdEquals } = useSampleFilter()
  const [isLoading, setIsLoading] = useState(false)
  const latestRequestIdRef = useRef(0)
  const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] } as const

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
      style: 'mapbox://styles/mapbox/streets-v12',
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

        setIsLoading(true)
        const requestId = ++latestRequestIdRef.current
        const startedAt = performance.now()
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: debouncedSearchText || undefined,
          allowedAccess: allowedAccess,
          createdByIdEquals,
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

    return () => {
      if (mapRef.current) {
        mapRef.current.off('load', onLoad)
        mapRef.current.remove()
      }
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    ;(async () => {
      try {
        setIsLoading(true)
        const requestId = ++latestRequestIdRef.current
        const startedAt = performance.now()
        const map = mapRef.current
        if (!map) return
        const existingSource = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
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
  }, [debouncedSearchText, allowedAccess, createdByIdEquals])

  return (
    <div className="relative w-full h-[70vh]">
      <div ref={mapContainerRef} className="w-full h-full rounded-lg border" />
      {isLoading && (
        <div className="absolute inset-0 z-10 rounded-lg bg-white/60 backdrop-blur-sm flex items-center justify-center" aria-busy="true" aria-live="polite">
          <span className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-400/30 border-t-gray-600" />
        </div>
      )}
    </div>
  )
}


