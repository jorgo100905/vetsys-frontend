// ==========================================================================
// MÓDULO DE EXPEDIENTES Y RECEPCIÓN
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    cargarExpedientes();
});

// 1. Cargar la tabla desde la API o mostrar estado vacío
async function cargarExpedientes(query = "") {
    const tbody = document.getElementById('patientTableBody');
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#718096;">⏳ Cargando expedientes...</td></tr>`;

    try {
        const endpoint = query ? `expedientes/buscar?query=${encodeURIComponent(query)}` : 'expedientes';
        const expedientes = await API.get(endpoint);

        renderTablaExpedientes(expedientes);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#e53e3e;">⚠️ Sin conexión con la API C#. Asegúrate de ejecutar Visual Studio (F5).</td></tr>`;
    }
}

// 2. Renderizar filas de forma dinámica
function renderTablaExpedientes(lista) {
    const tbody = document.getElementById('patientTableBody');
    tbody.innerHTML = '';

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#718096;">No se encontraron expedientes registrados.</td></tr>`;
        return;
    }

    lista.forEach(exp => {
        const badgeEspecie = exp.mascotaEspecie === 'Perro' ? 'badge-dog' : (exp.mascotaEspecie === 'Gato' ? 'badge-cat' : '');
        
        const row = `
            <tr>
                <td><strong>${exp.codigoExpediente || 'EXP-' + exp.idMascota}</strong></td>
                <td><strong>${exp.mascotaNombre}</strong></td>
                <td><span class="badge ${badgeEspecie}">${exp.mascotaEspecie}</span> ${exp.mascotaRaza || ''}</td>
                <td>${exp.duenoNombre} ${exp.duenoApellido}</td>
                <td>${exp.duenoTelefono}</td>
                <td>
                    <a href="historial.html?id=${exp.idMascota}" class="btn-action">📋 Historial</a>
                    <a href="consulta.html?id=${exp.idMascota}" class="btn-action" style="background-color: #ebf8ff; color: #2b6cb0;">🩺 Consulta</a>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// 3. Registrar expediente en el formulario
async function guardarExpediente(e) {
    e.preventDefault();

    const dto = {
        duenoNombre: document.getElementById('duenoNombre').value.trim(),
        duenoApellido: document.getElementById('duenoApellido').value.trim(),
        duenoTelefono: document.getElementById('duenoTelefono').value.trim(),
        duenoCorreo: document.getElementById('duenoCorreo')?.value.trim() || "",
        duenoDireccion: document.getElementById('duenoDireccion')?.value.trim() || "",
        mascotaNombre: document.getElementById('mascotaNombre').value.trim(),
        mascotaEspecie: document.getElementById('mascotaEspecie').value,
        mascotaRaza: document.getElementById('mascotaRaza')?.value.trim() || "",
        mascotaSexo: document.getElementById('mascotaSexo')?.value || "M",
        mascotaFechaNac: document.getElementById('mascotaEdad')?.value || null
    };

    try {
        const respuesta = await API.post('expedientes', dto);
        alert(`¡Expediente registrado con éxito!`);
        document.getElementById('expedienteForm').reset();
        switchTab('buscar');
        cargarExpedientes();
    } catch (err) {
        alert("Ocurrió un error al intentar guardar en la base de datos.");
    }
}

// 4. Cambiar entre pestañas
function switchTab(tabName) {
    const tabBuscar = document.getElementById('tab-buscar');
    const tabNuevo = document.getElementById('tab-nuevo');
    const btns = document.querySelectorAll('.tab-btn');

    if (tabName === 'buscar') {
        tabBuscar.style.display = 'block';
        tabNuevo.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else if (tabName === 'nuevo') {
        tabBuscar.style.display = 'none';
        tabNuevo.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}