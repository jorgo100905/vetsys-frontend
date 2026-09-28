// ==========================================================================
// MÓDULO DE CONSULTAS MÉDICAS Y RECETAS
// ==========================================================================

let pacienteSeleccionadoId = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener ID de la URL si se llegó desde el botón "Nueva Consulta"
    const urlParams = new URLSearchParams(window.location.search);
    pacienteSeleccionadoId = urlParams.get('id');

    cargarSelectPacientes();
});

// Cargar la lista de pacientes desde la API para llenar el <select>
async function cargarSelectPacientes() {
    const select = document.getElementById('selectPaciente');
    try {
        const pacientes = await API.get('expedientes');
        select.innerHTML = '<option value="" disabled selected>Seleccione un paciente...</option>';
        
        pacientes.forEach(p => {
            const opcion = document.createElement('option');
            opcion.value = p.idMascota;
            // Guardamos el texto completo para usarlo en la receta
            opcion.dataset.nombreCompleto = `${p.mascotaNombre} (${p.mascotaEspecie}) | Dueño: ${p.duenoNombre} ${p.duenoApellido}`;
            opcion.textContent = opcion.dataset.nombreCompleto;
            
            if (pacienteSeleccionadoId && p.idMascota == pacienteSeleccionadoId) {
                opcion.selected = true;
            }
            select.appendChild(opcion);
        });
    } catch (error) {
        select.innerHTML = '<option value="" disabled>Error de conexión. API inactiva.</option>';
    }
}

// INYECCIÓN Y LANZAMIENTO DE IMPRESIÓN
function imprimirReceta() {
    // 1. Extraer datos actuales del formulario
    const select = document.getElementById('selectPaciente');
    if (select.selectedIndex <= 0) {
        alert("Por favor seleccione un paciente antes de imprimir.");
        return;
    }

    const pacienteTexto = select.options[select.selectedIndex].dataset.nombreCompleto;
    const peso = document.getElementById('peso').value || "---";
    const temp = document.getElementById('temp').value || "---";
    const tratamiento = document.getElementById('tratamiento').value;

    if (!tratamiento.trim()) {
        alert("El campo de Tratamiento / Receta está vacío.");
        return;
    }

    // 2. Inyectar datos en la plantilla oculta
    document.getElementById('printFecha').textContent = new Date().toLocaleDateString('es-MX');
    document.getElementById('printPaciente').textContent = pacienteTexto;
    document.getElementById('printPeso').textContent = peso;
    document.getElementById('printTemp').textContent = temp;
    document.getElementById('printTratamiento').textContent = tratamiento;

    // 3. Ejecutar la ventana de impresión del navegador
    window.print();
}

// GUARDAR LA CONSULTA EN POSTGRESQL
async function guardarConsulta(e) {
    e.preventDefault();

    const dto = {
        idPaciente: document.getElementById('selectPaciente').value,
        peso: parseFloat(document.getElementById('peso').value),
        temperatura: parseFloat(document.getElementById('temp').value),
        frecuenciaCardiaca: parseInt(document.getElementById('fc').value) || null,
        frecuenciaRespiratoria: parseInt(document.getElementById('fr').value) || null,
        motivo: document.getElementById('motivo').value,
        diagnostico: document.getElementById('diagnostico').value,
        tratamiento: document.getElementById('tratamiento').value,
        fecha: new Date().toISOString()
    };

    try {
        await API.post('consultas', dto);
        alert('¡Consulta médica guardada correctamente!');
        window.location.href = `historial.html?id=${dto.idPaciente}`;
    } catch (error) {
        alert("Modo Desarrollo: El frontend intentó guardar, pero falta levantar la API C#.");
    }
}