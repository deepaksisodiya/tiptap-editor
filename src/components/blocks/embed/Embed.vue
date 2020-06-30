<template>
  <div>
    <ul v-if="!embeds.data.url" class="kitchensink">
      <li @click="deleteNode">
        <i class="add-icon close-icon"></i>
      </li>
      <li class="embed-input" v-if="embeds.isLoading === true">
        <i class="loading-icon"></i>
        <span>{{ loadingText }}</span>
      </li>
      <li v-if="embeds.isLoading === false" class="embed-input">
        <input
          ref="embedInput"
          :placeholder="placeholderText"
          type="text"
          @paste.stop
          @keyup.enter="onClickAdd"
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
      </li>
    </ul>
    <div
      v-if="embeds.data.url && embeds.data.type === 'video'"
      :class="['embed-wrapper', embedWrapperClass]"
    >
      <figure v-html="embeds.data.html"></figure>
      <figcaption v-if="embeds.data.url && embeds.data.type === 'video'">
        <input
          type="text"
          v-model="caption"
          :disabled="!view.editable"
          @keydown="handleKeydown"
          @paste.stop
          placeholder="write caption (optional)"
        />
      </figcaption>
    </div>
    <div
      @click="onClickEmbed"
      v-if="embeds.data.url && embeds.data.type === 'link'"
      :class="[
        'embed-wrapper',
        { selected: shouldShowClose },
        embedWrapperClass
      ]"
    >
      <div class="close-button" @click="deleteNode">
        <i class="close-icon"></i>
      </div>
      <div
        :class="{
          'embed-container':
            embeds.data.provider === 'Twitter' ||
            embeds.data.provider === 'Instagram'
        }"
        v-html="embeds.data.html"
      ></div>
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
      shouldShowClose: false,
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

      if (this.embeds.data.type === "link") {
        this.$nextTick(() => {
          this.disableLink();
          if (this.embeds.data.provider === "Twitter" && window.twttr)
            window.twttr.widgets.load();

          if (this.embeds.data.provider === "Instagram" && window.instgrm)
            window.instgrm.Embeds.process();
        });
      }
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
    },
    embedWrapperClass() {
      if (this.node.attrs.provider) {
        return `${this.node.attrs.provider.toLowerCase()}-wrapper`;
      } else {
        return `standard-link-wrapper`;
      }
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

      // move cursor to new paragraph
      let tr = this.view.state.tr;
      const pos = this.getPos();
      let textSelection = TextSelection.create(tr.doc, pos + 1, pos + 1);
      tr = tr.setSelection(textSelection);
      this.view.dispatch(tr);

      const validURL = this.getValidUrl(this.url);
      this.updateAttrs({
        url: validURL
      });

      this.embeds.isLoading = true;
      this.embeds.isError = false;
      try {
        const url = encodeURIComponent(validURL.trim());
        const response = await this.options.getEmbeds(url);
        // TODO: refactor here and similar code in mounted hook
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
        if (this.embeds.data.type === "link") this.$nextTick(this.disableLink);
      } catch (error) {
        this.embeds.isError = true;
      } finally {
        this.embeds.isLoading = false;
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
    handleKeydown(event) {
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
    },
    disableLink() {
      this.$el.querySelector("a").onclick = e => e.preventDefault();
    },
    onClickEmbed() {
      this.shouldShowClose = !this.shouldShowClose;
    },
    deleteNode() {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
      this.view.dispatch(
        tr.setSelection(textSelection).deleteSelection(this.src)
      );
      this.view.focus();
    }
  }
};
</script>

<style scoped>
.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.embed-container {
  position: relative;
}
.embed-container::before {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 400;
  content: "";
}
</style>
