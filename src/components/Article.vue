<template>
  <div class="editor">
    <!-- on hover it will show bold, italic and code -->
    <!-- menububble start -->
    <div ref="linkInput" v-if="linkMenuIsActive" class="highlight-menu-input">
      <input
        type="text"
        v-model="linkUrl"
        placeholder="Paste or type a link"
        ref="linkInput"
        @keydown.enter.prevent="setLinkUrl(editor.commands.link, linkUrl)"
        @keydown.esc="hideLinkMenu"
      />
      <i class="toolbar-close-icon" @click="setLinkUrl(editor.commands.link, linkUrl)"></i>
    </div>
    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
      ref="menububble"
    >
      <ul
        class="highlight-menu"
        :class="{ 'is-active': menu.isActive, ios: isIOS }"
        :style="{ position: 'sticky', display: linkMenuIsActive ? 'none' : 'block'}"
        ref="menuUl"
      >
        <li @click="commands.bold" v-if="!linkMenuIsActive">
          <button>
            <i class="bold-icon" :class="{ 'is-active': isActive.bold() }"></i>
          </button>
        </li>

        <li @click="commands.italic" v-if="!linkMenuIsActive">
          <button>
            <i class="italic-icon" :class="{ 'is-active': isActive.italic() }"></i>
          </button>
        </li>
        <li v-if="!linkMenuIsActive" @click="showLinkMenu(getMarkAttrs('link'))">
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
            <i class="large-heading-icon" :class="{ 'is-active': isActive.heading({ level: 3 }) }"></i>
          </button>
        </li>

        <li
          class="menubar__button"
          @click="commands.heading({ level: 5 })"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i class="small-heading-icon" :class="{ 'is-active': isActive.heading({ level: 5 }) }"></i>
          </button>
        </li>

        <li class="menububble__button" @click="commands.blockquote" v-if="!linkMenuIsActive">
          <button>
            <i class="quote-icon" :class="{ 'is-active': isActive.blockquote() }"></i>
          </button>
        </li>
      </ul>
    </editor-menu-bubble>
    <!-- menububble end -->

    <article>
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
              <i class="add-icon" :class="{ 'close-icon': shouldShowFloatingMenu }"></i>
            </li>
            <li class="menubar__button" @click="onClickImage()" v-if="shouldShowFloatingMenu">
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
            -->
            <li
              v-if="shouldShowFloatingMenu"
              :style="`display: ${hasLock ? 'none' : 'none'}`"
              :class="{ 'is-active': isActive.lock() }"
              @click="onClickMenuItem(commands.lock)"
            >
              <i class="lock-icon"></i>
            </li>
          </ul>
        </div>
      </editor-floating-menu>
      <editor-content id="editor" class="editor__content" :editor="editor" />
      <div class="ios-test-fix">empt</div>
    </article>

    <!--
    <vue-json-pretty :path="'res'" :data="data"> </vue-json-pretty>
    -->
  </div>
</template>

<script>
import {
  Editor,
  EditorContent,
  EditorFloatingMenu,
  EditorMenuBubble
} from "tiptap";

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
// import VueJsonPretty from "vue-json-pretty";
import _debounce from "lodash.debounce";
import axios from "axios";

import {
  Embed,
  Image,
  FeatureImage,
  Lock,
  Doc,
  Title,
  HorizontalRule,
  Header
} from "./../blocks";

import Placeholder from "./../extensions/Placeholder";

import "@/assets/scss/base.scss";
import "@/assets/scss/editor.scss";
import "@/assets/scss/article.scss";

export default {
  name: "Article",
  props: {
    onUpdatePost: {
      type: Function,
      required: true
    },
    content: {
      type: Object,
      required: false
    },
    title: {
      type: String,
      required: false
    }
  },
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  data() {
    return {
      data: this.content,
      imageSrc: "",
      shouldShowFloatingMenu: false,
      editable: true,
      linkUrl: null,
      linkMenuIsActive: false,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
      editor: new Editor({
        autoFocus: true,
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
          new FeatureImage(),
          new Embed({
            baseUrl: "https://api.scrollstack.com/embeds/metadata"
          }),
          new HorizontalRule(),
          new Lock()
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
            newData.content[0].content.shift();
          }
          this.onUpdatePost(newData, title);
        }, 300)
      })
    };
  },
  mounted() {
    this.$refs.menububble.$watch("menu.isActive", newValue => {
      if (!newValue) this.linkMenuIsActive = false;
    });

    if (this.isIOS) {
      this.$refs.floatingMenu.$watch("menu.top", newValue => {
        if (
          newValue + 13 >=
          window.visualViewport.pageTop + window.visualViewport.height
        ) {
          this.$refs.floatingMenuElement.scrollIntoView(true);
        }
      });

      window.setInterval(() => this.fixMenubarforIos(), 100);
    }

    // init data
    if (this.content) {
      const newContent = this.addTitle(this.content, this.title);
      this.editor.setContent(newContent, false);
    }
  },
  methods: {
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
    },
    addTitle(data, title) {
      if (data.content.length === 0) return;
      let newData = data;
      newData.content[0].content = [
        {
          type: "title",
          content: [{ type: "text", text: title }]
        },
        data.content[0].content[0]
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
        if (content.length === 2 && !this.shouldShowFloatingMenu)
          return "Start your content here ...";
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
    },
    toggleFloatingMenu() {
      this.shouldShowFloatingMenu = !this.shouldShowFloatingMenu;
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
    hideFloatingMenu() {
      this.shouldShowFloatingMenu = false;
    },
    previewFiles(command) {
      this.editor.focus();
      const file = this.$refs.fileInput.files[0];

      const imageType = /image.*/;
      if (file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const img = new Image();
          img.src = reader.result;
          this.imageSrc = img.src;

          const formData = new FormData();
          formData.append(file.name, file);
          // TODO handle image loading here later
          const response = await axios.post(
            "https://api.scrollstack.com/images",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            }
          );
          command({
            src: response.data.url,
            addImageAt: this.addImageAt
          });
        };
        reader.readAsDataURL(file);
      } else {
        console.log("File not supported!");
      }
      // this.$refs.fileInput.value = "";
    },
    fixMenubarforIos() {
      const menuUl = this.$refs.menuUl;
      const linkInput = this.$refs.linkInput;
      const pageTop = window.visualViewport.pageTop;
      linkInput.style.top = `${pageTop}px`;
      menuUl.style.top = `${pageTop}px`;
    }
  },
  watch: {
    content(newValue) {
      if (newValue) {
        const newContent = this.addTitle(newValue, this.title);
        this.editor.setContent(newContent, false);
      }
    },
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
    }
  },
  computed: {
    hasLock() {
      return contains(
        this.editor.view.state.doc,
        this.editor.schema.nodes.lock
      );
    }
  }
};
</script>

<style lang="scss">
.editor *.is-empty:nth-child(1)::before,
.editor *.is-empty:nth-child(2)::before {
  float: left;
  content: attr(data-empty-text);
  pointer-events: none;
  height: 0;
}

figcaption > span.is-empty {
  display: inline-block;
  text-align: left;
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

// .menububble3 {
//   &__form {
//     display: flex;
//     align-items: center;
//   }

//   &__input {
//     font: inherit;
//     border: none;
//     background: transparent;
//     color: white;
//   }
// }
.ios-test-fix {
  visibility: hidden;
  height: 500px;
}
</style>
