<template>
  <div class="demo">
    <div class="article-container">
      <Article
        :onUpdatePost="onUpdatePost"
        :uploadImage="uploadImage"
        :uploadAudio="uploadAudio"
        :getEmbeds="getEmbeds"
        :content="getContent()"
        delayUpdateBy="300"
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

const defaultContent = {
  type: "doc",
  content: [
    {
      type: "featuredimage",
      attrs: {
        src: "",
        caption: "",
        alt: ""
      }
    },
    {
      type: "paragraph"
    }
  ]
};

export default {
  name: "Demo",
  data() {
    return {
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
      alert(formData);
    },
    uploadAudio(formData) {
      // return promise with upload Audio
      alert(formData);
    },
    getEmbeds(url) {
      // Should return promise with embed URL data
      alert(url);
    },
    onUpdatePost({ blocks, title = "" }) {
      this.blocks = { title, ...blocks };
    },
    getContent() {
      return defaultContent;
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
