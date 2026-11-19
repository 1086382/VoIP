<template>
  <i aria-hidden="true" :class="['bi', `bi-${icon}`, variant && `text-${variant}`]"
     :style="{ fontSize: `${fontScale || scale || 1}em` }"></i>
</template>

<script>
export default {
  props: ['icon', 'variant', 'fontScale', 'scale'],
}
</script>
