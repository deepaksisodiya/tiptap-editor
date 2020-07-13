# tiptap-editor

## How to use it

```
import Post from 'tiptap-editor';
const { Article } = Post;

import "./node_modules/tiptap-editor/src/assets/scss/base.scss";
import "./node_modules/tiptap-editor/src/assets/scss/editor.scss";
import "./node_modules/tiptap-editor/src/assets/scss/article.scss";

<Article
  :on-update-post="onUpdatePost"
  :content="blocks"
  :title="title"
  :should-show-title-error="shouldShowTitleError"
  :hide-title-error="hideTitleError"
  :upload-image="uploadImage"
  :get-embeds="getEmbeds"
/>
```

## Props details

| Props                   | Type     | Details                                                                      |
|-------------------------|----------|------------------------------------------------------------------------------|
| onUpdatePost            | function | Method call when there is some changes in editor, default debounce is 300 ms |
| blocks                  | JSON     | content json                                                                  |
| title                   | String   | title of the post                                                            |
| should-show-title-error | Boolean  | should show title error                                                      |
| hide-title-error        | function | to hide title error message                                                  |
| upload-image            | function | method to post image to server, should return promise                        |
| get-embeds              | function | method to get embeds, should return promise                                  |
