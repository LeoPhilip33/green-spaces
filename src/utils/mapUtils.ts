import type { GeoJsonFeature } from '@/types/GeoJson'
import mapboxgl, { type MapEvent } from 'mapbox-gl'

export function initializeMap(
  container: string,
  style: string,
  center: [number, number],
  zoom: number,
): mapboxgl.Map {
  return new mapboxgl.Map({
    container,
    style,
    center,
    zoom,
  })
}

export function removeExistingLayersAndSources(
  map: mapboxgl.Map,
  layers: string[],
  sources: string[],
): void {
  layers.forEach((layer) => {
    if (map.getLayer(layer)) {
      map.removeLayer(layer)
    }
  })
  sources.forEach((source) => {
    if (map.getSource(source)) {
      map.removeSource(source)
    }
  })
}

export function showPopup(map: mapboxgl.Map, e: mapboxgl.MapMouseEvent & MapEvent): void {
  if (!e.features || !e.features[0]) {
    console.error('No features found in the event:', e)
    return
  }
  const geometry = e.features[0].geometry as GeoJsonFeature['geometry']
  const coordinates =
    geometry.type === 'Point'
      ? geometry.coordinates
      : geometry.type === 'Polygon'
        ? geometry.coordinates[0]
        : geometry.type === 'MultiPoint' ||
            geometry.type === 'LineString' ||
            geometry.type === 'MultiLineString' ||
            geometry.type === 'MultiPolygon'
          ? geometry.coordinates[0][0]
          : null
  const properties = e.features[0].properties

  let lngLat
  if (coordinates && Array.isArray(coordinates) && Array.isArray(coordinates[0])) {
    lngLat = coordinates[0] as [number, number]
  } else {
    lngLat = coordinates as [number, number]
  }

  if (
    Array.isArray(lngLat) &&
    lngLat.length === 2 &&
    typeof lngLat[0] === 'number' &&
    typeof lngLat[1] === 'number' &&
    !isNaN(lngLat[0]) &&
    !isNaN(lngLat[1])
  ) {
    let description = '<strong>Details:</strong><br>'
    for (const key in properties) {
      description += `${key}: ${properties[key]}<br>`
    }

    new mapboxgl.Popup().setLngLat(lngLat).setHTML(description).addTo(map)
  } else {
    console.error('Invalid coordinates:', lngLat)
  }
}
