<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FilterComponent',
  props: {
    filterName: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      required: true,
    },
    icon: {
      type: String,
    },
  },
  data() {
    return {
      isActive: this.modelValue,
    };
  },
  watch: {
    modelValue(newValue) {
      this.isActive = newValue;
    },
  },
  methods: {
    toggleActive() {
      this.isActive = !this.isActive;
      this.$emit('update:modelValue', this.isActive);
      this.$emit('change', this.isActive);
    },
  },
});
</script>

<template>
  <button class="container-filter d-flex gap-2 align-items-center shadow-sm p-2 border rounded-pill"
    :class="{ active: isActive }" @click="toggleActive" :style="{ backgroundColor: isActive ? color : '' }">
    <i :class="icon"></i>
    <p class="mb-0">{{ filterName }}</p>
  </button>
</template>

<style lang="scss" scoped>
.container-filter {
  transition: 0.2s;
  height: fit-content;

  i {
    color: $green;
  }

  &:hover {
    transform: scale(1.05);
    transition: 0.2s;
  }

  &.active {
    color: $white;

    i {
      color: $white;
    }
  }

  p {
    font-size: 0.8rem;
  }
}
</style>
