<template>
  <a-select>
    <a-select-option v-for="item of options" :keu="item.value" :value="item.value" :label="item.label">
      <span class="flex-o">
        <fs-icon :icon="item.icon" class="fs-16 color-blue mr-5" />
        {{ item.label }}
      </span>
    </a-select-option>
  </a-select>
</template>

<script lang="ts" setup>
const props = defineProps<{
  options: { value: any; label: string; icon: string }[];
}>();
</script>
