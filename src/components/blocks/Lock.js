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
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{ tag: "div" }],
      toDom: () => ["div"]
    };
  }

  commands({ type }) {
    return attrs => (state, dispatch) => {
      let { tr, schema } = state;
      if (tr.doc.content.size - tr.selection.head === 1)
        tr = tr.insert(tr.doc.content.size, schema.nodes["paragraph"].create());
      let textSelection = TextSelection.create(
        tr.doc,
        tr.selection.head,
        tr.selection.head
      );
      tr = tr
        .setSelection(textSelection)
        .replaceSelectionWith(type.create(attrs));
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
        <div>
          <div @paste.stop style="text-align:center">
            {{text}}
          </div>
        </div>
      `
    };
  }
}
