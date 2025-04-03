import { ref, getCurrentInstance, provide, watch, onMounted, onUnmounted, onBeforeUnmount, createElementBlock, openBlock, renderSlot, inject, withDirectives, vShow } from "vue";
var horizontalLineProcessor = /* @__PURE__ */ (() => {
  function calculate(vm, options, metas, rects) {
    let width = vm.$el.clientWidth;
    let total = metas.length;
    let top = 0;
    let offset = 0;
    while (offset < total) {
      let strategy = getRowStrategy(width, options, metas, offset);
      for (let i = 0, left = 0, meta, rect; i < strategy.count; i++) {
        meta = metas[offset + i];
        rect = rects[offset + i];
        rect.top = top;
        rect.left = strategy.left + left;
        rect.width = meta.width * strategy.height / meta.height;
        rect.height = strategy.height;
        left += rect.width;
      }
      offset += strategy.count;
      top += strategy.height;
    }
    vm.$el.style.height = top + "px";
  }
  function getRowStrategy(width, options, metas, offset) {
    let greedyCount = getGreedyCount(width, options.lineGap, metas, offset);
    let lazyCount = Math.max(greedyCount - 1, 1);
    let greedySize = getContentSize(width, options, metas, offset, greedyCount);
    let lazySize = getContentSize(width, options, metas, offset, lazyCount);
    let finalSize = chooseFinalSize(lazySize, greedySize, width);
    let height = finalSize.height;
    let fitContentWidth = finalSize.width;
    if (finalSize.count === 1) {
      fitContentWidth = Math.min(options.singleMaxWidth, width);
      height = metas[offset].height * fitContentWidth / metas[offset].width;
    }
    return {
      left: getLeft(width, fitContentWidth, options.align),
      // 行起始位置
      count: finalSize.count,
      // 项目数
      height
      // 行高度
    };
  }
  function getGreedyCount(rowWidth, rowHeight, metas, offset) {
    let count = 0;
    for (let i = offset, width = 0; i < metas.length && width <= rowWidth; i++) {
      width += metas[i].width * rowHeight / metas[i].height;
      count++;
    }
    return count;
  }
  function getContentSize(rowWidth, options, metas, offset, count) {
    let originWidth = 0;
    for (let i = count - 1; i >= 0; i--) {
      let meta = metas[offset + i];
      originWidth += meta.width * options.lineGap / meta.height;
    }
    let fitHeight = options.lineGap * rowWidth / originWidth;
    let canFit = fitHeight <= options.maxLineGap && fitHeight >= options.minLineGap;
    if (canFit) {
      return {
        cost: Math.abs(options.lineGap - fitHeight),
        count,
        width: rowWidth,
        height: fitHeight
      };
    } else {
      let height = originWidth > rowWidth ? options.minLineGap : options.maxLineGap;
      return {
        cost: Infinity,
        count,
        width: originWidth * height / options.lineGap,
        height
      };
    }
  }
  function chooseFinalSize(lazySize, greedySize, rowWidth) {
    if (lazySize.cost === Infinity && greedySize.cost === Infinity) {
      return greedySize.width < rowWidth ? greedySize : lazySize;
    } else {
      return greedySize.cost >= lazySize.cost ? lazySize : greedySize;
    }
  }
  return {
    calculate
  };
})();
var verticalLineProcessor = /* @__PURE__ */ (() => {
  function calculate(vm, options, metas, rects) {
    let width = vm.$el.clientWidth;
    let grow = options.grow;
    let strategy = grow ? getRowStrategyWithGrow(width, grow) : getRowStrategy(width, options);
    let tops = getArrayFillWith(0, strategy.count);
    metas.forEach((meta, index2) => {
      let offset = tops.reduce(
        (last, top, i) => top < tops[last] ? i : last,
        0
      );
      let width2 = strategy.width[offset % strategy.count];
      let rect = rects[index2];
      rect.top = tops[offset];
      rect.left = strategy.left + (offset ? sum(strategy.width.slice(0, offset)) : 0);
      rect.width = width2;
      rect.height = meta.height * (options.fixedHeight ? 1 : width2 / meta.width);
      tops[offset] = tops[offset] + rect.height;
    });
    vm.$el.style.height = Math.max.apply(Math, tops) + "px";
  }
  function getRowStrategy(width, options) {
    let count = width / options.lineGap;
    let slotWidth;
    if (options.singleMaxWidth >= width) {
      count = 1;
      slotWidth = Math.max(width, options.minLineGap);
    } else {
      let maxContentWidth = options.maxLineGap * ~~count;
      let minGreedyContentWidth = options.minLineGap * ~~(count + 1);
      let canFit = maxContentWidth >= width;
      let canFitGreedy = minGreedyContentWidth <= width;
      if (canFit && canFitGreedy) {
        count = Math.round(count);
        slotWidth = width / count;
      } else if (canFit) {
        count = ~~count;
        slotWidth = width / count;
      } else if (canFitGreedy) {
        count = ~~(count + 1);
        slotWidth = width / count;
      } else {
        count = ~~count;
        slotWidth = options.maxLineGap;
      }
      if (count === 1) {
        slotWidth = Math.min(width, options.singleMaxWidth);
        slotWidth = Math.max(slotWidth, options.minLineGap);
      }
    }
    return {
      width: getArrayFillWith(slotWidth, count),
      count,
      left: getLeft(width, slotWidth * count, options.align)
    };
  }
  function getRowStrategyWithGrow(width, grow) {
    let total = sum(grow);
    return {
      width: grow.map((val) => width * val / total),
      count: grow.length,
      left: 0
    };
  }
  return {
    calculate
  };
})();
function getLeft(width, contentWidth, align) {
  switch (align) {
    case "right":
      return width - contentWidth;
    case "center":
      return (width - contentWidth) / 2;
    default:
      return 0;
  }
}
function getArrayFillWith(item, count) {
  let getter = typeof item === "function" ? () => item() : () => item;
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr[i] = getter();
  }
  return arr;
}
function sum(arr) {
  return arr.reduce((sum2, val) => sum2 + val);
}
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const MOVE_CLASS_PROP = "_wfMoveClass";
const _sfc_main$1 = {
  __name: "Waterfall",
  props: {
    autoResize: {
      type: Boolean,
      default: true
    },
    interval: {
      default: 200,
      validator: (val) => val >= 0
    },
    align: {
      default: "left",
      validator: (val) => ~["left", "right", "center"].indexOf(val)
    },
    line: {
      default: "v",
      validator: (val) => ~["v", "h"].indexOf(val)
    },
    lineGap: {
      required: true,
      validator: (val) => val >= 0
    },
    minLineGap: {
      validator: (val) => val >= 0
    },
    maxLineGap: {
      validator: (val) => val >= 0
    },
    singleMaxWidth: {
      validator: (val) => val >= 0
    },
    grow: {
      validator: (val) => val instanceof Array
      // 固定列宽
    },
    fixedHeight: {
      default: false
    },
    watch: {
      default: () => ({})
    }
  },
  setup(__props) {
    const props = __props;
    const waterfallRef = ref();
    const instance = getCurrentInstance();
    const virtualRects = ref([]);
    const token = ref();
    provide("reflow", reflow);
    watch(
      [
        () => props.align,
        () => props.line,
        () => props.lineGap,
        () => props.minLineGap,
        () => props.maxLineGap,
        () => props.singleMaxWidth,
        () => props.fixedHeight,
        () => props.watch
      ],
      () => {
        reflowHandler();
      },
      {
        immediate: true
      }
    );
    watch(
      props.grow,
      () => {
        reflowHandler();
      },
      {
        immediate: true
      }
    );
    function reflow() {
      var _a;
      if (!instance.proxy.$el) {
        return;
      }
      let width = instance.proxy.$el.clientWidth;
      let metas = Array.from((_a = waterfallRef.value) == null ? void 0 : _a.children).map(
        (e) => e.__vueParentComponent.exposed.getMeta()
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
        flag = true;
        instance.proxy.$emit("reflowed", instance.proxy);
      }, 0);
    }
    const watchAutoResize = () => {
      watch(
        props.autoResize,
        (newValA, oldValA) => {
          autoResizeHandler(newValA);
        },
        {
          immediate: true
        }
      );
      on(instance.proxy.$el, getTransitionEndEvent(), tidyUpAnimations, true);
      autoResizeHandler(props.autoResize);
    };
    function render(rects, metas) {
      let metasNeedToMoveByTransform = metas.filter((meta) => meta.moveClass);
      let firstRects = getRects(metasNeedToMoveByTransform);
      applyRects(rects, metas);
      let lastRects = getRects(metasNeedToMoveByTransform);
      metasNeedToMoveByTransform.forEach((meta, i) => {
        meta.node[MOVE_CLASS_PROP] = meta.moveClass;
        setTransform(meta.node, firstRects[i], lastRects[i]);
      });
      document.body.clientWidth;
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
      node.style.transform = node.style.WebkitTransform = `translate(${dx}px,${dy}px) scale(${sw},${sh})`;
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
        maxLineGap,
        singleMaxWidth: Math.max(vm.singleMaxWidth || 0, maxLineGap),
        fixedHeight: !!vm.fixedHeight,
        grow: vm.grow && vm.grow.map((val) => +val)
      };
    }
    function calculate(vm, metas, styles) {
      let options = getOptions(vm);
      let processor = vm.line === "h" ? horizontalLineProcessor : verticalLineProcessor;
      processor.calculate(vm, options, metas, styles);
    }
    function autoResizeHandler(autoResize) {
      if (autoResize === false || !props.autoResize) {
        off(window, "resize", reflowHandler, false);
      } else {
        on(window, "resize", reflowHandler, false);
      }
    }
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
    function removeClass(elem, name) {
      let reg = new RegExp("\\s*\\b" + name + "\\b\\s*", "g");
      let res = attr(elem, "class").replace(reg, " ").trim();
      attr(elem, "class", res);
    }
    function attr(elem, name, value) {
      if (typeof value !== "undefined") {
        elem.setAttribute(name, value);
      } else {
        return elem.getAttribute(name) || "";
      }
    }
    function getTransitionEndEvent() {
      let isWebkitTrans = window.ontransitionend === void 0 && window.onwebkittransitionend !== void 0;
      let transitionEndEvent = isWebkitTrans ? "webkitTransitionEnd" : "transitionend";
      return transitionEndEvent;
    }
    function on(elem, type, listener, useCapture = false) {
      elem.addEventListener(type, listener, useCapture);
    }
    function off(elem, type, listener, useCapture = false) {
      elem.removeEventListener(type, listener, useCapture);
    }
    let flag = true;
    onMounted(() => {
      watchAutoResize();
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (flag) {
            flag = false;
            reflow();
          }
        });
      });
      if (waterfallRef.value) {
        observer.observe(waterfallRef.value, {
          childList: true,
          // 监听子节点增删
          subtree: false,
          // 监听所有后代节点
          attributes: false
          // 监听属性变化
        });
      }
      onUnmounted(() => observer.disconnect());
    });
    onBeforeUnmount(() => {
      autoResizeHandler(false);
      off(instance.proxy.$el, getTransitionEndEvent(), tidyUpAnimations, true);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "vue-waterfall",
        ref_key: "waterfallRef",
        ref: waterfallRef
      }, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 512);
    };
  }
};
const Waterfall = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-606a03dc"]]);
const _sfc_main = {
  __name: "WaterfallSlot",
  props: {
    width: {
      type: Number,
      required: true,
      validator: (val) => val >= 0
    },
    height: {
      type: Number,
      required: true,
      validator: (val) => val >= 0
    },
    order: {
      type: Number,
      default: 0
    },
    moveClass: {
      type: String,
      default: ""
    }
  },
  setup(__props, { expose: __expose }) {
    const instance = getCurrentInstance();
    const props = __props;
    const isShow = ref(false);
    const node = ref(null);
    const rect = ref({
      top: 0,
      left: 0,
      width: 0,
      height: 0
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
        moveClass: props.moveClass
      };
    };
    watch([() => props.width, () => props.height], () => {
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
    __expose({
      getMeta,
      rect
    });
    return (_ctx, _cache) => {
      return withDirectives((openBlock(), createElementBlock("div", {
        class: "vue-waterfall-slot",
        ref_key: "node",
        ref: node
      }, [
        renderSlot(_ctx.$slots, "default", {}, void 0, true)
      ], 512)), [
        [vShow, isShow.value]
      ]);
    };
  }
};
const Waterfallslot = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-2591e18a"]]);
const index = {
  Waterfall,
  Waterfallslot
};
export {
  index as default
};
