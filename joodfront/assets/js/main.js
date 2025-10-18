// ==========================
// بيانات المنتجات الأساسية
// ==========================
const PRODUCTS = [
  { id: 1, title: 'كرواسون شوكولاتة', price: 7, img: 'assets/img/p1.jpg', desc: 'كرواسون زبدة محشو شوكولاتة.', category: 'croissant' },
  { id: 2, title: 'جاتوه شوكولاتة', price: 12, img: 'assets/img/p2.jpg', desc: 'كيكة شوكولاتة إسفنجية بطبقة موس.', category: 'cakes' },
  { id: 3, title: 'بقلاوة فستق', price: 10, img: 'assets/img/p3.jpg', desc: 'حلويات شرقية بطعم مميز.', category: 'oriental' },
  { id: 4, title: 'كنافة كريمة', price: 15, img: 'assets/img/p4.jpg', desc: 'قِوام مقرمش مع كريمة طازجة.', category: 'oriental' },
  { id: 5, title: 'خبز فرنسي', price: 6, img: 'assets/img/p5.jpg', desc: 'خبز طازج يومي.', category: 'bread' },
  { id: 6, title: 'قهوة عربية', price: 8, img: 'assets/img/p6.jpg', desc: 'مشروب ضيافة.', category: 'drinks' },
  { id: 7, title: 'كوكيز شوكولاتة', price: 9, img: 'assets/img/p7.jpg', desc: 'كوكيز مقرمش بالشوكولاتة.', category: 'cakes' },
  { id: 8, title: 'كرواسون جبنة', price: 7, img: 'assets/img/p8.jpg', desc: 'كرواسون محشو جبنة بيضاء.', category: 'croissant' },
  { id: 9, title: 'تارت فواكه', price: 14, img: 'assets/img/p9.jpg', desc: 'تارت محشو بكريمة الفانيلا والفواكه الطازجة.', category: 'cakes' },
  { id: 10, title: 'بسبوسة فستق', price: 11, img: 'assets/img/p10.jpg', desc: 'بسبوسة طرية مزينة بالفستق.', category: 'oriental' },
];

// ==========================
// العناصر في الصفحة
// ==========================
const featuredGrid = document.getElementById('featuredGrid');
const cartBadge = document.getElementById('cartBadge');
const yearSpan = document.getElementById('year');

// ==========================
// عرض المنتجات
// ==========================
function renderProducts(list) {
  if (!featuredGrid) return;
  featuredGrid.innerHTML = list.map(p => `
    <div class="col-6 col-md-4 col-lg-3 mb-3">
      <div class="card product-card h-100 shadow-sm">
        <img src="${p.img}" class="card-img-top" alt="${p.title}" 
          onerror="this.src='https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=60'">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title mb-1">${p.title}</h6>
          <p class="text-muted small mb-2">${p.desc}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="price">${p.price.toFixed(2)} ر.س</span>
            <button class="btn btn-sm btn-outline-primary" data-id="${p.id}" data-action="quick">عرض سريع</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================
// عرض سريع (Quick View Modal)
// ==========================
const quickModal = document.getElementById('quickView');
const quickTitle = document.getElementById('quickTitle');
const quickImg = document.getElementById('quickImg');
const quickDesc = document.getElementById('quickDesc');
const quickPrice = document.getElementById('quickPrice');
const addToCartBtn = document.getElementById('addToCartBtn');

let currentProduct = null;
let cartCount = 0;

featuredGrid?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="quick"]');
  if (!btn) return;
  const product = PRODUCTS.find(p => p.id === Number(btn.dataset.id));
  if (!product) return;

  currentProduct = product;
  quickTitle.textContent = product.title;
  quickImg.src = product.img;
  quickDesc.textContent = product.desc;
  quickPrice.textContent = `${product.price.toFixed(2)} ر.س`;

  const modal = bootstrap.Modal.getOrCreateInstance(quickModal);
  modal.show();
});

addToCartBtn?.addEventListener('click', () => {
  cartCount += 1;
  cartBadge.textContent = String(cartCount);
  bootstrap.Modal.getOrCreateInstance(quickModal).hide();
});

// ==========================
// الفئات (Categories)
// ==========================
const CATEGORIES = ["croissant", "cakes", "oriental", "bread", "drinks"];
let currentCategoryIndex = 0;

// تفعيل الفئة المحددة في الواجهة
function setActiveCategory(cat) {
  document.querySelectorAll('.cat-tile').forEach(tile => {
    tile.classList.toggle('active', tile.getAttribute('data-category') === cat);
  });
}

// فلترة وعرض حسب الفئة
function filterAndRender(category) {
  const filtered = PRODUCTS.filter(p => p.category === category);
  renderProducts(filtered.length ? filtered : PRODUCTS);
  setActiveCategory(category);
}

// ==========================
// التعامل مع البلاطات (Tiles)
// ==========================
document.querySelectorAll('.cat-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    const cat = tile.getAttribute('data-category');
    if (!cat) return;
    currentCategoryIndex = CATEGORIES.indexOf(cat);
    filterAndRender(cat);
  });
});

// ==========================
// السلايدر (الأزرار Prev / Next)
// ==========================
const nextBtn = document.getElementById("nextCategory");
const prevBtn = document.getElementById("prevCategory");

nextBtn?.addEventListener("click", () => {
  currentCategoryIndex = (currentCategoryIndex + 1) % CATEGORIES.length;
  const nextCat = CATEGORIES[currentCategoryIndex];
  filterAndRender(nextCat);
});

prevBtn?.addEventListener("click", () => {
  currentCategoryIndex = (currentCategoryIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
  const prevCat = CATEGORIES[currentCategoryIndex];
  filterAndRender(prevCat);
});

// ==========================
// عند التحميل الأول
// ==========================
filterAndRender(CATEGORIES[currentCategoryIndex]);

// ==========================
// تحديث السنة في الفوتر
// ==========================
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
