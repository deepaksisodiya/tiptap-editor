<template>
  <div>
    <ul
      v-if="!isInputActive"
      class="highlight-menu"
      :class="{
        'is-active':
          menu.isActive && !isTitleSelected() && !isCodeBlockSelected(),
        ios,
      }"
      :style="getStyle(menu)"
      ref="menuUl"
    >
      <li @click="editor.chain().toggleBold().run()">
        <button>
          <i class="bold-icon" :class="{ 'is-active': isActive('bold') }"></i>
        </button>
      </li>

      <li @click="editor.chain().toggleItalic().run()">
        <button>
          <i
            class="italic-icon"
            :class="{ 'is-active': isActive('italic') }"
          ></i>
        </button>
      </li>
      <li @click="showInput(getMarkAttributes('link'))">
        <button>
          <i class="link-icon" :class="{ 'is-active': isActive('link') }"></i>
        </button>
      </li>

      <li>
        <button>
          <i class="separator-icon"></i>
        </button>
      </li>

      <li @click="editor.chain().toggleHeading({ level: 3 }).run()">
        <button>
          <i
            class="large-heading-icon"
            :class="{ 'is-active': isActive('heading', { level: 3 }) }"
          ></i>
        </button>
      </li>

      <li @click="editor.chain().toggleHeading({ level: 5 }).run()">
        <button>
          <i
            class="small-heading-icon"
            :class="{ 'is-active': isActive('heading', { level: 5 }) }"
          ></i>
        </button>
      </li>

      <li @click="editor.chain().toggleBlockquote().run()">
        <button>
          <i
            class="quote-icon"
            :class="{ 'is-active': isActive('blockquote') }"
          ></i>
        </button>
      </li>
    </ul>
    <div
      v-else
      ref="linkDiv"
      :class="['highlight-menu-input', ios ? 'ios' : '']"
      :style="getStyle(menu)"
    >
      <input
        type="url"
        v-model="href"
        placeholder="Paste or type a link"
        @keydown.enter.prevent="addAnchor(href)"
        @keydown.esc="hideInput"
      />
      <i class="toolbar-close-icon" @click="addAnchor(href)"></i>
    </div>
  </div>
</template>

<script>
import browser from "../utils/browser";
import MenuBubble from "./../extensions/MenuBubble";
import { getValidUrl } from "./../utils";

export default {
  props: {
    editor: {
      default: null,
      type: Object,
    },
  },
  data() {
    return {
      href: null,
      isInputActive: false,
      ios: browser.ios,
      menu: {
        isActive: false,
        left: 0,
        bottom: 0,
      },
    };
  },
  computed: {
    isActive() {
      return this.editor.isActive.bind(this.editor);
    },
    getMarkAttributes() {
      return this.editor.getMarkAttributes.bind(this.editor);
    },
    getNodeAttributes() {
      return (
        this.editor.getNodeAttributes &&
        this.editor.getNodeAttributes.bind(this.editor)
      );
    },
  },
  watch: {
    "menu.isActive"(newValue) {
      if (!newValue) this.isInputActive = false;
    },
  },
  mounted() {
    if (this.ios) {
      window.addEventListener("scroll", this.fixMenuEl);
      window.addEventListener("resize", this.fixMenuEl);
      window.visualViewport.addEventListener("scroll", this.fixMenuEl);
      window.visualViewport.addEventListener("resize", this.fixMenuEl);
    }
  },
  beforeUnmount() {
    if (this.ios) {
      window.removeEventListener("scroll", this.fixMenuEl);
      window.removeEventListener("resize", this.fixMenuEl);
      window.visualViewport.removeEventListener("scroll", this.fixMenuEl);
      window.visualViewport.removeEventListener("resize", this.fixMenuEl);
    }
    this.editor.unregisterPlugin("menu_bubble");
  },
  methods: {
    getStyle(menu) {
      return window.screen.width >= 786
        ? `left: ${menu.left}px; bottom: ${menu.bottom}px;`
        : "";
    },
    showInput(attrs) {
      this.href = attrs.href;
      this.isInputActive = true;
      this.$nextTick(() => {
        if (this.ios) this.fixMenuEl();
        this.$refs.linkDiv.querySelector("input").focus();
      });
    },
    addAnchor(url) {
      let validUrl;
      if (url) validUrl = getValidUrl(url);
      this.editor.chain().setLink(validUrl).run();
      this.hideInput();
      this.menu.isActive = true;
    },
    hideInput() {
      this.href = null;
      this.isInputActive = false;
      this.$nextTick(() => {
        if (this.ios) this.fixMenuEl();
      });
    },
    isBlockSelected(name) {
      const { $from, $to } = this.editor.view.state.tr.selection;
      return $from.parent.type.name === name && $to.parent.type.name === name;
    },
    isTitleSelected() {
      return this.isBlockSelected("title");
    },
    isCodeBlockSelected() {
      return this.isBlockSelected("code_block");
    },
    fixMenuEl() {
      const menuUl = this.$refs.menuUl;
      const linkDiv = this.$refs.linkDiv;
      const pageTop = window.visualViewport.pageTop;
      const article = document.getElementsByClassName("editor")[0];

      if (linkDiv) linkDiv.style.top = `${pageTop - article.offsetTop}px`;
      if (menuUl) menuUl.style.top = `${pageTop - article.offsetTop}px`;
    },
    handler(menu) {
      // the second check ensures event is fired only once
      if (menu.isActive && this.menu.isActive === false) {
        if (this.ios) {
          this.fixMenuEl();
        }
        this.$emit("show", menu);
      } else if (!menu.isActive && this.menu.isActive === true) {
        this.$emit("hide", menu);
      }
      this.menu = menu;
    },
  },
};
</script>
