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
}
