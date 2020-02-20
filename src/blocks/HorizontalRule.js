import { HorizontalRule as TiptapHorizontalRule } from "tiptap-extensions";

export default class HorizontalRuleNode extends TiptapHorizontalRule {
  get schema() {
    return {
      group: "block",
      selectable: false,
      parseDOM: [{ tag: "hr" }],
      toDOM: () => ["hr"]
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      let { tr, schema } = state;
      if (tr.doc.content.size - tr.selection.head === 1)
        tr = tr.insert(tr.doc.content.size, schema.nodes["paragraph"].create());
      tr = tr.replaceSelectionWith(type.create(attrs));
      return dispatch(tr);
    };
  }
}
