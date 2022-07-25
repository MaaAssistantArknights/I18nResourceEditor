type AvailableLocalization = 'zhCN' | 'enUS' | 'jaJP' | 'koKR'
type ResourceType = {
  [K in AvailableLocalization]: string
} & { key: string }