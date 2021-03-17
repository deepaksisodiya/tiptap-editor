import { Mark } from "@tiptap/core";

export const Superscript = Mark.create({
  name: "image",

  draggable: true,

  parseHTML() {
    return [
      {
        tag: "sup",
      },
    ];
  },

  renderHTML() {
    return ["sup", 0];
  },

  addCommands() {
    return {
      toggleSup: () => ({ commands }) => {
        return commands.toggleMark("sup");
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Ctrl-Shift-6": () => this.editor.commands.toggleSup(),
    };
  },
});
