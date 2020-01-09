<template>
  <div class="editor">
    <div class="checkbox">
      <input type="checkbox" id="editable" v-model="editable" />
      <label for="editable">editable</label>
    </div>
    <button @click="setContentImage">Set Content</button>
    <editor-floating-menu
      :editor="editor"
      v-slot="{ commands, isActive, menu }"
    >
      <div>
        <span v-if="isActive.table()">
          <button class="menubar__button" @click="commands.deleteTable">
            delete_table
          </button>
          <button class="menubar__button" @click="commands.addColumnBefore">
            add_col_before
          </button>
          <button class="menubar__button" @click="commands.addColumnAfter">
            add_col_after
          </button>
          <button class="menubar__button" @click="commands.deleteColumn">
            delete_col
          </button>
          <button class="menubar__button" @click="commands.addRowBefore">
            add_row_before
          </button>
          <button class="menubar__button" @click="commands.addRowAfter">
            add_row_after
          </button>
          <button class="menubar__button" @click="commands.deleteRow">
            delete_row
          </button>
          <button class="menubar__button" @click="commands.toggleCellMerge">
            combine_cells
          </button>
        </span>

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
              :class="{ 'is-active': isActive.heading({ level: 1 }) }"
              @click="onClickMenuItem(commands.heading, { level: 1 })"
            >
              H1
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 2 }) }"
              @click="onClickMenuItem(commands.heading, { level: 2 })"
            >
              H2
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
              @click="onClickMenuItem(commands.heading, { level: 3 })"
            >
              H3
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.bullet_list() }"
              @click="onClickMenuItem(commands.bullet_list)"
            >
              bullet_list
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.ordered_list() }"
              @click="onClickMenuItem(commands.ordered_list)"
            >
              ordered_list
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.blockquote() }"
              @click="onClickMenuItem(commands.blockquote)"
            >
              blockquote
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.code_block() }"
              @click="onClickMenuItem(commands.code_block)"
            >
              code_block
            </button>

            <button
              class="menubar__button"
              @click="
                onClickMenuItem(commands.createTable, {
                  rowsCount: 3,
                  colsCount: 3,
                  withHeaderRow: false
                })
              "
            >
              Table
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.todo_list() }"
              @click="onClickMenuItem(commands.todo_list)"
            >
              checklist
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.foodMeta() }"
              @click="onClickMenuItem(commands.foodMeta)"
            >
              FoodMeta
            </button>

            <button
              class="menubar__button"
              :class="{ 'is-active': isActive.image() }"
              @click="showImagePrompt(commands.image)"
            >
              Image
            </button>

            <button
              :class="{ 'is-active': isActive.embed() }"
              @click="onClickMenuItem(commands.embed)"
            >
              Embed
            </button>

            <button
              :class="{ 'is-active': isActive.seperator() }"
              @click="onClickMenuItem(commands.seperator)"
            >
              Seperator
            </button>

            <button
              :style="`display: ${hasLock ? 'none' : 'block'}`"
              :class="{ 'is-active': isActive.lock() }"
              @click="onClickMenuItem(commands.lock)"
            >
              Lock
            </button>
          </div>
        </div>
      </div>
    </editor-floating-menu>

    <!-- on hover it will show bold, italic and code -->
    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
    >
      <div :class="[menu.isActive ? 'is-active' : 'is-not-active']">
        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.bold() }"
          @click="commands.bold"
        >
          bold
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.italic() }"
          @click="commands.italic"
        >
          italic
        </button>

        <button
          class="menububble__button"
          :class="{ 'is-active': isActive.code() }"
          @click="commands.code"
        >
          code
        </button>

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
        <button
          v-else
          class="menububble__button"
          @click="showLinkMenu(getMarkAttrs('link'))"
          :class="{ 'is-active': isActive.link() }"
        >
          <span>{{ isActive.link() ? "Update Link" : "Add Link" }}</span>
        </button>
      </div>
    </editor-menu-bubble>

    <div class="editor">
      <editor-content id="editor" class="editor__content" :editor="editor" />
    </div>
    <vue-json-pretty :path="'res'" :data="data"> </vue-json-pretty>
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
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  History,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TrailingNode,
  HorizontalRule,
  Placeholder
} from "tiptap-extensions";
import FoodMeta from "./FoodMeta";
import Embed from "./Embed";
import Seperator from "./Seperator";
import Image from "./Image";
import Lock from "./Lock";
import VueJsonPretty from "vue-json-pretty";
import { contains } from "prosemirror-utils";
import Doc from "./Doc";
import Title from "./Title";

