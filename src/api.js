import axios from "axios";

export const uploadImage = formData =>
  axios.post("https://deepak.scrollstack.com/api/w/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

export const getEmbeds = url =>
  axios.get(
    `https://deepak.scrollstack.com/api/w/embeds/metadata?url=${url.trim()}`
  );
