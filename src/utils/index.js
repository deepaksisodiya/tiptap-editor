export const isDataURL = (data = "") => {
  const regex = new RegExp(
    /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i // eslint-disable-line
  );
  return !!data.match(regex);
};

// https://stackoverflow.com/questions/11300906/check-if-a-string-starts-with-http-using-javascript
export const getValidUrl = (url = "") => {
  let newUrl = window.decodeURIComponent(url);
  newUrl = newUrl.trim().replace(/\s/g, "");

  if (/^(:\/\/)/.test(newUrl)) {
    return `https${newUrl}`;
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `https://${newUrl}`;
  }
  return newUrl;
};
