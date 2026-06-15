<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

img[src=""], img:not([src]) {
  background: linear-gradient(135deg, #1E3A8A 0%, #C81D25 50%, #F59E0B 100%);
  min-height: 200px;
}

img[src*="placeholder"], img[src*="placehold"], img[src*="via.placeholder"] {
  background: linear-gradient(135deg, #1E3A8A 0%, #C81D25 50%, #F59E0B 100%);
}
</style>
