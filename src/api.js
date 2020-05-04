import axios from "axios";

export const uploadImage = formData =>
  axios.post("https://deepak.scrollstack.com/api/w/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "oWn7jKY6TFSVEHN7p-2jmwAc5-2EIDjWo29DWzQLUco"
    }
  });

export const getEmbeds = url =>
  axios.get(
    `https://deepak.scrollstack.com/api/w/embeds/metadata?url=${url.trim()}`,
    {
      headers: {
        Authorization: "oWn7jKY6TFSVEHN7p-2jmwAc5-2EIDjWo29DWzQLUco"
      }
    }
  );
