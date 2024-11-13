<script lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import FilterComponent from '@/components/FilterComponent.vue';
import LoaderComponent from '@/components/LoaderComponent.vue';
import { COLORS } from '@/utils/colors';
import { simplifyGeoJSON } from '@/utils/geojsonUtils';
import { GREEN_SPACE_FILTERS } from '@/utils/filters';
import { GreenSpaces } from '@/enums/GreenSpaces';
import { initializeMap, removeExistingLayersAndSources, showPopup } from '@/utils/mapUtils';
import { MapLayers, MapSources } from '@/enums/map.enums';

export default {
  name: 'HomeView',
  components: {
    FilterComponent,
    LoaderComponent
  },
  data() {
    return {
      greenSpaces: GreenSpaces,
      loading: true as boolean,
      filters: {
        parks: false,
        gardens: false,
        playgrounds: false,
        pitches: false,
        forests: false,
        woods: false,
        trees: false,
        deciduous: false,
        broadleaved: false,
        needleleaved: false,
        heatzones: false,
      },
      colors: COLORS,
      geojsonData: null as Array<GeoJSON.FeatureCollection> | null,
      map: null as mapboxgl.Map | null,
    };
  },
  mounted() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicGhpbGlwbGVvIiwiYSI6ImNtMzc4NGI0bjBldzEybXNmN2ltb2F3ZDEifQ._Zl6AnfQY1xmGDIsTTihMA';
    const geojsonFiles = [
      '/geojson/green_spaces_paris.geojson',
      '/geojson/trees_paris.geojson',
      '/geojson/lst_paris_2022.geojson'
    ];
    const geojsonPromises = geojsonFiles.map(file => axios.get(file));
    Promise.all(geojsonPromises)
      .then(responses => {
        this.geojsonData = responses.map(response => response.data);
        this.initializeMap();
      })
      .catch(error => {
        console.error('Error loading GeoJSON data:', error);
        this.loading = false;
      });
  },
  methods: {
    initializeMap() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.map = initializeMap(
        'map',
        'mapbox://styles/philipleo/cm37lqs4w00gd01pd29tg4txb',
        [2.3522, 48.8566],
        11
      );

      if (!this.map) return;
      this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      this.map.on('load', () => {
        this.updateMapLayers();
        this.addLayerClickHandlers();
        this.loading = false;
      });
    },
    updateMapLayers() {
      if (!this.geojsonData || !this.map) return;

      removeExistingLayersAndSources(this.map,
        [
          MapLayers.ParksLayer,
          MapLayers.GardensLayer,
          MapLayers.PlaygroundsLayer,
          MapLayers.PitchesLayer,
          MapLayers.ForestsLayer,
          MapLayers.WoodsLayer,
          MapLayers.Clusters,
          MapLayers.ClusterCount,
          MapLayers.UnclusteredPoint,
          MapLayers.HeatzonesLayer
        ],
        [
          MapSources.ParksSource,
          MapSources.GardensSource,
          MapSources.PlaygroundsSource,
          MapSources.PitchesSource,
          MapSources.ForestsSource,
          MapSources.WoodsSource,
          MapSources.TreesSource,
          MapSources.HeatzonesSource
        ]);
      if (this.filters.heatzones) {
        this.addHeatmapLayer();
      }
      this.addFilteredLayers();
      if (this.filters.trees) {
        this.addTreeLayers();
      }
    },
    addTreeLayers() {
      if (!this.geojsonData) return;

      let treesData = this.geojsonData[1].features;
      if (this.filters.deciduous) {
        treesData = treesData.filter((feature) => feature.properties && feature.properties.leaf_cycle === 'deciduous');
      }
      if (this.filters.broadleaved) {
        treesData = treesData.filter((feature) => feature.properties && feature.properties.leaf_type === 'broadleaved');
      }
      if (this.filters.needleleaved) {
        treesData = treesData.filter((feature) => feature.properties && feature.properties.leaf_type === 'needleleaved');
      }
      if (this.map?.getSource(MapSources.TreesSource)) {
        (this.map.getSource(MapSources.TreesSource) as mapboxgl.GeoJSONSource)?.setData({
          type: 'FeatureCollection',
          features: treesData,
        });
      } else {
        this.map?.addSource(MapSources.TreesSource, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: treesData,
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 100,
        });
      }
      if (!this.map?.getLayer(MapLayers.Clusters)) {
        this.map?.addLayer({
          id: MapLayers.Clusters,
          type: 'circle',
          source: MapSources.TreesSource,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': this.colors.trees,
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              100,
              30,
              750,
              40
            ],
          },
        });
      }
      if (!this.map?.getLayer(MapLayers.ClusterCount)) {
        this.map?.addLayer({
          id: MapLayers.ClusterCount,
          type: 'symbol',
          source: MapSources.TreesSource,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });
      }
      if (!this.map?.getLayer(MapLayers.UnclusteredPoint)) {
        this.map?.addLayer({
          id: MapLayers.UnclusteredPoint,
          type: 'circle',
          source: MapSources.TreesSource,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': this.colors.trees,
            'circle-radius': 10,
          },
        });
      }
    },
    addHeatmapLayer() {
      if (!this.geojsonData) return;

      const simplifiedData = simplifyGeoJSON(this.geojsonData[2]);
      if (this.map?.getSource(MapSources.HeatzonesSource)) {
        (this.map.getSource(MapSources.HeatzonesSource) as mapboxgl.GeoJSONSource)?.setData({
          type: 'FeatureCollection',
          features: simplifiedData.features
        });
      } else {
        this.map?.addSource(MapSources.HeatzonesSource, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: simplifiedData.features
          },
        });
      }
      if (!this.map?.getLayer(MapLayers.HeatzonesLayer)) {
        this.map?.addLayer({
          id: MapLayers.HeatzonesLayer,
          type: 'heatmap',
          source: MapSources.HeatzonesSource,
          paint: {
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-opacity': 0.5
          }
        });
      }
    },
    addFilteredLayers() {
      GREEN_SPACE_FILTERS.forEach(filter => {
        if (this.filters[filter.key as keyof typeof this.filters]) {
          const data = {
            type: 'FeatureCollection',
            features: (this.geojsonData && this.geojsonData[0] as GeoJSON.FeatureCollection)?.features.filter((feature) => feature.properties && feature.properties[filter.property] === filter.value) || []
          };
          if (this.map?.getSource(`${filter.key}Source`)) {
            (this.map?.getSource(`${filter.key}Source`) as mapboxgl.GeoJSONSource).setData({
              type: 'FeatureCollection',
              features: data.features
            });
          } else {
            this.map?.addSource(`${filter.key}Source`, {
              type: 'geojson',
              data: data as GeoJSON.FeatureCollection,
            });
          }
          if (!this.map?.getLayer(`${filter.key}Layer`)) {
            this.map?.addLayer({
              id: `${filter.key}Layer`,
              type: 'fill',
              source: `${filter.key}Source`,
              layout: {},
              paint: {
                'fill-color': this.colors[filter.key as keyof typeof this.colors],
                'fill-opacity': 0.5,
              },
            });
          }
        }
      });
    },
    addLayerClickHandlers() {
      const layers = [
        MapLayers.ParksLayer,
        MapLayers.GardensLayer,
        MapLayers.PlaygroundsLayer,
        MapLayers.PitchesLayer,
        MapLayers.ForestsLayer,
        MapLayers.WoodsLayer,
        MapLayers.UnclusteredPoint
      ];
      layers.forEach(layer => {
        this.map?.on('click', layer, (e) => {
          if (!this.map) return;
          showPopup(this.map, e);
        });
      });
    },
  }
};
</script>

