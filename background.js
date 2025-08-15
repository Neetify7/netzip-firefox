let currentDownloads = [];
let downloadedFiles = [];

browser.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "downloadFiles" && Array.isArray(msg.urls)) {
    const rootFolder = msg.hostname;
    downloadedFiles = [];

    for (let fileUrl of msg.urls) {
      try {
        const urlObj = new URL(fileUrl);
        let path = urlObj.pathname;
        if (path.endsWith("/")) path += "index.html";
        if (!path.split("/").pop().includes(".")) path += ".html";
        if (path.startsWith("/")) path = path.slice(1);

        downloadedFiles.push({ filename: `${rootFolder}/${path}`, url: fileUrl });
      } catch (e) {
        console.error("Download failed for", fileUrl, e);
      }
    }

    try {
      const zip = new JSZip();

      for (const file of downloadedFiles) {
        try {
          const response = await fetch(file.url, { mode: 'cors' });
          if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
          const blob = await response.blob();
          zip.file(file.filename, blob);
        } catch (fetchError) {
          console.warn("Skipped file due to fetch error:", file.url, fetchError);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });

      const reader = new FileReader();
      reader.onload = async function() {
        const dataUrl = reader.result;

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const downloadId = await browser.downloads.download({
        url: url,
        filename: `${rootFolder}.zip`,
        conflictAction: "overwrite",
        saveAs: true
      });

        currentDownloads.push(downloadId);
        downloadedFiles = [];
        sendResponse({ zipped: true });
      };
      reader.readAsDataURL(content);

    } catch (e) {
      console.error("ZIP creation failed", e);
      sendResponse({ zipped: false });
    }

  } else if (msg.action === "stopDownloads") {
    for (const id of currentDownloads) browser.downloads.cancel(id);
    currentDownloads = [];
    downloadedFiles = [];
    sendResponse({ stopped: true });
  }

  return true;
});