<template>
  <el-skeleton :animated="animation" :count="count" :loading="showLoading" :rows="2">
    <template #template>
      <div class="skeleton-wrapper">
        <el-skeleton-item variant="image" :style="size"></el-skeleton-item>
      </div>
    </template>
  </el-skeleton>
</template>
<script setup>
const props = defineProps({
  showLoading: {
    type: Boolean,
    default: false,
  },
  animation: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 1,
  },
  size: {
    type: Object,
    default: () => {
      return { width: '200px', height: '200px' };
    },
  },
});
</script>
<style lang="scss" scoped>
.el-skeleton {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}

.skeleton-wrapper {
  margin: 0 20px 20px 0;
}
</style>