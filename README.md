# netzip-firefox
A Firefox based extension used to crawl the network tab and ZIP the contents. (to use the <strong>Chromium</strong> version, go to https://github.com/Neetify7/netzip-chromium)

## Requirements
- Firefox (Firefox, Librewolf, etc)
- about:debugging access
- Extension access

You can use Google and its forks with https://github.com/Neetify7/netzip-chromium. (Google Chrome, Brave, etc)

## Installation
1. Go to https://github.com/Neetify7/netzip-firefox/releases/tag/release
2. Download the ZIP
3. Unzip the folder
4. In <strong>Firefox</strong>, go to about:debugging#/runtime/this-firefox
6. Click load temporary add-on
7. <strong>Go</strong> the unzipped folder from step 3
8. Click on <strong>manifest.json</strong>

Firefox may think this extension is unsafe but this is a false positive since the extension needs to read the site to download it. (<strong>do not</strong> change the temporary addon or else the extension will not work)

## Usage
1. Go to any site or specific page
2. If you are on Windows/Linux, click Control+Shift+I to open up devtools
3. If you are on MacOS, click Command+Option+C to open up devtools
4. Now, in the tabs section, if you correctly installed the extension, NetZIP should appear
5. Click on NetZIP
6. Only if you have permission, click crawl page to download the specific page, crawl site to download the entire site, and stop to obviously stop

<strong>Any site downloaded must be credited.</strong>

## Update
To update, repeat the installation proccess, this time removing the extension and reinstalling it.

## Credit
If you are using this tool you should add <strong>credit</strong> linking to this repository for making this proccess easier.

This repository used JSZip to help ZIP downloaded files.
