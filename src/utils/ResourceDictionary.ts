import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { fs } from "@tauri-apps/api";
import _ from "lodash";

const baseTemplate = {
  ResourceDictionary: {
    "@_xmlns": "http://schemas.microsoft.com/winfx/2006/xaml/presentation",
    "@_xmlns:x": "http://schemas.microsoft.com/winfx/2006/xaml",
    "@_xmlns:system": "clr-namespace:System;assembly=mscorlib",
    "@_xmlns:local": "clr-namespaces:MaaWpfGui",
    "@_xmlns:uri": "clr-namespace:System;assembly=System.Runtime",
    "system:String": [],
  },
};

class ResourceDictionary {
  async load(filepath: string): Promise<boolean> {
    this.filepath_ = filepath;
    try {
      await fs.readTextFile(filepath);
    } catch (e) {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
        format: true,
        indentBy: "  ",
      });
      const xml = builder.build(baseTemplate);
      await fs.writeTextFile(this.filepath_, xml);
    }
    return new Promise((resolve) => {
      fs.readTextFile(filepath)
        .then((content) => {
          const parser = new XMLParser({
            ignoreAttributes: false,
            tagValueProcessor: (_, value) =>
              value.replaceAll("&#x0a;", "\n"),
          });
          let object = parser.parse(content);
          if (Object.keys(object).length === 0) {
            object = { ...baseTemplate };
          }
          this.object_ = Object.fromEntries(
            object.ResourceDictionary["system:String"]?.map(
              (item: {
                "@_x:Key": string;
                "#text": string;
                "@_xml:space": "preserve" | undefined;
              }) => [
                item["@_x:Key"],
                Object.assign(
                  { text: item["#text"] },
                  item["@_xml:space"] === "preserve" ||
                    item["#text"]?.includes("\n")
                    ? { options: { preserveSpace: true } }
                    : {}
                ),
              ]
            ) ?? []
          );
          resolve(true);
        })
        .catch((error) => {
          console.error(error);
          resolve(false);
        });
    });
  }

  get(key: string): string | undefined {
    if (!this.object_) {
      return undefined;
    }
    return _.get(this.object_, key, undefined)?.text;
  }

  list(): Record<string, Translation> {
    if (!this.object_) {
      return {};
    }
    return this.object_;
  }

  set(key: string, value: Translation) {
    if (!this.object_) {
      return;
    }
    _.set(this.object_, key, value);
  }

  async save() {
    if (!this.filepath_ || !this.object_) {
      return;
    }
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: "    ",
      commentPropName: '#comment',
    });
    const xml = builder.build({
      "#comment": "THIS FILE IS AUTO GENERATED, DO NOT EDIT",
      ResourceDictionary: {
        ...baseTemplate.ResourceDictionary,
        "system:String": Object.entries(this.object_).map((entry) =>
          Object.assign(
            {
              "@_x:Key": entry[0],
              "#text": entry[1].text,
            },
            entry[1].options?.preserveSpace ? { "@_xml:space": "preserve" } : {}
          )
        ),
      },
    });
    await fs.writeTextFile(this.filepath_, xml);
  }

  private object_: Record<string, Translation> | null = null;
  private filepath_: string | null = null;
}

export default ResourceDictionary;
