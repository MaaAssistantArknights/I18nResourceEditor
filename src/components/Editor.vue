<script lang="ts" setup>
import { ref, Ref } from 'vue'
import { NButton, NLayout, NLayoutHeader, NLayoutContent, NInput, NSpace, NDrawer, NIcon, useMessage } from 'naive-ui'
import { Search } from '@vicons/ionicons5'
import EditableTable from './EditableTable.vue'
import ResourceDictionary from '../utils/ResourceDictionary'

import { readDir } from '@tauri-apps/api/fs'
import { open } from '@tauri-apps/api/dialog'
import { join } from '@tauri-apps/api/path'

const search = ref('')
const showError = ref(false)
const data: Ref<ResourceType[]> = ref([])
const openedDir: Ref<string | null> = ref(null)

const mergeData = (locale: AvailableLocalization, record: Record<string, string>) => {
  for (const key of Object.keys(record)) {
    const i = data.value.findIndex(item => item.key === key)
    if (i !== -1) {
      data.value[i][locale] = record[key]
    } else {
      const newItem = {
        key,
        zhCN: '',
        enUS: '',
        jaJP: '',
        koKR: ''
      }
      newItem[locale] = record[key]
      data.value.push(newItem)
    }
  }
}

const handleOpenDir = async () => {
  const selected = await open({
    directory: true,
  })
  if (selected) {
    openedDir.value = selected as string
    const entries = await readDir(selected as string)
    const files = entries.filter(entry => !entry.children)
    for (const file of files) {
      switch (file.name) {
        case 'zh-cn.xaml': {
          const dictionary = new ResourceDictionary()
          const success = await dictionary.load(file.path)
          if (success) {
            mergeData('zhCN', dictionary.list())
          }
          break
        }
        case 'en-us.xaml': {
          const dictionary = new ResourceDictionary()
          const success = await dictionary.load(file.path)
          if (success) {
            mergeData('enUS', dictionary.list())
          }
          break
        }
        case 'ja-jp.xaml': {
          const dictionary = new ResourceDictionary()
          const success = await dictionary.load(file.path)
          if (success) {
            mergeData('jaJP', dictionary.list())
          }
          break
        }
        case 'ko-kr.xaml': {
          const dictionary = new ResourceDictionary()
          const success = await dictionary.load(file.path)
          if (success) {
            mergeData('koKR', dictionary.list())
          }
          break
        }
        default: break
      }
    }
  }
}

const handleCloseDir = async () => {
  openedDir.value = null
  data.value = []
}

const handleSave = async () => {
  if (!openedDir.value) {
    return
  }
}

const handleAddKey = async () => {
  if (!data.value) {
    return
  }
  data.value.push({
    key: '',
    zhCN: '',
    enUS: '',
    jaJP: '',
    koKR: ''
  })
}
</script>

<template>
  <NLayout class="editor">
    <NLayoutHeader class="header">
      <NSpace>
        <NButton type="primary" @click="handleOpenDir" v-if="!openedDir">Open</NButton>
        <NButton type="primary" @click="handleCloseDir" v-else>Close</NButton>
        <NButton type="primary" @click="handleSave">Save</NButton>
      </NSpace>
      <NSpace>
        <NButton type="primary" @click="handleAddKey">Add key</NButton>
        <NInput class="search" v-model:value="search" placeholder="Search for keys">
          <template #prefix>
            <NIcon :component="Search" />
          </template>
        </NInput>
      </NSpace>
    </NLayoutHeader>
    <NLayoutContent class="main">
      <EditableTable v-model:data="data" :filter="search" />
    </NLayoutContent>
  </NLayout>
</template>

<style lang="less">
.editor {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;

  .search {
    width: 300px;
  }
}

.main {
  padding-top: 20px;
}
</style>