import { Image as TiptapImage } from "tiptap-extensions";
import { TextSelection } from "tiptap";

import ImageComponent from "./FeatureImage.vue";

export default class ImageNode extends TiptapImage {
  get name() {
    return "featuredimage";
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: ""
        },
        alt: {
          default: ""
        },
        caption: {
          default: ""
        }
      },
      group: "block",
      selectable: false,
      toDOM: node => ["img", node.attrs]
    };
  }

  commands({ type }) {
    return ({ src, addImageAt }) => (state, dispatch) => {
      let { tr, schema } = state;
      if (tr.doc.content.size - addImageAt === 1)
        tr = tr.insert(tr.doc.content.size, schema.nodes["paragraph"].create());
      let textSelection = TextSelection.create(tr.doc, addImageAt, addImageAt);
      tr = tr
        .setSelection(textSelection)
        .replaceSelectionWith(type.create({ src }));
      return dispatch(tr);
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos", "options"],
      components: {
        ImageComponent
      },
      template: `
        <ImageComponent
          :node='this.node'
          :updateAttrs='this.updateAttrs'
          :view='this.view'
          :getPos='this.getPos'
          :options='this.options'
        ></ImageComponent>
      `
    };
  }
}
