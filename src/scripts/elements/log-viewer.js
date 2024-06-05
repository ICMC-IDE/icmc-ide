export default class LogViewer extends HTMLElement {
  constructor() {
    super();
  }

  write(error) {
    // Code copied from https://github.com/hlorenzi/customasm/blob/b6978f90891915f1e4844d498a179249819406bd/web/main.js
    let output = error.toString();

    output = output.replaceAll("&", "&amp;");
    output = output.replaceAll("<", "&lt;");
    output = output.replaceAll(">", "&gt;");
    output = output.replaceAll("\n", "<br>");
    output = output.replaceAll("\x1b[90m", '</span><span class="mtk7">');
    output = output.replaceAll("\x1b[91m", '</span><span class="mtk3">');
    output = output.replaceAll("\x1b[93m", '</span><span class="mtk2">');
    output = output.replaceAll("\x1b[96m", '</span><span class="mtk4">');
    output = output.replaceAll("\x1b[97m", '</span><span class="mtk1">');
    output = output.replaceAll("\x1b[1m", '</span><span class="mtk5">');
    output = output.replaceAll("\x1b[0m", '</span><span class="mtk6">');

    output = '<span class="mtk1">' + output + "</span>";
    this.innerHTML = output;
  }

  clear() {
    this.innerHTML = "";
  }
}

customElements.define("log-viewer", LogViewer);
