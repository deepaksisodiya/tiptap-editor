<template>
  <div class="demo">
    <div class="article-container">
      <Article
        :onUpdatePost="onUpdatePost"
        :uploadImage="uploadImage"
        :getEmbeds="getEmbeds"
      />
    </div>
    <vue-json-pretty :path="'res'" :data="blocks"></vue-json-pretty>
  </div>
</template>

<script>
import VueJsonPretty from "vue-json-pretty";
import Article from "./components/Article.vue";

import "@/assets/scss/base.scss";
import "@/assets/scss/editor.scss";
import "@/assets/scss/article.scss";

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
    uploadImage(formData) {
      // return promise with upload image url
      console.log(formData);
    },
    getEmbeds(url) {
      // Should return promise with embed URL data
      console.log(url);
    },
    onUpdatePost({ blocks, title }) {
      this.blocks = blocks;
      this.title = title;
    }
  }
};
</script>
<style>
@media only screen and (min-width: 768px) {
  .title {
    text-align: center;
  }
  .demo {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 20px;
    border: 2px solid black;
    margin: 25px;
  }
  .article-container {
    width: 60%;
    padding: 0 50px;
    box-sizing: border-box;
    margin: unset;
    height: 730px;
    overflow-y: scroll;
    border-right: 2px solid black;
  }
  .vjs-tree.is-root {
    position: relative;
    width: 40%;
    padding: 10px;
    box-sizing: border-box;
    height: 730px;
    overflow-y: scroll;
  }
}
</style>
