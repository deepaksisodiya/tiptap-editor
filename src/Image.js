import { Image as TiptapImage } from "tiptap-extensions";

export default class Image extends TiptapImage {
  get schema() {
    return {
      attrs: {
        src: {},
        alt: {
          default: null
        },
        caption: {
          default: null
        }
      },
      group: "block",
      draggable: true,
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
      props: ["node", "updateAttrs", "view"],
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
      template: `
          <figure>
            <img :src="src" />
            <input type="text" v-model="caption" :disabled="!view.editable" placeholder="write caption (optional)" />
          </figure>
        `
    };
  }
}
