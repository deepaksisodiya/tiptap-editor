import { Node } from "@tiptap/core";

export const Header = Node.create({
  name: "header",
  content: "title",
  selectable: false,
  parseHTML() {
    return [
      {
        tag: "header",
      },
    ];
  },
  renderHTML() {
    return ["header", 0];
  },
});
