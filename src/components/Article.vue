<template>
  <div class="editor">
    <!-- on hover it will show bold, italic and code -->
    <!-- menububble start -->
    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
    >
      <ul
        class="highlight-menu"
        :class="{ 'is-active': menu.isActive || linkMenuIsActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
        <li
          class="menububble3__button"
          @click="commands.bold"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i class="bold-icon" :class="{ 'is-active': isActive.bold() }"></i>
          </button>
        </li>

        <li
          class="menububble3__button"
          @click="commands.italic"
          v-if="!linkMenuIsActive"
        >
          <button>
            <i
              class="italic-icon"
              :class="{ 'is-active': isActive.italic() }"
            ></i>
          </button>
        </li>

        <form
          class="menububble__form"
          v-if="linkMenuIsActive"
          @submit.prevent="setLinkUrl(commands.link, linkUrl)"
        >
          <input
            class="menububble__input"
            type="text"
            v-model="linkUrl"
            placeholder="https://"
            ref="linkInput"
            @keydown.esc="hideLinkMenu"
          />
          <button
            class="menububble__button"
            @click="setLinkUrl(commands.link, null)"
            type="button"
          >
            remove
          </button>
        </form>
        <li
          v-else
          class="menububble__button"
          @click="showLinkMenu(getMarkAttrs('link'))"
        >
          <button>
            <i class="link-icon" :class="{ 'is-active': isActive.link() }"></i>
            <!--
          <span>{{ isActive.link() ? "Update Link" : "Add Link" }}</span>
          --></button>
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
      <editor-floating-menu
        :editor="editor"
        v-slot="{ commands, isActive, menu }"
      >
        <div
          class="editor__floating-menu"
          :class="{ 'is-plus-active': menu.isActive }"
          :style="`top: ${menu.top - 20}px`"
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
            <li
              class="menubar__button"
              @click="onClickImage()"
              v-if="shouldShowFloatingMenu"
            >
              <i class="image-icon"></i>
            </li>
            <li
              class="menubar__button"
              :class="{ 'is-active': isActive.horizontal_rule() }"
              v-if="shouldShowFloatingMenu"
              @click="onClickMenuItem(commands.horizontal_rule)"
            >
              <i class="separator-icon"></i>
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
              @click="onClickEmbed(commands.embed, 'video')"
            >
              <i class="video-icon"></i>
            </li>

            <li
              :class="{ 'is-active': isActive.embed() }"
              v-if="shouldShowFloatingMenu"
              @click="onClickEmbed(commands.embed, 'link')"
            >
              <i class="link-icon"></i>
            </li>

            <li v-if="shouldShowFloatingMenu">
              <i class="kitchensink-divider"></i>
            </li>

            <li
              v-if="shouldShowFloatingMenu"
              :style="`display: ${hasLock ? 'none' : 'inline'}`"
              :class="{ 'is-active': isActive.lock() }"
              @click="onClickMenuItem(commands.lock)"
            >
              <i class="lock-icon"></i>
            </li>
          </ul>
        </div>
      </editor-floating-menu>
      <editor-content id="editor" class="editor__content" :editor="editor" />
      <div class="ios">s</div>
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
  TrailingNode,
  HorizontalRule,
  Placeholder
} from "tiptap-extensions";
import { contains } from "prosemirror-utils";
// import VueJsonPretty from "vue-json-pretty";

import { Embed, Image, Lock, Doc, Title } from "./../blocks";

import "./../../ui_assets/scss/editor/editor.scss";

export default {
  name: "Article",
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  data() {
    return {
      imageSrc: "",
      data: null,
      shouldShowFloatingMenu: false,
      editable: true,
      linkUrl: null,
      linkMenuIsActive: false,
      editor: new Editor({
        editable: true,
        extensions: [
          new Doc(),
          new Title(),
          new Placeholder({
            showOnlyCurrent: false,
            emptyNodeText: this.emptyNodeText
          }),
          new HardBreak(),
          new Heading({ levels: [3, 5] }),
          new ListItem(),
          new OrderedList(),
          new Link(),
          new Bold(),
          new Blockquote(),
          new Italic(),
          new History(),
          new TrailingNode({
            node: "paragraph",
            notAfter: ["paragraph"]
          }),
          new Image(),
          new Embed({
            baseUrl: "http://139.59.32.245:8000/metadata"
          }),
          new HorizontalRule(),
          new Lock()
        ],
        onUpdate: ({ getJSON }) => {
          this.data = getJSON();
        }
      })
    };
  },
  methods: {
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    emptyNodeText(node) {
      if (node.type.name === "title") {
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
    onClickEmbed(command, embedType) {
      command({ embedType });
      this.hideFloatingMenu();
    },
    onClickImage() {
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
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          this.imageSrc = img.src;
          command({ src: img.src });
        };
        reader.readAsDataURL(file);
      } else {
        // console.log("File not supported!");
      }
      this.$refs.fileInput.value = "";
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

.menububble3 {
  &__form {
    display: flex;
    align-items: center;
  }

  &__input {
    font: inherit;
    border: none;
    background: transparent;
    color: white;
  }
}
.ios {
  height: 500px;
  visibility: hidden;
}
</style>
