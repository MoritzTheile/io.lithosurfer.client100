import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getSamplesGeoFeatureCollection } from '../features/api'
import { useSampleFilter } from '../features/sampleFilter'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

export default function SamplesMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const { debouncedSearchText, allowedAccess, createdByIdEquals } = useSampleFilter()

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 6,
    })

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    const onLoad = async () => {
      try {
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: debouncedSearchText || undefined,
          allowedAccess: allowedAccess,
          createdByIdEquals,
        })
        if (!mapRef.current) return
        if (!mapRef.current.getSource('samples')) {
          mapRef.current.addSource('samples', {
            type: 'geojson',
            data: geojson as any,
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
        } else {
          const source = mapRef.current.getSource('samples') as mapboxgl.GeoJSONSource
          source.setData(geojson as any)
        }
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
        const geojson = await getSamplesGeoFeatureCollection({
          nameContains: debouncedSearchText || undefined,
          allowedAccess: allowedAccess,
          createdByIdEquals,
        })
        const map = mapRef.current
        if (!map) return
        const source = map.getSource('samples') as mapboxgl.GeoJSONSource | undefined
        source?.setData(geojson as any)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to refresh GeoJSON', e)
      }
    })()
  }, [debouncedSearchText, allowedAccess, createdByIdEquals])

  return <div ref={mapContainerRef} className="w-full h-[70vh] rounded-lg border" />
}


