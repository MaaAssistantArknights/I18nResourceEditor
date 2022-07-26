import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { fs } from '@tauri-apps/api'
import _ from 'lodash'

const baseTemplate = {
  ResourceDictionary: {
    "@_xmlns": "http://schemas.microsoft.com/winfx/2006/xaml/presentation",
    "@_xmlns:x": "http://schemas.microsoft.com/winfx/2006/xaml",
    "@_xmlns:system": "clr-namespace:System;assembly=mscorlib",
    "@_xmlns:local": "clr-namespaces:MeoAsstGui",
    "system:String": []
  }
}

class ResourceDictionary {
  async load(filepath: string): Promise<boolean> {
    this.filepath_ = filepath
    return new Promise((resolve) => {
      fs.readTextFile(filepath)
        .then(content => {
          const parser = new XMLParser({ ignoreAttributes: false })
          let object = parser.parse(content)
          if (Object.keys(object).length === 0) {
            object = { ...baseTemplate }
          }
          this.object_ = Object.fromEntries(object.ResourceDictionary["system:String"].map(
            (item: { "@_x:Key": string, "#text": string }) => [item["@_x:Key"], item["#text"]]
          ))
          resolve(true)
        })
        .catch(error => {
          console.error(error)
          resolve(false)
        })
    })
  }

  get(key: string): string | null {
    if (!this.object_) {
      return null
    }
    return _.get(this.object_, key, null)
  }

  list(): Record<string, string> {
    if (!this.object_) {
      return {}
    }
    return this.object_
  }

  set(key: string, value: string) {
    if (!this.object_) {
      return
    }
    _.set(this.object_, key, value)
  }

  async save() {
    if (!this.filepath_ || !this.object_) {
      return
    }
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  '
    });
    const xml = builder.build({
      ResourceDictionary: {
        "@_xmlns": "http://schemas.microsoft.com/winfx/2006/xaml/presentation",
        "@_xmlns:x": "http://schemas.microsoft.com/winfx/2006/xaml",
        "@_xmlns:system": "clr-namespace:System;assembly=mscorlib",
        "@_xmlns:local": "clr-namespaces:MeoAsstGui",
        "system:String": Object.entries(this.object_).map(entry => (
          {
            "@_x:Key": entry[0],
            "#text": entry[1]
          }
        ))
      }
    })
    await fs.writeTextFile(this.filepath_, xml)
  }

  private object_: Record<string, string> | null = null
  private filepath_: string | null = null
}

export default ResourceDictionary