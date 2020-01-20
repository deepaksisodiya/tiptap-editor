import { Image as TiptapImage } from "tiptap-extensions";
import { TextSelection } from "tiptap";

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
      mounted() {},
      methods: {
        captionPlaceHolder() {
          return "Placeholder";
        },
        handleKeyup(event) {
          let {
            state: { tr }
          } = this.view;
          const pos = this.getPos();
          if (event.key === "Backspace" && !this.caption) {
            let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
            this.view.dispatch(
              tr.setSelection(textSelection).deleteSelection(this.src)
            );
            this.view.focus();
          } else if (event.key === "Enter") {
            let textSelection = TextSelection.create(tr.doc, pos + 2, pos + 2);
            this.view.dispatch(tr.setSelection(textSelection));
            this.view.focus();
          }
        }
      },
      template: `
          <figure>
            <img :src="src" />
            <figcaption><input v-model="caption" placeholder="Type caption for image (optional)" @keyup="handleKeyup"/></figcaption>
          </figure>
        `
    };
  }
}
