<template>
  <div>
    <button @click="changeContent">Change content</button>
    <Article
      :onUpdatePost="onUpdatePost"
      :content="content"
      :postImage="postImage"
      :getEmbeds="getEmbeds"
    />
  </div>
</template>

<script>
import Article from "./components/Article.vue";
import { postImage, getEmbeds } from "./api";

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
    postImage,
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
