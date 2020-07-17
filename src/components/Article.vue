<template>
  <div class="editor">
    <article>
      <editor-menu-bubble :editor="editor" />
      <!-- Message-bar -->
      <error-message
        :onClickClose="onClickCloseError"
        :hasError="error.occurred"
        :errorMessage="error.message"
        :error-name="error.name"
      />
      <!-- End of message-bar -->

      <editor-floating-menu
        :editor="editor"
        v-slot="{ commands, isActive, menu }"
        ref="floatingMenu"
      >
        <div
          class="editor__floating-menu"
          :class="{ 'is-plus-active': menu.isActive }"
          :style="`top: ${menu.top - 20}px`"
          ref="floatingMenuElement"
        >
          <input
            type="file"
            id="image-input"
            ref="fileInput"
            style="display:none"
            @change="previewFiles(commands.image)"
          />
          <ul class="kitchensink">
            <li @click="toggleFloatingMenu">
              <i
                class="add-icon"
                :class="{ 'close-icon': shouldShowFloatingMenu }"
              ></i>
            </li>
            <li v-if="shouldShowTooltip" class="popover right-popover">
              <div class="popover-content">
                <h3>WELCOME TO SCROLLSTACK</h3>
                <p>
                  Tap the (+) button to add images, videos, embeds and more to
                  your story.
                </p>
                <button @click="onClickOk" class="dark-button">
                  <span>OK, Got it</span>
                </button>
              </div>
            </li>
            <li @click="onClickImage()" v-if="shouldShowFloatingMenu">
              <i class="image-icon"></i>
            </li>

            <li
              :class="{ 'is-active': isActive.embed() }"
              v-if="shouldShowFloatingMenu"
              @click="onClickEmbed(commands.embed, 'video')"
            >
              <i class="video-icon"></i>
            </li>

            <li
              v-if="shouldShowFloatingMenu"
              :class="{ 'is-active': isActive.ordered_list() }"
              @click="onClickMenuItem(commands.ordered_list)"
            >
              <i class="list-icon"></i>
            </li>

            <li
              :class="{ 'is-active': isActive.embed() }"
              v-if="shouldShowFloatingMenu"
              @click="onClickEmbed(commands.embed, 'link')"
            >
              <i class="link-icon"></i>
            </li>

            <li
              :class="{ 'is-active': isActive.horizontal_rule() }"
              v-if="shouldShowFloatingMenu"
              @click="onClickMenuItem(commands.horizontal_rule)"
            >
              <i class="separator-icon"></i>
            </li>

            <li v-if="shouldShowFloatingMenu" style="display:none">
              <i class="kitchensink-divider"></i>
            </li>

            <!--
              For now disable the lock icon from floating menu kitchsink for pre-alpha relese
              later do like :style="`display: ${hasLock ? 'none' : 'inline'}`"
              :style="`display: ${hasLock ? 'none' : 'none'}`"
            -->
            <!-- <li
              v-if="shouldShowFloatingMenu"
              :style="`display: ${hasLock ? 'none' : 'none'}`"
              :class="{ 'is-active': isActive.lock() }"
              @click="onClickMenuItem(commands.lock)"
            >
              <i class="lock-icon"></i>
            </li>-->
          </ul>
        </div>
      </editor-floating-menu>
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
  Italic,
  Link,
  History,
  TrailingNode
} from "tiptap-extensions";
import { contains, findChildren } from "prosemirror-utils";
import _debounce from "lodash.debounce";

import ErrorMessage from "./ErrorMessage.vue";
import EditorFloatingMenu from "./../EditorFloatingMenu";
import EditorMenuBubble from "./EditorMenuBubble.vue";
import {
  Embed,
  Image,
  FeatureImage,
  // Lock,
  Doc,
  Title,
  HorizontalRule,
  Header
} from "./blocks";
import Placeholder from "./../extensions/Placeholder";
import browser from "../utils/browser";
import { keyEvent } from "../utils/dom";

