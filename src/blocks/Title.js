import { Node } from "tiptap";
import { TextSelection } from "tiptap";

export default class Title extends Node {
  get name() {
    return "title";
  }

  get schema() {
    return {
      content: "inline*",
      parseDOM: [
        {
          tag: "h1"
        }
      ],
      toDOM: () => ["h1", 0],
      marks: "bold italic"
    };
  }
  keys() {
    return {
      Enter: (state, dispatch) => {
        let {
          tr,
          selection: { anchor }
        } = state;
        if (tr.doc.resolve(anchor).parent.type.name !== "title") return false;
        let textSelection = TextSelection.create(
          tr.doc,
          anchor + 3,
          anchor + 3
        );
        return dispatch(tr.setSelection(textSelection));
      },
      Backspace: (state, dispatch) => {
        let {
          tr,
          selection: { anchor }
        } = state;
        const currentNode = tr.doc.resolve(anchor).parent.type.name;

        if (
          currentNode !== "header" &&
          currentNode !== "title" &&
          tr.doc.resolve(anchor - 3).parent.type.name === "header"
        ) {
          let textSelection = TextSelection.create(
            tr.doc,
            anchor - 4,
            anchor - 4
          );
          return dispatch(tr.setSelection(textSelection));
        }
        return false;
      }
    };
  }
}
