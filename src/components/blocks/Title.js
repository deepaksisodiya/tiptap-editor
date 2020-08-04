import { Node } from "tiptap";
import { TextSelection } from "tiptap";
import browser from "../../utils/browser";

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
      marks: ""
    };
  }
  keys() {
    return {
      Enter: (state, dispatch, view) => {
        let {
          tr,
          selection: { anchor },
          schema: {
            nodes: { paragraph }
          }
        } = state;
        if (browser.ios) anchor = view.lastSelection.anchor;
        if (tr.doc.resolve(anchor).parent.type.name !== "title") return false;
        if (tr.doc.nodeAt(anchor + 3).textContent)
          tr = tr.insert(anchor + 3, paragraph.create());
        let textSelection = TextSelection.create(
          tr.doc,
          anchor + 4,
          anchor + 4
        );
        tr = tr.setSelection(textSelection);
        dispatch(tr);
        return true;
      },
      Backspace: (state, dispatch, { featureImageInstance }) => {
        let {
          tr,
          selection: { anchor, empty }
        } = state;
        const currentNode = tr.doc.resolve(anchor).parent.type.name;

        const nodeAt2 = tr.doc.nodeAt(anchor - 2);
        if (
          nodeAt2 &&
          (nodeAt2.type.name === "image" ||
            (nodeAt2.type.name === "embed" && nodeAt2.attrs.type === "link") ||
            (nodeAt2.type.name === "featuredimage" &&
              (featureImageInstance.dataUrl || nodeAt2.attrs.src)))
        ) {
          return true;
        }

        if (
          empty &&
          currentNode !== "header" &&
          currentNode !== "title" &&
          tr.doc.resolve(anchor - 3).parent.type.name === "header"
        ) {
          let textSelection = TextSelection.create(
            tr.doc,
            anchor - 4,
            anchor - 4
          );
          dispatch(tr.setSelection(textSelection));
          return true;
        }
        return false;
      }
    };
  }
}
