import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  product;
  categories;
  buttons;
  inputs;
  subElements;
  defaultFormData = {
    description: "",
    discount: 0,
    price: "",
    quantity: 1,
    status: 1,
    subcategory: "",
    title: "",
    images: [],
  };

  onUploadBtnClick = (event) => {
    event.preventDefault();
    const input = document.createElement("input");
    input.type = "file";
    input.addEventListener("change", async () => {
      try {
        const [file] = input.files;
        const { uploadImage } = this.buttons;
        uploadImage.classList.add("is-loading");
        uploadImage.disabled = true;

        const result = await this.uploader(file);

        uploadImage.classList.remove("is-loading");
        uploadImage.disabled = false;

        this.uploadNewImage(result.data.link, file.name);

        console.log("изображение загружено ", result);
      } catch (error) {
        console.error("ошибка загрузки изображения", error);
      }
    });
    input.click();
  };

  sendFormBtnClick = async (event) => {
    event.preventDefault();
    const url = new URL("/api/rest/products", BACKEND_URL);
    const method = this.productId ? "PATCH" : "PUT";
    const data = this.getFormData();
    try {
      const result = await fetchJson(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      this.dispatchEvent(result);
      console.log("форма отправлена");
    } catch (error) {
      console.error("ошибка отправки формы", error);
    }
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const product = this.productId
      ? this.getProduct(this.productId)
      : Promise.resolve(this.defaultFormData);

    [this.product, this.categories] = await Promise.all([
      product,
      this.getCategories(),
    ]);

    this.createForm();
    this.fillThisForm();
    this.initEventListeners();
    console.log(this.subElements);
    return this.element;
  }

  createForm() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.product
      ? this.getTemplate(this.product)
      : this.getEmptyTemplate();
    this.element = wrapper.firstElementChild;
    this.buttons = this.getButtons();
    this.inputs = this.getInputs();
    this.subElements = this.getSubElements();
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не отсутствует</p>
    </div>`;
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const formatToNumber = ["price", "quantity", "discount", "status"];
    const excludedFields = ["images"];
    const fields = Object.keys(this.defaultFormData).filter(
      (item) => !excludedFields.includes(item)
    );
    const getValue = (field) =>
      productForm.querySelector(`[name=${field}]`).value;

    const values = {};

    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    values.id = this.productId;
    const imagesHTMLCollection = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );
    values.images = [];
    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.nextElementSibling.textContent,
      });
    }
    return values;
  }

  async getProduct(productId) {
    const url = new URL("/api/rest/products", BACKEND_URL);
    url.searchParams.set("id", productId);
    try {
      const response = await fetchJson(url);
      return response[0];
    } catch (error) {
      console.error("ошибка получения данных о товаре", error);
    }
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
  getSubElements() {
    const elements = this.element.querySelectorAll("[data-element]");
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }
  getButtons() {
    const buttons = this.element.querySelectorAll("button");
    return [...buttons].reduce((acc, button) => {
      acc[button.name] = button;
      return acc;
    }, {});
  }

  getInputs() {
    const inputs = this.element.querySelectorAll(".form-control");
    return [...inputs].reduce((acc, input) => {
      acc[input.name] = input;
      return acc;
    }, {});
  }

  async uploader(file) {
    const { uploadImage } = this.buttons;
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
        refferer: "",
      });
      return await response.json();
    } catch (error) {
      console.error("ошибка загрузки изображения на сервер", error);
      return Promise.reject(error);
    }
  }

  uploadNewImage(url, name) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.fillImagesList([{ url, source: name }]);
    const li = wrapper.firstElementChild;
    this.subElements.imageListContainer.append(li);
  }

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
        <div class="form-group form-group__wide">
        <ul class="sortable-list" data-element="imageListContainer">
        ${this.fillImagesList(this.product.images)}
        </ul>

          </div>
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
          <input required="" type="number" name="price" class="form-control" placeholder="${
            this.defaultFormData.price
          }">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="${
            this.defaultFormData.discount
          }">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="${
          this.defaultFormData.quantity
        }">
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
        ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>`;
  }

  fillImagesList(data) {
    return data
      .map(({ url, source }) => {
        return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${escapeHtml(url)}">
      <input type="hidden" name="source" value="${escapeHtml(source)}">
      <span>
    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
    <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
    <span>${escapeHtml(source)}</span>
  </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button></li>`;
      })
      .join("");
  }

  fillThisForm() {
    Object.entries(this.product).forEach(([key, value]) => {
      const input = this.element.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = value;
      }
    });
  }
  dispatchEvent(result) {
    const event = this.productId
      ? new CustomEvent("product-saved", { detail: result })
      : new CustomEvent("product-created", {});
    this.element.dispatchEvent(event);
  }
  initEventListeners() {
    this.buttons.uploadImage.addEventListener(
      "pointerdown",
      this.onUploadBtnClick
    );
    this.buttons.save.addEventListener("click", this.sendFormBtnClick);

    this.subElements.imageListContainer.addEventListener(
      "click",
      this.removeImage
    );
  }
  removeImage(event) {
    const target = event.target.dataset;
    if ("deleteHandle" in target) {
      event.target.closest("li").remove();
    }
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.buttons = null;
    this.inputs = null;
  }
}