// import "./editor/editor.scss";

export default {
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble,
    VueJsonPretty
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
            emptyNodeText: node => {
              if (node.type.name === "title") {
                return "Title";
              }
              return "Tell us your story";
            }
          }),
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem({
            nested: true
          }),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new History(),
          new Table({
            resizable: true
          }),
          new TableHeader(),
          new TableCell(),
          new TableRow(),
          new TrailingNode({
            node: "paragraph",
            notAfter: ["paragraph"]
          }),
          new Image(),
          new FoodMeta(),
          new Embed({
            changeToParagraph: this.changeToParagraph,
            type: ["video", "link"]
          }),
          new HorizontalRule(),
          new Seperator(),
          new Lock()
        ],
        onUpdate: ({ getJSON }) => {
          this.data = getJSON();
        },
        content: `
          <h2>
            Floating Menu
          </h2>
          <p>
            This is an example of a medium-like editor. Enter a new line and some buttons will appear.
          </p>
          <p> Try to change some content here. With the <code>History</code> extension you are able to undo and redo your changes. You can also use keyboard shortcuts for this (<code>cmd+z</code> and <code>cmd+shift+z</code>).</p>
          <p>This iframe is rendered as a vue component. This makes it possible to render the input below to change its source.</p>
          <iframe src="https://www.youtube.com/embed/XIMLoLxmTDw" frameborder="0" allowfullscreen></iframe>

        `
      })
    };
  },
  methods: {
    changeToParagraph(text) {
      const arr = this.data.content.map(el => {
        if (el.type === "embed" && el.attrs.src === text) {
          return {
            type: "paragraph",
            content: [
              {
                type: "text",
                text
              }
            ]
          };
        }
        return el;
      });
      const content = {
        type: "doc",
        content: arr
      };
      this.editor.setContent(content, true);
    },
    showLinkMenu(attrs) {
      this.linkUrl = attrs.href;
      this.linkMenuIsActive = true;
      this.$nextTick(() => {
        this.$refs.linkInput.focus();
      });
    },
    hideLinkMenu() {
      this.linkUrl = null;
      this.linkMenuIsActive = false;
    },
    setLinkUrl(command, url) {
      command({ href: url });
      this.hideLinkMenu();
    },
    showImagePrompt(command) {
      const src = prompt("Enter the url of your image here");
      if (src !== null) {
        command({ src });
      }
    },
    toggleFloatingMenu() {
      this.shouldShowFloatingMenu = !this.shouldShowFloatingMenu;
    },
    onClickMenuItem(command, obj) {
      command(obj);
      this.shouldShowFloatingMenu = false;
    },
    setContent() {
      const content = {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: {
              level: 2
            },
            content: [
              {
                type: "text",
                text: "Set Content from button"
              }
            ]
          },
          {
            type: "foodMeta",
            attrs: {
              cooktime: "48",
              serves: "40"
            }
          },
          {
            type: "seperator"
          },
          {
            type: "paragraph"
          }
        ]
      };
      this.editor.setContent(content, true);
    },
    setContentImage() {
      const content = {
        type: "doc",
        content: [
          {
            type: "image",
            attrs: {
              src:
                "https://s01.sgp1.cdn.digitaloceanspaces.com/article/82781-cakfrpcito-1577809242.jpeg",
              alt: null,
              caption: "some caption"
            }
          }
        ]
      };
      this.editor.setContent(content, true);
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
  },
  mounted() {
    const doc = this.editor.getJSON();
    doc.content.push({
      type: "foodMeta",
      attrs: {
        cooktime: "48",
        serves: "40"
      }
    });
    this.editor.setContent(doc);
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
</style>
