import { Image as TiptapImage } from "tiptap-extensions";
import { Editor, Doc } from "tiptap";
import FigCaptionContent from "./FigCaptionContent";
import { Placeholder } from "tiptap-extensions";

class CustomDoc extends Doc {
  get schema() {
    return {
      content: "paragraph"
    };
  }
}

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
      components: {
        FigCaptionContent
      },
      data() {
        return {
          editor: new Editor({
            editable: true,
            extensions: [
              new CustomDoc(),
              new Placeholder({
                showOnlyCurrent: false,
                emptyNodeText: () => {
                  return "Placeholder";
                }
              })
            ],
            onUpdate: ({ getJSON }) => {
              if (getJSON().content[0].content) {
                this.caption = getJSON().content[0].content[0].text;
              } else {
                this.caption = null;
              }
            }
          })
        };
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
      template: `
          <figure>
            <img :src="src" />
            <fig-caption-content :editor="editor" />
          </figure>
        `
    };
  }
}
