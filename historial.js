// ==========================================================================
// MÓDULO DE HISTORIAL CLÍNICO Y CARNET
// ==========================================================================

let pacienteIdActual = null;

document.addEventListener("DOMContentLoaded", () => {
    // Extraer el ID del paciente desde la URL (ej. historial.html?id=5)
    const urlParams = new URLSearchParams(window.location.search);
    pacienteIdActual = urlParams.get('id');

    if (pacienteIdActual) {
        document.getElementById('btnNuevaConsulta').href = `consulta.html?id=${pacienteIdActual}`;
        cargarDatosPaciente(pacienteIdActual);
        cargarConsultas(pacienteIdActual);
        cargarVacunas(pacienteIdActual);
        cargarDesparasitantes(pacienteIdActual);
    } else {
        alert("No se especificó un paciente. Redirigiendo a búsqueda...");
        window.location.href = 'index.html';
    }

    // Configurar la fecha actual por defecto en el modal
    document.getElementById('aplicacionFecha').valueAsDate = new Date();
});

// Cambiar entre pestañas (Consultas / Vacunas / Desparasitación)
function switchHistorialTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-navigation .tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabId}`).style.display = 'block';
    event.target.classList.add('active');
}

// 1. CARGAR DATOS DEL PACIENTE
async function cargarDatosPaciente(id) {
    try {
        const paciente = await API.get(`expedientes/${id}`);
        
        document.getElementById('lblNombrePaciente').textContent = paciente.mascotaNombre;
        document.getElementById('lblEspecie').textContent = paciente.mascotaEspecie;
        document.getElementById('lblDueño').textContent = `${paciente.duenoNombre} ${paciente.duenoApellido}`;
        document.getElementById('lblTelefono').textContent = paciente.duenoTelefono;
        document.getElementById('lblRaza').textContent = paciente.mascotaRaza || 'N/A';
        document.getElementById('lblSexo').textContent = paciente.mascotaSexo === 'M' ? 'Macho' : 'Hembra';
        
        // Asignar emoji según especie
        const avatar = document.getElementById('lblAvatar');
        avatar.textContent = paciente.mascotaEspecie === 'Gato' ? '🐱' : '🐶';
        
    } catch (error) {
        console.error("Error al cargar perfil:", error);
    }
}

// 2. CARGAR CONSULTAS (TIMELINE)
async function cargarConsultas(id) {
    const contenedor = document.getElementById('consultasTimeline');
    try {
        const consultas = await API.get(`consultas/paciente/${id}`);
        
        if (!consultas || consultas.length === 0) {
            contenedor.innerHTML = '<div class="empty-state">No hay consultas registradas para este paciente.</div>';
            return;
        }

        contenedor.innerHTML = ''; // Limpiar estado de carga
        consultas.forEach(c => {
            contenedor.innerHTML += `
                <div class="timeline-item">
                    <div class="timeline-header">
                        <span class="timeline-date">📅 ${new Date(c.fecha).toLocaleDateString()}</span>
                        <span class="badge" style="background-color:#e2e8f0;">Peso: ${c.peso}kg | Temp: ${c.temperatura}°C</span>
                    </div>
                    <div class="timeline-body">
                        <p style="margin-bottom:0.5rem"><strong>Motivo:</strong> ${c.motivo}</p>
                        <p style="margin-bottom:0.5rem"><strong>Diagnóstico:</strong> ${c.diagnostico}</p>
                        <p><strong>Tratamiento:</strong> ${c.tratamiento}</p>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        contenedor.innerHTML = '<div class="empty-state text-muted">Aún no hay conexión con el servidor.</div>';
    }
}

// 3. CARGAR VACUNAS
async function cargarVacunas(id) {
    const tbody = document.getElementById('tablaVacunas');
    try {
        const vacunas = await API.get(`vacunas/paciente/${id}`);
        
        if (!vacunas || vacunas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay vacunas registradas.</td></tr>';
            return;
        }
        
        // Renderizar vacunas reales aquí cuando la API esté conectada
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state text-muted">API no conectada. Esperando datos.</td></tr>';
    }
}

// 4. CARGAR DESPARASITANTES
async function cargarDesparasitantes(id) {
    const tbody = document.getElementById('tablaDesparasitantes');
    try {
        const desparasitantes = await API.get(`desparasitantes/paciente/${id}`);
        
        if (!desparasitantes || desparasitantes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay desparasitaciones registradas.</td></tr>';
            return;
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state text-muted">API no conectada. Esperando datos.</td></tr>';
    }
}

// ==========================================
// CONTROL DEL MODAL DE REGISTRO
// ==========================================
function abrirModalAplicacion(tipo) {
    document.getElementById('modalAplicacion').classList.add('active');
    document.getElementById('modalTituloAplicacion').textContent = `Registrar ${tipo}`;
    document.getElementById('aplicacionTipo').value = tipo;
}

function cerrarModalAplicacion() {
    document.getElementById('modalAplicacion').classList.remove('active');
    document.getElementById('formAplicacion').reset();
}

async function guardarAplicacion(e) {
    e.preventDefault();
    const tipo = document.getElementById('aplicacionTipo').value;
    const dto = {
        idPaciente: pacienteIdActual,
        nombre: document.getElementById('aplicacionNombre').value,
        fecha: document.getElementById('aplicacionFecha').value,
        proximaDosis: document.getElementById('aplicacionProxima').value,
        notas: document.getElementById('aplicacionNotas').value
    };

    try {
        // Lógica condicional según el tipo de aplicación
        const endpoint = tipo === 'Vacuna' ? 'vacunas' : 'desparasitantes';
        await API.post(endpoint, dto);
        
        cerrarModalAplicacion();
        if (tipo === 'Vacuna') cargarVacunas(pacienteIdActual);
        else cargarDesparasitantes(pacienteIdActual);
        
        alert(`¡${tipo} registrada correctamente!`);
    } catch (error) {
        alert("Guardado simulado: Configura el backend para persistir los datos.");
        cerrarModalAplicacion();
    }
}