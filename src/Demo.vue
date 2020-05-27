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
import VueJsonPretty from "vue-json-pretty";
import axios from "axios";
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
      // TODO change it
      axios.post("https://deepak.scrollstack.com/api/w/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "oWn7jKY6TFSVEHN7p-2jmwAc5-2EIDjWo29DWzQLUco"
        }
      });
    },
    getEmbeds(url) {
      // TODO change it
      axios.get(
        `https://deepak.scrollstack.com/api/w/embeds/metadata?url=${url.trim()}`,
        {
          headers: {
            Authorization: "oWn7jKY6TFSVEHN7p-2jmwAc5-2EIDjWo29DWzQLUco"
          }
        }
      );
    },
    onUpdatePost({ blocks, title }) {
      this.blocks = blocks;
      this.title = title;
    }
  }
};
</script>
