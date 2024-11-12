<script lang="ts">
import { Chart, registerables } from 'chart.js';
import { COLORS } from '@/utils/colors';
import { GreenSpaces } from '@/enums/GreenSpaces';

Chart.register(...registerables);

export default {
  name: 'StatisticsComponent',
  props: {
    statistics: Object,
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.renderChart();
  },
  watch: {
    statistics: {
      deep: true,
      handler() {
        if (this.chart) {
          this.chart.destroy();
        }
        this.renderChart();
      },
    },
  },
  methods: {
    renderChart() {
      this.$nextTick(() => {
        const ctx = this.$refs.statisticsChart?.getContext('2d');
        if (!ctx) {
          console.error('Canvas context not found');
          return;
        }
        this.chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: [GreenSpaces.Parks, GreenSpaces.Gardens, GreenSpaces.Playgrounds, GreenSpaces.Pitches, GreenSpaces.Forests, GreenSpaces.Woods, GreenSpaces.Trees],
            datasets: [
              {
                label: 'Total',
                data: [
                  this.statistics.totalParks,
                  this.statistics.totalGardens,
                  this.statistics.totalPlaygrounds,
                  this.statistics.totalPitches,
                  this.statistics.totalForests,
                  this.statistics.totalWoods,
                  this.statistics.totalTrees,
                ],
                backgroundColor: [
                  COLORS.parks,
                  COLORS.gardens,
                  COLORS.playgrounds,
                  COLORS.pitches,
                  COLORS.forests,
                  COLORS.woods,
                  COLORS.trees,
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Répartition des espaces verts',
              },
            },
          },
        });
      });
    },
  },
};
</script>

<template>
  <div>
    <canvas ref="statisticsChart"></canvas>
  </div>
</template>


<style scoped>
canvas {
  max-height: 30rem;
}
</style>
