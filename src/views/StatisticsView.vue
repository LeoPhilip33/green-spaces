<script lang="ts">
import axios from 'axios';
import StatisticsComponent from '@/components/StatisticsComponent.vue';
import CardComponent from '@/components/CardComponent.vue';
import LoaderComponent from '@/components/LoaderComponent.vue';
import { GreenSpaces } from '@/enums/GreenSpaces';
import type { Statistics } from '@/types/Statistics';
import type { FeatureCollection, Geometry } from 'geojson';
import type { GeoJsonProperties, GeoJsonResponse, GeoJsonFeature } from '@/types/GeoJson';

export default {
  name: 'StatisticsView',
  components: {
    StatisticsComponent,
    CardComponent,
    LoaderComponent
  },
  data() {
    return {
      loading: false as boolean,
      geojsonData: null as FeatureCollection<Geometry, GeoJsonProperties>[] | null,
      statistics: {
        totalParks: 0,
        totalGardens: 0,
        totalPlaygrounds: 0,
        totalPitches: 0,
        totalForests: 0,
        totalWoods: 0,
        totalTrees: 0,
        percentageDeciduous: 0,
        percentageBroadleaved: 0,
        percentageNeedleleaved: 0,
      } as Statistics,
    };
  },
  computed: {
    formattedStatistics() {
      return {
        [GreenSpaces.Parks]: this.statistics.totalParks,
        [GreenSpaces.Gardens]: this.statistics.totalGardens,
        [GreenSpaces.Playgrounds]: this.statistics.totalPlaygrounds,
        [GreenSpaces.Pitches]: this.statistics.totalPitches,
        [GreenSpaces.Forests]: this.statistics.totalForests,
        [GreenSpaces.Woods]: this.statistics.totalWoods,
        [GreenSpaces.Trees]: this.statistics.totalTrees,
        [GreenSpaces.DeciduousTrees]: `${this.statistics.percentageDeciduous} %`,
        [GreenSpaces.BroadleavedTrees]: `${this.statistics.percentageBroadleaved} %`,
        [GreenSpaces.NeedleleavedTrees]: `${this.statistics.percentageNeedleleaved} %`,
      };
    }
  },
  mounted() {
    this.loading = true;
    this.loadGeojsonData();
  },
  methods: {
    async loadGeojsonData(): Promise<void> {
      try {
        const responses: [GeoJsonResponse, GeoJsonResponse] = await Promise.all([
          axios.get('./geojson/green_spaces_paris.geojson'),
          axios.get('./geojson/trees_paris.geojson'),
        ]);
        this.geojsonData = responses.map(response => response.data);
        this.calculateStatistics();
        this.loading = false;
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        this.loading = false;
      }
    },
    calculateStatistics(): void {
      if (!this.geojsonData) {
        return;
      }

      const parks = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.leisure === 'park').length;
      const gardens = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.leisure === 'garden').length;
      const playgrounds = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.leisure === 'playground').length;
      const pitches = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.leisure === 'pitch').length;
      const forests = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.landuse === 'forest').length;
      const woods = this.geojsonData[0].features.filter((feature: GeoJsonFeature) => feature.properties.natural === 'wood').length;
      const trees = this.geojsonData[1].features.length;
      const deciduousTrees = this.geojsonData[1].features.filter((feature: GeoJsonFeature) => feature.properties.leaf_cycle === 'deciduous').length;
      const broadleavedTrees = this.geojsonData[1].features.filter((feature: GeoJsonFeature) => feature.properties.leaf_type === 'broadleaved').length;
      const needleleavedTrees = this.geojsonData[1].features.filter((feature: GeoJsonFeature) => feature.properties.leaf_type === 'needleleaved').length;

      this.statistics.totalParks = parks;
      this.statistics.totalGardens = gardens;
      this.statistics.totalPlaygrounds = playgrounds;
      this.statistics.totalPitches = pitches;
      this.statistics.totalForests = forests;
      this.statistics.totalWoods = woods;
      this.statistics.totalTrees = trees;
      this.statistics.percentageDeciduous = parseFloat(((deciduousTrees / trees) * 100).toFixed(2));
      this.statistics.percentageBroadleaved = parseFloat(((broadleavedTrees / trees) * 100).toFixed(2));
      this.statistics.percentageNeedleleaved = parseFloat(((needleleavedTrees / trees) * 100).toFixed(2));
    },
  },
};
</script>

<template>
  <div class="position-relative">
    <LoaderComponent class="position-absolute z-3" :loading="loading" />
    <div class="container mt-4">
      <div class="row">
        <CardComponent v-for="(value, key) in formattedStatistics" :key="key" :title="key" :value="value" />
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <StatisticsComponent :statistics="statistics" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  margin-bottom: 1rem;
}
</style>
