import { Node } from "tiptap";
import { chainCommands, exitCode } from "tiptap-commands";
import { TextSelection } from "tiptap";

export default class LockNode extends Node {
  // name of the component
  get name() {
    return "lock";
  }

  get defaultOptions() {
    return {
      text: `Only paid subscribers can see content below`
    };
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      group: "block",
      selectable: true,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{ tag: this.name }]
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      let tr = state.tr;
      tr = tr.replaceSelectionWith(type.create(attrs));
      let textSelection = TextSelection.create(
        tr.doc,
        tr.selection.head,
        tr.selection.head
      );
      tr = tr.setSelection(textSelection);
      return dispatch(tr);
    };
  }

  keys({ type }) {
    const command = chainCommands(exitCode, (state, dispatch) => {
      dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    });
    return {
      "Shift-l": command
    };
  }

  get view() {
    const options = this.options;
    return {
      data() {
        return {
          text: options.text
        };
      },
      props: ["node", "updateAttrs", "view"],
      template: `
        <div @paste.stop style="text-align:center" contenteditable="false">
          {{text}}
        </div>
      `
    };
  }
}
