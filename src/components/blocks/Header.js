import { Node } from "tiptap";

export default class Title extends Node {
  get name() {
    return "header";
  }

  get schema() {
    return {
      content: "title",
      selectable: false,
      parseDOM: [
        {
          tag: "header"
        }
      ],
      toDOM: () => ["header", 0]
    };
  }
}
