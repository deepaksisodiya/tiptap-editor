<template>
  <div class="editor">
    <div class="checkbox">
      <input type="checkbox" id="editable" v-model="editable" />
      <label for="editable">editable</label>
    </div>
    <editor-floating-menu
      :editor="editor"
      v-slot="{ commands, isActive, menu }"
    >
      <div
        class="editor__floating-menu"
        :class="{ 'is-active': menu.isActive }"
        :style="`top: ${menu.top}px`"
      >
        <button @click="toggleFloatingMenu">
          Plus_icon
        </button>
        <div v-if="shouldShowFloatingMenu">
          <input
            type="file"
            ref="fileInput"
            style="display:none"
            @change="previewFiles(commands.image)"
          />
          <button class="menubar__button" @click="onClickImage()">
            Image
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.horizontal_rule() }"
            @click="onClickMenuItem(commands.horizontal_rule)"
          >
            HorizontalRule
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="onClickMenuItem(commands.ordered_list)"
          >
            List
          </button>

          <button
            :class="{ 'is-active': isActive.embed() }"
            @click="onClickMenuItem(commands.embed)"
          >
            Video
          </button>

          <button
            :class="{ 'is-active': isActive.embed() }"
            @click="onClickMenuItem(commands.embed)"
          >
            Link
          </button>

          <button
            :style="`display: ${hasLock ? 'none' : 'inline'}`"
            :class="{ 'is-active': isActive.lock() }"
            @click="onClickMenuItem(commands.lock)"
          >
            Lock
          </button>
        </div>
      </div>
    </editor-floating-menu>

    <!-- on hover it will show bold, italic and code -->
    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
    >
      <ul :class="[menu.isActive ? 'is-active' : 'is-not-active']">
        <li :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
          <i class="bold-icon"></i>
        </li>

        <li
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          <i class="italic-icon"></i>
        </li>

        <form
          class="menububble__form"
          v-if="linkMenuIsActive"
          @submit.prevent="setLinkUrl(commands.link, linkUrl)"
        >
          <input
            type="text"
            v-model="linkUrl"
            placeholder="https://"
            ref="linkInput"
            @keydown.esc="hideLinkMenu"
          />
          <button @click="setLinkUrl(commands.link, null)" type="button">
            remove
          </button>
        </form>
        <button
          v-else
          @click="showLinkMenu(getMarkAttrs('link'))"
          :class="{ 'is-active': isActive.link() }"
        >
          <i class="link-icon"></i>
          <span>{{ isActive.link() ? "Update Link" : "Add Link" }}</span>
        </button>

        <li>
          <i class="separator-icon"></i>
        </li>

        <li
          :class="{ 'is-active': isActive.heading({ level: 3 }) }"
          @click="onClickMenuItem(commands.heading, { level: 3 })"
        >
          <i class="large-heading-icon"></i>
        </li>

        <li
          class="menubar__button"
          :class="{ 'is-active': isActive.heading({ level: 5 }) }"
          @click="onClickMenuItem(commands.heading, { level: 5 })"
        >
          <i class="small-heading-icon"></i>
        </li>

        <li
          class="menububble__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          <i class="quote-icon"></i>
        </li>
      </ul>
    </editor-menu-bubble>

    <article>
      <editor-content id="editor" class="editor__content" :editor="editor" />
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
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Code,
  Italic,
  Link,
  History,
  TrailingNode,
  HorizontalRule,
  Placeholder
} from "tiptap-extensions";
import { contains } from "prosemirror-utils";
// import VueJsonPretty from "vue-json-pretty";

import Embed from "./Embed";
import Image from "./Image";
import Lock from "./Lock";
import Doc from "./Doc";
import Title from "./Title";

import "./../ui_assets/scss/editor/editor.scss";

export default {
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
          new Code(),
          new Italic(),
          new History(),
          new TrailingNode({
            node: "paragraph",
            notAfter: ["paragraph"]
          }),
          new Image(),
          new Embed({
            type: ["video", "link"]
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
        if (content.length === 2) return "Start your content here ...";
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
    onClickMenuItem(command, obj) {
      command(obj);
      this.shouldShowFloatingMenu = false;
    },
    onClickImage() {
      this.$refs.fileInput.click();
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
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
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
.is-not-active {
  visibility: hidden;
  opacity: 0;
}
.is-active {
  visibility: visible;
  opacity: 1;
  transition: visibility 0.2s, opacity 0.2s;
}
.ProseMirror [contenteditable="false"] {
  white-space: normal;
}

.ProseMirror [contenteditable="true"] {
  white-space: pre-wrap;
}
</style>
