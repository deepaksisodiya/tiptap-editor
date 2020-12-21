import { Node, Plugin, PluginKey } from "tiptap";
import {
  toggleBlockType,
  setBlockType,
  textblockTypeInputRule
} from "tiptap-commands";
import { DecorationSet } from "prosemirror-view";
import { getHighlightDecorations } from "prosemirror-highlightjs";
import browser from "../../utils/browser";
import hljs from "highlight.js/lib/core";

import bash from "highlight.js/lib/languages/bash";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import scss from "highlight.js/lib/languages/scss";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

hljs.registerLanguage("bash", bash);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("php", php);
hljs.registerLanguage("python", python);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("scss", scss);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("html", html);

class DecorationCache {
  constructor(cache) {
    this.cache = { ...cache };
  }

  get(pos) {
    return this.cache[pos] || null;
  }

  set(pos, node, decorations) {
    this.cache[pos] = { node, decorations };
  }

  replace(oldPos, newPos, node, decorations) {
    this.remove(oldPos);
    this.set(newPos, node, decorations);
  }

  remove(pos) {
    delete this.cache[pos];
  }

  invalidate(tr) {
    const returnCache = new DecorationCache(this.cache);
    const mapping = tr.mapping;
    Object.keys(this.cache).forEach(k => {
      const pos = +k;
      const result = mapping.mapResult(pos);
      const mappedNode = tr.doc.nodeAt(result.pos);
      const { node, decorations } = this.get(pos);

      if (result.deleted || !mappedNode?.eq(node)) {
        returnCache.remove(pos);
      } else if (pos !== result.pos) {
        // update the decorations' from/to values to match the new node position
        const updatedDecorations = decorations
          .map(d => d.map(mapping, 0, 0))
          .filter(d => d !== null);
        returnCache.replace(pos, result.pos, mappedNode, updatedDecorations);
      }
    });

    return returnCache;
  }
}

export default class CodeBlockHighlight extends Node {
  get name() {
    return "code_block";
  }

  get schema() {
    return {
      attrs: {
        language: { default: "" }
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
          preserveWhitespace: "full"
        }
      ],
      toDOM: () => ["pre", ["code", { class: "hljs", spellcheck: "false" }, 0]]
    };
  }

  commands({ type, schema }) {
    return () => toggleBlockType(type, schema.nodes.paragraph);
  }

  keys({ type }) {
    return {
      "Shift-Ctrl-\\": setBlockType(type),
      Tab: (state, dispatch) => {
        let { $head } = state.selection;
        if (!$head.parent.type.spec.code) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.insertText("  ").scrollIntoView());
        }

        return true;
      },
      // manually doing Enter in case of firefox browser,
      // https://github.com/ProseMirror/prosemirror/issues/1073
      Enter: (state, dispatch) => {
        let { $head } = state.selection;
        if (!$head.parent.type.spec.code || !browser.gecko) {
          return false;
        }
        if (dispatch) {
          dispatch(
            state.tr
              .insertText("\n")
              .scrollIntoView()
              .setMeta("resetSelectionHack", true)
          );
        }

        return true;
      },
      // manually doing backspace in case of firefox browser,
      // https://github.com/ProseMirror/prosemirror/issues/1073
      Backspace: (state, dispatch) => {
        let { $head } = state.selection;
        if (!$head.parent.type.spec.code || !browser.gecko) {
          return false;
        }
        const { $from, $to } = state.selection;
        if (dispatch) {
          if ($from.pos === $to.pos) {
            // no selection
            dispatch(
              state.tr.delete($from.pos - 1, $from.pos).scrollIntoView()
            );
          } else {
            dispatch(state.tr.deleteSelection().scrollIntoView());
          }
        }

        return true;
      }
    };
  }

  inputRules({ type }) {
    return [textblockTypeInputRule(/^```$/, type)];
  }

  get plugins() {
    return [
      new Plugin({
        name: new PluginKey("highlight"),
        state: {
          init: (config, instance) => {
            return {
              cache: new DecorationCache({}),
              decorations: DecorationSet.create(instance.doc, [])
            };
          },
          apply: (tr, data) => {
            const updatedCache = data.cache.invalidate(tr);
            if (!tr.docChanged) {
              return {
                cache: updatedCache,
                decorations: data.decorations.map(tr.mapping, tr.doc)
              };
            }
            let content = getHighlightDecorations(
              tr.doc,
              hljs,
              ["code_block"],
              function() {
                return "";
              },
              {
                preRenderer: (_, pos) =>
                  updatedCache.get(pos) && updatedCache.get(pos).decorations,
                postRenderer: (b, pos, decorations) => {
                  updatedCache.set(pos, b, decorations);
                },
                autohighlightCallback: (node, pos, language) => {
                  const attrs = node.attrs || {};
                  attrs["language"] = language || "";

                  return tr.setNodeMarkup(pos, undefined, attrs);
                }
              }
            );
            return {
              cache: updatedCache,
              decorations: DecorationSet.create(tr.doc, content)
            };
          }
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          }
        }
      })
    ];
  }
}
