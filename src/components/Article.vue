<template>
  <div class="editor">
    <!-- on hover it will show bold, italic and code -->
    <!-- menububble start -->
    <div ref="linkDiv" v-show="linkMenuIsActive" class="highlight-menu-input">
      <input
        type="text"
        v-model="linkUrl"
        placeholder="Paste or type a link"
        ref="linkInput"
        @keydown.enter.prevent="setLinkUrl(editor.commands.link, linkUrl)"
        @keydown.esc="hideLinkMenu"
      />
      <i
        class="toolbar-close-icon"
        @click="setLinkUrl(editor.commands.link, linkUrl)"
      ></i>
    </div>
    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
      ref="menububble"
    >
      <ul
        class="highlight-menu"
        :class="{
          'link-menu-active': linkMenuIsActive,
          'is-active': menu.isActive && !isTitleSelected(),
          ios: isIOS,
          'sticky-highlight-menu': !isIOS
        }"
        ref="menuUl"
      >
        <li @click="commands.bold" v-if="!linkMenuIsActive">
          <button>
            <i class="bold-icon" :class="{ 'is-active': isActive.bold() }"></i>
          </button>
        </li>

        <li @click="commands.italic" v-if="!linkMenuIsActive">
          <button>
            <i
              class="italic-icon"
              :class="{ 'is-active': isActive.italic() }"
            ></i>
          </button>
        </li>
        <li
          v-if="!linkMenuIsActive"
          @click="showLinkMenu(getMarkAttrs('link'))"
        >
          <button>
            <i class="link-icon" :class="{ 'is-active': isActive.link() }"></i>
            <!--
          <span>{{ isActive.link() ? "Update Link" : "Add Link" }}</span>
            -->
          </button>
        </li>

        <li v-if="!linkMenuIsActive">
          <button>
            <i class="separator-icon"></i>
          </button>
        </li>

        <li
          class="menubar__button"
          @click="commands.heading({ level: 3 })"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i
              class="large-heading-icon"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            ></i>
          </button>
        </li>

        <li
          class="menubar__button"
          @click="commands.heading({ level: 5 })"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i
              class="small-heading-icon"
              :class="{ 'is-active': isActive.heading({ level: 5 }) }"
            ></i>
          </button>
        </li>

        <li
          class="menububble__button"
          @click="commands.blockquote"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i
              class="quote-icon"
              :class="{ 'is-active': isActive.blockquote() }"
            ></i>
          </button>
        </li>
      </ul>
    </editor-menu-bubble>
    <!-- menububble end -->

    <article>
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
            <li
              class="menubar__button"
              @click="onClickImage()"
              v-if="shouldShowFloatingMenu"
            >
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
              class="menubar__button"
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
              class="menubar__button"
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
            </li> -->
          </ul>
        </div>
      </editor-floating-menu>
      <editor-content id="editor" class="editor__content" :editor="editor" />
      <div class="ios-test-fix">empt</div>
    </article>
  </div>
</template>

<script>
import { Editor, EditorContent } from "tiptap";

import EditorFloatingMenu from "./EditorFloatingMenu";
import EditorMenuBubble from "./EditorMenuBubble";
import ErrorMessage from "./ErrorMessage.vue";

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
import { contains } from "prosemirror-utils";
import _debounce from "lodash.debounce";

import {
  Embed,
  Image,
  FeatureImage,
  // Lock,
  Doc,
  Title,
  HorizontalRule,
  Header
} from "./../blocks";

import Placeholder from "./../extensions/Placeholder";

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
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
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
          new Image(),
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
            if (block.type === "image" && block.attrs.src.includes("data:")) {
              block.attrs.src = "";
            }
          });
          const payload = { blocks: newData, title };
          this.onUpdatePost(payload);
        }, 300)
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

    this.$refs.menububble.$watch("menu.isActive", newValue => {
      if (!newValue) this.linkMenuIsActive = false;
    });

    if (this.isIOS) {
      this.$refs.linkDiv.style.position = "absolute";

      this.menuBarTimer = setInterval(() => this.fixMenubarforIos(), 100);
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
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
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
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
      this.$refs.menububble.menu.isActive = true;
    },
    toggleFloatingMenu() {
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
    isTitleSelected() {
      const {
        state: {
          tr: { doc, selection }
        }
      } = this.editor.view;
      const nodeAtStart = doc.resolve(selection.from).parent.type.name;
      const nodeAtEnd = doc.resolve(selection.to).parent.type.name;
      return nodeAtStart === "title" && nodeAtEnd === "title";
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
            src: this.imageSrc,
            addImageAt: this.addImageAt
          });

          window.imageInstance.$refs.img.onload = async () => {
            const imageInstance = window.imageInstance;
            imageInstance.caption = " ";
            imageInstance.$nextTick(() => {
              imageInstance.caption = "";
            });
            if (imageInstance && imageInstance.dataUrl.includes("data:")) {
              const formData = new FormData();
              formData.append("image", file);

              try {
                const response = await this.uploadImage(formData);
                if (response.status === 200) {
                  imageInstance.src = response.data.url;
                  window.imageInstance = null;
                }
              } catch (error) {
                this.handleError(error);
                window.imageInstance.deleteNode();
              }
            }
          };
        };
        reader.readAsDataURL(file);
      } else {
        console.log("File not supported!");
      }
      this.$refs.fileInput.value = "";
    },
    fixMenubarforIos() {
      const menuUl = this.$refs.menuUl;
      const linkDiv = this.$refs.linkDiv;
      const pageTop = window.visualViewport.pageTop;
      const article = document.getElementsByClassName("editor")[0];

      linkDiv.style.top = `${pageTop - article.offsetTop}px`;
      menuUl.style.top = `${pageTop - article.offsetTop}px`;
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
