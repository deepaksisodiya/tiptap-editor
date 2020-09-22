import { Node } from "tiptap";
import { TextSelection } from "tiptap";

import Audio from "./Audio.vue";

export default class AudioNode extends Node {
  get name() {
    return "audio";
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: ""
        },
        caption: {
          default: ""
        }
      },
      group: "block",
      selectable: false,
      parseDOM: [
        {
          tag: this.name,
          getAttrs: dom => {
            return {
              src: dom.getAttribute("src"),
              alt: dom.getAttribute("alt"),
              caption: dom.getAttribute("caption")
            };
          }
        }
      ],
      toDOM: node => ["audio", node.attrs]
    };
  }

  commands({ type }) {
    return ({ src, addAudioAt }) => (state, dispatch) => {
      let { tr, schema } = state;
      if (tr.doc.content.size - addAudioAt === 1)
        tr = tr.insert(tr.doc.content.size, schema.nodes["paragraph"].create());
      let textSelection = TextSelection.create(tr.doc, addAudioAt, addAudioAt);
      tr = tr
        .setSelection(textSelection)
        .replaceSelectionWith(type.create({ src }));
      return dispatch(tr);
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
      components: {
        Audio
      },
      template: `
        <Audio
          :node='this.node'
          :updateAttrs='this.updateAttrs'
          :view='this.view'
          :getPos='this.getPos'
          :options='this.options'
          :editor='this.editor'
        ></Audio>
      `
    };
  }
}
