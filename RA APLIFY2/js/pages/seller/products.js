// ========================== //
// Seller - Products           //
// ========================== //

function renderSellerProducts(container) {
    const user = DataStore.getCurrentUser();
    const stores = DataStore.getStoresByOwner(user?.id || '');
    const store = stores[0];
    if (!store) return;

    const products = DataStore.getProductsByStore(store.id);

    // Group by category
    const categories = {};
    products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
    });

    container.innerHTML = `
        ${UI.renderHeader('Products', {
            showBack: false,
            actions: `<button class="btn btn-primary btn-sm" onclick="showAddProductModal('${store.id}')" id="btn-add-product">${Icons.plus} Add</button>`
        })}

        <div class="page-content">
            <!-- Stats -->
            <div style="display:flex;gap:var(--space-3);padding:var(--space-4);overflow-x:auto">
                <div style="background:var(--primary-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:100px;text-align:center">
                    <div class="font-bold text-primary">${products.length}</div>
                    <div class="text-xs text-muted">Total</div>
                </div>
                <div style="background:var(--success-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:100px;text-align:center">
                    <div class="font-bold text-success">${products.filter(p => p.available).length}</div>
                    <div class="text-xs text-muted">Available</div>
                </div>
                <div style="background:var(--error-50);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);min-width:100px;text-align:center">
                    <div class="font-bold text-error">${products.filter(p => !p.available).length}</div>
                    <div class="text-xs text-muted">Unavailable</div>
                </div>
            </div>

            <!-- Products List -->
            <div style="padding:0 var(--space-4)">
                ${Object.entries(categories).map(([cat, prods]) => `
                    <div class="section-title" style="padding-left:0;font-size:var(--font-base)">${cat} (${prods.length})</div>
                    ${prods.map(p => `
                        <div class="product-manage-card" id="pm-${p.id}">
                            <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--gradient-primary-soft);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
                                ${p.emoji}
                            </div>
                            <div class="product-manage-info">
                                <div class="product-manage-name">${p.name}</div>
                                <div class="product-manage-price">${Utils.formatPrice(p.price)}</div>
                                <div class="product-manage-category">
                                    Stock: ${p.inventory} units •
                                    <span style="color:${p.available ? 'var(--success-500)' : 'var(--error-500)'}">${p.available ? 'Available' : 'Unavailable'}</span>
                                </div>
                            </div>
                            <div class="product-manage-actions">
                                <label class="toggle-switch">
                                    <input type="checkbox" ${p.available ? 'checked' : ''} onchange="toggleProductAvailability('${p.id}', this.checked)">
                                    <span class="toggle-slider"></span>
                                </label>
                                <button class="header-icon-btn" onclick="showEditProductModal('${p.id}')" style="width:32px;height:32px">
                                    ${Icons.edit}
                                </button>
                                <button class="header-icon-btn" onclick="deleteProduct('${p.id}')" style="width:32px;height:32px;color:var(--error-400)">
                                    ${Icons.trash}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                `).join('')}

                ${products.length === 0 ? UI.renderEmpty(Icons.package, 'No products yet', 'Add your first product to start selling', `<button class="btn btn-primary" onclick="showAddProductModal('${store.id}')">Add Product</button>`) : ''}
            </div>
        </div>

        ${UI.renderSellerNav('products')}
    `;
}

function showAddProductModal(storeId) {
    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Product Name *</label>
            <input type="text" class="input-field" id="prod-name" placeholder="e.g., Tata Salt (1kg)">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Price (₹) *</label>
            <input type="number" class="input-field" id="prod-price" placeholder="e.g., 28">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Category *</label>
            <input type="text" class="input-field" id="prod-category" placeholder="e.g., Essentials, Snacks">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Emoji Icon</label>
            <input type="text" class="input-field" id="prod-emoji" placeholder="e.g., 🧂" value="📦">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Inventory Quantity</label>
            <input type="number" class="input-field" id="prod-inventory" placeholder="e.g., 50" value="10">
        </div>
        <div class="flex items-center justify-between mb-4">
            <span class="input-label">Available for Sale</span>
            <label class="toggle-switch">
                <input type="checkbox" id="prod-available" checked>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <button class="btn btn-primary btn-block" onclick="addProduct('${storeId}')" id="btn-save-product">Add Product</button>
    `;
    UI.showModal(content, { title: 'Add New Product' });
}

function addProduct(storeId) {
    const name = document.getElementById('prod-name')?.value?.trim();
    const price = parseFloat(document.getElementById('prod-price')?.value);
    const category = document.getElementById('prod-category')?.value?.trim();
    const emoji = document.getElementById('prod-emoji')?.value?.trim() || '📦';
    const inventory = parseInt(document.getElementById('prod-inventory')?.value) || 0;
    const available = document.getElementById('prod-available')?.checked;

    if (!name || !price || !category) {
        UI.showToast('Please fill all required fields', 'error');
        return;
    }

    DataStore.createProduct({
        store_id: storeId,
        name, price, category, emoji, inventory, available
    });

    UI.closeModal();
    UI.showToast('Product added!', 'success');
    renderSellerProducts(document.getElementById('app-content'));
}

function showEditProductModal(productId) {
    const p = DataStore.getProduct(productId);
    if (!p) return;

    const content = `
        <div class="input-group mb-4">
            <label class="input-label">Product Name</label>
            <input type="text" class="input-field" id="edit-prod-name" value="${p.name}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Price (₹)</label>
            <input type="number" class="input-field" id="edit-prod-price" value="${p.price}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Category</label>
            <input type="text" class="input-field" id="edit-prod-category" value="${p.category}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Emoji Icon</label>
            <input type="text" class="input-field" id="edit-prod-emoji" value="${p.emoji}">
        </div>
        <div class="input-group mb-4">
            <label class="input-label">Inventory Quantity</label>
            <input type="number" class="input-field" id="edit-prod-inventory" value="${p.inventory}">
        </div>
        <button class="btn btn-primary btn-block" onclick="saveProductEdit('${productId}')" id="btn-update-product">Update Product</button>
    `;
    UI.showModal(content, { title: 'Edit Product' });
}

function saveProductEdit(productId) {
    const name = document.getElementById('edit-prod-name')?.value?.trim();
    const price = parseFloat(document.getElementById('edit-prod-price')?.value);
    const category = document.getElementById('edit-prod-category')?.value?.trim();
    const emoji = document.getElementById('edit-prod-emoji')?.value?.trim();
    const inventory = parseInt(document.getElementById('edit-prod-inventory')?.value) || 0;

    if (!name || !price) {
        UI.showToast('Name and price are required', 'error');
        return;
    }

    DataStore.updateProduct(productId, { name, price, category, emoji, inventory });
    UI.closeModal();
    UI.showToast('Product updated!', 'success');
    renderSellerProducts(document.getElementById('app-content'));
}

function toggleProductAvailability(productId, available) {
    DataStore.updateProduct(productId, { available });
    UI.showToast(available ? 'Product is now available' : 'Product marked as unavailable', available ? 'success' : 'warning');
}

function deleteProduct(productId) {
    UI.confirm('Delete Product', 'Are you sure you want to delete this product? This cannot be undone.', () => {
        DataStore.deleteProduct(productId);
        UI.showToast('Product deleted', 'success');
        renderSellerProducts(document.getElementById('app-content'));
    });
}
