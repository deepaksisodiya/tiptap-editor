import {
  CodeBlockHighlight as TiptapCodeBlockHighlight,
  Highlight
} from "tiptap-extensions";
import low from "lowlight/lib/core";

import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import scala from "highlight.js/lib/languages/scala";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";

import { Plugin } from "tiptap";

function addIndentation() {
  return function(state, dispatch) {
    function isInCode(state) {
      let $head = state.selection.$head;
      for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.spec.code) return true;
      }
      return false;
    }

    if (!isInCode(state)) return false;
    dispatch(state.tr.insertText("  ", state.selection.from, state.selection.to));
    return true;
  };
}

export default class CodeBlockHighlight extends TiptapCodeBlockHighlight {
  get name() {
    return "code_block";
  }

  get defaultOptions() {
    return {
      languages: {
        bash,
        css,
        dockerfile,
        go,
        java,
        javascript,
        json,
        php,
        python,
        ruby,
        scala,
        sql,
        typescript,
        xml
      }
    };
  }

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
      toDOM: () => ["pre", ["code", { class: "hljs" }, 0]]
    };
  }

  keys() {
    return {
      Tab: addIndentation()
    };
  }

  get plugins() {
    return [
      Highlight({ name: this.name }),
      new Plugin({
        props: {
          nodeViews: {
            code_block(node, view, getPos) {
              return {
                update(node) {
                  if (node.type.name !== "code_block") return false;

                  const language = low.highlightAuto(node.textContent).language;
                  if (node.attrs.language !== language) {
                    const newAttrs = {
                      ...node.attrs,
                      language: language
                    };
                    const transaction = view.state.tr.setNodeMarkup(
                      getPos(),
                      null,
                      newAttrs
                    );
                    view.dispatch(transaction);
                  }
                  return true;
                }
              };
            }
          }
        }
      })
    ];
  }
}
