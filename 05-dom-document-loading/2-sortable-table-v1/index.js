export default class SortableTable {
  element;
  arrow;
  subElements = {};
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTamplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.getArrow();
  }

  getTamplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
    <div class="sortable-table"><div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.getHeader()}  </div>
    <div data-element="body" class="sortable-table__body">
    ${this.getProductsRows(this.data)} </div>
    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder"
     class="sortable-table__empty-placeholder">
    <div> <p>No products satisfies your filter criteria</p>
    <button type="button" class="button-primary-outline">
    Reset all filters </button>
        </div>
      </div>
    </div>
  </div>
    `;
  }

  getHeader() {
    return this.headerConfig
      .map((config) => {
        return `<div
      class="sortable-table__cell"
      data-id="${config.id}"
      data-sortable="${config.sortable}">
      <span>${config.title}</span> </div>`;
      })
      .join("");
  }

  getProductsRows() {
    return this.data
      .map((product) => {
        return ` <a href="/products/${product.id}" class="sortable-table__row">
        ${this.getProductsColumns(product)} </a>`;
      })
      .join("");
  }

  getProductsColumns(product) {
    return this.headerConfig
      .map((config) => {
        const value = product[config.id];
        if (config.template) {
          return config.template(value);
        }
        return `<div class="sortable-table__cell">${value}</div>`;
      })
      .join("");
  }

  getArrow() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
     <span class="sort-arrow"></span></span>`;
    this.arrow = wrapper.firstElementChild;
  }

  getSubElements(prop) {
    const result = {};
    const headerElements = this.element.querySelectorAll("[data-id]");
    for (const item of headerElements) {
      const name = item.dataset.id;
      result[name] = item;
    }
    const sortableTable = this.element.querySelectorAll("[data-element]");
    for (const item of sortableTable) {
      const name = item.dataset.element;
      result[name] = item;
    }

    return result;
  }

  sort(value, order) {
    if (!this.isSordet(value, order)) {
      return;
    }
    const sortType = this.headerConfig.find(
      (item) => item.id === value && item.sortable
    )?.sortType;

    if (!sortType) {
      return;
    }

    const direction = {
      asc: 1,
      desc: -1,
    };
    this.updateArrow(value, order);
    let compare;
    switch (sortType) {
      case "number":
        compare = function (a, b) {
          return direction[order] * (a[value] - b[value]);
        };
        break;
      case "string":
        compare = function (a, b) {
          return (
            direction[order] *
            a[value].localeCompare(b[value], ["ru", "en"], {
              caseFirst: "upper",
            })
          );
        };
        break;
    }
    this.data.sort(compare);
    this.subElements.body.innerHTML = this.getProductsRows();
  }

  updateArrow(value, order) {
    this.subElements[value].append(this.arrow);
    this.subElements[value].dataset.order = order;
  }

  isSordet(value, order) {
    const previousSorted =
      this.subElements.header.querySelector("[data-order]");
    if (
      this.subElements[value] === previousSorted &&
      previousSorted.dataset.order === order
    ) {
      return false;
    }

    if (previousSorted) {
      previousSorted.removeAttribute("data-order");
    }
    return true;
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
