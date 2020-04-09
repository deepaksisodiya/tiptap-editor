<template>
  <div>
    <button @click="changeContent">Change content</button>
    <Article
      :onUpdatePost="onUpdatePost"
      :content="content"
      :uploadImage="uploadImage"
      :getEmbeds="getEmbeds"
    />
  </div>
</template>

<script>
import Article from "./components/Article.vue";
import { uploadImage, getEmbeds } from "./api";

export default {
  name: "App",
  data() {
    return {
      content: {
        type: "doc",
        content: []
      }
    };
  },
  components: {
    Article
  },
  methods: {
    uploadImage,
    getEmbeds,
    onUpdatePost(preData, newData, title) {
      console.log(preData, newData, title);
    },
    changeContent() {
      this.content = {
        type: "doc",
        content: [
          ...this.content.content,
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "paragraph 3"
              }
            ]
          }
        ]
      };
    }
  }
};
</script>
