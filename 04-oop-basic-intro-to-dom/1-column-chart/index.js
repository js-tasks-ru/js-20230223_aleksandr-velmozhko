export default class ColumnChart {
  chartHeight = 50;
  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  getTemplate() {
    const formattedValue = this.formatHeading
      ? this.formatHeading(this.value.toLocaleString("en"))
      : this.value.toLocaleString("en");
    let template = `<div class="column-chart column-chart_loading"  style="--chart-height: ${
      this.chartHeight
    }">
    <div class="column-chart__title">Total ${this.label} ${this.getLink()}</div>
    <div class="column-chart__container">
    <div data-element="header" class="column-chart__header">${formattedValue}</div>
    <div data-element="body" class="column-chart__chart">
    ${this.getColumnCharts(this.data)}
    </div></div></div></div>>`;
    return template;
  }

  getLink() {
    return this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";
  }
  getColumnCharts(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data
      .map((item) => {
        const value = String(Math.floor(item * scale));
        const percent = ((item / maxValue) * 100).toFixed(0);
        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join("");
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    this.dataElements = this.getDataElements(this.element);
  }

  getDataElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const elem of elements) {
      const elemName = elem.dataset.element;
      result[elemName] = elem;
    }
    return result;
  }

  update(updatedData) {
    this.dataElements.body.innerHTML = this.getColumnCharts(updatedData);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
