'use strict';

// nav toggle
(function() {
  let isMenuOpen = true;
  const OPEN_TEXT = `Открыть основное меню`;
  const CLOSE_TEXT = `Закрыть основное меню`;
  const mainNavEl = document.querySelector(`.main-nav--nojs`);
  mainNavEl.classList.remove(`main-nav--nojs`);
  mainNavEl.classList.remove(`main-nav--opened`);
  mainNavEl.classList.add(`main-nav--closed`);
  isMenuOpen = false;
  const mainNavToggleEl = document.querySelector(`.js-toggle`);
  const mainNavToggleText = mainNavToggleEl.querySelector(`span`);
  mainNavToggleEl.addEventListener(`click`, (evt) => {
    if (isMenuOpen) {
      isMenuOpen = false;
      mainNavToggleText.innerText = OPEN_TEXT;
      mainNavToggleEl.setAttribute(`aria-label`, OPEN_TEXT);
    } else {
      isMenuOpen = true;
      mainNavToggleText.innerText = CLOSE_TEXT;
      mainNavToggleEl.setAttribute(`aria-label`, CLOSE_TEXT);
    }
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
  const sliderControls = sliderEl.querySelector(`.slider__controls`);
  const sliderControlEls = sliderControls.querySelectorAll(`.slider__control`);
  const sliderRange = sliderEl.querySelector(`.slider__range`);
  const sliderThumbler = sliderEl.querySelector(`.slider__thumb`);
  const INITIAL_X = 197;
  const SliderState = {
    AFTER: `after`,
    BEFORE: `before`,
    MIDDLE: `middle`
  };

  class Slider {
    constructor() {
      this.rootEl = sliderEl;
      this.controlsEl = sliderControls;
      this.controlBefore = sliderControlEls[0];
      this.controlAfter = sliderControlEls[1];
      this.rangeEl = sliderRange;
      this.thumbEl = sliderThumbler;
      this.imageBefore = sliderImageBefore;
      this.imageAfter = sliderImageAfter;
      this.active = SliderState.BEFORE;
      this.imageX = 0;
      this.thumbX = 0;
      this.startDragFlag = false;
      this.startDragX = 0;
      this.minX = 0;
      this.maxX = this.rangeEl.offsetWidth - this.thumbEl.offsetWidth;
      this.minXMobile = 0;
      this.maxXMobile = 38;
      this.shiftX = this.thumbEl.offsetWidth;

      this.handleControlsClickMobile = this.handleControlsClickMobile.bind(this);
      this.handleControlsClickTablet = this.handleControlsClickTablet.bind(this);

      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);

      this.handleThumbMouseDown = this.handleThumbMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
    }

    setSlider() {
      this.imageBefore.style.clipPath = `polygon(0 0, ${this.imageX}% 0, ${this.imageX}% 100%, 0 100%)`;
      this.imageAfter.style.clipPath = `polygon(${this.imageX}% 0, 100% 0, 100% 100%, ${this.imageX}% 100%)`;
      this.thumbEl.style.transform = `translateX(${this.thumbX}px)`;
    }

    setBefore() {
      this.active = SliderState.BEFORE;
      this.imageX = 100;
    }

    setAfter() {
      this.active = SliderState.AFTER;
      this.imageX = 0;
    }

    moveSlider(evtClientX) {
      const shift = this.startDragX - evtClientX;
      this.startDragX = evtClientX;
      const endX = this.thumbX - shift;
      const willMinRange = endX <= this.minX + this.shiftX / 2;
      const willMaxRange = endX >= this.maxX - this.shiftX / 2;

      if (willMinRange && shift >=0) {
        this.thumbX = this.minX;
        this.setBefore();
        this.setSlider();
        return;
      }

      if (willMaxRange && shift <=0) {
        this.thumbX = this.maxX;
        this.setAfter();
        this.setSlider();
        return;
      }

      const percentX = Math.round(endX * 100 / this.maxX);
      this.active = SliderState.MIDDLE;
      this.imageX = 100 - percentX;
      this.thumbX = endX;
      this.setSlider();
    }

    endDrag() {
      if (this.startDragFlag) {
        this.startDragFlag = false;
      }
    }

    initMobile() {
      this.active = SliderState.BEFORE;
      this.imageX = 0;
      this.thumbX = 0;
      this.setMobileListeners(true);
    }

    initTablet() {
      this.active = SliderState.MIDDLE;
      this.imageX = 49;
      this.thumbX = 197;
      this.setTabletListeners(true);
    }

    changeToMobile() {
      if (this.active === SliderState.AFTER) {
        this.imageX = 0;
        this.thumbX = this.maxXMobile;
      } else if (this.active === SliderState.BEFORE) {
        this.imageX = 100;
        this.thumbX = this.minXMobile;
      } else {
        this.active = SliderState.BEFORE;
        this.imageX = 100;
        this.thumbX = this.minXMobile;
      }
      this.setSlider();
      this.setTabletListeners(false);
      this.setMobileListeners(true);
    }

    changeToTablet() {
      if (this.active === SliderState.AFTER) {
        this.imageX = 0;
        this.thumbX = this.maxX;
      } else {
        this.imageX = 100;
        this.thumbX = this.minX;
      }
      this.setSlider();
      this.setMobileListeners(false);
      this.setTabletListeners(true);
    }

    setMobileListeners(isActive) {
      if (isActive) {
        this.controlsEl.addEventListener(`click`, this.handleControlsClickMobile);
      } else {
        this.controlsEl.removeEventListener(`click`, this.handleControlsClickMobile);
      }
    }

    setTabletListeners(isActive) {
      if(isActive) {
        this.controlsEl.addEventListener(`click`, this.handleControlsClickTablet);

        this.thumbEl.addEventListener("touchstart", this.handleTouchStart);
        this.thumbEl.addEventListener("touchmove", this.handleTouchMove);
        this.thumbEl.addEventListener("touchend", this.handleTouchEnd);

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        this.thumbEl.addEventListener(`mousedown`, this.handleThumbMouseDown);
      } else {
        this.controlsEl.removeEventListener(`click`, this.handleControlsClickTablet);

        this.thumbEl.removeEventListener("touchstart", this.handleTouchStart);
        this.thumbEl.removeEventListener("touchmove", this.handleTouchMove);
        this.thumbEl.removeEventListener("touchend", this.handleTouchEnd);

        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        this.thumbEl.removeEventListener(`mousedown`, this.handleThumbMouseDown);
      }
    }

    handleControlsClickMobile(evt) {
      const targetEl = evt.target;
      const isBeforeActive = this.active === SliderState.BEFORE;

      switch (targetEl) {
        case this.controlBefore:
          if (!isBeforeActive) {
            this.thumbX = this.minXMobile;
            this.setBefore();
            this.setSlider();
          }
          break;

        case this.controlAfter:
          if (isBeforeActive) {
            this.thumbX = this.maxXMobile;
            this.setAfter();
            this.setSlider();
          }
          break;

        case this.rangeEl:
          if (isBeforeActive) {
            this.thumbX = this.maxXMobile;
            this.setAfter();
            this.setSlider();
          } else {
            this.thumbX = this.minXMobile;
            this.setBefore();
            this.setSlider();
          }
          break;
        default:
          return;
      }
    }

    handleControlsClickTablet(evt) {
      const targetEl = evt.target;
      switch (targetEl) {
        case this.controlBefore:
          if (this.active !== SliderState.BEFORE) {
            this.thumbX = this.minX;
            this.setBefore();
            this.setSlider();
          }
          break;
        case this.controlAfter:
          if (this.active !== SliderState.AFTER) {
            this.thumbX = this.maxX;
            this.setAfter();
            this.setSlider();
          }
          break;
        case this.rangeEl:
          const x = evt.offsetX;
          if (x <= this.minX + this.shiftX / 2) {
            this.thumbX = this.minX;
            this.setBefore();
            this.setSlider();
            return;
          }
          if (x >= this.maxX - this.shiftX / 2) {
            this.thumbX = this.maxX;
            this.setAfter();
            this.setSlider();
            return;
          }
          const percentX = 100 - Math.round(x * 100 / this.maxX);
          this.active = SliderState.MIDDLE;
          this.imageX = percentX;
          this.thumbX = x - this.shiftX / 2;
          this.setSlider();
          break;
        default:
          return;
      }
    }

    handleTouchStart(evt) {
      evt.preventDefault();
      this.startDragFlag = true;

      for (let touch of evt.changedTouches) {
        if (touch.target === this.thumbEl) {
          this.startDragX = touch.clientX;
        }
      }
    }

    handleTouchEnd() {
      this.endDrag();
    }

    handleTouchMove(evt) {
      evt.preventDefault();
      if (!this.startDragFlag) {
        return;
      }

      let evtClientX = 0;
      for (let touch of evt.changedTouches) {
        if (touch.target === this.thumbEl) {
          evtClientX = touch.clientX;
        }
      }
      this.moveSlider(evtClientX);
    }

    handleThumbMouseDown(evt) {
      evt.preventDefault();
      this.startDragFlag = true;
      this.startDragX = evt.clientX;
    }

    handleMouseUp() {
      this.endDrag();
    }

    handleMouseMove(evt) {
      if (!this.startDragFlag) {
        return;
      }
      this.moveSlider(evt.clientX);
    }
  }

  const catSlider = new Slider();
  const tabletMQ = window.matchMedia(`(min-width: 768px)`);
  const isTablet = tabletMQ.matches;

  if (isTablet) {
    catSlider.initTablet();
  } else {
    catSlider.initMobile();
  }

  tabletMQ.addEventListener(`change`, () => {
    if (tabletMQ.matches) {
      catSlider.changeToTablet();
    } else {
      catSlider.changeToMobile();
    }
  });
})();
