<template>
  <div class="editor">
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
        </div>
      </div>
    </editor-floating-menu>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import "./assets/sass/main.scss";
import { Editor, EditorContent, EditorFloatingMenu } from "tiptap";
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

export default {
  components: {
    EditorContent,
    EditorFloatingMenu
  },
  data() {
    return {
      editor: new Editor({
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
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
          })
        ],
        content: `
          <h2>
            Floating Menu
          </h2>
          <p>
            This is an example of a medium-like editor. Enter a new line and some buttons will appear.
          </p>
          <p> Try to change some content here. With the <code>History</code> extension you are able to undo and redo your changes. You can also use keyboard shortcuts for this (<code>cmd+z</code> and <code>cmd+shift+z</code>).</p>
        `
      })
    };
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
</style>
