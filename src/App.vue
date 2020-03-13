<template>
  <Article :onUpdatePost="onUpdatePost" />
</template>

<script>
import Article from "./components/Article.vue";

export default {
  name: "App",
  components: {
    Article
  },
  methods: {
    onUpdatePost(postJSON) {
      console.log(postJSON);
    }
  }
};
</script>
