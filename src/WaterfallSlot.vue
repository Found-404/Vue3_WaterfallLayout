<template>
  <div class="vue-waterfall-slot" ref="node" v-show="isShow">
    <slot></slot>
  </div>
</template>

<script setup>
import {
  ref,
  defineProps,
  watch,
  getCurrentInstance,
  onMounted,
  defineExpose,
  onUnmounted,
  inject,
} from "vue";

const instance = getCurrentInstance();
const props = defineProps({
  width: {
    type: Number,
    required: true,
    validator: (val) => val >= 0,
  },
  height: {
    type: Number,
    required: true,
    validator: (val) => val >= 0,
  },
  order: {
    type: Number,
    default: 0,
  },
  moveClass: {
    type: String,
    default: "",
  },
});
const isShow = ref(false);
const node = ref(null);
const rect = ref({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
});
const reflow = inject("reflow");

const notify = () => {
  reflow();
};

const getMeta = () => {
  return {
    vm: instance.proxy,
    node: node.value,
    order: props.order,
    width: props.width,
    height: props.height,
    moveClass: props.moveClass,
  };
};

// 监听props中的width和height
watch([() => props.width, () => props.height], () => {
  // 通知父组件
  notify();
});
const handler = () => {
  isShow.value = true;
};
onMounted(() => {
  handler();
});
onUnmounted(() => {
  notify();
});

defineExpose({
  getMeta,
  rect,
});
</script>

<style scoped>
.vue-waterfall-slot {
  position: absolute;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
