let scriptInjection = new Set<string>();

const inject = (fn: (element: HTMLScriptElement) => void) => {
  const script = document.createElement('script');
  fn(script);
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);
};

const injectScript = (path: string) => {
  if (scriptInjection.has(path)) {
    return;
  }

  inject(script => {
    script.src = chrome.extension.getURL(path);
  });

  scriptInjection.add(path);
};

injectScript('rx-devtools.bundle.js');

window.addEventListener('message', function (event: { source: any, data: any }) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null ||
    !(message.source === 'rx-devtools-plugin')) {
    return;
  }

  chrome.runtime.sendMessage(message);
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });
