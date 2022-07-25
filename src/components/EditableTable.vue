<script lang="ts" setup>
import { h, ref, Ref, onUpdated, nextTick } from 'vue'
import { NDataTable, NInput, NDropdown, NSpace, DataTableColumns, DropdownOption } from 'naive-ui'

const props = defineProps<{
  data: Array<DataType>
  filter: string | null
}>()

const emit = defineEmits(['update:data'])

type DataType = {
  key: string,
  zhCN: string,
  enUS: string,
  jaJP: string,
  koKR: string
}

const columns: DataTableColumns<DataType> = [
  {
    title: 'Key',
    key: 'key',
    filter(value, row) {
      return row.key.includes(value as string)
    },
    render: (row, index) => {
      return h(NInput, {
        value: row.key,
        onUpdateValue(v) {
          props.data[index].key = v
          emit('update:data', props.data)
        }
      })
    }
  },
  {
    title: () => h(NSpace, { align: 'center' }, () => [
      h('img', { draggable: false, class: 'emoji', src: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1e8-1f1f3.png' }),
      h('span', 'zh-CN')
    ]),
    key: 'zhCN',
    render: (row, index) => {
      return h(NInput, {
        value: row.zhCN,
        onUpdateValue(v) {
          props.data[index].zhCN = v
          emit('update:data', props.data)
        }
      })
    }
  },
  {
    title: () => h(NSpace, { align: 'center' }, () => [
      h('img', { draggable: false, class: 'emoji', src: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1fa-1f1f8.png' }),
      h('span', 'en-US')
    ]),
    key: 'enUS',
    render: (row, index) => {
      return h(NInput, {
        value: row.enUS,
        onUpdateValue(v) {
          props.data[index].enUS = v
          emit('update:data', props.data)
        }
      })
    }
  },
  {
    title: () => h(NSpace, { align: 'center' }, () => [
      h('img', { draggable: false, class: 'emoji', src: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1ef-1f1f5.png' }),
      h('span', 'ja-JP')
    ]),
    key: 'jaJP',
    render: (row, index) => {
      return h(NInput, {
        value: row.jaJP,
        onUpdateValue(v) {
          props.data[index].jaJP = v
          emit('update:data', props.data)
        }
      })
    }
  },
  {
    title: () => h(NSpace, { align: 'center' }, () => [
      h('img', { draggable: false, class: 'emoji', src: 'https://twemoji.maxcdn.com/v/14.0.2/72x72/1f1f0-1f1f7.png' }),
      h('span', 'ko-KR')
    ]),
    key: 'koKR',
    render: (row, index) => {
      return h(NInput, {
        value: row.koKR,
        onUpdateValue(v) {
          props.data[index].koKR = v
          emit('update:data', props.data)
        }
      })
    }
  },
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
const table: Ref<any> = ref(null)
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
      if (selectedKey.value) {
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
  table.value.filter({
    key: [props.filter]
  })
})
</script>

<template>
  <div>
    <NDataTable :columns="columns" :data="props.data" virtual-scroll
      max-height="calc(100vh - 160px)" ref="table" :row-props="rowProps" />
    <NDropdown placement="bottom-start" trigger="manual" :x="menuXOffset" :y="menuYOffset"
      :options="options" :show="showDropdownMenu" :on-clickoutside="handleClickOutside"
      @select="handleSelect" />
  </div>

</template>

<style lang="less">
img.emoji {
  height: 2em;
  width: 2em;
  margin: 0 .05em 0 .1em;
  vertical-align: -0.1em;
}
</style>