<template>
  <div class="container-home position-relative">
    <LoaderComponent class="position-absolute z-3" :loading="loading" />
    <div class="position-relative">
      <div class="position-absolute z-1 top-0 start-0 p-3">
        <div class="d-flex flex-wrap gap-2">
          <FilterComponent :filterName="greenSpaces.Parks" :color="colors.parks" :icon="'bi bi-bounding-box'"
            v-model="filters.parks" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.Gardens" :color="colors.gardens" :icon="'bi bi-flower1'"
            v-model="filters.gardens" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.Playgrounds" :color="colors.playgrounds" :icon="'bi bi-dice-1-fill'"
            v-model="filters.playgrounds" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.Pitches" :color="colors.pitches" :icon="'bi bi-geo-alt-fill'"
            v-model="filters.pitches" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.Forests" :color="colors.forests" :icon="'bi bi-signpost-2-fill'"
            v-model="filters.forests" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.Woods" :color="colors.woods" :icon="'bi bi-signpost-fill'"
            v-model="filters.woods" @change="updateMapLayers" />
          <FilterComponent :filterName="greenSpaces.HeatMap" :color="colors.heatzones" :icon="'bi bi-thermometer-half'"
            v-model="filters.heatzones" @change="updateMapLayers" />
          <div>
            <FilterComponent :filterName="greenSpaces.Trees" :color="colors.trees" :icon="'bi bi-tree-fill'"
              v-model="filters.trees" @change="updateMapLayers" />
            <div v-if="filters.trees" class="ms-2 mt-2 d-flex flex-column gap-1">
              <FilterComponent :filterName="greenSpaces.DeciduousTrees" :color="colors.deciduous"
                v-model="filters.deciduous" @change="updateMapLayers" />
              <FilterComponent :filterName="greenSpaces.BroadleavedTrees" :color="colors.broadleaved"
                v-model="filters.broadleaved" @change="updateMapLayers" />
              <FilterComponent :filterName="greenSpaces.NeedleleavedTrees" :color="colors.needleleaved"
                v-model="filters.needleleaved" @change="updateMapLayers" />
            </div>
          </div>
        </div>
      </div>
      <div id="map"></div>
    </div>
  </div>
</template>

<style scoped>
#map {
  height: 100vh;
  width: 100%;
}
</style>
