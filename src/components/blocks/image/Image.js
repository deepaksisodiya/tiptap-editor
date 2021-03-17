import { TextSelection } from "tiptap";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import { Node } from "@tiptap/core";

import ImageComponent from "./Image.vue";

export const Image = Node.create({
  name: "image",

  group: "block",

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src][data-featured-image="false"]',
        getAttrs: (dom) => {
          return {
            src: JSON.parse(dom.getAttribute("data-src")),
            alt: dom.getAttribute("alt"),
            caption: dom.getAttribute("caption"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    if (HTMLAttributes.src === "") return ["paragraph"];
    return [
      "img",
      {
        ...HTMLAttributes,
        src: HTMLAttributes.src && HTMLAttributes.src.fallback,
        "data-src": JSON.stringify(HTMLAttributes.src),
        "data-featured-image": false,
      },
    ];
  },

  addCommands() {
    return {
      setImage: ({ src, addImageAt }) => ({ tr, dispatch }) => {
        if (tr.doc.content.size - addImageAt === 1)
          tr = tr.insert(
            tr.doc.content.size,
            schema.nodes["paragraph"].create()
          );
        let textSelection = TextSelection.create(
          tr.doc,
          addImageAt,
          addImageAt
        );
        tr = tr
          .setSelection(textSelection)
          .replaceSelectionWith(this.type.create({ src }));
        return dispatch(tr);
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageComponent);
  },
});
