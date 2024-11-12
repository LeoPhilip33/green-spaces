<script lang="ts">
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import FilterComponent from '@/components/FilterComponent.vue';
import { COLORS } from '@/utils/colors';
import { FILTERS } from '@/utils/filters';
import simplify from 'simplify-js';
import Loader from '@/components/LoaderComponent.vue';

export default {
  name: 'HomeView',
  components: {
    FilterComponent,
    Loader
  },
  data() {
    return {
      loading: true,
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
      geojsonData: null,
      map: null,
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
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/philipleo/cm37lqs4w00gd01pd29tg4txb',
        center: [2.3522, 48.8566],
        zoom: 11,
      });
      this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      this.map.on('load', () => {
        this.updateMapLayers();
        this.addLayerClickHandlers();
        this.loading = false;
      });
    },
    resetFilters() {
      for (const key in this.filters) {
        this.filters[key] = false;
      }
    },
    updateMapLayers() {
      if (!this.geojsonData) return;

      this.removeExistingLayersAndSources();
      if (this.filters.heatzones) {
        this.addHeatmapLayer();
      }
      this.addFilteredLayers();
      if (this.filters.trees) {
        this.addTreeLayers();
      }
    },
    removeExistingLayersAndSources() {
      const layers = ['parksLayer', 'gardensLayer', 'playgroundsLayer', 'pitchesLayer', 'forestsLayer', 'woodsLayer', 'clusters', 'cluster-count', 'unclustered-point', 'heatzonesLayer'];
      const sources = ['parksSource', 'gardensSource', 'playgroundsSource', 'pitchesSource', 'forestsSource', 'woodsSource', 'treesSource', 'heatzonesSource'];
      layers.forEach(layer => {
        if (this.map.getLayer(layer)) {
          this.map.removeLayer(layer);
        }
      });
      sources.forEach(source => {
        if (this.map.getSource(source)) {
          this.map.removeSource(source);
        }
      });
    },
    addTreeLayers() {
      let treesData = this.geojsonData[1].features;
      if (this.filters.deciduous) {
        treesData = treesData.filter(feature => feature.properties.leaf_cycle === 'deciduous');
      }
      if (this.filters.broadleaved) {
        treesData = treesData.filter(feature => feature.properties.leaf_type === 'broadleaved');
      }
      if (this.filters.needleleaved) {
        treesData = treesData.filter(feature => feature.properties.leaf_type === 'needleleaved');
      }
      if (this.map.getSource('treesSource')) {
        this.map.getSource('treesSource').setData({
          type: 'FeatureCollection',
          features: treesData,
        });
      } else {
        this.map.addSource('treesSource', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: treesData,
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });
      }
      if (!this.map.getLayer('clusters')) {
        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'treesSource',
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
      if (!this.map.getLayer('cluster-count')) {
        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'treesSource',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
        });
      }
      if (!this.map.getLayer('unclustered-point')) {
        this.map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'treesSource',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': this.colors.trees,
            'circle-radius': 10,
          },
        });
      }
    },
    addHeatmapLayer() {
      const simplifiedData = this.simplifyGeoJSON(this.geojsonData[2]);
      if (this.map.getSource('heatzonesSource')) {
        this.map.getSource('heatzonesSource').setData(simplifiedData);
      } else {
        this.map.addSource('heatzonesSource', {
          type: 'geojson',
          data: simplifiedData,
        });
      }
      if (!this.map.getLayer('heatzonesLayer')) {
        this.map.addLayer({
          id: 'heatzonesLayer',
          type: 'heatmap',
          source: 'heatzonesSource',
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
    simplifyGeoJSON(data) {
      return {
        type: 'FeatureCollection',
        features: data.features.map(feature => {
          if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates = feature.geometry.coordinates.map(ring => simplify(ring, 0.01, true));
          }
          return feature;
        })
      };
    },
    addFilteredLayers() {
      FILTERS.forEach(filter => {
        if (this.filters[filter.key]) {
          const data = {
            type: 'FeatureCollection',
            features: this.geojsonData[0].features.filter(feature => feature.properties[filter.property] === filter.value)
          };
          if (this.map.getSource(`${filter.key}Source`)) {
            this.map.getSource(`${filter.key}Source`).setData(data);
          } else {
            this.map.addSource(`${filter.key}Source`, {
              type: 'geojson',
              data: data,
            });
          }
          if (!this.map.getLayer(`${filter.key}Layer`)) {
            this.map.addLayer({
              id: `${filter.key}Layer`,
              type: 'fill',
              source: `${filter.key}Source`,
              layout: {},
              paint: {
                'fill-color': this.colors[filter.key],
                'fill-opacity': 0.5,
              },
            });
          }
        }
      });
    },
    addLayerClickHandlers() {
      const layers = ['parksLayer', 'gardensLayer', 'playgroundsLayer', 'pitchesLayer', 'forestsLayer', 'woodsLayer', 'unclustered-point'];
      layers.forEach(layer => {
        this.map.on('click', layer, (e) => {
          this.showPopup(e);
        });
      });
    },
    showPopup(e) {
      const coordinates = e.features[0].geometry.coordinates;
      const properties = e.features[0].properties;

      let lngLat;
      if (Array.isArray(coordinates[0])) {
        lngLat = coordinates[0][0];
      } else {
        lngLat = coordinates;
      }

      if (lngLat.length === 2 && !isNaN(lngLat[0]) && !isNaN(lngLat[1])) {
        let description = '<strong>Details:</strong><br>';
        for (const key in properties) {
          description += `${key}: ${properties[key]}<br>`;
        }

        new mapboxgl.Popup()
          .setLngLat(lngLat)
          .setHTML(description)
          .addTo(this.map);
      } else {
        console.error('Invalid coordinates:', lngLat);
      }
    }
  }
};
</script>

<template>
  <div class="container-home position-relative">
    <Loader class="position-absolute z-3" :loading="loading" />
    <div class="position-relative">
      <div class="position-absolute z-1 top-0 start-0 p-3">
        <div class="d-flex flex-wrap gap-2">
          <FilterComponent :filterName="'Parcs'" :color="colors.parks" :icon="'bi bi-bounding-box'"
            v-model="filters.parks" @change="updateMapLayers" />
          <FilterComponent :filterName="'Jardins'" :color="colors.gardens" :icon="'bi bi-flower1'"
            v-model="filters.gardens" @change="updateMapLayers" />
          <FilterComponent :filterName="'Aires de jeux'" :color="colors.playgrounds" :icon="'bi bi-dice-1-fill'"
            v-model="filters.playgrounds" @change="updateMapLayers" />
          <FilterComponent :filterName="'Emplacements'" :color="colors.pitches" :icon="'bi bi-geo-alt-fill'"
            v-model="filters.pitches" @change="updateMapLayers" />
          <FilterComponent :filterName="'Forêts'" :color="colors.forests" :icon="'bi bi-signpost-2-fill'"
            v-model="filters.forests" @change="updateMapLayers" />
          <FilterComponent :filterName="'Bois'" :color="colors.woods" :icon="'bi bi-signpost-fill'"
            v-model="filters.woods" @change="updateMapLayers" />
          <FilterComponent :filterName="'Carte thermique'" :color="colors.heatzones" :icon="'bi bi-thermometer-half'"
            v-model="filters.heatzones" @change="updateMapLayers" />
          <div>
            <FilterComponent :filterName="'Arbres'" :color="colors.trees" :icon="'bi bi-tree-fill'"
              v-model="filters.trees" @change="updateMapLayers" />
            <div v-if="filters.trees" class="ms-2 mt-2 d-flex flex-column gap-1">
              <FilterComponent :filterName="'Arbres à feuilles caduques'" :color="colors.deciduous"
                v-model="filters.deciduous" @change="updateMapLayers" />
              <FilterComponent :filterName="'Arbres à feuilles larges'" :color="colors.broadleaved"
                v-model="filters.broadleaved" @change="updateMapLayers" />
              <FilterComponent :filterName="'Arbres à feuilles d\'aiguilles'" :color="colors.needleleaved"
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
