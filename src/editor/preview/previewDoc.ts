import shim from './clf4-shim.css?raw';
import bridge from './bridge.js?raw';

export const SFU_CSS_URL = 'https://www.sfu.ca/etc/designs/clf/clientlibs/clf4/default/css/default.min.css';

const EDITOR_CSS = `
html{overflow:auto!important}
body{padding:16px!important;background:#fff!important;min-height:100vh;box-sizing:border-box}
.main__content,.main__content--content,.page-content,.page-content__main{display:block!important;padding:0!important;margin:0!important;max-width:none!important;width:auto!important;grid-template-columns:none!important}
[data-sfub-path],[data-sfub-item]{cursor:pointer}
[data-sfub-edit="text"]:hover{outline:1px dashed rgba(11,120,230,.7);outline-offset:2px}
[data-sfub-selected]{outline:2px solid #0b78e6!important;outline-offset:2px}
[contenteditable]{outline:2px solid #0b78e6!important;outline-offset:2px;cursor:text!important;background:rgba(11,120,230,.08)}
[data-sfub-droptarget]{outline:3px dashed #0b78e6!important;outline-offset:-3px}
[draggable=true]{-webkit-user-drag:element}
`;

/** The preview iframe document: SFU page wrappers + CLF4 CSS (shim or live) + bridge. */
export function previewDocument(liveCss: boolean): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${liveCss ? `<link rel="stylesheet" href="${SFU_CSS_URL}">` : `<style>${shim}</style>`}
<style>${EDITOR_CSS}</style></head>
<body><section class="main"><div class="main__content"><div class="main__content--content"><div class="page-content"><div class="page-content__main"><div class="html section"><div id="sfub-mount"></div></div></div></div></div></div></section>
<script>${bridge}</script></body></html>`;
}
