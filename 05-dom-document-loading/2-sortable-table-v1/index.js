export default class SortableTable {
  element;
  arrow;
  subElements;
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.template = headerConfig[0].template;
    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTamplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.getArrow();
    this.updateArrow("title", "asc");
  }

  getHeader() {
    return this.headerConfig
      .map((config) => {
        return `<div
      class="sortable-table__cell"
      data-id="${config.id}"
      data-sortable="${config.sortable}"
      data-order="asc">
      <span>${config.title}</span> </div>`;
      })
      .join("");
  }

  getProducts(data) {
    return data
      .map((item) => {
        return `
    <a href="#" class="sortable-table__row">
    ${this.template(item.images)}
     <div class="sortable-table__cell">${item.title}</div>
     <div class="sortable-table__cell">${item.quantity}</div>
          <div class="sortable-table__cell">${item.price}</div>
          <div class="sortable-table__cell">${item.sales}</div>
        </a>
      `;
      })
      .join("");
  }
  getTamplate() {
    return `
    <div data-element="productsContainer" class="products-list__container">
    <div class="sortable-table"><div data-element="header" class="sortable-table__header sortable-table__row">
    ${this.getHeader()}  </div>
    <div data-element="body" class="sortable-table__body">
    ${this.getProducts(this.data)} </div>
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

  getArrow() {
    this.arrow = document.createElement("div");
    this.arrow.innerHTML = `<span data-element="arrow" class="sortable-table__sort-arrow">
     <span class="sort-arrow"></span></span>`;
  }

  getSubElements(elem) {
    const result = {};
    const elements = elem.querySelectorAll("[data-id]");
    for (const item of elements) {
      const name = item.dataset.id;
      result[name] = item;
    }
    const body = elem.querySelector("[data-element='body']");
    result.body = body;
    return result;
  }

  updateArrow(value, order) {
    this.subElements[value].append(this.arrow);
    this.subElements[value].dataset.order = order;
  }

  sort(value, order) {
    const direction = {
      asc: 1,
      desc: -1,
    };

    const sortData = [...this.data];

    const sortableHeader = this.headerConfig.find(
      (item) => item.id === value && item.sortable
    );

    if (!sortableHeader) {
      return;
    }

    const sortType = sortableHeader.sortType;

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
    sortData.sort(compare);
    this.updateArrow(value, order);
    this.subElements.body.innerHTML = this.getProducts(sortData);
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
