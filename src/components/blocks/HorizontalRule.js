import { Node } from "@tiptap/core";

export const HorizontalRuleNode = Node.create({
  name: "horizontalRule",

  group: "block",

  parseHTML() {
    return [{ tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hr", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setHorizontalRule: () => ({ tr, dispatch }) => {
        if (tr.doc.content.size - tr.selection.head === 1)
          tr = tr.insert(
            tr.doc.content.size,
            schema.nodes["paragraph"].create()
          );
        tr = tr.replaceSelectionWith(this.type.create());
        dispatch(tr);
        return true;
      },
    };
  },

  addInputRules() {
    return [nodeInputRule(/^(?:---|___\s|\*\*\*\s)$/, this.type)];
  },
});
