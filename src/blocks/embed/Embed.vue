<template>
  <div>
    <div
      v-if="!embeds.data.url && embeds.isLoading === false"
      class="embed-input"
    >
      <input
        ref="embedInput"
        :placeholder="placeholderText"
        @paste.stop
        type="text"
        v-model="url"
        :disabled="!view.editable"
      />
      <button
        :disabled="!isButtonActive"
        :class="{ active: isButtonActive }"
        @click="onClickAdd"
      >
        Add
      </button>
    </div>
    <div
      class="embed-input"
      v-if="!embeds.data.url && embeds.isLoading === true"
    >
      <i class="loading-icon"></i>
      <span>{{ loadingText }}</span>
    </div>
    <div
      v-if="embeds.data.url && embeds.data.type === 'video'"
      class="videoWrapper"
    >
      <figure>
        <iframe
          allowfullscreen
          frameborder="0"
          width="560"
          height="349"
          :src="embedUrl(embeds.data)"
        ></iframe>
      </figure>
    </div>
    <figcaption v-if="embeds.data.url && embeds.data.type === 'video'">
      <input
        type="text"
        v-model="caption"
        :disabled="!view.editable"
        @keyup="handleKeyup"
        placeholder="write caption (optional)"
      />
    </figcaption>
    <div
      v-if="embeds.data.url && embeds.data.type === 'link'"
      class="embed-link-block"
      :class="{
        'no-image': !embeds.data.thumbnail_url,
        'full-width-image': !isSquareImage,
        'link-only': isOnlyLink
      }"
    >
      <div v-if="isOnlyLink" class="content">
        <div class="embed-source">
          <div class="link-embed">
            <i class="embed-link-icon"></i>
          </div>
          <span>{{ embeds.data.url }}</span>
        </div>
        <i class="right-arrow"></i>
      </div>
      <div v-else class="content">
        <h1 v-if="embeds.data.title">{{ embeds.data.title }}</h1>
        <p v-if="embeds.data.description">{{ embeds.data.description }}</p>
        <span>{{ embeds.data.url }}</span>
      </div>
      <figure v-if="embeds.data.thumbnail_url">
        <img :src="embeds.data.thumbnail_url" alt="Trulli" />
      </figure>
    </div>
  </div>
</template>

<script>
import { TextSelection } from "tiptap";

export default {
  name: "Embed",
  props: ["node", "updateAttrs", "view", "getPos", "options"],
  data() {
    return {
      isButtonActive: false,
      embeds: {
        isLoading: false,
        isError: false,
        data: {
          title: "",
          description: "",
          author_name: "",
          type: "",
          url: "",
          thumbnail_url: "",
          thumbnail_width: 0,
          thumbnail_height: 0,
          provider_name: "",
          html: ""
        }
      }
    };
  },
  mounted() {
    if (this.url) {
      const data = {
        title: this.node.attrs.title,
        url: this.node.attrs.url,
        author_name: this.node.attrs.author_name,
        thumbnail_url: this.node.attrs.thumbnail_url,
        thumbnail_width: this.node.attrs.thumbnail_width,
        thumbnail_height: this.node.attrs.thumbnail_height,
        provider_name: this.node.attrs.provider_name,
        type: this.node.attrs.type,
        html: this.node.attrs.html,
        description: this.node.attrs.description
      };
      this.embeds.data = data;
    } else {
      this.$nextTick(() => {
        this.$refs.embedInput.focus();
      });
    }
  },
  watch: {
    url() {
      if (this.url) {
        this.isButtonActive = true;
      } else {
        this.isButtonActive = false;
      }
    }
  },
  computed: {
    isOnlyLink() {
      const { url, thumbnail_url, title, description } = this.embeds.data;
      if (!title && !description && !thumbnail_url && url) {
        return true;
      }
      return false;
    },
    isSquareImage() {
      const { thumbnail_width, thumbnail_height } = this.embeds.data;
      return thumbnail_width === thumbnail_height;
    },
    url: {
      get() {
        return this.node.attrs.url;
      },
      set(url) {
        this.updateAttrs({
          url
        });
      }
    },
    caption: {
      get() {
        return this.node.attrs.caption;
      },
      set(caption) {
        this.updateAttrs({
          caption
        });
      }
    },
    placeholderText() {
      if (this.node.attrs.type === "link") {
        return "Paste or type a link";
      }
      return "Paste or type video link";
    },
    loadingText() {
      if (this.node.attrs.type === "link") return "Embedding link…";
      return "Embedding video…";
    }
  },
  methods: {
    async onClickAdd() {
      if (!this.url) return;
      const isUrl = this.validURL(this.url);

      if (!isUrl) {
        this.createAndMovetoNextParagraph();
      } else {
        this.embeds.isLoading = true;
        this.embeds.isError = false;
        try {
          const response = await this.options.getEmbeds(this.url);
          this.embeds.data = response.data;
          // for copy pasting to work
          this.updateAttrs({
            title: response.data.title,
            description: response.data.description,
            author_name: response.data.author_name,
            url: response.data.url,
            thumbnail_url: response.data.thumbnail_url,
            thumbnail_width: response.data.thumbnail_width,
            thumbnail_height: response.data.thumbnail_height,
            provider_name: response.data.provider_name,
            type: response.data.type,
            html: response.data.html
          });
        } catch (error) {
          this.embeds.isError = true;
        } finally {
          // move cursor to new paragraph
          const pos = this.getPos();
          this.embeds.isLoading = false;
          let tr = this.view.state.tr;
          let textSelection = TextSelection.create(tr.doc, pos + 1, pos + 1);
          tr = tr.setSelection(textSelection);
          this.view.dispatch(tr);
          // focus the editor
          this.view.focus();
        }
      }
    },
    createAndMovetoNextParagraph() {
      let {
        state: { tr, schema }
      } = this.view;
      const pos = this.getPos();
      // replce embeds with paragraph
      let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
      tr = tr.setSelection(textSelection).insertText(this.url);

      // create new paragraph
      const type = schema.nodes["paragraph"];
      tr = tr.insert(pos + this.url.length + 2, type.create());
      // move cursor to new paragraph
      textSelection = TextSelection.create(
        tr.doc,
        pos + this.url.length + 2,
        pos + this.url.length + 2
      );
      tr = tr.setSelection(textSelection);
      this.view.dispatch(tr);
      // focus the editor
      this.view.focus();
    },
    validURL(str) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
      return !!pattern.test(str);
    },
    embedUrl(data) {
      if (data.provider_name !== "YouTube") return data.url;

      const div = document.createElement("div");
      div.innerHTML = data.html;
      const iframeNode = div.getElementsByTagName("iframe")[0];
      return iframeNode.src;
    },
    handleKeyup(event) {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      if (event.key === "Backspace" && !this.caption) {
        let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
        this.view.dispatch(
          tr.setSelection(textSelection).deleteSelection(this.url)
        );
        this.view.focus();
      } else if (event.key === "Enter") {
        let textSelection = TextSelection.create(tr.doc, pos + 2, pos + 2);
        this.view.dispatch(tr.setSelection(textSelection));
        this.view.focus();
      }
    }
  }
};
</script>

<style scoped>
.videoWrapper {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
}
.videoWrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
