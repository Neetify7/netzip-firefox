browser.devtools.panels.create("NetZIP", "", "devtools.html", panel => {
  console.log("NetZIP panel created");
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let urls = [];
let crawling = false;

browser.devtools.network.onRequestFinished.addListener(request => {
  if (request.request.method !== "GET") return;
  const url = request.request.url;
  if (!urls.includes(url)) urls.push(url);
});

function updateProgress(current, total) {
  const progress = total === 0 ? 0 : Math.round((current / total) * 100);
  document.getElementById("Progress").textContent = `${progress}%`;
}

async function animateProgressTo100() {
  let current = parseInt(document.getElementById("Progress").textContent.replace(/\D/g, "") || "0", 10);
  while (current < 100) {
    current++;
    document.getElementById("Progress").textContent = `${current}%`;
    await sleep(10);
  }
}

document.getElementById("downloadCurrent").onclick = async () => {
  updateProgress(2, 100);

  browser.devtools.inspectedWindow.eval(`location.reload()`);
  await sleep(3000);

  if (urls.length === 0) return;

  const origin = await new Promise(resolve => {
    browser.devtools.inspectedWindow.eval("location.origin", result => resolve(result));
  });

  browser.runtime.sendMessage({
    action: "downloadFiles",
    urls,
    hostname: new URL(origin).hostname,
    addHtml: true
  });

  await animateProgressTo100();
  urls = [];
};

document.getElementById("crawlSite").onclick = async () => {
  updateProgress(2, 100);

  await sleep(3000);
  crawling = true;
  const visited = new Set();
  const toVisit = [];
  const inspectedTabId = browser.devtools.inspectedWindow.tabId;

  const origin = await new Promise(resolve => {
    browser.devtools.inspectedWindow.eval("location.origin", result => resolve(result));
  });

  const currentUrl = await new Promise(resolve => {
    browser.devtools.inspectedWindow.eval("location.href", result => resolve(result));
  });

  toVisit.push(currentUrl);

  while (toVisit.length && crawling) {
    const url = toVisit.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    const currentLocation = await new Promise(resolve => {
      browser.devtools.inspectedWindow.eval("location.href", result => resolve(result));
    });
    if (currentLocation !== url) {
      await browser.tabs.update(inspectedTabId, { url });
      await sleep(3000);
    }

    await browser.scripting.executeScript({
      target: { tabId: inspectedTabId },
      func: () => document.querySelectorAll("button").forEach(btn => btn.click())
    });
    await sleep(2000);

    const links = await new Promise(resolve => {
      browser.scripting.executeScript({
        target: { tabId: inspectedTabId },
        func: () => Array.from(document.querySelectorAll("a[href]")).map(a => a.href)
      }, results => resolve(results[0]?.result || []));
    });

    const allLinks = links.filter(l => l.startsWith(origin));
    for (const d of allLinks) if (!visited.has(d) && !toVisit.includes(d)) toVisit.push(d);

    updateProgress(visited.size, visited.size + toVisit.length);
  }

  if (urls.length > 0) {
    browser.runtime.sendMessage({
      action: "downloadFiles",
      urls,
      hostname: new URL(origin).hostname,
      addHtml: true
    });
  }

  await animateProgressTo100();
  urls = [];
};

document.getElementById("stopDownloads").onclick = () => {
  crawling = false;
  urls = [];
  updateProgress(0, 100);
  browser.runtime.sendMessage({ action: "stopDownloads" });
};