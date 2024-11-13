import type { FeatureCollection, Geometry, Feature } from 'geojson'

export interface GeoJsonProperties {
  leaf_type: string
  leisure: string
  landuse: string
  natural: string
  leaf_cycle: string
}

export interface GeoJsonResponse {
  data: FeatureCollection<Geometry, GeoJsonProperties>
}

export type GeoJsonFeature = Feature<Geometry, GeoJsonProperties>
