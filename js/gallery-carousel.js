// Dynamically inject Swiper slides before the carousel initializes.
(function () {
    const galleryImages = 29;

    function injectGallerySlides() {
        const swiperWrapper = document.querySelector('.carousel-album .swiper-wrapper');

        if (!swiperWrapper) return;

        swiperWrapper.innerHTML = '';

        for (let imageNum = 1; imageNum <= galleryImages; imageNum += 1) {
            const imagePath = `img/gallery/${imageNum}.png`;
            const slide = document.createElement('div');

            slide.className = 'swiper-slide carousel-img';
            slide.style.backgroundImage = `url('${imagePath}')`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center center';
            slide.setAttribute('data-src', imagePath);

            const overlay = document.createElement('div');
            overlay.className = 'carousel-overlay';

            const icon = document.createElement('span');
            icon.className = 'icon-diagonal-arrows launch-gallery-icon';

            slide.appendChild(overlay);
            slide.appendChild(icon);
            swiperWrapper.appendChild(slide);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectGallerySlides);
    } else {
        injectGallerySlides();
    }
})();
