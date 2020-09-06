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
  const MIDDLE = 365;
  const GRADIENT_COLOR = `#eaeaea`;
  const SliderState = {
    AFTER: `after`,
    BEFORE: `before`,
    MIDDLE: `middle`
  };
  const Thumb = {
    MIN: 0,
    MID: 197,
    MOBILE: 38
  };
  const Image = {
    AFTER: 0,
    BEFORE: 100,
    TABLET: 49,
    DESKTOP: 53
  };
  const MQ = {
    MOBILE: `mobile`,
    TABLET: `tablet`,
    DESKTOP: `desktop`
  };
  const getMQ = (mq) => {
    switch(mq) {
      case MQ.MOBILE:
        return window.matchMedia(`(max-width: 767.9px)`);
      case MQ.TABLET:
        return window.matchMedia(`(min-width: 768px) and (max-width: 1299.9px)`);
      case MQ.DESKTOP:
        return window.matchMedia(`(min-width: 1300px)`);
      default:
        throw Error(`Unknown MQ`);
    }
  };

  class Slider {
    constructor() {
      this.rootEl = sliderEl;
      this.contentEl = sliderEl.children[0];
      this.imageBefore = this.contentEl.children[0];
      this.imageAfter = this.contentEl.children[1];
      this.controlsEl = sliderEl.children[1];
      this.controlBefore = this.controlsEl.children[0];
      this.rangeEl = this.controlsEl.children[1];
      this.controlAfter = this.controlsEl.children[2];
      this.thumbEl = this.rangeEl.children[0];
      this.gradientEl = document.querySelector(`.js-gradient`);
      this.state = SliderState.BEFORE;
      this.imageX = 0;
      this.thumbX = 0;
      this.thumbMax = this.rangeEl.offsetWidth - this.thumbEl.offsetWidth;
      this.startDragFlag = false;
      this.startDragX = 0;
      this.shiftX = this.thumbEl.offsetWidth / 2;
      this.gradientWidth = 0;

      this.handleControlsClick = this.handleControlsClick.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleThumbMouseDown = this.handleThumbMouseDown.bind(this);
      this.handleMouseUp = this.handleMouseUp.bind(this);
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleWindowResize = this.handleWindowResize.bind(this);
    }

    setState(state, imageX, thumbX) {
      this.state = state;
      this.imageX = imageX;
      this.thumbX = thumbX;
      if (getMQ(MQ.DESKTOP).matches) {
        switch (state) {
          case SliderState.BEFORE:
            this.gradientWidth = 0;
            break;
          case SliderState.AFTER:
            this.gradientWidth = this.rootEl.offsetWidth;
            break;
          case SliderState.MIDDLE:
            const shift = (this.imageX - Image.DESKTOP) * MIDDLE / Image.DESKTOP;
            this.gradientWidth = this.rootEl.offsetWidth - MIDDLE - shift;
            break;
          default:
            throw Error(`Unknown Slider State`);
        }
      }
    }

    setSlider() {
      if (getMQ(MQ.DESKTOP).matches) {
        this.gradientEl.style.backgroundImage = `linear-gradient(to left, ${GRADIENT_COLOR} 0, ${GRADIENT_COLOR} ${this.gradientWidth}px, transparent ${this.gradientWidth}px)`;
      }
      this.imageBefore.style.clipPath = `polygon(0 0, ${this.imageX}% 0, ${this.imageX}% 100%, 0 100%)`;
      this.imageAfter.style.clipPath = `polygon(${this.imageX}% 0, 100% 0, 100% 100%, ${this.imageX}% 100%)`;
      this.thumbEl.style.transform = `translateX(${this.thumbX}px)`;
    }

    initMobile() {
      this.thumbMax = this.rangeEl.offsetWidth - this.thumbEl.offsetWidth;
      this.setState(SliderState.BEFORE, Image.BEFORE, Thumb.MIN);
    }

    initTablet() {
      this.thumbMax = this.rangeEl.offsetWidth - this.thumbEl.offsetWidth;
      this.setState(SliderState.MIDDLE, Image.TABLET, Thumb.MID);
    }

    initDesktop() {
      this.setState(SliderState.MIDDLE, Image.DESKTOP, Thumb.MID);
    }

    moveSlider(evtClientX) {
      const shift = this.startDragX - evtClientX;
      this.startDragX = evtClientX;
      const endX = this.thumbX - shift;
      const willMinRange = endX <= Thumb.MIN + this.shiftX;
      const willMaxRange = endX >= this.thumbMax - this.shiftX;

      if (willMinRange && shift >=0) {
        this.setState(SliderState.BEFORE, Image.BEFORE, Thumb.MIN);
      } else if (willMaxRange && shift <=0) {
        this.setState(SliderState.AFTER, Image.AFTER, this.thumbMax);
      } else {
        const percentX = Math.round(endX * 100 / this.thumbMax);
        this.setState(SliderState.MIDDLE, 100 - percentX, endX);
      }
      this.setSlider();
    }

    endDrag() {
      if (this.startDragFlag) {
        this.startDragFlag = false;
      }
    }

    removeGradient() {
      this.gradientWidth = 0;
      this.gradientEl.style.backgroundImage = ``;
    }

    addListeners() {
      if (getMQ(MQ.TABLET).matches || getMQ(MQ.DESKTOP).matches) {
        this.thumbEl.addEventListener(`touchstart`, this.handleTouchStart);
        this.thumbEl.addEventListener(`touchmove`, this.handleTouchMove);
        this.thumbEl.addEventListener(`touchend`, this.handleTouchEnd);
        this.thumbEl.addEventListener(`mousedown`, this.handleThumbMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener(`resize`, this.handleWindowResize);
      }
      this.controlsEl.addEventListener(`click`, this.handleControlsClick);
    }

    removeListeners() {
      this.thumbEl.removeEventListener(`touchstart`, this.handleTouchStart);
      this.thumbEl.removeEventListener(`touchmove`, this.handleTouchMove);
      this.thumbEl.removeEventListener(`touchend`, this.handleTouchEnd);
      this.thumbEl.removeEventListener(`mousedown`, this.handleThumbMouseDown);
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
    }

    handleControlsClick(evt) {
      const targetEl = evt.target;
      const isBeforeActive = this.state === SliderState.BEFORE;
      const isAfterActive = this.state === SliderState.AFTER;

      switch (targetEl) {
        case this.controlBefore:
          if (isBeforeActive) {
            return;
          }
          this.setState(SliderState.BEFORE, Image.BEFORE, Thumb.MIN);
          break;

        case this.controlAfter:
          if (isAfterActive) {
            return;
          }
          const thumbX = getMQ(MQ.MOBILE).matches ? Thumb.MOBILE : this.thumbMax;
          this.setState(SliderState.AFTER, Image.AFTER, thumbX);
          break;

        case this.rangeEl:
          if (getMQ(MQ.MOBILE).matches) {
            const state = isBeforeActive ? SliderState.AFTER : SliderState.BEFORE;
            const imageX = isBeforeActive ? Image.AFTER : Image.BEFORE;
            const thumbX = isBeforeActive ? Thumb.MOBILE : Thumb.MIN;
            this.setState(state, imageX, thumbX);
          } else {
            const x = evt.offsetX;
            if (x <= Thumb.MIN + this.shiftX) {
              this.setState(SliderState.BEFORE, Image.BEFORE, Thumb.MIN);
            } else if (x >= this.thumbMax - this.shiftX) {
              this.setState(SliderState.AFTER, Image.AFTER, this.thumbMax);
            } else {
              const percentX = 100 - Math.round(x * 100 / this.thumbMax);
              this.setState(SliderState.MIDDLE, percentX, x - this.shiftX);
            }
          }
          break;

        default:
          return;
      }
      this.setSlider();
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
      if (!this.startDragFlag) {
        return;
      }

      if (evt.cancelable) {
        evt.preventDefault();
        let evtClientX = 0;
        for (let touch of evt.changedTouches) {
          if (touch.target === this.thumbEl) {
            evtClientX = touch.clientX;
          }
        }
        this.moveSlider(evtClientX);
      }
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

    handleWindowResize() {
      if (getMQ(MQ.DESKTOP).matches) {
        this.initDesktop();
        this.setSlider();
      }
    }
  }

  const catSlider = new Slider();

  if (getMQ(MQ.MOBILE).matches) {
    catSlider.initMobile();
  } else if (getMQ(MQ.TABLET).matches) {
    catSlider.initTablet();
  } else {
    catSlider.initDesktop();
  }
  catSlider.setSlider();
  catSlider.addListeners();

  getMQ(MQ.MOBILE).addEventListener(`change`, (evt) => {
    if (evt.target.matches) {
      catSlider.initMobile();
      catSlider.setSlider();
      catSlider.removeListeners();
    }
  });

  getMQ(MQ.TABLET).addEventListener(`change`, (evt) => {
    if (evt.target.matches) {
      catSlider.initTablet();
      catSlider.setSlider();
      catSlider.removeGradient();
      catSlider.addListeners();
    }
  });

  getMQ(MQ.DESKTOP).addEventListener(`change`, (evt) => {
    if (evt.target.matches) {
      catSlider.initDesktop();
      catSlider.setSlider();
    }
  });
})();
