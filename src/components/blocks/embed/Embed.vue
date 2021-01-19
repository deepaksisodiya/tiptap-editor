<template>
  <div>
    <ul v-if="!embeds.data.url" class="kitchensink embed-input-open">
      <li @click="deleteNode">
        <i class="icon add-icon close-icon"></i>
      </li>
      <li class="embed-input" v-if="embeds.isLoading === true">
        <i class="icon loading-icon"></i>
        <span>{{ loadingText }}</span>
      </li>
      <li v-if="embeds.isLoading === false" class="embed-input">
        <input
          ref="embedInput"
          :placeholder="placeholderText"
          type="url"
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
          placeholder="Type caption for video (optional)"
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
          'embed-content':
            embeds.data.provider === 'Twitter' ||
            embeds.data.provider === 'Instagram' ||
            embeds.data.provider === 'Github' ||
            embeds.data.provider === 'Apple'
        }"
        v-html="embeds.data.html"
      ></div>
    </div>
  </div>
</template>

<script>
import { TextSelection } from "tiptap";
import jsonp from "jsonp";

import { getValidUrl, loadScript } from "./../../../utils";

export default {
  name: "Embed",
  props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
  data() {
    return {
      isButtonActive: false,
      shouldShowClose: false,
      embeds: {
        isLoading: false,
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
  inject: ["getEditorVm"],
  mounted() {
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
    if (this.url) {
      this.embeds.data = this.getEmbedsData(this.node.attrs);

      if (this.embeds.data.type === "link") {
        this.$nextTick(() => {
          this.disableLink();
          this.loadEmbeds();
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
    loadGithubGist(githubGistUrl) {
      const url = new URL(githubGistUrl);
      const file = url.searchParams.get("file");
      const jsonUrl =
        url.origin + url.pathname + ".json" + (file ? `?file=${file}` : "");

      jsonp(jsonUrl, { timeout: 20000 }, (err, response) => {
        if (err) {
          // need to handle error case
          return;
        }
        this.embeds.data.html =
          `<link rel="stylesheet" href="${response.stylesheet}"></link>` +
          response.div;
      });
    },
    loadEmbeds() {
      if (this.embeds.data.provider === "Twitter") {
        if (window.twttr) window.twttr.widgets.load();
        else {
          loadScript("https://platform.twitter.com/widgets.js", () => {
            window.twttr.widgets.load();
          });
        }
      }

      if (this.embeds.data.provider === "Instagram") {
        if (window.instgrm) window.instgrm.Embeds.process();
        else {
          loadScript("https://www.instagram.com/embed.js", () => {
            window.instgrm.Embeds.process();
          });
        }
      }
      if (this.embeds.data.provider === "Github")
        this.loadGithubGist(this.embeds.data.url);
    },
    async onClickAdd() {
      try {
        if (!this.url) throw "nullURL";

        // move cursor to new paragraph
        let tr = this.view.state.tr;
        const pos = this.getPos();
        let textSelection = TextSelection.create(tr.doc, pos + 1, pos + 1);
        tr = tr.setSelection(textSelection);
        this.view.dispatch(tr);

        const validURL = getValidUrl(this.url);
        this.updateAttrs({
          url: validURL
        });

        this.embeds.isLoading = true;

        const url = encodeURIComponent(validURL.trim());
        const response = await this.options.getEmbeds(url);
        this.embeds.data = this.getEmbedsData(response.data.attrs);
        // for copy pasting to work
        this.updateAttrs(this.embeds.data);

        if (this.embeds.data.type === "link") {
          this.$nextTick(() => {
            this.disableLink();
            this.loadEmbeds();
          });
        }
      } catch (error) {
        this.options.handleError(error, "embed");
      } finally {
        this.embeds.isLoading = false;
      }
    },
    handleKeydown(event) {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      if (event.key === "Backspace" && !this.caption) {
        this.deleteNode();
      } else if (event.key === "Enter") {
        let textSelection = TextSelection.create(tr.doc, pos + 2, pos + 2);
        this.view.dispatch(tr.setSelection(textSelection));
        this.view.focus();
        event.preventDefault();
      }
    },
    disableLink() {
      const anchorTag = this.$el.querySelector("a");
      if (anchorTag) anchorTag.onclick = e => e.preventDefault();
    },
    onClickEmbed() {
      this.editor.blur();
      this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    },
    deleteNode() {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
      this.view.dispatch(
        tr.setSelection(textSelection).deleteSelection(this.url)
      );
      this.view.focus();
    },
    getEmbedsData(data) {
      return {
        title: data.title,
        description: data.description,
        url: data.url,
        provider: data.provider,
        thumbnail_url: data.thumbnail_url,
        thumbnail_width: data.thumbnail_width,
        thumbnail_height: data.thumbnail_height,
        html: data.html,
        type: data.type
      };
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
</style>
