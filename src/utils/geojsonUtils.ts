import simplify from 'simplify-js'
import type { FeatureCollection, Geometry } from 'geojson'

export function simplifyGeoJSON(data: FeatureCollection<Geometry>): FeatureCollection<Geometry> {
  return {
    type: 'FeatureCollection',
    features: data.features.map((feature) => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        feature.geometry.coordinates = feature.geometry.coordinates.map((ring) => {
          const points = ring.map((coord) => ({ x: coord[0] as number, y: coord[1] as number }))
          const simplifiedPoints = simplify(points, 0.01, true)
          return simplifiedPoints.map((point) => [point.x, point.y])
        })
      }
      return feature
    }),
  }
}
