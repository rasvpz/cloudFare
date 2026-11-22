import { PRODUCTS } from '../data/products.js';
import { formatINR, formatPoints } from '../utils/formatters.js';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export function renderProductSlider(host) {
  host.innerHTML = `
    <div class="cf-section-title">
      <h2>Featured Products</h2>
      <span class="cf-link">Discover products and collect more points.</span>
    </div>
    <div class="cf-swiper">
      <div class="swiper" id="cf-products-swiper">
        <div class="swiper-wrapper">
          ${PRODUCTS.map((p) => `
            <div class="swiper-slide">
              <article class="cf-product-card" data-product="${p.id}">
                <div class="cf-product-img">
                  <span class="cf-product-badge">${p.badge}</span>
                  <img src="${p.image}" alt="${p.name}" loading="lazy" />
                </div>
                <div class="cf-product-body">
                  <div class="cf-product-category">${p.category}</div>
                  <div class="cf-product-name">${p.name}</div>
                  <div class="cf-product-meta">
                    <div class="cf-product-price">${formatINR(p.price)}</div>
                    <div class="cf-product-pts"><i class="bi bi-star-fill"></i> ${formatPoints(p.points)} pts</div>
                  </div>
                  <button class="cf-product-btn" type="button">View Details</button>
                </div>
              </article>
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </div>`;
  new Swiper('#cf-products-swiper', {
    modules: [Pagination],
    slidesPerView: 1.2,
    spaceBetween: 12,
    grabCursor: true,
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      480: { slidesPerView: 1.6 },
      640: { slidesPerView: 2.2 },
      900: { slidesPerView: 2.6 },
    },
  });
}