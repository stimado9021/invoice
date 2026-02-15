document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión
  const nombre = localStorage.getItem("user_name");
  if (!nombre) {
    window.location.href = "index.html";
    return;
  }

  const adminNameElement = document.getElementById("adminName");
  if (adminNameElement) adminNameElement.innerText = nombre;

  // Cargas iniciales
  cargarEstadisticas();
  buscarProductos();
  listarUsuarios();

  // Actualizar estadísticas cada 5 minutos
  setInterval(cargarEstadisticas, 300000);

  // Llamar al cargar la página
  cargarDatosImpuesto();

  cargarHistorialVentas();

  cargarCategorias();
});

/** --- GESTIÓN DE ESTADÍSTICAS --- **/
async function cargarEstadisticas() {
  try {
    const response = await fetch("api/get_stats.php");
    const data = await response.json();

    if (data.error) return console.error(data.error);

    document.getElementById("ventasDia").innerText = formatearMoneda(
      data.diaria,
    );
    document.getElementById("ventasSemana").innerText = formatearMoneda(
      data.semanal,
    );
    document.getElementById("ventasMes").innerText = formatearMoneda(
      data.mensual,
    );
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

/** --- GESTIÓN DE PRODUCTOS --- **/
async function buscarProductos() {
  const inputBusqueda = document.getElementById("busquedaNombre");
  const filtroCat = document.getElementById("filtroCategoria");
  const tablaPro = document.getElementById("tablaProductosBody");

  // Evitar errores si los elementos no existen aún
  const nombrePro = inputBusqueda ? inputBusqueda.value : "";
  const catPro = filtroCat ? filtroCat.value : "";

  try {
    const response = await fetch(
      `api/productos.php?accion=buscar&nombre=${nombrePro}&categoria=${catPro}`,
    );

    const productos = await response.json();
    tablaPro.innerHTML = '';
    productos.forEach((p) => {
      const stockClass = p.stock <= 5 ? "text-danger fw-bold" : "text-white";
      tablaPro.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td class="gold-text fw-bold">${p.nombre}</td>
                    <td>${p.categoria_nombre || "General"}</td>
                    <td>${parseFloat(p.precio).toFixed(2)}</td>
                    <td class="${stockClass}">${p.stock}</td>
                    <td>${p.idDeposito}</td>
                    <td>${p.codigoPro}</td>
                    <td class="d-flex align-items-center gap-1">
                        <button class="btn btn-sm btn-outline-warning me-1" onclick="prepararEdicion(${p.id})">✎</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${p.id})">🗑</button>
                        <button class="btn btn-sm btn-outline-primary"  onclick="abrirModalStock(${p.id}, '${p.nombre}')">
    📦
</button>
                    </td>
                </tr>`;
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function prepararEdicion(id) {
  try {
    const response = await fetch(`api/get_producto.php?id=${id}`);
    const p = await response.json();
    if (p) {
      document.getElementById("p_id").value = p.id;
      document.getElementById("p_nombre").value = p.nombre;
      document.getElementById("p_precio").value = p.precio;
      document.getElementById("p_stock").value = p.stock;
      document.getElementById("p_categoria").value = p.id_categoria;
      document.getElementById("p_idDeposito").value = p.idDeposito;
      document.getElementById("p_codigoPro").value = p.codigoPro;


      document.querySelector("#modalProducto .modal-title").innerText =
        "EDITAR PRODUCTO";
      const myModal = new bootstrap.Modal(
        document.getElementById("modalProducto"),
      );
      myModal.show();
    }
  } catch (error) {
    console.error(error);
  }
}

function prepararNuevoProducto() {
  document.getElementById("formProducto").reset();
  document.getElementById("p_id").value = "";

  document.querySelector("#modalProducto .modal-title").innerText =
    "NUEVO SUMINISTRO";
}

/** --- GESTIÓN DE USUARIOS (El error estaba aquí) --- **/

async function listarUsuarios() {
  try {
    const response = await fetch("api/usuarios.php?accion=leer");
    const usuarios = await response.json();
    const tabla = document.getElementById("tablaUsuariosBody");
    tabla.innerHTML = "";

    usuarios.forEach((u) => {
      
      tabla.innerHTML += `
                <tr>
                    <td class="align-middle">${u.nombre}</td>
                    <td class="align-middle text-warning">${u.correo}</td>
                    <td class="align-middle"><span class="badge ${u.rol === "admin" ? "bg-gold text-dark" : "border border-secondary"}">${u.rol.toUpperCase()}</span></td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-link gold-text" onclick="prepararEdicionUsuario(${u.id})">Editar</button>
                        <button class="btn btn-sm btn-link text-danger" onclick="eliminarUsuario(${u.id})">Borrar</button>
                    </td>
                </tr>`;
    });
  } catch (error) {
    console.error(error);
  }
}

// ESTA ES LA FUNCIÓN QUE TE FALTABA
async function prepararEdicionUsuario(id) {
  try {
    const response = await fetch("api/usuarios.php?accion=leer");
    const usuarios = await response.json();
    const u = usuarios.find((user) => user.id == id);

    if (u) {
      document.getElementById("u_id").value = u.id;
      document.getElementById("u_nombre").value = u.nombre;
      document.getElementById("u_correo").value = u.correo;
      document.getElementById("u_rol").value = u.rol;
      document.getElementById("u_pass").value = ""; // Contraseña vacía por seguridad

      document.querySelector("#modalUsuario .modal-title").innerText =
        "EDITAR ACCESO";
      const myModal = new bootstrap.Modal(
        document.getElementById("modalUsuario"),
      );
      myModal.show();
    }
  } catch (error) {
    console.error("Error al cargar usuario:", error);
  }
}

async function eliminarUsuario(id) {
  if (confirm("¿Eliminar acceso a este usuario?")) {
    // Aquí deberías tener una acción en tu PHP para borrar
    await fetch(`api/usuarios.php?accion=eliminar&id=${id}`, {
      method: "POST",
    });
    listarUsuarios();
  }
}

/** --- EVENTOS DE FORMULARIOS --- **/

document.getElementById("formProducto")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("p_id").value;
    const producto = {
      id,
      nombre: document.getElementById("p_nombre").value,
     precio: parseFloat(document.getElementById("p_precio").value.replace(/[^0-9.-]+/g, "")) || 0,
      stock: document.getElementById("p_stock").value,
      id_categoria: document.getElementById("p_categoria").value,
      deposito: document.getElementById("p_idDeposito").value,
      codigoPro: document.getElementById("p_codigoPro").value,
    };
    console.log(producto);
    const url = id ? "api/actualizar_producto.php" : "api/guardar_producto.php";
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify(producto),
    });
    if (await res.json()) {
      bootstrap.Modal.getInstance(
        document.getElementById("modalProducto"),
      ).hide();
      buscarProductos();
    }
  });

document.getElementById("formUsuario").addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = {
    id: document.getElementById("u_id").value,
    nombre: document.getElementById("u_nombre").value,
    correo: document.getElementById("u_correo").value,
    pass: document.getElementById("u_pass").value,
    rol: document.getElementById("u_rol").value,
  };
  const res = await fetch("api/usuarios.php?accion=guardar", {
    method: "POST",
    body: JSON.stringify(datos),
  });
  if (await res.json()) {
    bootstrap.Modal.getInstance(document.getElementById("modalUsuario")).hide();
    listarUsuarios();
  }
});

/** --- UTILIDADES --- **/
function limpiarFormUsuario() {
  document.getElementById("formUsuario").reset();
  document.getElementById("u_id").value = "";
  document.querySelector("#modalUsuario .modal-title").innerText =
    "NUEVO USUARIO";
}



async function cargarDatosImpuesto() {
  // Cargar el porcentaje actual
  const resActual = await fetch("api/impuestos.php?accion=actual");
  const actual = await resActual.json();
  document.getElementById("input-impuesto").value = actual.porcentaje;

  // Cargar el historial
  const resHistorial = await fetch("api/impuestos.php?accion=historial");
  const historial = await resHistorial.json();
  let html = "";
  historial.forEach((item) => {
    html += `<tr>
            <td>${item.fecha_cambio}</td>
            <td>${item.porcentaje}%</td>
            <td>${item.usuario}</td>
        </tr>`;
  });
  document.getElementById("tabla-historial-impuestos").innerHTML = html;
}

async function guardarImpuesto() {
  const nuevoVal = document.getElementById("input-impuesto").value;
  const adminId = localStorage.getItem("user_id"); // Asegúrate de guardar el ID al loguear

  const res = await fetch("api/impuestos.php", {
    method: "POST",
    body: JSON.stringify({ porcentaje: nuevoVal, usuario_id: adminId }),
  });

  if (res.ok) {
    alert("Impuesto actualizado y registrado en el historial.");
    cargarDatosImpuesto();
  }
}

async function cargarReportes() {
  try {
    // 1. Cargar Resumen (Tarjetas)
    const resResumen = await fetch("api/reportes.php?accion=resumen_hoy");
    const resumen = await resResumen.json();

    document.getElementById("ingresosHoy").textContent =
      `$${parseFloat(resumen.ingresos_totales || 0).toFixed(2)}`;
    document.getElementById("cantidadVentas").textContent =
      resumen.total_ventas;
    document.getElementById("alertaStock").textContent =
      resumen.producto_critico || "Todo ok";

    // 2. Cargar Tabla de Historial
    const resHistorial = await fetch(
      "api/reportes.php?accion=historial_reciente",
    );
    const ventas = await resHistorial.json();

    const tabla = document.getElementById("tablaHistorialVentas");
    tabla.innerHTML = "";

    ventas.forEach((v) => {
      tabla.innerHTML += `
                <tr>
                    <td class="text-white-50 small">${new Date(v.fecha).toLocaleTimeString()}</td>
                    <td class="text-white fw-bold">${v.vendedor}</td>
                    <td class="gold-text fw-bold">$${v.total}</td>
                    <td><button class="btn btn-sm btn-outline-light" onclick="verDetalleVenta(${v.id})">👁️</button></td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error cargando reportes:", error);
  }
}




// Función para cargar historial
async function cargarHistorialVentas() {
  const periodo = document.getElementById("filtroFecha").value;

  try {
    // Enviamos el periodo como parámetro GET
    const response = await fetch(`api/ventas.php?accion=historial&periodo=${periodo}`);
    const data = await response.json();
   
    const cuerpo = document.getElementById("tablaHistorialVentas");
    cuerpo.innerHTML = "";

    if (data.status === "success") {
      data.ventas.forEach((v) => {

       
        const fechaObj = new Date(v.fecha);
        const fecha = fechaObj.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        const hora = fechaObj.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        });

        cuerpo.innerHTML += `
                <tr class="align-middle text-white">
                    <td>${fecha}</td>
                    <td>${hora}</td>
                    <td class="fw-bold text-uppercase">${v.vendedor}</td>
                    <td class="gold-text fw-bold">$${parseFloat(v.total).toFixed(2)}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-warning" onclick="verDetalleVenta(${v.id})">
                            👁️ Ver
                        </button>
                    </td>
                </tr>
            `;
      });
    }
  } catch (error) {
    console.error("Error al filtrar ventas:", error);
  }
}

function cargarCategorias() {
  const select = document.getElementById("filtroCategoria");

  fetch("api/categorias.php")
    .then((response) => response.json())
    .then((data) => {
      // Mantener la opción por defecto
      select.innerHTML = '<option value="">Todas las categorías</option>';

      data.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando categorías:", error));
}


async function verDetalleVenta(idVenta) {
  try {
    const res = await fetch(`api/ventas.php?accion=detalle&id=${idVenta}`);
    const data = await res.json();

    if (data.status === "success") {
      const v = data.venta[0][0];
      const c = data.cliente[0][0];

      // Llenar encabezados
      document.getElementById("det-factura-id").innerText = v.id;
      document.getElementById("det-cliente").textContent = c.cliente_nombre;
      document.getElementById("det-email").textContent = c.email;
      document.getElementById("det-fecha").textContent = v.fecha;
      document.getElementById("det-vendedor").textContent = v.vendedor_nombre;

      // Llenar tabla de productos
      const cuerpo = document.getElementById("tablaDetalleCuerpo");
      cuerpo.innerHTML = "";

      data.productos[0].forEach(p => {
        cuerpo.innerHTML += `
                    <tr>
                        <td>${p.cantidad}</td>
                        <td>${p.nombre}</td>
                        <td>$${parseFloat(p.precio_unitario).toFixed(2)}</td>
                        <td class="text-end">$${(p.cantidad * p.precio_unitario).toFixed(2)}</td>
                    </tr>
                `;
      });

      // Totales
      document.getElementById("det-subtotal").textContent = `$${parseFloat(v.subtotal).toFixed(2)}`;
      document.getElementById("det-impuesto").textContent = `$${(v.total - v.subtotal).toFixed(2)}`;
      document.getElementById("det-total").textContent = `$${parseFloat(v.total).toFixed(2)}`;

      // Mostrar el modal
      const myModal = new bootstrap.Modal(document.getElementById('modalDetalleVenta'));
      myModal.show();
    }
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    alert("No se pudo cargar el detalle de la venta.");
  }
}



function exportarPDF() {
  // Verificamos si la librería cargó
  if (!window.jspdf) {
    alert("La librería PDF aún no ha cargado. Por favor, espera un segundo.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4'); // 'pt' suele dar menos problemas de escala

  // Título con estilo Joicy Nails
  doc.setFontSize(18);
  doc.setTextColor(184, 134, 11); // Un tono dorado/café
  doc.text("JOICY NAILS SUPPLY - REPORTE DE VENTAS", 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 40, 60);

  // Leer la tabla de ventas directamente del HTML
  doc.autoTable({
    html: '#tablaHistorialVentas', // REVISA QUE ESTE ID SEA EL DE TU TABLA
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [184, 134, 11] }, // Encabezado dorado
    styles: { fontSize: 8, cellPadding: 3 },
    columns: [
      { header: 'Fecha', dataKey: 0 },
      { header: 'Hora', dataKey: 1 },
      { header: 'Vendedor', dataKey: 2 },
      { header: 'Total', dataKey: 3 },
      // No agregamos el índice 5 (donde están los botones)
    ],
  });
  // --- ACCIÓN DE IMPRESIÓN ---
  doc.autoPrint();
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
  //doc.save("Reporte_Ventas_JoicyNails.pdf");
}

function exportarExcel() {
  if (typeof XLSX === 'undefined') {
    alert("La librería de Excel aún no ha cargado.");
    return;
  }

  const tabla = document.getElementById("tablaHistorialVentas");
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Ventas" });
  XLSX.writeFile(wb, "Reporte_Ventas_JoicyNails.xlsx");
}


function exportarExcelInventario() {
  if (typeof XLSX === 'undefined') {
    alert("La librería de Excel aún no ha cargado.");
    return;
  }

  const tabla = document.getElementById("tablaProductosBody");
  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Inventario" });
  XLSX.writeFile(wb, "Reporte_Inventario_JoicyNails.xlsx");
}

function exportarPDFInventario() {
  // Verificamos si la librería cargó
  if (!window.jspdf) {
    alert("La librería PDF aún no ha cargado. Por favor, espera un segundo.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4'); // 'pt' suele dar menos problemas de escala

  // Título con estilo Joicy Nails
  doc.setFontSize(18);
  doc.setTextColor(184, 134, 11); // Un tono dorado/café
  doc.text("JOICY NAILS SUPPLY - REPORTE DE INVENTARIO", 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 40, 60);

  // Leer la tabla de ventas directamente del HTML
  doc.autoTable({
    html: '#tablaProductosBody', // REVISA QUE ESTE ID SEA EL DE TU TABLA
    startY: 80,
    theme: 'grid',
    headStyles: { fillColor: [184, 134, 11] }, // Encabezado dorado
    styles: { fontSize: 8, cellPadding: 3 },
    columns: [
      { header: 'ID', dataKey: 0 },
      { header: 'Producto', dataKey: 1 },
      { header: 'Categoria', dataKey: 2 },
      { header: 'Precio', dataKey: 3 },
      { header: 'Stock', dataKey: 4 },
      // No agregamos el índice 5 (donde están los botones)
    ],
  });
  // --- ACCIÓN DE IMPRESIÓN ---
  doc.autoPrint();
  const pdfBlob = doc.output('bloburl');
  window.open(pdfBlob, '_blank');
  //doc.save("Reporte_Inventario_JoicyNails.pdf");
}

document.getElementById('tipoCodigo').addEventListener('change', function () {
  const inputCodigo = document.getElementById('p_codigoPro');

  if (this.value === 'automatico') {
    // Genera un código basado en la fecha y hora actual (único y rápido)
    const autoGen = 'BC-' + Date.now();
    inputCodigo.value = autoGen;
    inputCodigo.readOnly = true; // No permite editarlo
    inputCodigo.style.backgroundColor = '#e9ecef';
  } else {
    inputCodigo.value = '';
    inputCodigo.readOnly = false;
    inputCodigo.style.backgroundColor = '#fff';
    inputCodigo.placeholder = "Ingrese código manualmente";
  }
});