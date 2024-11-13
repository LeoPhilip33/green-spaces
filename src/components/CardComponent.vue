<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CardComponent',
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
  },
});
</script>

<template>
  <div class="col-md-4 mb-3">
    <div class="card">
      <div class="card-body d-flex justify-content-between">
        <h5 class="card-title mb-0">{{ title }}</h5>
        <p class="card-text">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.01);
    box-shadow: 0 0px 3px $green;
  }
}
</style>
