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
  // Do not append http/https in case of spotify URI
  if (/^(spotify:)(\b(episode|show|playlist|track)\b:)(.*)/.test(newUrl)) {
    return newUrl;
  }
  if (/^(:\/\/)/.test(newUrl)) {
    return `https${newUrl}`;
  }
  if (!/^(f|ht)tps?:\/\//i.test(newUrl)) {
    return `https://${newUrl}`;
  }
  return newUrl;
};

export const returnFileSize = (number = 0) => {
  if (number < 1024) {
    return number + "bytes";
  } else if (number >= 1024 && number < 1048576) {
    return (number / 1024).toFixed(1) + "KB";
  } else if (number >= 1048576) {
    return (number / 1048576).toFixed(1) + "MB";
  }
};

export const loadScript = (url, callback) => {
  var script = document.createElement("script");
  script.type = "text/javascript";
  if (script.readyState) {
    // only required for IE <9
    script.onreadystatechange = () => {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    //Others
    script.onload = () => {
      callback();
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};
