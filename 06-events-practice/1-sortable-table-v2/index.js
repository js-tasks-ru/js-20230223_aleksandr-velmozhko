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

    if (!order || order === "asc") {
      this.sort(id, "desc");
    } else if (order === "desc") {
      this.sort(id, "asc");
    }
  };

  constructor(
    headerConfig,
    { data = [], sorted = {} } = {},
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
    wrapper.innerHTML = this.getTamplate;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.arrow = this.getArrow();
    this.sort(this.sorted.id, this.sorted.order);
  }

  get getTamplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
    <div class="sortable-table"><div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.getHeader()}  </div>
    <div data-element="body" class="sortable-table__body"></div>
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
      .map(({ id, sortable, title }) => {
        return `<div
      class="sortable-table__cell"
      data-id="${id}"
      data-sortable="${sortable}">
      <span>${title}</span> </div>`;
      })
      .join("");
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
      .map(({ id, template }) => {
        const value = product[id];
        if (template) {
          return template(value);
        }
        return `<div class="sortable-table__cell">${value}</div>`;
      })
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

  updateArrow(field, order) {
    this.subElements[field].append(this.arrow);
    this.subElements[field].dataset.order = order;
  }

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    if (!this.isSordet(field, order)) {
      return;
    }
    const sortType = this.headerConfig.find(
      ({ id, sortable }) => id === field && sortable
    )?.sortType;

    if (!sortType) {
      return;
    }

    this.updateArrow(field, order);
    const compare = this.getCompareFunc(sortType, field, order);
    const sortedData = [...this.data].sort(compare);
    this.subElements.body.innerHTML = this.getProductsRows(sortedData);
  }

  sortOnServer(field, order) {}

  getCompareFunc(sortType, field, order) {
    let compare;
    const direction = {
      asc: 1,
      desc: -1,
    };
    switch (sortType) {
      case "number":
        compare = function (a, b) {
          return direction[order] * (a[field] - b[field]);
        };
        break;
      case "string":
        compare = function (a, b) {
          return (
            direction[order] *
            a[field].localeCompare(b[field], ["ru", "en"], {
              ncaseFirst: "upper",
            })
          );
        };
        break;
    }
    return compare;
  }

  isSordet(field, order) {
    const previousSorted =
      this.subElements.header.querySelector("[data-order]");
    if (
      this.subElements[field] === previousSorted &&
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
