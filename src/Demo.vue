<template>
  <div class="demo">
    <div class="article-container">
      <Article
        :onUpdatePost="onUpdatePost"
        :uploadImage="uploadImage"
        :uploadDocument="uploadDocument"
        :uploadAudio="uploadAudio"
        :getEmbeds="getEmbeds"
        :content="getContent()"
        :setFailedBlocks="failedBlocks"
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
        alt: "",
        height: "",
        width: ""
      }
    },
    {
      type: "document",
      attrs: {
        src: "http://www.africau.edu/images/default/sample.pdf",
        caption: "",
        name: "01 ScrollStack_Tax Declaration Form FY 202021 (1).pdf",
        size: "128.5KB",
        format: "pdf"
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
    delay(ms) {
      return new Promise(res => setTimeout(res, ms));
    },
    async uploadImage() {
      // return promise with upload image url
      await this.delay(3000);
      return Promise.resolve({
        status: 200,
        data: {
          image: "https://dev-bucket.nyc3.cdn.digitaloceanspaces.com/sites/74/posts/2327/juuuydyvgt1608178680.webp",
          fallback: "https://dev-bucket.nyc3.cdn.digitaloceanspaces.com/sites/74/posts/2327/juuuydyvgt1608178680.png",
          meta: {
            height: 400,
            width: 400
          }
        }
      });
    },
    failedBlocks() {},
    async uploadDocument() {
      // return promise with upload document url
      await this.delay(3000);
      return Promise.resolve({
        status: 200,
        data: {
          document: "http://www.africau.edu/images/default/sample.pdf",
          format: "pdf"
        }
      });
      // return Promise.reject({});
    },
    uploadAudio(formData) {
      // return promise with upload Audio
      alert(formData);
    },
    getEmbeds() {
      // Should return promise with embed URL data
      return Promise.resolve({
        status: 200,
        data: {
          type: "embed",
          attrs: {
            title: "Pink Floyd - High Hopes (Official Music Video HD)",
            description:
              "Delicate Sound of Thunder, restored, re-edited, remixed, out now https://PinkFloyd.lnk.to/DSOT_RestoredNow available in HD this new version was specially re-...",
            type: "link",
            url: "https://www.youtube.com/watch?v=7jMlFXouPk8",
            provider: null,
            domain: "youtube.com",
            thumbnail_url: "https://i.ytimg.com/vi/7jMlFXouPk8/hqdefault.jpg",
            thumbnail_width: 480,
            thumbnail_height: 360,
            html:
              '<a href="https://www.youtube.com/watch?v=7jMlFXouPk8" title="Pink Floyd - High Hopes (Official Music Video HD)" target="_blank" rel="noopener nofollow" class="embed-link-block-container">\n    <div class="embed-link-block full-width-image">\n        <div class="content">\n            <h1>Pink Floyd - High Hopes (Official Music Video HD)</h1>\n            <p>Delicate Sound of Thunder, restored, re-edited, remixed, out now https://PinkFloyd.lnk.to/DSOT_RestoredNow available in HD this new version was specially re-...</p>\n            <span>youtube.com</span>\n            </div>\n        <figure>\n            <img src="https://i.ytimg.com/vi/7jMlFXouPk8/hqdefault.jpg" alt="Trulli">\n        </figure>\n        </div>\n</a>'
          }
        }
      });
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
