<template>
  <div class="vue-waterfall" :style="style" ref="waterfallRef">
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
  onBeforeUnmount,
} from "vue";
import { horizontalLineProcessor, verticalLineProcessor } from "./model.js";
const MOVE_CLASS_PROP = "_wfMoveClass";
const props = defineProps({
  autoResize: {
    type: Boolean,
    default: true,
  },
  interval: {
    default: 200,
    validator: (val) => val >= 0,
  },
  align: {
    default: "left",
    validator: (val) => ~["left", "right", "center"].indexOf(val),
  },
  line: {
    default: "v",
    validator: (val) => ~["v", "h"].indexOf(val),
  },
  lineGap: {
    required: true,
    validator: (val) => val >= 0,
  },
  minLineGap: {
    validator: (val) => val >= 0,
  },
  maxLineGap: {
    validator: (val) => val >= 0,
  },
  singleMaxWidth: {
    validator: (val) => val >= 0,
  },
  grow: {
    validator: (val) => val instanceof Array, // 固定列宽
  },
  fixedHeight: {
    default: false,
  },
  watch: {
    default: () => ({}),
  },
});
const waterfallRef = ref();
const instance = getCurrentInstance();
const virtualRects = ref([]);
const token = ref();

watch(
  [
    () => props.align,
    () => props.line,
    () => props.lineGap,
    () => props.minLineGap,
    () => props.maxLineGap,
    () => props.singleMaxWidth,
    () => props.fixedHeight,
    () => props.watch,
  ],
  () => {
    reflowHandler();
  },
  {
    immediate: true,
  }
);

watch(
  props.grow,
  () => {
    reflowHandler();
  },
  {
    immediate: true,
  }
);

/**
 * - this     ==> instance.proxy
 * - this.$el ==> instance.proxy.$el
 */
function reflow() {
  if (!instance.proxy.$el) {
    return;
  }
  let width = instance.proxy.$el.clientWidth;
  /**
   * waterfallRef.value.children 伪数组不支持数组方法,通过Array.from转换
   */
  let metas = Array.from(waterfallRef.value?.children).map((e) =>
    e.__vueParentComponent.exposed.getMeta()
  );
  metas.sort((a, b) => a.order - b.order);
  virtualRects.value = metas.map(() => ({}));
  calculate(instance.proxy, metas, virtualRects.value);
  setTimeout(() => {
    if (isScrollBarVisibilityChange(instance.proxy.$el, width)) {
      calculate(instance.proxy, metas, virtualRects.value);
    }
    instance.proxy.$el.style.overflow = "hidden";
    render(virtualRects.value, metas);
    instance.proxy.$emit("reflowed", instance.proxy);
  }, 0);
}

// 监听props中的autoResize
const watchAutoResize = () => {
  watch(
    props.autoResize,
    (newValA, oldValA) => {
      autoResizeHandler(newValA);
    },
    {
      immediate: true,
    }
  );
  on(instance.proxy.$el, getTransitionEndEvent(), tidyUpAnimations, true);
  autoResizeHandler(props.autoResize);
};

// 渲染
function render(rects, metas) {
  let metasNeedToMoveByTransform = metas.filter((meta) => meta.moveClass);
  let firstRects = getRects(metasNeedToMoveByTransform);
  applyRects(rects, metas);
  let lastRects = getRects(metasNeedToMoveByTransform);
  metasNeedToMoveByTransform.forEach((meta, i) => {
    meta.node[MOVE_CLASS_PROP] = meta.moveClass;
    setTransform(meta.node, firstRects[i], lastRects[i]);
  });
  document.body.clientWidth; // forced reflow
  metasNeedToMoveByTransform.forEach((meta) => {
    addClass(meta.node, meta.moveClass);
    clearTransform(meta.node);
  });
}

function clearTransform(node) {
  node.style.transform = node.style.WebkitTransform = "";
  node.style.transitionDuration = "";
}

function addClass(elem, name) {
  if (!hasClass(elem, name)) {
    let cur = attr(elem, "class").trim();
    let res = (cur + " " + name).trim();
    attr(elem, "class", res);
  }
}

