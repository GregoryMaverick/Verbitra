#!/usr/bin/env node
// Regenerates lib/ocrWebViewHtml.ts with locally bundled tesseract.js + worker scripts.
// Run: node scripts/gen-ocr-html.js
const fs = require('fs');
const path = require('path');

function findTesseractDist() {
  const roots = [
    path.resolve(__dirname, '../../..'),
    path.resolve(__dirname, '..'),
  ];
  for (const root of roots) {
    const candidate = path.join(root, 'node_modules/.pnpm/tesseract.js@7.0.0/node_modules/tesseract.js/dist');
    if (fs.existsSync(candidate)) return candidate;
    // Try non-pnpm path
    const candidate2 = path.join(root, 'node_modules/tesseract.js/dist');
    if (fs.existsSync(candidate2)) return candidate2;
  }
  throw new Error('Could not find tesseract.js dist directory. Run pnpm install first.');
}

const distDir = findTesseractDist();
const tesseractJs = fs.readFileSync(path.join(distDir, 'tesseract.min.js'), 'utf8');
const workerJs = fs.readFileSync(path.join(distDir, 'worker.min.js'), 'utf8');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script>
(function() {
  function postMsg(msg) {
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    } catch (e) {}
  }

  // If anything fails before our main script runs, report it to RN.
  window.addEventListener('error', function(ev) {
    try {
      postMsg({ type: 'error', message: (ev && ev.message) ? ('WebView error: ' + ev.message) : 'WebView error' });
    } catch (e) {}
  });
  window.addEventListener('unhandledrejection', function(ev) {
    try {
      var reason = ev && ev.reason;
      var msg = reason && reason.message ? reason.message : String(reason || 'Unhandled promise rejection');
      postMsg({ type: 'error', message: 'WebView rejection: ' + msg });
    } catch (e) {}
  });

  var workerBlob = new Blob([${JSON.stringify(workerJs)}], { type: 'application/javascript' });
  window.__TESSERACT_WORKER_URL__ = URL.createObjectURL(workerBlob);
})();
  </script>
  <script>${tesseractJs}</script>
</head>
<body>
<script>
(function() {
  var OCR_ENGINE_TIMEOUT_MS = 30000;
  var OCR_RECOGNIZE_TIMEOUT_MS = 90000;

  function postMsg(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  function withTimeout(promise, timeoutMs, message) {
    return new Promise(function(resolve, reject) {
      var timer = setTimeout(function() {
        reject(new Error(message));
      }, timeoutMs);
      promise.then(function(value) {
        clearTimeout(timer);
        resolve(value);
      }, function(error) {
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  window.runOCR = async function(images) {
    try {
      postMsg({ type: 'progress', page: 0, total: images.length, status: 'init' });
      var worker = await withTimeout(Tesseract.createWorker('eng', 1, {
        workerPath: window.__TESSERACT_WORKER_URL__,
        // Explicit paths are more reliable in WKWebView than defaults.
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0',
        langPath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1/4.0.0_best_int',
        logger: function(m) {
          if (m.status === 'recognizing text') {
            postMsg({ type: 'progress', page: m.jobId, progress: m.progress, status: 'recognizing' });
          }
        }
      }), OCR_ENGINE_TIMEOUT_MS, 'Timed out starting OCR engine. Please check your connection and try again.');

      var allResults = [];
      for (var i = 0; i < images.length; i++) {
        postMsg({ type: 'progress', page: i + 1, total: images.length, status: 'recognizing' });
        var result = await withTimeout(
          worker.recognize(images[i]),
          OCR_RECOGNIZE_TIMEOUT_MS,
          'Timed out reading text from this image. Try cropping closer to the text.'
        );
        var rawWords = (result && result.data && Array.isArray(result.data.words)) ? result.data.words : [];
        var rawText = (result && result.data && result.data.text) ? result.data.text : '';
        var words = rawWords.map(function(w) {
          return { text: w.text, confidence: w.confidence };
        });
        allResults.push({ rawText: rawText, words: words });
      }

      await worker.terminate();
      postMsg({ type: 'result', pages: allResults });
    } catch(e) {
      var msg = (e && e.message) ? e.message : String(e || 'OCR failed');
      postMsg({ type: 'error', message: msg });
    }
  };

  postMsg({ type: 'ready' });
})();
</script>
</body>
</html>`;

const tsContent = `// Auto-generated — do not edit directly. Run scripts/gen-ocr-html.js to regenerate.
// Bundles tesseract.js and its worker locally to avoid loading code from a CDN.
export const TESSERACT_WEBVIEW_HTML: string = ${JSON.stringify(html)};
`;

const outPath = path.resolve(__dirname, '../lib/ocrWebViewHtml.ts');
fs.writeFileSync(outPath, tsContent, 'utf8');
console.log('Generated', outPath, '(' + tsContent.length + ' chars)');
