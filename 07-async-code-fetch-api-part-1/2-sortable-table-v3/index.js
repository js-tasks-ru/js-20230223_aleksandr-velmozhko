import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";
export default class SortableTable {
  element;
  arrow;
  start = 1;
  step = 25;
  subElements = {};
  end = this.start + this.step;
  loading = false;

  onClickSortFunc = (event) => {
    const target = event.target.closest("[data-sortable='true']");
    if (!target) {
      return;
    }
    const { id, order } = target.dataset;
    const newOrder = order === "asc" ? "desc" : "asc";
    this.sorted = { id, order: newOrder };

    if (this.isSortLocally) {
      this.sortOnClient(id, newOrder);
    } else {
      this.sortOnServer(id, newOrder);
    }
  };
  onScrollFunc = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { clientHeight } = document.documentElement;

    if (bottom < clientHeight && !this.loading) {
      this.loading = true;

      this.element.classList.add("sortable-table_loading");
      const newData = await this.updateData();
      this.element.classList.remove("sortable-table_loading");

      this.data = [...this.data, ...newData];

      this.subElements.body.insertAdjacentHTML(
        "beforeend",
        this.getProductsRows(newData)
      );

      this.loading = false;
    }
  };

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      url = "",
    } = {},
    isSortLocally = false
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTamplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.arrow = this.getArrow();
    this.sort(this.sorted.id, this.sorted.order);
    this.addEventListener();
  }

  getTamplate() {
    return `
    <div class="sortable-table">
    ${this.getHeader()}
    ${this.getTableBody(this.data)}
    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>
    </div>
    `;
  }

  getHeader() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">${this.headerConfig
      .map((item) => this.getHeaderRow(item))
      .join("")}</div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";

    return `<div class="sortable-table__cell" data-id="${id}"
      data-sortable="${sortable}" data-order='${order}'> <span>${title}</span> </div>`;
  }

  getTableBody(data) {
    return ` <div data-element="body" class="sortable-table__body">
    ${this.getProductsRows(data)}
    </div>`;
  }

  getProductsRows(data) {
    return data
      .map((product) => {
        return ` <a href="#" class="sortable-table__row">
        ${this.getProductsColumns(product)} </a>`;
      })
      .join("");
  }

  getProductsColumns(product) {
    return this.headerConfig
      .map(({ id, template }) =>
        template
          ? template(product[id])
          : `<div class="sortable-table__cell">${product[id]}</div>`
      )
      .join("");
  }

  getArrow() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
     <span class="sort-arrow"></span></span>`;
    return wrapper.firstElementChild;
  }

  addEventListener() {
    this.subElements.header.addEventListener(
      "pointerdown",
      this.onClickSortFunc
    );
    if (!this.isSortLocally) {
      window.addEventListener("scroll", this.onScrollFunc);
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-id],[data-element]");
    elements.forEach((item) => {
      const name = item.dataset.id || item.dataset.element;
      result[name] = item;
    });

    return result;
  }

  sort(id, order) {
    if (this.isSortLocally) {
      return this.sortOnClient(id, order);
    } else {
      return this.sortOnServer(id, order);
    }
  }

  sortOnClient(id, order) {
    const sortType = this.headerConfig.find(
      (item) => item.id === id && item.sortable
    )?.sortType;

    if (!sortType) {
      return;
    }
    const compare = this.getCompareFunc(sortType, id, order);

    this.updateArrow(id, order);
    const sortedData = [...this.data].sort(compare);
    this.subElements.body.innerHTML = this.getProductsRows(sortedData);
  }

  async sortOnServer(id, order) {
    this.start = 1;
    this.end = this.start + this.step;

    this.element.classList.add("sortable-table_loading");
    this.data = await this.loadData(id, order, this.start, this.end);
    this.element.classList.remove("sortable-table_loading");

    if (this.data.length) {
      this.updateArrow(id, order);
      this.subElements.body.innerHTML = this.getProductsRows(this.data);
      this.element.classList.remove("sortable-table_empty");
    } else {
      this.element.classList.add("sortable-table_empty");
    }
  }
  updateData() {
    const { id, order } = this.sorted;
    this.start += this.step;
    this.end = this.start + this.step;

    return this.loadData(id, order, this.start, this.end);
  }
  loadData(id, order, start, end) {
    const requestURL = this.url;
    requestURL.searchParams.set("_embed", "subcategory.category");
    requestURL.searchParams.set("_sort", id);
    requestURL.searchParams.set("_order", order);
    requestURL.searchParams.set("_start", start);
    requestURL.searchParams.set("_end", end);

    return fetchJson(requestURL);
  }
  updateArrow(id, order) {
    this.subElements[id].append(this.arrow);
    this.subElements[id].dataset.order = order;
  }

  getCompareFunc(sortType, id, order) {
    let compare;
    const direction = order === "asc" ? 1 : -1;

    switch (sortType) {
      case "number":
        compare = (a, b) => direction * (a[id] - b[id]);
        break;
      case "string":
        compare = (a, b) =>
          direction *
          a[id].localeCompare(b[id], ["ru", "en"], {
            ncaseFirst: "upper",
          });
        break;
      default:
        throw new Error("Unknown sort type");
    }
    return compare;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.arrow = null;
    this.subElements = null;
    window.removeEventListener("scroll", this.onScrollFunc);
  }
}
