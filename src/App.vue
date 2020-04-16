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
        content: [
          {
            type: "featuredimage",
            attrs: {
              src: "",
              alt: "",
              caption: ""
            }
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "para"
              }
            ]
          },
          {
            type: "embed",
            attrs: {
              title:
                "Latest News, In depth news, India news, Politics news, Indian Cinema, Indian sports, Culture, Video News",
              description:
                "Scroll.in is an independent website covering news, politics, sports, culture and everything in between. Get the latest news, reportage, analysis and commentary on all that matters in India and beyond.",
              type: "link",
              url: "https://scroll.in",
              provider: null,
              html:
                "<a href='https://scroll.in' title='Latest News, In depth news, India news, Politics news, Indian Cinema, Indian sports, Culture, Video News' class='embed-link-block-container'> <div class='embed-link-block full-width-image'><div class='content'> <h1>Latest News, In depth news, India news, Politics news, Indian Cinema, Indian sports, Culture, Video News</h1> <p>Scroll.in is an independent website covering news, politics, sports, culture and everything in between. Get the latest news, reportage, analysis and commentary on all that matters in India and beyond.</p> <span>https://scroll.in</span> </div> <figure> <img src='https://scroll.in/static/assets/scroll-default.d78c35dfafcc7b30a9b371ecf515075f.006.png' alt='Trulli'> </figure> </div> </a>",
              thumbnail_url:
                "https://scroll.in/static/assets/scroll-default.d78c35dfafcc7b30a9b371ecf515075f.006.png",
              thumbnail_width: 630,
              thumbnail_height: 1200,
              caption: null
            }
          },
          {
            type: "embed",
            attrs: {
              title: "PM Modi's address to the nation on COVID-19",
              dscription: "",
              type: "video",
              url: "https://www.youtube.com/watch?v=OKvi-2_o6y0",
              provider: "YouTube",
              html:
                "<iframe allowfullscreen frameborder='0' width='560' height='349' src='https://www.youtube.com/embed/OKvi-2_o6y0?feature=oembed'></iframe>",
              thumbnail_url: "https://i.ytimg.com/vi/OKvi-2_o6y0/hqdefault.jpg",
              thumbnail_width: 480,
              thumbnail_height: 360,
              caption: "deepak"
            }
          },
          {
            type: "paragraph"
          }
        ]
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
