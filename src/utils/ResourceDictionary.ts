import { XMLParser } from 'fast-xml-parser'
import { fs } from '@tauri-apps/api'
import _ from 'lodash'

class ResourceDictionary {
  async load(filepath: string): Promise<boolean> {
    return new Promise((resolve) => {
      fs.readTextFile(filepath)
        .then(content => {
          const parser = new XMLParser({ ignoreAttributes: false })
          const object = parser.parse(content)
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

  save() {

  }

  private object_: Record<string, string> | null = null
}

export default ResourceDictionary