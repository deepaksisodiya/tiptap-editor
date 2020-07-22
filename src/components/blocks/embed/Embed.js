import { Node } from "tiptap";

import Embed from "./Embed.vue";

export default class EmbedNode extends Node {
  get name() {
    return "embed";
  }

  get schema() {
    return {
      attrs: {
        title: {
          default: ""
        },
        description: {
          default: ""
        },
        type: {
          default: ""
        },
        url: {
          default: ""
        },
        provider: {
          default: ""
        },
        thumbnail_url: {
          default: ""
        },
        thumbnail_width: {
          default: ""
        },
        thumbnail_height: {
          default: ""
        },
        html: {
          default: ""
        },
        caption: {
          default: null
        }
      },
      group: "block",
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [
        {
          tag: this.name,
          getAttrs: dom => {
            return {
              title: dom.getAttribute("title"),
              description: dom.getAttribute("description"),
              type: dom.getAttribute("type"),
              url: dom.getAttribute("url"),
              provider: dom.getAttribute("provider"),
              thumbnail_url: dom.getAttribute("thumbnail_url"),
              thumbnail_width: dom.getAttribute("thumbnail_width"),
              thumbnail_height: dom.getAttribute("thumbnail_height"),
              caption: dom.getAttribute("caption"),
              html: dom.getAttribute("html")
            };
          }
        }
      ],
      toDOM: node => ["embed", node.attrs]
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      return dispatch(state.tr.replaceSelectionWith(type.create(attrs)));
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
      components: {
        Embed
      },
      template: `
        <Embed
          :node='this.node'
          :updateAttrs='this.updateAttrs'
          :view='this.view'
          :getPos='this.getPos'
          :options='this.options'
          :editor='this.editor'
        ></Embed>
      `
    };
  }
}
