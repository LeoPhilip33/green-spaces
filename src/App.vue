<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavComponent.vue'
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="app-content flex-grow-1">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-content {
  margin-left: 7rem;
}
</style>
