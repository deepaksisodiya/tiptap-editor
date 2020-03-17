<template>
  <Article :onUpdatePost="onUpdatePost" :content="content" />
</template>

<script>
import Article from "./components/Article.vue";

export default {
  name: "App",
  data() {
    return {
      content: {
        type: "doc",
        content: [
          {
            type: "title",
            content: [
              {
                type: "text",
                text: "title of the doc"
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "paragraph 1"
              }
            ]
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "paragraph 2"
              }
            ]
          }
        ]
      }
    };
  },
  components: {
    Article
  },
  methods: {
    onUpdatePost(preData, newData) {
      console.log(preData, newData);
    }
  }
};
</script>
