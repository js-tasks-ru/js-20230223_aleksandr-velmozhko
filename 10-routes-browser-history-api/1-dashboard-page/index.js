import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements = {};
  components = {};
  from = new Date();
  to = new Date();

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    this.initComponents();
    return this.element;
  }
  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((acc, elem) => {
      acc[elem.dataset.element] = elem;
      return acc;
    }, {});
  }
  initComponents() {
    this.getRangePicker();
    this.getColumnChart(this.from, this.to);
    this.getBestSellers();
  }
  getTemplate() {
    return `<div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div></div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers">
        </div></div> <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable">
      </div>
    </div>`;
  }

  getBestSellers() {
    const { sortableTable } = this.subElements;
    const component = (this.components.bestSellers = new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${this.from}&to=${this.to}`,
      isSortLocally: true,
    }));
    sortableTable.append(component.element);
    component.url.searchParams.set("from", this.from);
    component.url.searchParams.set("to", this.to);
  }

  getColumnChart(from, to) {
    const { ordersChart, salesChart, customersChart } = this.subElements;
    this.components.ordersChart = new ColumnChart({
      url: `api/dashboard/orders`,
      range: {
        from,
        to,
      },
      label: "orders",
      link: "#",
    });

    this.components.salesChart = new ColumnChart({
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      label: "sales",
      formatHeading: (data) => `$${data.toLocaleString("en-US")}`,
    });

    this.components.customersChart = new ColumnChart({
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
      label: "customers",
    });
    ordersChart.append(this.components.ordersChart.element);
    salesChart.append(this.components.salesChart.element);
    customersChart.append(this.components.customersChart.element);
  }

  getRangePicker() {
    const { rangePicker } = this.subElements;
    const to = (this.to = new Date());
    const from = (this.from = new Date(to.getFullYear(), to.getMonth(), 0, 2));
    //Если не передать время, то в компоненте после применения toISOString в dolumnchart, запросы будут отправляться на день раньше из-за часового пояса
    const component = (this.components.rangePicker = new RangePicker({
      from,
      to,
    }));
    rangePicker.append(component.element);

    component.element.addEventListener("date-select", (event) => {
      const { from, to } = event.detail;
      this.updateColumnChart(from, to);
      this.updateBestSellers(from, to);
    });
  }
  async updateBestSellers(from, to) {
    const {
      start,
      end,
      sorted: { id, order },
    } = this.components.bestSellers;

    const url = new URL("api/dashboard/bestsellers", BACKEND_URL);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());
    url.searchParams.set("_sort", id);
    url.searchParams.set("_order", order);
    url.searchParams.set("_start", start);
    url.searchParams.set("_end", end);
    const response = await fetchJson(url);
    this.components.bestSellers.renderRows(response);
  }
  updateColumnChart(from, to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.subElements = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
