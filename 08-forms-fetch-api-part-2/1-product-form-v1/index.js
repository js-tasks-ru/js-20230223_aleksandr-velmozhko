import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  product;
  categories;
  buttons;
  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    this.product = await this.getProduct(this.productId);
    this.categories = await this.getCategories();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate(this.product);
    this.element = wrapper.firstElementChild;
    this.buttons = this.getButtons();

    this.initEventListeners();
  }

  async getProduct(productId) {
    const url = new URL("/api/rest/products", BACKEND_URL);
    url.searchParams.set("id", productId);
    const response = await fetchJson(url);
    return response[0];
  }

  getButtons() {
    const buttons = this.element.querySelectorAll("button");
    return [...buttons].reduce((acc, button) => {
      acc[button.name] = button;
      return acc;
    }, {});
  }
  initEventListeners() {
    this.buttons.uploadImage.addEventListener("click", this.onUploadBtnClick);
    this.buttons.save.addEventListener("click", this.sendFormBtnClick);
  }
  onUploadBtnClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.click();
    input.onchange = async () => {
      try {
        const [file] = input.files;
        const result = await this.uploader(file);
        console.log("изображение загружено ", result);
      } catch (error) {
        console.error("ошибка загрузки изображения", error);
      }
    };
  };
  async uploader(file) {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        refferer: "",
      });
      return await response.json();
    } catch (error) {
      console.error("ошибка загрузки изображения на сервер", error);
    }
  }
  sendFormBtnClick = async (event) => {
    const formData = new FormData(document.forms[0]);
    console.log(document.forms[0]);
  };

  getTemplate() {
    return ` <div class="product-form">
    <form data-element="productForm" class="form-grid">
    <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"><ul class="sortable-list"><li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="https://i.imgur.com/MWorX2R.jpg">
          <input type="hidden" name="source" value="75462242_3746019958756848_838491213769211904_n.jpg">
          <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="https://i.imgur.com/MWorX2R.jpg">
        <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
      </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li></ul></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
          ${this.categories}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>


    </form>
  </div>`;
  }
  async getCategories() {
    const categories = await fetchJson(
      "https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory"
    );

    return categories
      .map((category) => {
        return category.subcategories.map((subcategory) => {
          return `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`;
        });
      })
      .join("");
  }
}
