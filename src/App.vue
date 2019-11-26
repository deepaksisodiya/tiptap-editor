<template>
  <editor-content :editor="editor" />
</template>

<script>
// Import the basic building blocks
import { Editor, EditorContent } from "tiptap";

export default {
  components: {
    EditorContent
  },
  data() {
    return {
      // Create an `Editor` instance with some default content. The editor is
      // then passed to the `EditorContent` component as a `prop`
      editor: new Editor({
        content: "<p>This is just a boring paragraph</p>"
      })
    };
  },
  beforeDestroy() {
    // Always destroy your editor instance when it's no longer needed
    this.editor.destroy();
  }
};
</script>
