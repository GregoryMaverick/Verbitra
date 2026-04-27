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
  var workerBlob = new Blob([${JSON.stringify(workerJs)}], { type: 'application/javascript' });
  window.__TESSERACT_WORKER_URL__ = URL.createObjectURL(workerBlob);
})();
  </script>
  <script>${tesseractJs}</script>
</head>
<body>
<script>
(function() {
  function postMsg(msg) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  window.runOCR = async function(images) {
    try {
      postMsg({ type: 'progress', page: 0, total: images.length, status: 'init' });
      var worker = await Tesseract.createWorker('eng', 1, {
        workerPath: window.__TESSERACT_WORKER_URL__,
        logger: function(m) {
          if (m.status === 'recognizing text') {
            postMsg({ type: 'progress', page: m.jobId, progress: m.progress, status: 'recognizing' });
          }
        }
      });

      var allResults = [];
      for (var i = 0; i < images.length; i++) {
        postMsg({ type: 'progress', page: i + 1, total: images.length, status: 'recognizing' });
        var result = await worker.recognize(images[i]);
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
      postMsg({ type: 'error', message: e.message || 'OCR failed' });
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
