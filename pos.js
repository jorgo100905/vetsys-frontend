// CATÁLOGO DE PRODUCTOS Y SERVICIOS EN MEMORIA
const productosPos = [
    { id: 101, codigo: "SERV-01", nombre: "Consulta Médica General", categoria: "SERVICIOS", precio: 350.00, stock: 999 },
    { id: 102, codigo: "SERV-02", nombre: "Vacuna Quíntuple Cánina", categoria: "SERVICIOS", precio: 280.00, stock: 999 },
    { id: 1, codigo: "75010001", nombre: "Meloxicam Gotas 10ml", categoria: "MEDICAMENTO", precio: 160.00, stock: 12 },
    { id: 2, codigo: "75010002", nombre: "Simparica Trio 10-20kg", categoria: "MEDICAMENTO", precio: 380.00, stock: 3 },
    { id: 4, codigo: "75010004", nombre: "Alimento Royal Canin 2Kg", categoria: "ALIMENTO", precio: 680.00, stock: 8 },
    { id: 5, codigo: "75010005", nombre: "Shampoo Antiséptico", categoria: "ACCESORIO", precio: 220.00, stock: 15 }
];

let carrito = [];
let categoriaActual = 'TODOS';

// Inicializar vista
function initPOS() {
    renderProductos(productosPos);
}

// Renderizar tarjetas de productos
function renderProductos(items) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    items.forEach(p => {
        const card = `
            <div class="product-card" onclick="agregarAlCarrito(${p.id})">
                <div class="prod-title">${p.nombre}</div>
                <div class="prod-stock">Stock: ${p.stock === 999 ? '∞' : p.stock}</div>
                <div class="prod-price">$${p.precio.toFixed(2)}</div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// Filtrar por categoría
function filtrarCategoria(cat) {
    categoriaActual = cat;
    document.querySelectorAll('.pill').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const filtrados = (cat === 'TODOS') 
        ? productosPos 
        : productosPos.filter(p => p.categoria === cat);
    
    renderProductos(filtrados);
}

// Agregar item al carrito
function agregarAlCarrito(id) {
    const prod = productosPos.find(p => p.id === id);
    const itemExistente = carrito.find(item => item.id === id);

    if (itemExistente) {
        if (itemExistente.cantidad < prod.stock) {
            itemExistente.cantidad++;
        } else {
            alert('Límite de stock alcanzado para este producto.');
        }
    } else {
        carrito.push({
            id: prod.id,
            nombre: prod.nombre,
            precio: prod.precio,
            cantidad: 1
        });
    }

    renderCarrito();
}

// Renderizar tabla del carrito
function renderCarrito() {
    const tbody = document.getElementById('cartTableBody');
    tbody.innerHTML = '';

    let subtotalNeto = 0;

    carrito.forEach((item, index) => {
        const itemSubtotal = item.precio * item.cantidad;
        subtotalNeto += itemSubtotal;

        const row = `
            <tr>
                <td>${item.nombre}</td>
                <td>
                    <input type="number" value="${item.cantidad}" min="1" style="width:40px;" onchange="actualizarCantidad(${index}, this.value)">
                </td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>$${itemSubtotal.toFixed(2)}</td>
                <td><button class="btn-remove" onclick="eliminarDelCarrito(${index})">✕</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Cálculos de Totales
    const subtotal = subtotalNeto / 1.16;
    const iva = subtotalNeto - subtotal;
    const total = subtotalNeto;

    document.getElementById('lblSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('lblIva').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('lblTotal').textContent = `$${total.toFixed(2)}`;

    calcularCambio();
}

function actualizarCantidad(index, cant) {
    const cantidad = parseInt(cant);
    if (cantidad > 0) {
        carrito[index].cantidad = cantidad;
        renderCarrito();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    renderCarrito();
}

function calcularCambio() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const pagaCon = parseFloat(document.getElementById('inputPagaCon').value) || 0;
    const cambio = pagaCon - total;

    const lblCambio = document.getElementById('lblCambio');
    lblCambio.textContent = `$${cambio > 0 ? cambio.toFixed(2) : '0.00'}`;
}

function toggleEfectivoInput() {
    const metodo = document.getElementById('metodoPago').value;
    const groupPaga = document.getElementById('groupPagaCon');
    const groupCambio = document.getElementById('groupCambio');

    if (metodo === 'Efectivo') {
        groupPaga.style.display = 'block';
        groupCambio.style.display = 'flex';
    } else {
        groupPaga.style.display = 'none';
        groupCambio.style.display = 'none';
    }
}

// Procesar Venta y Generar Comprobante
function procesarVenta() {
    if (carrito.length === 0) {
        alert('El carrito de compras está vacío.');
        return;
    }

    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const metodo = document.getElementById('metodoPago').value;
    const pagaCon = parseFloat(document.getElementById('inputPagaCon').value) || 0;

    if (metodo === 'Efectivo' && pagaCon < total) {
        alert('El monto ingresado es menor al total a pagar.');
        return;
    }

    // Llenar Modal de Ticket
    const clienteSelect = document.getElementById('clienteSelect');
    document.getElementById('ticketFechaHora').textContent = `Fecha: ${new Date().toLocaleString()}`;
    document.getElementById('ticketCliente').textContent = `Cliente: ${clienteSelect.options[clienteSelect.selectedIndex].text}`;

    let itemsHtml = '';
    carrito.forEach(i => {
        itemsHtml += `<p>${i.cantidad}x ${i.nombre} - $${(i.precio * i.cantidad).toFixed(2)}</p>`;
    });
    document.getElementById('ticketBodyItems').innerHTML = itemsHtml;
    document.getElementById('ticketTotal').textContent = `TOTAL: $${total.toFixed(2)}`;
    document.getElementById('ticketPagoMetodo').textContent = `Método: ${metodo}`;

    document.getElementById('modalTicket').classList.add('active');
}

function cerrarTicket() {
    document.getElementById('modalTicket').classList.remove('active');
    carrito = [];
    renderCarrito();
    document.getElementById('inputPagaCon').value = '';
}

// Búsqueda en tiempo real
document.getElementById('posSearchInput').addEventListener('keyup', (e) => {
    const q = e.target.value.toLowerCase();
    const filtrados = productosPos.filter(p => p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q));
    renderProductos(filtrados);
});

window.onload = initPOS;