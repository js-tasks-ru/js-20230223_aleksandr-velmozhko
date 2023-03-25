export default class SortableTable {
  element;
  arrow;
  subElements = {};

  onClickSortFunc = (event) => {
    const target = event.target.closest("[data-sortable='true']");
    if (!target) {
      return;
    }
    const { id, order } = target.dataset;
    const newOrder = order === "asc" ? "desc" : "asc";
    const sortedData = this.sort(id, newOrder);

    this.updateArrow(id, newOrder);
    this.subElements.body.innerHTML = this.getTableBody(sortedData);
  };

  constructor(
    headerConfig = [],
    {
      data = [],
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
    } = {},
    isSortLocally = true
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.render();
    this.addEventListener();
  }

  render() {
    const wrapper = document.createElement("div");
    const sortedData = this.sort(this.sorted.id, this.sorted.order);

    wrapper.innerHTML = this.getTamplate(sortedData);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.arrow = this.getArrow();
    this.updateArrow(this.sorted.id, this.sorted.order);
  }

  getTamplate(data) {
    return `
    <div class="sortable-table">
    ${this.getHeader()}
    ${this.getTableBody(data)}</div>
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
  }

  getSubElements(prop) {
    const result = {};
    const elements = this.element.querySelectorAll("[data-id],[data-element]");
    elements.forEach((item) => {
      const name = item.dataset.id || item.dataset.element;
      result[name] = item;
    });

    return result;
  }

  updateArrow(id, order) {
    this.subElements[id].append(this.arrow);
    this.subElements[id].dataset.order = order;
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
    return [...this.data].sort(compare);
  }

  sortOnServer(id, order) {}

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
  }
}