function hasClass(elem, name) {
  return new RegExp("\\b" + name + "\\b").test(attr(elem, "class"));
}

function setTransform(node, firstRect, lastRect) {
  let dx = firstRect.left - lastRect.left;
  let dy = firstRect.top - lastRect.top;
  let sw = firstRect.width / lastRect.width;
  let sh = firstRect.height / lastRect.height;
  node.style.transform =
    node.style.WebkitTransform = `translate(${dx}px,${dy}px) scale(${sw},${sh})`;
  node.style.transitionDuration = "0s";
}

function getRects(metas) {
  return metas.map((meta) => meta.vm._.exposed.rect.value);
}

function applyRects(rects, metas) {
  rects.forEach((rect, i) => {
    let style = metas[i].node.style;
    metas[i].vm._.exposed.rect.value = rect;
    for (let prop in rect) {
      style[prop] = rect[prop] + "px";
    }
  });
}

function isScrollBarVisibilityChange(el, lastClientWidth) {
  return lastClientWidth !== el.clientWidth;
}

function getOptions(vm) {
  const maxLineGap = vm.maxLineGap ? +vm.maxLineGap : vm.lineGap;
  return {
    align: ~["left", "right", "center"].indexOf(vm.align) ? vm.align : "left",
    line: ~["v", "h"].indexOf(vm.line) ? vm.line : "v",
    lineGap: +vm.lineGap,
    minLineGap: vm.minLineGap ? +vm.minLineGap : vm.lineGap,
    maxLineGap: maxLineGap,
    singleMaxWidth: Math.max(vm.singleMaxWidth || 0, maxLineGap),
    fixedHeight: !!vm.fixedHeight,
    grow: vm.grow && vm.grow.map((val) => +val),
  };
}

// 根据props传入的[line] 判断布局方式
function calculate(vm, metas, styles) {
  let options = getOptions(vm);
  let processor =
    vm.line === "h" ? horizontalLineProcessor : verticalLineProcessor;
  processor.calculate(vm, options, metas, styles);
}

// 根据传入的props-autoResize 【开启/关闭】监听
function autoResizeHandler(autoResize) {
  if (autoResize === false || !props.autoResize) {
    off(window, "resize", reflowHandler, false);
  } else {
    on(window, "resize", reflowHandler, false);
  }
}

// 防抖
// 清除定时器，重新计时
function reflowHandler() {
  clearTimeout(token.value);
  token.value = setTimeout(reflow, props.interval);
}

function tidyUpAnimations(event) {
  let node = event.target;
  let moveClass = node[MOVE_CLASS_PROP];
  if (moveClass) {
    removeClass(node, moveClass);
  }
}

// 删除类名
function removeClass(elem, name) {
  let reg = new RegExp("\\s*\\b" + name + "\\b\\s*", "g");
  let res = attr(elem, "class").replace(reg, " ").trim();
  attr(elem, "class", res);
}

// 设置/获取 DOM属性
function attr(elem, name, value) {
  if (typeof value !== "undefined") {
    elem.setAttribute(name, value);
  } else {
    return elem.getAttribute(name) || "";
  }
}

function getTransitionEndEvent() {
  let isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined;
  let transitionEndEvent = isWebkitTrans
    ? "webkitTransitionEnd"
    : "transitionend";
  return transitionEndEvent;
}

// 添加事件监听
function on(elem, type, listener, useCapture = false) {
  elem.addEventListener(type, listener, useCapture);
}
// 删除事件监听
function off(elem, type, listener, useCapture = false) {
  elem.removeEventListener(type, listener, useCapture);
}

onMounted(() => {
  watchAutoResize();
});

// 组件销毁
onBeforeUnmount(() => {
  autoResizeHandler(false);
  off(instance.proxy.$el, getTransitionEndEvent(), tidyUpAnimations, true);
});
</script>

<style scoped>
.vue-waterfall {
  position: relative;
  /*overflow: hidden; cause clientWidth = 0 in IE if height not bigger than 0 */
}
</style>
