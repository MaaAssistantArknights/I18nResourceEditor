<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { NMessageProvider } from 'naive-ui';
import Editor from './components/Editor.vue'
</script>

<template>
  <NMessageProvider>
    <Editor />
  </NMessageProvider>
</template>

<style lang="less" scoped>
</style>
