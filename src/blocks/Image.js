import { Image as TiptapImage, History } from "tiptap-extensions";
import { Editor, Doc, Node, TextSelection } from "tiptap";
import { Placeholder } from "tiptap-extensions";

class CustomDoc extends Doc {
  get schema() {
    return {
      content: "span"
    };
  }
}

class FigCaptionEditor extends Editor {
  set element(element) {
    this._mountOptions = this.options.mountOptions || element;
  }
  get element() {
    return this._mountOptions;
  }
}

class Span extends Node {
  get name() {
    return "span";
  }

  get schema() {
    return {
      content: "text*",
      parseDOM: [
        {
          tag: "span"
        }
      ],
      toDOM: () => ["span", 0]
    };
  }
}

export default class Image extends TiptapImage {
  get schema() {
    return {
      attrs: {
        src: {},
        alt: {
          default: ""
        },
        caption: {
          default: ""
        }
      },
      group: "block",
      draggable: true,
      selectable: false,
      parseDOM: [
        {
          tag: "img[src]",
          getAttrs: dom => ({
            src: dom.getAttribute("src"),
            alt: dom.getAttribute("alt"),
            caption: dom.getAttribute("caption")
          })
        }
      ],
      toDOM: node => ["img", node.attrs]
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos"],
      data() {
        return {
          editor: null
        };
      },
      watch: {
        "view.editable"() {
          this.editor.setOptions({
            editable: this.view.editable
          });
        }
      },
      computed: {
        src: {
          get() {
            return this.node.attrs.src;
          },
          set(src) {
            this.updateAttrs({
              src
            });
          }
        },
        caption: {
          get() {
            return this.node.attrs.caption;
          },
          set(caption) {
            this.updateAttrs({
              caption
            });
          }
        }
      },
      mounted() {
        this.editor = new FigCaptionEditor({
          mountOptions: { mount: this.$refs.caption },
          editable: true,
          extensions: [
            new Span(),
            new CustomDoc(),
            new Placeholder({
              showOnlyCurrent: false,
              emptyNodeText: this.captionPlaceHolder
            }),
            new History()
          ],
          content: "<span>" + this.node.attrs.caption || "" + "</span>",
          onUpdate: ({ getJSON }) => {
            const { content } = getJSON();
            this.caption = content[0].content ? content[0].content[0].text : "";
          },
          editorProps: {
            handleKeyDown: (view, event) => {
              if (event.key === "Backspace" && !this.caption) {
                let {
                  state: { tr }
                } = this.view;
                const pos = this.getPos();
                let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
                this.view.dispatch(
                  tr.setSelection(textSelection).deleteSelection()
                );
                this.view.focus();
              }
              return false;
            }
          }
        });
      },
      methods: {
        captionPlaceHolder() {
          return "Placeholder";
        }
      },
      beforeDestroy() {
        this.editor.destroy();
      },
      template: `
          <figure>
            <img :src="src" />
            <figcaption ref="caption"/>
          </figure>
        `
    };
  }
}
