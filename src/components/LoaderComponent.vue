<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoaderComponent',
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  }
});
</script>

<template>
  <div class="container-loader d-flex h-100 w-100 justify-content-center align-items-center" v-if="loading">
    <div class="d-flex gap-2 rounded justify-content-center align-items-center bg-white shadow-sm p-3 rounder">
      <div class="spinner spinner-border" role="status">
      </div>
      <p class="mb-0">Chargement...</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container-loader {
  background-color: #00000036;

  .spinner {
    color: $green;
  }
}
</style>
