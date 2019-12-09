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
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            bullet_list
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            ordered_list
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            blockquote
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_block() }"
            @click="commands.code_block"
          >
            code_block
          </button>

          <button
            class="menubar__button"
            @click="
              commands.createTable({
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
            @click="commands.todo_list"
          >
            checklist
          </button>
        </div>
      </div>
    </editor-floating-menu>

    <editor-menu-bubble
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      v-slot="{ commands, isActive, menu, getMarkAttrs }"
    >
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`"
      >
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

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import "./assets/sass/main.scss";
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
  TrailingNode
} from "tiptap-extensions";
import Iframe from "./Iframe.js";

export default {
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
  },
  data() {
    return {
      editable: true,
      linkUrl: null,
      linkMenuIsActive: false,
      editor: new Editor({
        editable: true,
        extensions: [
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
          new Iframe()
        ],
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
.editor {
  position: relative;

  &__floating-menu {
    position: absolute;
    z-index: 1;
    margin-top: -0.25rem;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s, visibility 0.2s;

    &.is-active {
      opacity: 1;
      visibility: visible;
    }
  }
}
ul[data-type="todo_list"] {
  padding-left: 0;
}
li[data-type="todo_item"] {
  display: flex;
  flex-direction: row;
}
.todo-checkbox {
  border: 2px solid black;
  height: 0.9em;
  width: 0.9em;
  box-sizing: border-box;
  margin-right: 10px;
  margin-top: 0.3rem;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;
  border-radius: 0.2em;
  background-color: transparent;
  transition: 0.4s background;
}
.todo-content {
  flex: 1;
  > p:last-of-type {
    margin-bottom: 0;
  }
  > ul[data-type="todo_list"] {
    margin: 0.5rem 0;
  }
}
li[data-done="true"] {
  > .todo-content {
    > p {
      text-decoration: line-through;
    }
  }
  > .todo-checkbox {
    background-color: black;
  }
}
li[data-done="false"] {
  text-decoration: none;
}
.iframe {
  &__embed {
    width: 100%;
    height: 15rem;
    border: 0;
  }
  &__input {
    display: block;
    width: 100%;
    font: inherit;
    border: 0;
    border-radius: 5px;
    background-color: rgba(black, 0.1);
    padding: 0.3rem 0.5rem;
  }
}
</style>
