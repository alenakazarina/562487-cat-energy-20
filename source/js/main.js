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
  if (sliderEl) {
    const sliderImages = sliderEl.querySelectorAll(`.slider__image`);
    const sliderControlEls = sliderEl.querySelectorAll(`.slider__control`);
    const SliderClass = {
      BEFORE: `slider--before`,
      AFTER: `slider--after`
    };
    const toggleImage = (imageEl) => {
      imageEl.classList.toggle(`visually-hidden`);
      imageEl.classList.toggle(`slider__image--show`);
    }
    for (let sliderControlEl of sliderControlEls) {
      sliderControlEl.addEventListener(`click`, (evt) => {
        const targetEl = evt.target.dataset.control;
        const sliderStateBefore = sliderEl.classList.contains(SliderClass.BEFORE);
        switch (targetEl) {
          case `before`:
            if (sliderStateBefore) {
              return;
            }
            sliderEl.classList.remove(SliderClass.AFTER);
            sliderEl.classList.add(SliderClass.BEFORE);
            for (let sliderImage of sliderImages) {
              toggleImage(sliderImage);
            }
            break;
          case `after`:
            if (!sliderStateBefore) {
              return;
            }
            sliderEl.classList.remove(SliderClass.BEFORE);
            sliderEl.classList.add(SliderClass.AFTER);
            for (let sliderImage of sliderImages) {
              toggleImage(sliderImage);
            }
            break;
          default:
            return;
        }
      })
    }
  }
})();
