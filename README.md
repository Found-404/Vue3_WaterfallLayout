<p align="center">
    <img alt="logo" src="waterFullLogo.png"  style="margin-bottom: 10px;">
</p>

<h1 align="center">WaterFull</h1>
<p align="center">
  <a href="https://github.com/MopTym/vue-waterfall">Vue2</a>
  &nbsp;
  ·
  &nbsp;
  <a href="https://github.com/Found-404/Vue3_WaterfallLayout">Vue3</a>
  &nbsp;
  ·
  &nbsp;
  <a href="">React</a>
</p>

# Vue3-waterfall

A waterfall layout component for Vue3.js .

The address of the waterfall component of vue2 version is [vue-waterfall](https://github.com/MopTym/vue-waterfall).

The warehouse is an upgraded version of [vue-waterfall](https://github.com/MopTym/vue-waterfall) replica. Advantages, support vue3 version

Optimized the legacy issues of vue2 version.

## Effect Preview

- [Vue3-Waterfall](https://found-404.github.io/Vue3_WaterfallLayout/)

## Installation

```shell
npm install --save waterfall-v3
```

```html
<script src="https://cdn.jsdelivr.net/gh/Found-404/Vue3_WaterfallLayout@1.0.2/dist/Waterfall-Vue3.umd.js"></script>
```

## Introduction

```html
... import { Waterfall, WaterfallSlot } from "waterfall-v3"; ...

<Waterfall
  :line-gap="200"
  :min-line-gap="180"
  :max-line-gap="220"
  ref="waterfall"
>
  <WaterfallSlot
    v-for="(item, index) in items"
    :width="item.width"
    :height="item.height"
    :key="item.index"
    :order="index"
    move-class="item-move"
  >
    <div class="item" :style="item.style" :index="item.index"></div>
  </WaterfallSlot>
</Waterfall>
```

## Other versions

- [React-Waterfall](https://github.com/Found-404/React_WaterfallLayout)
- [Vue-Waterfall](https://github.com/Found-404/Vue3_WaterfallLayout)
