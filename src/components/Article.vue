<template>
  <div class="editor">
    <article>
      <editor-menu-bubble :editor="editor" />
      <editor-floating-menu
        :editor="editor"
        ref="floatingMenu"
        :before-upload="beforeUpload"
      />
      <editor-content id="editor" class="editor__content" :editor="editor" />
      <div class="ios-test-fix">empt</div>
    </article>
  </div>
</template>

<script>
import { Editor, EditorContent, TextSelection } from "tiptap";
import {
  Blockquote,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Code,
  Italic,
  Link,
  History,
  TrailingNode
} from "tiptap-extensions";
import { findChildren } from "prosemirror-utils";

import EditorFloatingMenu from "./EditorFloatingMenu.vue";
import EditorMenuBubble from "./EditorMenuBubble.vue";
import {
  Embed,
  Image,
  FeatureImage,
  // Lock,
  Doc,
  Title,
  HorizontalRule,
  Header,
  Superscript,
  Audio,
  CodeBlockHighlight
} from "./blocks";
import Placeholder from "./../extensions/Placeholder";
import browser from "../utils/browser";
import { keyEvent } from "../utils/dom";

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "featuredimage",
      attrs: {
        src: "",
        caption: "",
        alt: ""
      }
    },
    {
      type: "paragraph"
    }
  ]
};

