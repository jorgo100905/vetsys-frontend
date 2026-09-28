// SIMULACIÓN DE CATÁLOGO DE PRODUCTOS (POSTGRESQL PRODUCTOS)
let productos = [
    { id: 1, codigo: "75010001", nombre: "Meloxicam Gotas 10ml", categoria: "MEDICAMENTO", pCompra: 85.00, pVenta: 160.00, stock: 12, minStock: 5 },
    { id: 2, codigo: "75010002", nombre: "Simparica Trio 10-20kg", categoria: "MEDICAMENTO", pCompra: 210.00, pVenta: 380.00, stock: 3, minStock: 5 },
    { id: 3, codigo: "75010003", nombre: "Amoxicilina + Clavulánico 250mg", categoria: "MEDICAMENTO", pCompra: 95.00, pVenta: 190.00, stock: 2, minStock: 6 },
    { id: 4, codigo: "75010004", nombre: "Alimento Royal Canin Gastrointestinal 2Kg", categoria: "ALIMENTO", pCompra: 450.00, pVenta: 680.00, stock: 8, minStock: 3 },
    { id: 5, codigo: "75010005", nombre: "Shampoo Antiséptico Chlorhexidine", categoria: "ACCESORIO", pCompra: 110.00, pVenta: 220.00, stock: 15, minStock: 4 }
];

// Cargar catálogo e indicadores al iniciar
function initInventario() {
    renderInventario(productos);
    actualizarMetricas();
}

// Renderizado dinámico de la tabla de inventario
function renderInventario(data) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    data.forEach(p => {
        const esBajoStock = p.stock <= p.minStock;
        const rowClass = esBajoStock ? 'row-warning' : '';
        const badgeState = esBajoStock 
            ? `<span class="stock-badge critical">⚠️ Reponer (${p.stock})</span>` 
            : `<span class="stock-badge ok">Óptimo</span>`;

        const row = `
            <tr class="${rowClass}">
                <td><code>${p.codigo}</code></td>
                <td><strong>${p.nombre}</strong></td>
                <td><span class="badge">${p.categoria}</span></td>
                <td>$${p.pCompra.toFixed(2)}</td>
                <td><strong>$${p.pVenta.toFixed(2)}</strong></td>
                <td><strong>${p.stock}</strong> u.</td>
                <td>${p.minStock} u.</td>
                <td>${badgeState}</td>
                <td>
                    <button class="btn-action" onclick="surtirStock(${p.id})">➕ Surtir</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Actualización de indicadores superiores
function actualizarMetricas() {
    document.getElementById('totalProductsCount').textContent = productos.length;
    
    const bajos = productos.filter(p => p.stock <= p.minStock).length;
    document.getElementById('lowStockCount').textContent = bajos;

    const meds = productos.filter(p => p.categoria === 'MEDICAMENTO').length;
    document.getElementById('medsCount').textContent = meds;
}

// Filtro en tiempo real por búsqueda, categoría o stock crítico
function filtrarProductos() {
    const query = document.getElementById('inventorySearchInput').value.toLowerCase();
    const cat = document.getElementById('filterCategory').value;
    const soloBajoStock = document.getElementById('checkLowStock').checked;

    const filtrados = productos.filter(p => {
        const coincideQuery = p.nombre.toLowerCase().includes(query) || p.codigo.includes(query);
        const coincideCat = (cat === 'TODOS' || p.categoria === cat);
        const coincideStock = soloBajoStock ? (p.stock <= p.minStock) : true;

        return coincideQuery && coincideCat && coincideStock;
    });

    renderInventario(filtrados);
}

document.getElementById('inventorySearchInput').addEventListener('keyup', filtrarProductos);

// Manejo del Modal de Producto
function abrirModalProducto() {
    document.getElementById('modalProducto').classList.add('active');
}

function cerrarModalProducto() {
    document.getElementById('modalProducto').classList.remove('active');
    document.getElementById('productForm').reset();
}

// Guardar nuevo producto
function guardarProducto(e) {
    e.preventDefault();

    const nuevoProd = {
        id: productos.length + 1,
        codigo: document.getElementById('prodCodigo').value,
        nombre: document.getElementById('prodNombre').value,
        categoria: document.getElementById('prodCategoria').value,
        pCompra: parseFloat(document.getElementById('prodPrecioCompra').value),
        pVenta: parseFloat(document.getElementById('prodPrecioVenta').value),
        stock: parseInt(document.getElementById('prodStock').value),
        minStock: parseInt(document.getElementById('prodStockMin').value)
    };

    productos.push(nuevoProd);
    initInventario();
    cerrarModalProducto();
    alert('¡Producto agregado al inventario exitosamente!');
}

// Incremento rápido de stock (Surtir)
function surtirStock(id) {
    const prod = productos.find(p => p.id === id);
    if (prod) {
        const cantidad = prompt(`Ingrese la cantidad de unidades a ingresar para ${prod.nombre}:`, "10");
        if (cantidad && !isNaN(cantidad)) {
            prod.stock += parseInt(cantidad);
            initInventario();
        }
    }
}

window.onload = initInventario;