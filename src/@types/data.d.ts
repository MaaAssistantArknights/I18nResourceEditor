type AvailableLocalization = 'zhCN' | 'enUS' | 'jaJP' | 'koKR'

interface Translation {
  text: string;
  options?: {
    preserveSpace?: boolean;
  }
}

type ResourceType = {
  [K in AvailableLocalization]: Translation
} & { key: string }
