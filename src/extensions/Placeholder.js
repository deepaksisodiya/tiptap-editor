import { Extension, Plugin } from "tiptap";
import { Decoration, DecorationSet } from "prosemirror-view";

export default class Placeholder extends Extension {
  get name() {
    return "placeholder";
  }

  get defaultOptions() {
    return {
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      emptyNodeText: "Write something …",
      showOnlyWhenEditable: true,
      showOnlyCurrent: true
    };
  }

  get update() {
    return view => {
      view.updateState(view.state);
    };
  }

  get plugins() {
    return [
      new Plugin({
        props: {
          decorations: ({ doc, plugins, selection }) => {
            const editablePlugin = plugins.find(plugin =>
              plugin.key.startsWith("editable$")
            );
            const editable = editablePlugin.props.editable();
            const active = editable || !this.options.showOnlyWhenEditable;
            const { anchor } = selection;
            const decorations = [];
            if (!active) {
              return false;
            }

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
              const isHeaderNode = node.type.name === "header";
              const isPlaceHolderNode =
                isHeaderNode || node.type.name === "paragraph";
              const isNodeEmpty =
                node.content.size === 0 ||
                (isHeaderNode && node.content.size === 2);
              if (
                (hasAnchor || !this.options.showOnlyCurrent) &&
                isNodeEmpty &&
                isPlaceHolderNode
              ) {
                const classes = [this.options.emptyNodeClass];

                const from = isHeaderNode ? pos + 1 : pos;
                const to = isHeaderNode
                  ? pos + node.firstChild.nodeSize + 1
                  : pos + node.nodeSize;

                const decoration = Decoration.node(from, to, {
                  class: classes.join(" "),
                  "data-empty-text":
                    typeof this.options.emptyNodeText === "function"
                      ? this.options.emptyNodeText(node)
                      : this.options.emptyNodeText
                });
                decorations.push(decoration);
              }

              return false;
            });

            return DecorationSet.create(doc, decorations);
          }
        }
      })
    ];
  }
}
