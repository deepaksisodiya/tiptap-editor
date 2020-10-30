import { CodeBlockHighlight } from "tiptap-extensions";
import low from "lowlight/lib/core";

export default class CodeBlockHighlightWithLanguage extends CodeBlockHighlight {
  get schema() {
    return {
      attrs: {
        language: {
          default: null
        }
      },
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
          getAttrs: dom => {
            return {
              language: low.highlightAuto(dom.innerText).language
            };
          }
        }
      ],
      toDOM: () => ["pre", ["code", 0]]
    };
  }
}
