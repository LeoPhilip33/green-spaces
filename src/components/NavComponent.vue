<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'NavComponent',
});
</script>

<template>
  <nav class="pt-3 pb-3 d-flex justify-content-between flex-column position-fixed vh-100">
    <a class="w-100 mr-0 ml-0" href="/">
      <img src="../assets/logo.png" alt="Logo netcarbon">
    </a>
    <div class="d-flex flex-column gap-3">
      <router-link to="/" class="d-flex flex-column align-items-center">
        <i class="bi bi-map-fill"></i>
        <p>Carte</p>
      </router-link>
      <router-link to="/statistics" class="d-flex flex-column align-items-center">
        <i class="bi bi-bar-chart-fill "></i>
        <p>Statistics</p>
      </router-link>
    </div>
    <small class="text-center">
      <p class="mb-0">Philip Léo</p>
      <p class="mb-0">06.37.25.99.14</p>
    </small>
  </nav>
</template>

<style lang="scss" scoped>
nav {
  width: 7rem;
  border-right: 0.1rem solid $white;

  img {
    width: inherit;
  }

  small {
    font-size: 0.8em;
  }

  a {
    color: $black;
    text-decoration: none;
  }
}

.router-link-active {
  font-weight: bold;
  color: $green;
}
</style>
