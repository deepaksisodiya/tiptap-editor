import { Plugin, PluginKey } from "tiptap";

class Menu {
  constructor({ options, editorView }) {
    this.options = {
      ...{
        element: null,
        keepInBounds: true,
        onUpdate: () => false
      },
      ...options
    };
    this.editorView = editorView;
    this.isActive = false;
    this.left = 0;
    this.bottom = 0;
    this.top = 0;
    this.preventHide = false;

    // the mousedown event is fired before blur so we can prevent it
    this.mousedownHandler = this.handleClick.bind(this);
    this.options.element.addEventListener("mousedown", this.mousedownHandler);

    this.options.editor.on("focus", ({ view }) => {
      this.update(view);
    });

    this.options.editor.on("blur", ({ event }) => {
      if (this.preventHide) {
        this.preventHide = false;
        return;
      }

      this.hide(event);
    });
  }

  handleClick() {
    this.preventHide = true;
  }

  update(view, lastState) {
    const { state } = view;

    if (view.composing) {
      return;
    }
    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    ) {
      return;
    }

    // Hide the tooltip if the selection is empty
    if (state.selection.empty) {
      this.hide();
      return;
    }

    // Otherwise, reposition it and update its content
    // const { from, to } = state.selection;

    // These are in screen coordinates
    // We can't use EditorView.cordsAtPos here because it can't handle linebreaks correctly
    // See: https://github.com/ProseMirror/prosemirror-view/pull/47
    // const start = coordsAtPos(view, from);
    // const end = coordsAtPos(view, to, true);

    // The box in which the tooltip is positioned, to use as base
    // const parent = this.options.element.offsetParent;
    // console.log(parent);
    // if (!parent) {
    //   this.hide();
    //   return;
    // }

    // console.log("abcd");

    // const box = parent.getBoundingClientRect();
    // const el = this.options.element.getBoundingClientRect();

    // // Find a center-ish x position from the selection endpoints (when
    // // crossing lines, end may be more to the left)
    // const left = (start.left + end.left) / 2 - box.left;

    // // Keep the menuBubble in the bounding box of the offsetParent i
    // this.left = Math.round(
    //   this.options.keepInBounds
    //     ? Math.min(box.width - el.width / 2, Math.max(left, el.width / 2))
    //     : left
    // );
    // this.bottom = Math.round(box.bottom - start.top);
    // this.top = Math.round(end.bottom - box.top);
    this.isActive = true;

    this.sendUpdate();
  }

  sendUpdate() {
    this.options.onUpdate({
      isActive: this.isActive,
      left: this.left,
      bottom: this.bottom,
      top: this.top
    });
  }

  hide(event) {
    if (
      event &&
      event.relatedTarget &&
      this.options.element.parentNode.contains(event.relatedTarget)
    ) {
      return;
    }

    this.isActive = false;
    this.sendUpdate();
  }

  destroy() {
    this.options.element.removeEventListener(
      "mousedown",
      this.mousedownHandler
    );
  }
}

export default function(options) {
  return new Plugin({
    key: new PluginKey("menu_bubble"),
    view(editorView) {
      return new Menu({ editorView, options });
    }
  });
}
