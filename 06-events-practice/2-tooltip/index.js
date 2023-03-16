class Tooltip {
  static instance;
  element;

  handlePointerOver = (event) => {
    const target = event.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }
    const message = target.dataset.tooltip;
    this.render(message);
    this.element.style.left = `${event.pageX + 10}px`;
    this.element.style.top = `${event.pageY + 10}px`;

    target.addEventListener("pointermove", this.handlePointerMove);
  };

  handlePointerMove = (event) => {
    this.element.style.left = `${event.pageX + 10}px`;
    this.element.style.top = `${event.pageY + 10}px`;
  };

  handlePointerOut = (event) => {
    const target = event.target.closest("[data-tooltip]");
    if (!target) {
      return;
    }
    target.removeEventListener("pointermove", this.handlePointerMove);
    this.remove();
  };

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }
    Tooltip.instance = this;
  }

  initialize() {
    document.addEventListener("pointerover", this.handlePointerOver);
    document.addEventListener("pointerout", this.handlePointerOut);
  }

  render(message = "") {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.textContent = message;
    document.body.append(tooltip);
    this.element = tooltip;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    document.removeEventListener("pointerover", this.handlePointerOver);
    document.removeEventListener("pointerout", this.handlePointerOut);
    this.element = null;
  }
}

export default Tooltip;
