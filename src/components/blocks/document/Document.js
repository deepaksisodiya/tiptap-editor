import { Node } from "tiptap";
import { TextSelection } from "tiptap";

import Document from "./Document.vue";

export default class DocumentNode extends Node {
  get name() {
    return "document";
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: ""
        },
        caption: {
          default: ""
        },
        name: {
          default: ""
        },
        size: {
          default: ""
        },
        format: {
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
              caption: dom.getAttribute("caption"),
              name: dom.getAttribute("name"),
              size: dom.getAttribute("size"),
              format: dom.getAttribute("format")
            };
          }
        }
      ],
      toDOM: node => ["document", node.attrs]
    };
  }

  commands({ type }) {
    return ({ src, addDocumentAt }) => (state, dispatch) => {
      let { tr, schema } = state;
      if (tr.doc.content.size - addDocumentAt === 1)
        tr = tr.insert(tr.doc.content.size, schema.nodes["paragraph"].create());
      let textSelection = TextSelection.create(
        tr.doc,
        addDocumentAt,
        addDocumentAt
      );
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
        Document
      },
      template: `
        <Document
          :node='this.node'
          :updateAttrs='this.updateAttrs'
          :view='this.view'
          :getPos='this.getPos'
          :options='this.options'
          :editor='this.editor'
        ></Document>
      `
    };
  }
}
