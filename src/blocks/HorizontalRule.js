import { HorizontalRule as TiptapHorizontalRule } from "tiptap-extensions";
import { TextSelection } from "tiptap";

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
      let tr = state.tr;
      tr = tr.replaceSelectionWith(type.create(attrs));
      let textSelection = TextSelection.create(
        tr.doc,
        tr.selection.head + 1,
        tr.selection.head + 1
      );
      tr = tr.setSelection(textSelection);
      return dispatch(tr);
    };
  }
}
