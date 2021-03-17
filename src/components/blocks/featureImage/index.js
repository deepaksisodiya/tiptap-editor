import { TextSelection } from "prosemirror-state";

import ImageComponent from "./FeatureImage.vue";
import { VueNodeViewRenderer } from "@tiptap/vue-2";
import { Node, mergeAttributes } from "@tiptap/core";

export const Image = Node.create({
  name: "image",

  group() {
    return "block";
  },

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

  renderHTML({ HTMLAttributes }) {
    return ["img", { ...HTMLAttributes, "data-featured-image": true }];
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
    return VueNodeViewRenderer(FeatureImageComponent);
  },
});