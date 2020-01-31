import { Image as TiptapImage } from "tiptap-extensions";

import ImageComponent from "./Image.vue";

export default class ImageNode extends TiptapImage {
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

  commands({ type }) {
    return attrs => (state, dispatch) => {
      let tr = state.tr;
      tr = tr.replaceSelectionWith(type.create(attrs));
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
