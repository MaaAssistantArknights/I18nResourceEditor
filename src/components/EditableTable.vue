<script lang="ts" setup>
import { h, ref, Ref, onUpdated, nextTick } from 'vue'
import { NDataTable, NInput, NDropdown, NSpace, DataTableColumns, DropdownOption, DataTableInst } from 'naive-ui'
import { TableColumn } from 'naive-ui/es/data-table/src/interface';

const props = defineProps<{
  data: Array<ResourceType>
  filter: string | null
}>()

const emit = defineEmits(['update:data'])

const flagUrlMap = {
  zhCN: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1e8-1f1f3.png',
  zhTW: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1e8-1f1f3.png',
  enUS: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1fa-1f1f8.png',
  jaJP: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1ef-1f1f5.png',
  koKR: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1f0-1f1f7.png',
}

const localeDisplayMap = {
  zhCN: 'zh-CN',
  zhTW: 'zh-TW',
  enUS: 'en-US',
  jaJP: 'ja-JP',
  koKR: 'ko-KR',
}

function buildColumn(locale: AvailableLocalization): TableColumn<ResourceType> {
  return {
    title: () => h(NSpace, { align: 'center' }, () => [
      h('img', { draggable: false, class: 'emoji', src: flagUrlMap[locale] }),
      h('span', localeDisplayMap[locale])
    ]),
    key: locale,
    render: (row) => {
      return h(NInput, {
        class: 'translation-cell',
        type: 'textarea',
        autosize: { minRows: 1, maxRows: 5 },
        value: row[locale].text,
        onUpdateValue(v) {
          const index = props.data.findIndex(item => item.key === row.key)
          props.data[index][locale].text = v
          if (v.includes('\n') || v.includes('&#')) {
            props.data[index][locale].options = { preserveSpace: true }
          } else {
            props.data[index][locale].options = {}
          }
          emit('update:data', props.data)
        }
      })
    }
  }
}

const columns: DataTableColumns<ResourceType> = [
  {
    title: 'Key',
    key: 'key',
    filter(value, row) {
      const f = value as string
      if (f.length === 0) {
        return true
      }
      return [row.key, row.zhCN, row.zhTW, row.enUS, row.jaJP, row.koKR].join(' ').includes(f)
    },
    render: (row) => {
      return h(NInput, {
        defaultValue: row.key,
        passivelyActivated: true,
        onChange(v) {
          const index = props.data.findIndex(item => item.key === row.key)
          props.data[index].key = v
          emit('update:data', props.data)
        }
      })
    }
  },
  ...(['zhCN', 'zhTW', 'enUS', 'jaJP', 'koKR'] as AvailableLocalization[]).map(buildColumn)
]

const options: DropdownOption[] = [
  {
    label: () => h('span', { style: { color: 'red' } }, 'Delete'),
    key: 'delete'
  }
]

const showDropdownMenu = ref(false)
const menuXOffset = ref(0)
const menuYOffset = ref(0)
const table: Ref<DataTableInst | null> = ref(null)
const selectedKey: Ref<string | null> = ref(null)

const rowProps = (row: ResourceType) => {
  return {
    onContextmenu: (e: MouseEvent) => {
      e.preventDefault()
      selectedKey.value = row.key
      showDropdownMenu.value = false
      nextTick().then(() => {
        showDropdownMenu.value = true
        menuXOffset.value = e.clientX
        menuYOffset.value = e.clientY
      })
    }
  }
}

const handleClickOutside = () => {
  showDropdownMenu.value = false
}

const handleSelect = (key: string) => {
  switch (key) {
    case 'delete': {
      if (typeof selectedKey.value === 'string') {
        const index = props.data.findIndex(item => item.key === selectedKey.value)
        if (index !== -1) {
          props.data.splice(index, 1)
          emit('update:data', props.data)
        }
      }
    }
      break
    default: break
  }
  showDropdownMenu.value = false
}

onUpdated(() => {
  if (!table.value) {
    return
  }
  table.value.filter({
    key: [props.filter ?? '']
  })
})

defineExpose({
  handleAdded: () => {
    setTimeout(() => {
      if (!table.value) {
        return
      }
      table.value.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }
})
</script>

<template>
  <div>
    <NDataTable :columns="columns" :data="props.data" virtual-scroll max-height="calc(100vh - 160px)" ref="table"
      :row-props="rowProps" />
    <NDropdown placement="bottom-start" trigger="manual" :x="menuXOffset" :y="menuYOffset" :options="options"
      :show="showDropdownMenu" :on-clickoutside="handleClickOutside" @select="handleSelect" />
  </div>
</template>

<style lang="less">
img.emoji {
  height: 2em;
  width: 2em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}

.translation-cell {
  min-width: 100%;
}
</style>