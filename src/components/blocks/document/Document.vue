<template>
  <figure class="file-attachment">
    <div :class="['file-attachment-panel', { selected: shouldShowClose }]">
      <div class="close-button" @click="deleteNode">
        <i class="close-icon"></i>
      </div>
      <div class="file-attachment-container" @click="onDocumentClick">
        <i class="icon file-type-icon" :class="getIconClass()"></i>
        <div class="file-attachment-content">
          <p class="file-name">
            {{ name }}
          </p>
          <div class="file-meta-container">
            <small class="file-meta">
              {{ size }}
            </small>
            <div class="progress media-progress" v-if="isLoading">
              <div
                class="progress-bar"
                role="progressbar"
                aria-valuenow="45"
                aria-valuemin="0"
                aria-valuemax="100"
                style="width:45%"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <ul
        class="file-cta-container"
        v-if="!isLoading && data"
        @click="download"
      >
        <li class="download-cta">
          Download
        </li>
      </ul>
    </div>
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for Audio (optional)"
        @keydown="handleKeydown"
        @paste.stop
      />
    </figcaption>
  </figure>
</template>

<script>
import { TextSelection } from "tiptap";
import { returnFileSize, isDataURL } from "./../../../utils";

export default {
  name: "Document",
  props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
  data() {
    return {
      data: this.node.attrs.src,
      name: "",
      size: "",
      format: "",
      shouldShowClose: false,
      isLoading: true,
      loadingPercent: 0
    };
  },
  inject: ["getEditorVm"],
  computed: {
    caption: {
      get() {
        return this.node.attrs.caption;
      },
      set(caption) {
        this.updateAttrs({
          caption
        });
      }
    }
  },
  mounted() {
    this.onLoaded();
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
  },
  methods: {
    getIconClass() {
      return `${this.format}-icon`;
    },
    download() {
      window.open(this.data, "_blank");
    },
    onDocumentClick() {
      if (isDataURL(this.data) === false)
        this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    },
    handleKeydown(event) {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      if (event.key === "Enter") {
        let textSelection = TextSelection.create(tr.doc, pos + 2, pos + 2);
        this.view.dispatch(tr.setSelection(textSelection));
        this.view.focus();
        event.preventDefault();
      }
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
    },
    async onLoaded() {
      const documentInputEl = document.getElementById("document-input");

      if (this.data.includes("data:") && documentInputEl.files.length != 0) {
        this.isLoading = true;
        const file = documentInputEl.files[0];
        this.name = file.name;
        this.size = returnFileSize(file.size);
        this.format =
          file.type.split("/").length > 1 && file.type.split("/")[1];
        const formData = new FormData();
        formData.append("document", file);

        try {
          const response = await this.options.uploadDocument(formData);
          if (response && response.status === 200) {
            const { document: src, format } = response.data;
            this.updateAttrs({
              src,
              format,
              name: this.name,
              size: this.size
            });
            this.data = src;
          }
        } catch (error) {
          this.deleteNode();
        } finally {
          this.isLoading = false;
          documentInputEl.value = "";
        }
      }
    }
  }
};
</script>
