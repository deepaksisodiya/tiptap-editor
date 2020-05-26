<template>
  <div>
    <Article
      :onUpdatePost="onUpdatePost"
      :content="content"
      :uploadImage="uploadImage"
      :getEmbeds="getEmbeds"
    />
    <div>Title is {{ title }}</div>
    <vue-json-pretty :path="'res'" :data="blocks"> </vue-json-pretty>
  </div>
</template>

<script>
import "@/assets/scss/base.scss";
import "@/assets/scss/editor.scss";
import "@/assets/scss/article.scss";
import VueJsonPretty from "vue-json-pretty";
import Article from "./components/Article.vue";
import { uploadImage, getEmbeds } from "./api";

export default {
  name: "Demo",
  data() {
    return {
      title: "",
      blocks: {}
    };
  },
  components: {
    Article,
    VueJsonPretty
  },
  methods: {
    uploadImage,
    getEmbeds,
    onUpdatePost({ blocks, title }) {
      this.blocks = blocks;
      this.title = title;
    }
  }
};
</script>
