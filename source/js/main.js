'use strict';

// nav toggle
(function() {
  const mainNavEl = document.querySelector(`.main-nav--nojs`);
  mainNavEl.classList.remove(`main-nav--nojs`);
  mainNavEl.classList.remove(`main-nav--opened`);
  mainNavEl.classList.add(`main-nav--closed`);
  const mainNavToggleEl = document.querySelector(`.js-toggle`);
  mainNavToggleEl.addEventListener(`click`, (evt) => {
    mainNavEl.classList.toggle(`main-nav--opened`);
    mainNavEl.classList.toggle(`main-nav--closed`);
  });
})();

'use strict';

//  slider
(function() {
  const sliderEl = document.querySelector(`.js-slider`);
  if (!sliderEl) {
    return;
  }

  const [sliderImageBefore, sliderImageAfter] = sliderEl.querySelectorAll(`.slider__image`);
  const sliderControlEls = sliderEl.querySelectorAll(`.slider__control`);
  const sliderRange = sliderEl.querySelector(`.slider__range`);
  const sliderThumbler = sliderEl.querySelector(`.slider__thumb`);
  const INITIAL_X = 197;

  class Slider {
    constructor() {
      this.rootEl = sliderEl;
      this.controlEls = sliderControlEls;
      this.controlBefore = sliderControlEls[0];
      this.controlAfter = sliderControlEls[1];
      this.rangeEl = sliderRange;
      this.thumbler = sliderThumbler;
      this.imageBefore = sliderImageBefore;
      this.imageAfter = sliderImageAfter;
      this.active = ``;

      this.startDragFlag = false;
      this.minX = 0;
      this.maxX = this.rangeEl.offsetWidth - this.thumbler.offsetWidth;
      this.startX = INITIAL_X;

      this.handleControlClick = this.handleControlClick.bind(this);
      this.handleThumbMouseDown = this.handleThumbMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    init() {
      const isTablet = window.matchMedia(`(min-width: 768px)`).matches;
      for (let controlEl of this.controlEls) {
        controlEl.addEventListener(`click`, this.handleControlClick);
      }
      if (isTablet) {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        this.thumbler.addEventListener(`mousedown`, this.handleThumbMouseDown);
      }
    }

    showBefore() {
      const isTablet = window.matchMedia(`(min-width: 768px)`).matches;

      if (isTablet) {
        sliderImageBefore.style.clipPath = `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
        sliderImageAfter.style.clipPath = `polygon(100% 0, 100% 0, 100% 100%, 100% 100%)`;
        return;
      }

      this.imageBefore.classList.remove(`slider__image--hide`);
      this.imageBefore.classList.add(`slider__image--show`);
      this.imageAfter.classList.remove(`slider__image--show`);
      this.imageAfter.classList.add(`slider__image--hide`);
    }

    showAfter() {
      const isTablet = window.matchMedia(`(min-width: 768px)`).matches;

      if (isTablet) {
        sliderImageAfter.style.clipPath = `polygon(0 0, 100% 0, 100% 100%, 0 100%)`;
        sliderImageBefore.style.clipPath = `polygon(0 0, 100% 0, 100% 0, 0 0)`;
        return;
      }

      this.imageAfter.classList.remove(`slider__image--hide`);
      this.imageAfter.classList.add(`slider__image--show`);
      this.imageBefore.classList.remove(`slider__image--show`);
      this.imageBefore.classList.add(`slider__image--hide`);
    }

    setThumbMax() {
      sliderThumbler.classList.remove(`slider__thumb--before`);
      sliderThumbler.classList.add(`slider__thumb--after`);
      this.startX = this.maxX;
      const isTablet = window.matchMedia(`(min-width: 768px)`).matches;
      if (isTablet) {
        sliderThumbler.style.transform = `translateX(${this.maxX}px)`;
      }
    }

    setThumbMin() {
      sliderThumbler.classList.remove(`slider__thumb--after`);
      sliderThumbler.classList.add(`slider__thumb--before`);
      this.startX = this.minX;
      const isTablet = window.matchMedia(`(min-width: 768px)`).matches;
      if (isTablet) {
        sliderThumbler.style.transform = `translateX(${this.minX}px)`;
      }
    }

    handleControlClick(evt) {
      const targetEl = evt.target;
      const isBeforeActive = this.active === `before`;
      const isAfterActive = this.active === `after`;

      switch (targetEl) {
        case this.controlBefore:
          if (isBeforeActive) {
            return;
          }
          this.active = `before`;
          this.showBefore();
          this.setThumbMin();
          break;
        case this.controlAfter:
          if (isAfterActive) {
            return;
          }
          this.active = `after`;
          this.showAfter();
          this.setThumbMax();
          break;
        default:
          throw Error(`Unknown slider control`);
      }
    }

    handleThumbMouseDown(evt) {
      evt.preventDefault();
      this.startDragFlag = true;
    }

    handleMouseUp() {
      this.startDragFlag = false;
    }

    handleMouseMove(evt) {
      if (!this.startDragFlag) {
        return;
      }
      this.active = ``;
      const parentX = sliderThumbler.offsetParent.offsetLeft;
      const shift = parentX + this.startX - evt.clientX;
      const endX = this.startX - shift;
      const willMinRange = endX <= this.minX;
      const willMaxRange = endX >= this.maxX;
      const willInRange = !willMinRange && !willMaxRange;

      if (willMinRange) {
        this.active = `before`;
        this.showBefore();
        this.setThumbMin();
        return;
      }

      if (willMaxRange) {
        this.active = `after`;
        this.showAfter();
        this.setThumbMax();
        return;
      }

      if (willInRange) {
        const imageX = Math.round(endX * 100 / this.maxX);
        sliderThumbler.style.transform = `translateX(${endX}px)`;
        sliderImageBefore.style.clipPath = `polygon(0 0, ${100 - imageX}% 0, ${100 - imageX}% 100%, 0 100%)`;
        sliderImageAfter.style.clipPath = `polygon(${100 - imageX}% 0, 100% 0, 100% 100%, ${100 - imageX}% 100%)`;
        this.startX = endX;
        return;
      }
    }
  }

  const catSlider = new Slider();
  catSlider.init();
})();
