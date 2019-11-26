<template>
  <div>
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <button :class="{ 'is-active': isActive.bold() }" @click="commands.bold">
        Bold
      </button>
    </editor-menu-bar>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
// Import the basic building blocks
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import { Bold } from "tiptap-extensions";

export default {
  components: {
    EditorMenuBar,
    EditorContent
  },
  data() {
    return {
      // Create an `Editor` instance with some default content. The editor is
      // then passed to the `EditorContent` component as a `prop`
      editor: new Editor({
        extensions: [
          // The editor will accept paragraphs and headline elements as part of its document schema.
          new Bold()
        ]
      })
    };
  },
  beforeDestroy() {
    // Always destroy your editor instance when it's no longer needed
    this.editor.destroy();
  }
};
</script>

<style scoped>
.is-active {
  font-weight: bold;
}
</style>
