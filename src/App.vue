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
      v-slot="{ commands, isActive, menu }"
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

export default {
  components: {
    EditorContent,
    EditorFloatingMenu,
    EditorMenuBubble
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
</style>
