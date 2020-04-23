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
      <figure v-html="embeds.data.html"></figure>
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
      v-html="embeds.data.html"
    ></div>
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
          type: "",
          url: "",
          thumbnail_url: "",
          thumbnail_width: 0,
          thumbnail_height: 0,
          provider: "",
          html: "",
          caption: ""
        }
      }
    };
  },
  mounted() {
    if (this.url) {
      const data = {
        title: this.node.attrs.title,
        url: this.node.attrs.url,
        thumbnail_url: this.node.attrs.thumbnail_url,
        thumbnail_width: this.node.attrs.thumbnail_width,
        thumbnail_height: this.node.attrs.thumbnail_height,
        provider: this.node.attrs.provider,
        type: this.node.attrs.type,
        description: this.node.attrs.description,
        html: this.node.attrs.html
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
    // https://stackoverflow.com/questions/11300906/check-if-a-string-starts-with-http-using-javascript
    getValidUrl(url = "") {
      let newUrl = window.decodeURIComponent(url);
      newUrl = newUrl.trim().replace(/\s/g, "");

      if (/^(:\/\/)/.test(newUrl)) {
        return `https${newUrl}`;
      }
      if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
        return `https://${newUrl}`;
      }
      return newUrl;
    },
    async onClickAdd() {
      if (!this.url) return;

      const validURL = this.getValidUrl(this.url);
      this.updateAttrs({
        url: validURL
      });

      this.embeds.isLoading = true;
      this.embeds.isError = false;
      try {
        const response = await this.options.getEmbeds(validURL);
        this.embeds.data = {
          title: response.data.attrs.title,
          description: response.data.attrs.description,
          url: response.data.attrs.url,
          provider: response.data.attrs.provider,
          thumbnail_url: response.data.attrs.thumbnail_url,
          thumbnail_width: response.data.attrs.thumbnail_width,
          thumbnail_height: response.data.attrs.thumbnail_height,
          html: response.data.attrs.html,
          type: response.data.attrs.type
        };
        // for copy pasting to work
        this.updateAttrs(this.embeds.data);
      } catch (error) {
        this.embeds.isError = true;
      } finally {
        this.embeds.isLoading = false;
        // move cursor to new paragraph
        let tr = this.view.state.tr;
        const pos = this.getPos();
        let textSelection = TextSelection.create(tr.doc, pos + 1, pos + 1);
        tr = tr.setSelection(textSelection);
        this.view.dispatch(tr);
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
