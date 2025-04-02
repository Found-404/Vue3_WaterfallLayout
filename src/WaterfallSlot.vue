<template>
  <div class="vue-waterfall-slot" ref="node">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, getCurrentInstance, defineExpose } from "vue";

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
const node = ref(null);
const rect = ref({
  top: 0,
  left: 0,
  width: 0,
  height: 0,
});

const notify = () => {
  //   this.$parent.$emit("reflow", this);
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
watch(
  [() => props.width, () => props.height],
  ([newValA, oldValA], [newValB, oldValB]) => {
    console.log(newValA, oldValA, newValB, oldValB);
    // 通知父组件
    notify();
  }
);

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
