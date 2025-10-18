/* script.js
   يدير: تحميل products.json + عرض المنتجات + البحث + الفلترة + pagination + Quick View
*/

const PRODUCTS_URL = 'assets/js/products.json';
const PRODUCTS_PER_PAGE = 9;

let ALL_PRODUCTS = [];
let filteredProducts = [];
let currentPage = 1;
let cartCount = 0;

// UI elements
const featuredGrid = document.getElementById('featuredGrid');
const paginationEl = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const productsInfo = document.getElementById('productsInfo');
const cartBadge = document.getElementById('cartBadge');
const yearSpan = document.getElementById('year') || null;

// Helper: fetch products.json
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_URL, {cache: "no-store"});
    if (!res.ok) throw new Error('Failed to load products.json');
    const data = await res.json();
    ALL_PRODUCTS = Array.isArray(data) ? data : [];
    initCategoryOptions();
    
    // Check for category parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam && categoryParam !== 'all') {
      categorySelect.value = categoryParam;
    }
    
    applyFiltersAndRender();
  } catch (err) {
    console.error(err);
    featuredGrid.innerHTML = `<div class="col-12"><div class="alert alert-danger">خطأ في تحميل المنتجات. تأكد من تشغيل الصفحة عبر سيرفر محلي.</div></div>`;
  }
}

// Populate category select from data
function initCategoryOptions() {
  const cats = new Set(ALL_PRODUCTS.map(p => p.category));
  // ensure "all" exists
  categorySelect.innerHTML = `<option value="all">الكل</option>`;
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = categoryLabel(c);
    categorySelect.appendChild(opt);
  });
}

// mapping category code to label (Arabic)
function categoryLabel(code){
  const map = {
    "cakes":"كيك",
    "donuts":"دونات",
    "cookies":"كوكيز",
    "tarts":"ميني تارت",
    "croissant":"معجنات",
    "bread":"خبز",
    "drinks":"مشروبات"
  };
  return map[code] || code;
}

// Apply search + category then render
function applyFiltersAndRender(){
  const q = (searchInput?.value || '').trim().toLowerCase();
  const cat = (categorySelect?.value || 'all');

  filteredProducts = ALL_PRODUCTS.filter(p => {
    const matchQuery = q === '' || p.title.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q));
    const matchCat = cat === 'all' || p.category === cat;
    return matchQuery && matchCat;
  });

  currentPage = 1;
  renderProductsPage();
  renderPagination();
  updateProductsInfo();
}

// Render info text
function updateProductsInfo(){
  const total = filteredProducts.length;
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const end = Math.min(currentPage * PRODUCTS_PER_PAGE, total);
  if(total === 0){
    productsInfo.textContent = 'لا يوجد منتجات مطابقة للبحث أو الفلتر.';
  } else {
    productsInfo.textContent = `عرض ${start} - ${end} من ${total} نتيجة`;
  }
}

// Render page of products
function renderProductsPage(){
  if(!featuredGrid) return;
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageItems = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  featuredGrid.innerHTML = pageItems.map(p => `
    <div class="col-lg-4 col-md-6 col-sm-6">
      <div class="card product-card h-100">
        <div class="product-image">
          <img src="${p.img}" class="card-img-top" alt="${escapeHtml(p.title)}" onerror="this.src='https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=900&q=60'">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(p.title)}</h5>
          <p class="card-text text-muted">${escapeHtml(p.desc)}</p>
          <div class="stock-status mb-2">
            <span class="stock-text ${p.inStock ? 'text-success' : 'text-danger'}">
              <i class="bi bi-${p.inStock ? 'check-circle-fill' : 'x-circle-fill'} me-1"></i>
              ${p.inStock ? 'متوفر' : 'نفد المخزون'}
            </span>
          </div>
          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="price">${formatPrice(p.price)}</span>
              <div class="rating">
                <i class="bi bi-star-fill text-warning"></i>
                <i class="bi bi-star-fill text-warning"></i>
                <i class="bi bi-star-fill text-warning"></i>
                <i class="bi bi-star-fill text-warning"></i>
                <i class="bi bi-star-fill text-warning"></i>
              </div>
            </div>
            <div class="d-flex gap-2">
              <a href="product-details.html?id=${p.id}" class="btn btn-outline-primary flex-grow-1">
                <i class="bi bi-eye"></i>
              </a>
              <button class="btn btn-primary flex-grow-1" data-id="${p.id}" data-action="add" ${!p.inStock ? 'disabled' : ''}>${p.inStock ? 'أضف للسلة' : 'نفد المخزون'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// pagination render
function renderPagination(){
  if(!paginationEl) return;
  const total = filteredProducts.length;
  const pages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));
  const arr = [];

  // previous
  arr.push(`<li class="page-item ${currentPage===1?'disabled':''}"><a class="page-link" href="#" data-page="${currentPage-1}" aria-label="السابق">&laquo;</a></li>`);

  // show up to 7 page numbers with mid truncation
  const maxToShow = 7;
  let start = 1, end = pages;
  if(pages > maxToShow){
    const mid = Math.floor(maxToShow/2);
    if(currentPage <= mid){
      start = 1; end = maxToShow;
    } else if(currentPage >= pages - mid){
      start = pages - maxToShow + 1; end = pages;
    } else {
      start = currentPage - mid; end = currentPage + mid;
    }
  }
  for(let i=start;i<=end;i++){
    arr.push(`<li class="page-item ${i===currentPage?'active':''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`);
  }

  // next
  arr.push(`<li class="page-item ${currentPage===pages?'disabled':''}"><a class="page-link" href="#" data-page="${currentPage+1}" aria-label="التالي">&raquo;</a></li>`);

  paginationEl.innerHTML = arr.join('');
}

// utilities
function formatPrice(v){ return (Number(v) || 0).toFixed(2) + ' ج.م'; }
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// event delegation for product buttons & pagination
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-action="add"]');
  if(addBtn){
    const id = Number(addBtn.dataset.id);
    addToCartById(id);
    return e.preventDefault();
  }
  const pageLink = e.target.closest('#pagination a.page-link');
  if(pageLink){
    const page = Number(pageLink.dataset.page);
    if(!isNaN(page) && page>=1){
      // clamp
      const maxPage = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
      currentPage = Math.min(Math.max(1,page), maxPage);
      renderProductsPage();
      renderPagination();
      updateProductsInfo();
    }
    return e.preventDefault();
  }
});


// add to cart
function addToCartById(id){
  const product = ALL_PRODUCTS.find(p => p.id === id);
  if(!product || !product.inStock) {
    // Show notification for out of stock
    alert('عذراً، هذا المنتج غير متوفر حالياً');
    return;
  }
  
  cartCount++;
  if(cartBadge) cartBadge.textContent = String(cartCount);
  // small visual feedback (optional)
  const btn = document.querySelector(`[data-action="add"][data-id="${id}"]`);
  if(btn){
    btn.classList.add('btn-success');
    setTimeout(()=>btn.classList.remove('btn-success'),700);
  }
}


// search + filter events
searchInput?.addEventListener('input', debounce(()=> applyFiltersAndRender(), 240));
categorySelect?.addEventListener('change', ()=> applyFiltersAndRender());

// set year
if(yearSpan) yearSpan.textContent = new Date().getFullYear();

// initial load
loadProducts();

// small debounce helper
function debounce(fn, wait=200){
  let t;
  return function(...args){ clearTimeout(t); t = setTimeout(()=>fn.apply(this,args), wait); }
}
