export default class ColumnChart {
  chartHeight = 50;
  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value.toLocaleString("en"));
    this.link = link;

    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    this.dataElements = this.getDataElements(this.element);
  }

  getDataElements(element) {
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
    return ` <div class="column-chart column-chart_loading"
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

  update(updatedData) {
    this.dataElements.body.innerHTML = this.getColumnCharts(updatedData);
  }

  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = {};
    this.dataElements = {};
  }
}
