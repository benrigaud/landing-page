const { duration } = require("moment/moment");
const { space } = require("postcss/lib/list");

jQuery( document ).ready(function($) {

  // mobile menu
  $('.menu-trigger').click(function(){    
    $('.menu').toggleClass('active')
  });

  // slider
  const swiper = new Swiper('.slider-inspiration', {
    slidesPerView: 2,
    loop: true,
    spaceBetween: 20,
    speed: 1200,
    freeMode: true,
    navigation: {
      nextEl: '.slider-prev',
      prevEl: '.slider-next',
    },
    pagination: {
      el: '.slider-pagination',
      type: 'fraction',
    },
    breakpoints: {
      800: {
        slidesPerView: 3,
      },
      1000: {
        slidesPerView: 4,
      },
      1230: {
        slidesPerView: 6,
      },
    },
    autoplay: {
      delay: 0,
      pauseOnMouseEnter: true,
    },
  });

  // animations
  AOS.init({
    duration: 1000,
    once: true,
  });

});