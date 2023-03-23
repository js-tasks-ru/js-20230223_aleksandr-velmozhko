export default class DoubleSlider {
  element;
  subElements = {};
  activeThumb;

  startMooving = (event) => {
    this.activeThumb = event.target;
    this.element.addEventListener("pointermove", this.onPointerMove);
    this.element.addEventListener("pointerup", this.onPointerUp);
  };

  onPointerMove = (event) => {
    const leftBorder = this.activeThumb.bindings.leftBorder;
    const rightBorder = this.activeThumb.bindings.rightBorder;
    const sliderRect = this.subElements.slider.getBoundingClientRect();

    let position = event.clientX;
    if (position < leftBorder) {
      position = leftBorder;
    }
    if (position > rightBorder) {
      position = rightBorder;
    }

    this.activeThumb.bindings.position =
      (position - sliderRect.left) / sliderRect.width;
  };
  onPointerUp = (event) => {
    this.element.removeEventListener("pointermove", this.onPointerMove);
    this.element.removeEventListener("pointerup", this.onPointerUp);
    this.activeThumb = null;
  };

  constructor({
    min = 0,
    max = 0,
    formatValue = (value) => "$" + value,
    selected = {},
  } = {}) {
    this.formatValue = formatValue;
    this.min = min;
    this.max = max;
    this.from = selected.from || this.min;
    this.to = selected.to || this.max;

    this.render();
    this.initEventListeners();
  }
  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.createBindings();
  }

  get getTemplate() {
    const { left, right } = this.getPercent();

    return `<div class="range-slider ">
    <span data-element="from">${this.formatValue(this.from)}</span>
    <div class="range-slider__inner range-slider_dragging" data-element="slider">
    <span class="range-slider__progress" data-element="progressBar" style="right:${right}%; left : ${left}%"></span>
    <span class="range-slider__thumb-left" data-element="leftThumb" style="left:${left}%" ></span>
    <span class="range-slider__thumb-right" data-element="rightThumb" style="right:${right}%"></span>
    </div>
    <span data-element="to">${this.formatValue(this.to)}</span>
  </div>`;
  }

  getPercent() {
    return {
      left: ((this.from - this.min) * 100) / (this.max - this.min),
      right: 100 - ((this.to - this.min) * 100) / (this.max - this.min),
    };
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");
    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }
    return result;
  }

  createBindings() {
    const subElements = this.subElements;
    const updateValue = (pos) => {
      return this.formatValue(
        (pos * (this.max - this.min) + this.min).toFixed()
      );
    };

    subElements.leftThumb.bindings = {
      get leftBorder() {
        return subElements.slider.getBoundingClientRect().left;
      },
      get rightBorder() {
        return subElements.rightThumb.getBoundingClientRect().left;
      },
      set position(pos) {
        const percent = pos * 100 + "%";
        subElements.from.textContent = updateValue(pos);
        subElements.leftThumb.style.left = percent;
        subElements.progressBar.style.left = percent;
      },
    };
    subElements.rightThumb.bindings = {
      get leftBorder() {
        return subElements.leftThumb.getBoundingClientRect().right;
      },
      get rightBorder() {
        return subElements.slider.getBoundingClientRect().right;
      },
      set position(pos) {
        const percent = 100 - pos * 100 + "%";
        subElements.to.textContent = updateValue(pos);
        subElements.rightThumb.style.right = percent;
        subElements.progressBar.style.right = percent;
      },
    };
  }

  initEventListeners() {
    this.subElements.leftThumb.addEventListener(
      "pointerdown",
      this.startMooving
    );
    this.subElements.rightThumb.addEventListener(
      "pointerdown",
      this.startMooving
    );
  }
  remove() {
    if (!this.element) return;
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
