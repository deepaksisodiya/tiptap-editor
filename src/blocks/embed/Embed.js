import { Node } from "tiptap";
import { Fragment } from "prosemirror-model";

import Embed from "./Embed.vue";

export default class EmbedNode extends Node {
  get name() {
    return "embed";
  }

  get defaultOptions() {
    return {
      type: "video"
    };
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
        html: {
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
              html: dom.getAttribute("html"),
              thumbnail_url: dom.getAttribute("thumbnail_url"),
              thumbnail_width: dom.getAttribute("thumbnail_width"),
              thumbnail_height: dom.getAttribute("thumbnail_height"),
              caption: dom.getAttribute("caption")
            };
          }
        }
      ],
      toDOM: node => ["embed", node.attrs]
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      const node = type.create(attrs);
      node.__proto__.toJSON = function() {
        let obj = { type: this.type.name };
        // eslint-disable-next-line no-unused-vars
        for (let _ in this.attrs) {
          obj.attrs = this.attrs;
          break;
        }
        if (this.content.size) obj.content = this.content.toJSON();
        if (this.marks.length) obj.marks = this.marks.map(n => n.toJSON());
        if (this.type.name === "embed") {
          obj.content = {
            type: "html",
            html: this.attrs.html
          };
        }
        return obj;
      };
      node.__proto__.fromJSON = function(schema, json) {
        if (!json) throw new RangeError("Invalid input for Node.fromJSON");
        let marks = null;
        if (json.marks) {
          if (!Array.isArray(json.marks))
            throw new RangeError("Invalid mark data for Node.fromJSON");
          marks = json.marks.map(schema.markFromJSON);
        }
        if (json.type == "text") {
          if (typeof json.text != "string")
            throw new RangeError("Invalid text node in JSON");
          return schema.text(json.text, marks);
        }
        let content = Fragment.fromJSON(
          schema,
          json.type === "embed" ? json.content : undefined
        );
        return schema.nodeType(json.type).create(json.attrs, content, marks);
      };
      return dispatch(state.tr.replaceSelectionWith(type.create(attrs)));
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos", "options"],
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
        ></Embed>
      `
    };
  }
}