const EVENTS = ["online", "offline"];

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
      default: defaultContent,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    shouldShowTitleError: {
      type: Boolean,
      required: false,
      default: () => false
    },
    hideTitleError: {
      type: Function,
      required: false,
      default: Function.prototype
    },
    uploadImage: {
      type: Function,
      required: true
    },
    getEmbeds: {
      type: Function,
      required: true
    }
  },
  components: {
    ErrorMessage,
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  data() {
    return {
      isOnline: navigator.onLine || false,
      error: {
        occurred: false,
        message: "",
        name: ""
      },
      shouldShowTooltip: localStorage && !localStorage.getItem("editorTour"),
      data: this.content,
      imageSrc: "",
      shouldShowFloatingMenu: false,
      editable: true,
      linkUrl: null,
      linkMenuIsActive: false,
      editor: new Editor({
        autoFocus: false,
        editable: true,
        extensions: [
          new Doc(),
          new Bold(),
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
            handleError: this.handleError
          }),
          new FeatureImage({
            uploadImage: this.uploadImage,
            handleError: this.handleError
          }),
          new Embed({
            getEmbeds: this.getEmbeds
          }),
          new HorizontalRule()
          // new Lock()
        ],
        onUpdate: _debounce(({ getJSON }) => {
          this.data = getJSON();
          const newData = { ...this.data };
          const headerContent = newData.content[0].content;
          let title = "";
          if (headerContent) {
            title =
              headerContent[0].content &&
              headerContent[0].content[0] &&
              headerContent[0].content[0].text;
            newData.content.shift();
          }
          newData.content.forEach(block => {
            if (
              block.type === "image" &&
              block.attrs.src &&
              block.attrs.src.fallback.includes("data:")
            ) {
              block.attrs.src = "";
            }
          });
          const payload = { blocks: newData, title };
          this.onUpdatePost(payload);
        }, 300),
        editorProps: {
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
            }
          }
        }
      })
    };
  },
  created() {
    EVENTS.forEach(event =>
      window.addEventListener(event, this.updateOnlineStatus)
    );
  },
  mounted() {
    if (!this.isOnline) {
      this.error.occurred = true;
      this.error.message =
        "You appear to be offline. Any changes to your post may not be saved.";
      this.error.name = "offline";
    }

    // init data
    const newContent = this.addTitle(
      this.content || defaultContent,
      this.title
    );
    this.editor.setContent(newContent, false);
  },
  beforeDestroy() {
    if (this.menuBarTimer) clearInterval(this.menuBarTimer);

    EVENTS.forEach(event =>
      window.removeEventListener(event, this.updateOnlineStatus)
    );
  },
  methods: {
    updateOnlineStatus() {
      this.isOnline = navigator.onLine;
    },
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
        const {
          state: {
            doc: {
              content: { content }
            }
          }
        } = this.editor;
        if (
          content.length === 3 &&
          node.type.name === "paragraph" &&
          !this.shouldShowFloatingMenu
        )
          return "Start writing here";
      }
      return "";
    },
    toggleFloatingMenu(e) {
      if (!this.shouldShowFloatingMenu) {
        const nodePos = this.editor.view.posAtCoords({
          left: e.clientX + 100,
          top: e.clientY
        });
        this.editor.setSelection(nodePos.pos, nodePos.pos);
      }
      if (localStorage && !localStorage.getItem("editorTour")) {
        this.onClickOk();
      }
      this.shouldShowFloatingMenu = !this.shouldShowFloatingMenu;
      this.editor.setOptions({});
    },
    onClickMenuItem(command) {
      command();
      this.hideFloatingMenu();
    },
    onClickEmbed(command, type) {
      command({ type });
      this.hideFloatingMenu();
    },
    onClickImage() {
      this.addImageAt = this.editor.view.state.tr.selection.head;
      this.$refs.fileInput.click();
      this.hideFloatingMenu();
    },
    handleError(apiError) {
      if (this.error.name === "title") this.hideTitleError();
      this.error.occurred = true;
      if (apiError.response && apiError.response.status === 413) {
        this.error.message =
          "The image you are trying to upload is too big. Please resize it so that it is under 25MB.";
        this.error.name = "imageToBig";
      } else {
        this.error.message =
          "Something went wrong while uploading the image. Please try again.";
        this.error.name = "imageError";
      }
    },
    hideFloatingMenu() {
      this.shouldShowFloatingMenu = false;
    },
    previewFiles(command) {
      const file = this.$refs.fileInput.files[0];

      const imageType = /image.*/;
      if (file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          this.imageSrc = img.src;
          command({
            src: { fallback: this.imageSrc },
            addImageAt: this.addImageAt
          });
        };
        reader.readAsDataURL(file);
      }
    },
    onClickOk() {
      if (!localStorage) return;
      localStorage.setItem("editorTour", true);
      this.shouldShowTooltip = false;
    },
    onClickCloseError() {
      this.error.occurred = false;
      this.error.message = "";
      if (this.error.name === "title") {
        this.hideTitleError();
      }
    },
    handleAfterPaste({ state, dispatch }) {
      const { doc, schema, tr } = state;
      const childAfterCursor = doc.childAfter(state.selection.anchor + 1);
      if (
        childAfterCursor.node &&
        childAfterCursor.node.type.name === "paragraph" &&
        childAfterCursor.node.nodeSize === 2
      ) {
        this.editor.setSelection(
          state.selection.anchor + 2,
          state.selection.anchor + 2
        );
      } else if (
        !childAfterCursor.node &&
        doc.content.size === state.selection.anchor + 1
      ) {
        const type = schema.nodes["paragraph"];
        const transaction = tr.insert(doc.content.size, type.create());
        dispatch(transaction);
        this.editor.setSelection(
          state.selection.anchor + 2,
          state.selection.anchor + 2
        );
      }
    }
  },
  watch: {
    editable() {
      this.editor.setOptions({
        editable: this.editable
      });
    },
    shouldShowFloatingMenu() {
      const {
        state: {
          doc: {
            content: { content }
          }
        }
      } = this.editor;
      if (content.length === 2) {
        this.editor.setOptions({});
      }
    },
    shouldDisplayTitleError() {
      if (this.shouldShowTitleError) {
        this.error.occurred = true;
        this.error.message =
          "You need to add a title to your post before continuing.";
        this.error.name = "title";
      }
    },
    isOnline() {
      if (this.isOnline) {
        this.error.occurred = false;
      } else {
        this.error.occurred = true;
        this.error.message =
          "You appear to be offline. Any changes to your post may not be saved.";
        this.error.name = "offline";
      }
    }
  },
  computed: {
    hasLock() {
      return contains(
        this.editor.view.state.doc,
        this.editor.schema.nodes.lock
      );
    },
    shouldDisplayTitleError() {
      return this.shouldShowTitleError;
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
