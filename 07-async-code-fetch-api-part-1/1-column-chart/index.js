import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;
  constructor({
    label = "",
    link = "",
    url = "",
    range: { from = "", to = "" } = {},
    formatHeading = (data) => data,
  } = {}) {
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;
    this.url = url;
    this.from = from.toISOString();
    this.to = to.toISOString();
    this.data = [];

    this.render();
    this.loadData();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  async loadData() {
    this.element.classList.add("column-chart_loading");
    const url = new URL(this.url, "https://course-js.javascript.ru");
    url.searchParams.set("from", this.from);
    url.searchParams.set("to", this.to);
    let response;

    try {
      response = await fetchJson(url);
      this.data = Object.values(response);
      this.value = this.data.reduce((accum, item) => (accum += item), 0);
    } catch (error) {
      console.error(error);
    }
    if (this.data.length) {
      this.subElements.body.innerHTML = this.getColumnCharts(this.data);
      this.subElements.header.innerHTML = this.formatHeading(this.value);
      this.element.classList.remove("column-chart_loading");
    }
  }

  getSubElements(element) {
    let result = {};

    const elements = element.querySelectorAll("[data-element]");
    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }
    return result;
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getColumnCharts(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        const value = String(Math.floor(item * scale));
        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  getTemplate() {
    return `<div class="column-chart column-chart_loading"
    style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title">
    Total ${this.label}
    ${this.getLink()}
    </div>
    <div class="column-chart__container">
    <div data-element="header" class="column-chart__header">${this.value}</div>
    <div data-element="body" class="column-chart__chart">
    ${this.getColumnCharts(this.data)}
    </div></div></div>
    `;
  }

  update(...args) {
    [this.from, this.to] = args.map((date) => date.toISOString());
    this.loadData();
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = {};
    this.subElements = {};
  }
}
