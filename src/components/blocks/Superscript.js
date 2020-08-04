import { Mark } from "tiptap";
import { toggleMark } from "tiptap-commands";

export default class Superscript extends Mark {
  get name() {
    return "sup";
  }

  get schema() {
    return {
      parseDOM: [
        {
          tag: "sup"
        }
      ],
      toDOM: () => ["sup", 0]
    };
  }

  keys({ type }) {
    return {
      "Ctrl-Shift-6": toggleMark(type)
    };
  }
}
