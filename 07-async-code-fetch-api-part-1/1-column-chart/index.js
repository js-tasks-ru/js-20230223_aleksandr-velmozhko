import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  cash = new Map();
  constructor({
    label = "",
    link = "",
    url = "",
    value = 0,
    range = {},
    formatHeading = (data) => data,
  } = {}) {
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;
    this.url = url;
    this.range = range;
    this.data = [];
    this.value = value;

    this.render();
    this.update(this.range?.from, this.range?.to);
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  async loadData(from, to) {
    this.element.classList.add("column-chart_loading");
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    let response;
    try {
      response = await fetchJson(url);
    } catch (error) {
      console.log("Ошибка загрузки данных " + error);
      throw new Error("Ошибка загрузки данных " + error);
    }
    return response;
  }

  async update(from, to) {
    from = from.toISOString().split("T")[0];
    to = to.toISOString().split("T")[0];
    if (this.cash.get(from) === to) {
      this.showNewData();
      return;
    }
    this.cash.clear();
    this.cash.set(from, to);

    const loadedData = await this.loadData(from, to);
    this.data = Object.values(loadedData);

    if (this.data.length) {
      this.showNewData();
    }

    return loadedData;
  }
  showNewData() {
    this.element.classList.remove("column-chart_loading");
    this.value = this.data.reduce((accum, item) => (accum += item), 0);
    this.subElements.header.innerHTML = this.formatHeading(this.value);
    this.subElements.body.innerHTML = this.getColumnCharts(this.data);
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

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
