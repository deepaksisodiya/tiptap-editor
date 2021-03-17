import browser from "../../utils/browser";

import { Node } from "@tiptap/core";

export const Image = Node.create({
  name: "title",

  content: "inline*",

  parseHTML() {
    return [
      [
        {
          tag: "h1",
        },
      ],
    ];
  },

  renderHTML() {
    return ["h1", 0];
  },

  addCommands() {
    return {
      handleEnter: () => ({ state, dispatch, view }) => {
        let {
          tr,
          selection: { anchor: anchorAfterEnterKeydown },
          schema: {
            nodes: { paragraph },
          },
        } = state;
        let anchor = anchorAfterEnterKeydown;
        let anchorAtEnterKeydown = view.selectionAtEnterKeydown.anchor;

        if (browser.ios) anchor = anchorAtEnterKeydown;
        if (tr.doc.resolve(anchor).parent.type.name !== "title") {
          if (
            browser.ios &&
            anchorAfterEnterKeydown - anchorAtEnterKeydown === 2 &&
            !tr.doc.resolve(anchorAtEnterKeydown).parentOffset
          ) {
            let textSelection = TextSelection.create(
              tr.doc,
              anchor,
              anchor + 2
            );
            tr = tr.setSelection(textSelection).deleteSelection();
            dispatch(tr);
          }
          return false;
        }
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
      handleBackspace: () => ({ state, dispatch }) => {
        let {
          tr,
          selection: { anchor, empty },
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
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.handleEnter(),
      Backspace: () => this.editor.commands.handleBackspace(),
    };
  },
});
