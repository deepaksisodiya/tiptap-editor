import { Node } from "tiptap";
import { chainCommands, exitCode } from "tiptap-commands";

export default class SeperatorNode extends Node {
  // name of the component
  get name() {
    return "seperator";
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      group: "block",
      selectable: true,

      draggable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [{ tag: this.name }],
      toDOM: () => [
        "seperator",
        {
          frameborder: 0,
          allowfullscreen: "true"
        }
      ]
    };
  }

  commands({ type }) {
    return () => (state, dispatch) =>
      dispatch(state.tr.replaceSelectionWith(type.create()));
  }

  keys({ type }) {
    const command = chainCommands(exitCode, (state, dispatch) => {
      dispatch(state.tr.replaceSelectionWith(type.create()).scrollIntoView());
      return true;
    });
    return {
      "Shift-s": command
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view"],
      template: `
        <div @paste.stop style="text-align:center" contenteditable="true">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `
    };
  }
}
