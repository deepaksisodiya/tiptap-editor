import { Mark } from "tiptap";
import { toggleMark } from "tiptap-commands";

export default class Title extends Mark {
  get name() {
    return "sup";
  }

  get schema() {
    return {
      parseDOM: [
        {
          tag: "sup",
        },
      ],
      toDOM: () => ["sup", 0],
    };
  }

  keys({ type }) {
    return {
      "Ctrl-6": toggleMark(type),
    };
  }
}