export default {
  name: "Article",
  props: {
    onUpdatePost: {
      type: Function,
      required: true
    },
    content: {
      type: Object,
      default: function() {
        return defaultContent;
      },
      required: true
    },
    title: {
      type: String,
      required: false
    },
    uploadImage: {
      type: Function,
      required: true
    },
    uploadAudio: {
      type: Function,
      required: true
    },
    getEmbeds: {
      type: Function,
      required: true
    },
    handleError: {
      type: Function,
      default: () => {}
    },
    beforeUpload: {
      type: Function,
      default: () => true
    }
  },
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  data() {
    return {
      error: {
        occurred: false,
        message: "",
        name: ""
      },
      data: this.content,
      editable: true,
      selectedEl: undefined,
      editor: new Editor({
        autoFocus: false,
        editable: true,
        extensions: [
          new Doc(),
          new Bold(),
          new Code(),
          new Blockquote(),
          new Italic(),
          new Title(),
          new Header(),
          new Placeholder({
            showOnlyCurrent: false,
            emptyNodeText: this.emptyNodeText
          }),
          new HardBreak(),
          new Heading({ levels: [3, 5] }),
          new ListItem(),
          new OrderedList(),
          new Link(),
          new History(),
          new TrailingNode({
            node: "paragraph",
            notAfter: ["paragraph"]
          }),
          new Image({
            uploadImage: this.uploadImage,
            onSelection: this.onSelection
          }),
          new Audio({
            uploadAudio: this.uploadAudio,
            handleError: this.handleError,
            onSelection: this.onSelection
          }),
          new FeatureImage({
            uploadImage: this.uploadImage,
            onSelection: this.onSelection
          }),
          new Embed({
            getEmbeds: this.getEmbeds,
            onSelection: this.onSelection
          }),
          new HorizontalRule(),
          new Superscript(),
          new CodeBlockHighlight()
          // new Lock()
        ],
        onUpdate: ({ getJSON }) => {
          const data = getJSON();
          const title = this.editor.state.doc.firstChild.textContent;

          data.content.shift();
          data.content = data.content.filter(block => {
            if (
              (block.type === "image" &&
                block.attrs.src &&
                block.attrs.src.fallback.includes("data:")) ||
              (block.type === "audio" &&
                block.attrs.src &&
                block.attrs.src.includes("data:"))
            ) {
              return false;
            }
            return true;
          });
          this.onUpdatePost({ blocks: data, title });
        },
        // a hack for codeBlock on firefox browser,
        // check CodeBlockHighlight plugin for more detail
        onTransaction: ({ transaction }) => {
          if (
            transaction.getMeta("resetSelectionHack") &&
            typeof window !== undefined
          ) {
            const s = window.document.getSelection();
            if (s) {
              const r = s.getRangeAt(0);
              if (r) {
                s.removeAllRanges();
                s.addRange(r);
              }
            }
          }
        },
        editorProps: {
          handleClick: () => {
            this.selectedEl = null;
          },
          handlePaste: (view, event, slice) => {
            const singleNode =
              slice.openStart == 0 &&
              slice.openEnd == 0 &&
              slice.content.childCount == 1
                ? slice.content.firstChild
                : null;
            let tr = singleNode
              ? view.state.tr.replaceSelectionWith(singleNode, view.shiftKey)
              : view.state.tr.replaceSelection(slice);
            // current cursor position
            const anchor = tr.selection.anchor;
            // find featured image blocks
            const nodes = findChildren(
              tr.doc,
              child => child.type.name === "featuredimage",
              false
            );
            // if multiple featured image blocks
            if (nodes.length > 1) {
              let textSelection = TextSelection.create(
                tr.doc,
                nodes[1].pos,
                nodes[1].pos + 1
              );
              // select and delete block
              tr = tr.setSelection(textSelection).deleteSelection();
              // keep cursor and last anchor positoin
              textSelection = TextSelection.create(tr.doc, anchor, anchor);
              tr = tr.setSelection(textSelection);
            }
            view.dispatch(
              tr
                .scrollIntoView()
                .setMeta("paste", true)
                .setMeta("uiEvent", "paste")
            );
            this.handleAfterPaste(view);
            return true;
          },
          handleDOMEvents: {
            beforeinput: (view, event) => {
              // We should probably do more with beforeinput events, but support
              // is so spotty that I'm still waiting to see where they are going.

              // Very specific hack to deal with backspace sometimes failing on
              // Chrome Android when after an uneditable node.
              if (
                browser.chrome &&
                browser.android &&
                event.inputType == "deleteContentBackward"
              ) {
                const cursorBeforeDelete = view.state.selection.$cursor;
                let { domChangeCount } = view;
                setTimeout(() => {
                  if (view.domChangeCount != domChangeCount) return; // Event already had some effect
                  // This bug tends to close the virtual keyboard, so we refocus
                  let { $cursor } = view.state.selection;
                  view.dom.blur();
                  cursorBeforeDelete.pos !== $cursor.pos
                    ? this.editor.focus(
                        cursorBeforeDelete.pos,
                        cursorBeforeDelete.pos
                      )
                    : this.editor.focus();
                  if (
                    view.someProp("handleKeyDown", f =>
                      f(view, keyEvent(8, "Backspace"))
                    )
                  )
                    return;
                  // Crude approximation of backspace behavior when no command handled it
                  if ($cursor && $cursor.pos > 0)
                    view.dispatch(
                      view.state.tr
                        .delete($cursor.pos - 1, $cursor.pos)
                        .scrollIntoView()
                    );
                }, 50);
              }
              return true;
            },
            keydown: (view, event) => {
              if (event.keyCode === 13)
                view.selectionAtEnterKeydown = view.state.selection;
              return false;
            }
          }
        }
      })
    };
  },
  provide() {
    return {
      getEditorVm: () => {
        return this;
      }
    };
  },
  mounted() {
    // init data
    const newContent = this.addTitle(
      this.content || defaultContent,
      this.title
    );
    this.editor.setContent(newContent, false);
  },
  methods: {
    addTitle(data, title) {
      if (data.content.length === 0) return;
      let newData = data;
      newData.content = [
        {
          type: "header",
          content: [
            {
              type: "title",
              content: title ? [{ type: "text", text: title }] : []
            }
          ]
        },
        ...newData.content
      ];
      return newData;
    },
    emptyNodeText(node) {
      if (node.type.name === "header") {
        return "Title";
      }
      if (this.editor) {
        const { doc } = this.editor.state;
        if (
          doc.childCount === 3 &&
          node.type.name === "paragraph" &&
          !this.$refs.floatingMenu.shouldShowMenu
        )
          return "Start writing here";
      }
      return "";
    },
    handleAfterPaste({ state, dispatch }) {
      const { doc, schema, tr, selection } = state;
      const childAfterCursor = doc.childAfter(selection.anchor + 1);
      if (
        childAfterCursor.node &&
        childAfterCursor.node.type.name === "paragraph" &&
        childAfterCursor.node.nodeSize === 2
      ) {
        this.editor.setSelection(selection.anchor + 2, selection.anchor + 2);
      } else if (
        !childAfterCursor.node &&
        doc.content.size === selection.anchor + 1
      ) {
        const type = schema.nodes["paragraph"];
        const transaction = tr.insert(doc.content.size, type.create());
        dispatch(transaction);
        this.editor.setSelection(selection.anchor + 2, selection.anchor + 2);
      }
    },
    onSelection(el) {
      this.selectedEl = el;
    }
  },
  watch: {
    editable() {
      this.editor.setOptions({
        editable: this.editable
      });
    }
  }
};
</script>

<style lang="scss">
.editor *.is-empty:nth-child(1)::before,
.editor *.is-empty:nth-child(3)::before {
  float: left;
  content: attr(data-empty-text);
  pointer-events: none;
  height: 0;
}

.dot {
  height: 15px;
  width: 15px;
  background-color: black;
  border-radius: 50%;
  display: inline-block;
}

.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="true"] {
  white-space: pre-wrap;
}

.highlight-menu-input {
  z-index: 1001;
}

.link-menu-active {
  display: none;
}

.ios-test-fix {
  visibility: hidden;
  height: 500px;
}
</style>
