document.addEventListener("DOMContentLoaded", () => {
  verificarSesionVendedor();
  //cargarProductosVendedor();
  cargarImpuestoVenta(); // Para que el cálculo sea dinámico
  cargarCategorias()
});

// 1. SEGURIDAD: Verificar que sea vendedor
function verificarSesionVendedor() {
  const rol = localStorage.getItem("user_role");

  if (!rol || rol !== "vendedor") {
    window.location.href = "index.html";
  }

  const nombre = localStorage.getItem("user_name");
  if (document.getElementById("vendedorName")) {
    document.getElementById("vendedorName").textContent = nombre;
  }
}

// 2. CARGAR PRODUCTOS (Solo lectura para el vendedor)
// Al cargar los productos en la tabla
async function cargarProductosVendedor() {
  try {
    const res = await fetch("api/productos.php?accion=leer");
    const productos = await res.json();
    const tabla = document.getElementById("tablaVentasBody");
    tabla.innerHTML = "";

    productos.forEach((p) => {
      tabla.innerHTML += `
                <tr class="align-middle">
                    <td class="text-white fw-bold">${p.nombre}</td>
                    <td class="text-white">$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>
                        <span class="badge ${p.stock < 5 ? "bg-danger" : "bg-success"}">
                            ${p.stock} disp.
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-gold fw-bold" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio},${p.stock})">
                            + AGREGAR
                        </button>
                    </td>
                </tr>
            `;
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

// 3. OBTENER EL IMPUESTO ACTUAL DE LA BASE DE DATOS
let impuestoConfigurado = 0;
async function cargarImpuestoVenta() {
  try {
    const res = await fetch("api/impuestos.php?accion=actual");
    const data = await res.json();
    impuestoConfigurado = parseFloat(data.porcentaje);
    
  } catch (error) {
    console.error("Error al obtener impuesto:", error);
  }
}

// 4. LÓGICA DE CIERRE DE SESIÓN
function cerrarSesion() {
  if (confirm("¿Cerrar sesión de ventas?")) {
    localStorage.clear();
    window.location.replace("index.html");
  }
}

let carrito = [];

// 1. Agregar productos al carrito
function agregarAlCarrito(id, nombre, precio,stockDisponible) {
  // Validamos si hay stock antes de hacer nada
  console.log(stockDisponible);
  if (stockDisponible <= 0) {
    alert(`❌ No hay stock disponible para: ${nombre}`);
    return;
  }
  const productoExistente = carrito.find((p) => p.id === id);

  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ id, nombre, precio, cantidad: 1 });
  }
  renderizarCarrito();
}

// Al dibujar el carrito (Ticket de venta)
function renderizarCarrito() {
  const listaCarrito = document.getElementById("listaCarrito");
  listaCarrito.innerHTML = "";

  let subtotal = 0;

  carrito.forEach((p, index) => {
    const totalPorProducto = p.precio * p.cantidad;
    subtotal += totalPorProducto;

    listaCarrito.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2 border-bottom border-secondary pb-2">
                <div class="text-white">
                    <span class="gold-text fw-bold">${p.cantidad}x</span> ${p.nombre}
                </div>
                <div class="text-end">
                    <span class="text-white fw-bold">$${totalPorProducto.toFixed(2)}</span>
                    <button class="btn btn-sm text-danger ms-2" onclick="eliminarDelCarrito(${index})">
                        <i class="bi bi-trash"></i> ×
                    </button>
                </div>
            </div>
        `;
  });

  actualizarResumenDinero(subtotal);
}

// 3. Cálculos matemáticos (Subtotal, Impuesto, Total)
function actualizarResumenDinero(subtotal) {
  // Usamos la variable 'impuestoConfigurado' que traemos de la API
  const valorImpuesto = subtotal * (impuestoConfigurado / 100);
  const totalFinal = subtotal + valorImpuesto;

  // Actualizamos las etiquetas en el HTML
  document.getElementById("resumenSubtotal").textContent =
    `$${subtotal.toFixed(2)}`;
  document.getElementById("resumenImpuesto").textContent =
    `$${valorImpuesto.toFixed(2)} (${impuestoConfigurado}%)`;
  document.getElementById("resumenTotal").textContent =
    `$${totalFinal.toFixed(2)}`;
  document.getElementById("granTotal").textContent =
    `$${totalFinal.toFixed(2)}`;
}

// 4. Eliminar producto
function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  renderizarCarrito();
}

// 5. Finalizar Venta (Aquí conectarás con la base de datos después)
async function finalizarVenta() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const cliente = {
        nombre: document.getElementById('clienteNombre').value.trim(),
        email: document.getElementById('clienteEmail').value.trim(),
        telefono: document.getElementById('clienteTelefono').value.trim()
    };
// VALIDACIÓN: Si falta cualquier dato, se detiene
  if (!cliente.nombre || !cliente.email || !cliente.telefono) {
    alert("⚠️ Por favor, complete todos los datos del cliente (Nombre, Email y Teléfono) antes de finalizar la venta.");
    return; 
  }
  // Preparar los datos
  const ventaData = {
    cliente: cliente,
    vendedor_id: localStorage.getItem("user_id"), // Asegúrate de guardar el ID al hacer login
    subtotal: carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
    impuesto: impuestoConfigurado,
    total: parseFloat(
      document.getElementById("resumenTotal").textContent.replace("$", ""),
    ),
    productos: carrito,
  };
  

  try {
    const res = await fetch("api/ventas2.php", {
      method: "POST",
      body: JSON.stringify(ventaData),
      headers: { "Content-Type": "application/json" },
    });

    const resultado = await res.json();

    if (resultado.status === "success") {
      imprimirFactura(ventaData, resultado.venta_id || "001");
      alert("✅ Venta completada y stock actualizado.");
      carrito = []; // Limpiar carrito
      renderizarCarrito(); // Limpiar UI
      const tabla = document.getElementById("tablaVentasBody");
      if (tabla) {
        tabla.innerHTML = "";
      }

        document.getElementById('clienteNombre').value="";
        document.getElementById('clienteEmail').value="";
        document.getElementById('clienteTelefono').value="";
     
        document.getElementById('clienteNombre').focus();

      // 4. LIMPIAR EL CUADRO DE TEXTO DE BÚSQUEDA (Lo que pediste)
      const inputBusqueda = document.getElementById("busquedaNombre");
      if (inputBusqueda) {
        inputBusqueda.value = ""; // Vacía el texto escrito
        //inputBusqueda.focus(); // Opcional: pone el cursor ahí para la siguiente venta
      }
      //cargarProductosVendedor(); // Recargar tabla para ver el nuevo stock
    } else {
      alert("❌ Error: " + resultado.message);
    }
  } catch (error) {
    console.error("Error en la venta:", error);
  }
}

// 2. LA FUNCIÓN RENDERIZAR (Corregida)
function renderizarTabla(productos) {
  const tabla = document.getElementById("tablaVentasBody");
  tabla.innerHTML = "";

  if (!productos || productos.length === 0) {
    tabla.innerHTML =
      '<tr><td colspan="6" class="text-center">No se encontraron productos</td></tr>';
    return;
  }

  productos.forEach((p) => {
    const stockClass = p.stock <= 5 ? "text-danger fw-bold" : "text-white";

    // CORRECCIÓN: Comillas simples en '${p.nombre}' para que no falle el click
    const fila = `
            <tr>
                <td>${p.id}</td>
                <td class="gold-text fw-bold">${p.nombre}</td>
                <td>${p.categoria_nombre || "General"}</td>
                <td>$${parseFloat(p.precio).toFixed(2)}</td>
                <td class="${stockClass}">${p.stock}</td>
                <td>
                    <button class="btn btn-sm btn-outline-success" 
                        onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio},${p.stock})">
                        + Añadir
                    </button>
                </td>
            </tr>
        `;
    tabla.innerHTML += fila;
  });
}


document.getElementById("filtroCategoria").addEventListener("change", (e) => {
  const categoriaId = e.target.value.trim();
  const tabla = document.getElementById("tablaVentasBody"); // Definir aquí adentro
  
    fetch(`api/productos.php?accion=buscarCat&categoria_id=${categoriaId}`)
    .then((response) => response.json())
    .then((data) => {
      
       renderizarTabla(data);
    })
    .catch((error) => console.error("Error:", error));
});


document.getElementById("busquedaNombre").addEventListener("keyup", (e) => {
  const query = e.target.value.trim();
  const tabla = document.getElementById("tablaVentasBody"); // Definir aquí adentro



  if (query.length === 0) {
    tabla.innerHTML = "";
    return;
  }

  fetch(`api/productos.php?accion=buscar&nombre=${query}`)
    .then((response) => response.json())
    .then((data) => {
      renderizarTabla(data);
    })
    .catch((error) => console.error("Error:", error));
});


window.addEventListener('keydown', (e) => {
    // Si presiona F12
    if (e.key === 'F12') {
        e.preventDefault(); // Evita que se abra la consola del navegador
        finalizarVenta();
    }
});

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

function imprimirFactura(datos, facturaNum) {
    const { jsPDF } = window.jspdf;
    
    // Formato de ticket estándar (80mm de ancho). 
    // La altura se define en 200mm para evitar cortes en ventas largas.
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 200]
    });

    const vName = localStorage.getItem("user_name") || "Vendedor";
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- ENCABEZADO / MEMBRETE ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("JOICY NAILS SUPPLY", pageWidth / 2, 10, { align: "center" });
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Paddock Market, 3100 SW College Rd", pageWidth / 2, 15, { align: "center" });
    doc.text("Unit 66, Ocala, FL 34474", pageWidth / 2, 19, { align: "center" });
    doc.text("Phone: (352) 460-1501", pageWidth / 2, 23, { align: "center" });

    doc.setLineWidth(0.3);
    doc.line(5, 26, 75, 26); // Línea divisoria

    // --- INFO DE LA TRANSACCIÓN ---
    doc.setFontSize(8);
    doc.text(`Factura: #${facturaNum}`, 5, 31);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 5, 35);
    doc.text(`Atendido por: ${vName}`, 5, 39);

    // --- DATOS DEL CLIENTE ---
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE:", 5, 45);
    doc.setFont("helvetica", "normal");
    const nombreCliente = datos.cliente.nombre || "Cliente General";
    doc.text(`Nombre: ${nombreCliente}`, 5, 49);
    if(datos.cliente.telefono) doc.text(`Tel: ${datos.cliente.telefono}`, 5, 53);

    // --- TABLA DE PRODUCTOS ---
    const tableData = datos.productos.map(p => [
        p.cantidad,
        p.nombre,
        `$${(p.precio * p.cantidad).toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 57,
        head: [['Cant', 'Producto', 'Total']],
        body: tableData,
        theme: 'plain',
        styles: { fontSize: 7, cellPadding: 1, font: "helvetica" },
        headStyles: { fontStyle: 'bold', borderBottom: 0.1 },
        columnStyles: { 
            0: { cellWidth: 8 }, 
            2: { halign: 'right' } 
        },
        margin: { left: 5, right: 5 }
    });

    // --- TOTALES ---
    let finalY = doc.lastAutoTable.finalY + 6;
    
    doc.setFontSize(8);
    doc.text("Subtotal:", 40, finalY);
    doc.text(`$${datos.subtotal.toFixed(2)}`, 75, finalY, { align: "right" });
    
    const impVal = datos.subtotal * (datos.impuesto / 100);
    doc.text(`Tax (${datos.impuesto}%):`, 40, finalY + 4);
    doc.text(`$${impVal.toFixed(2)}`, 75, finalY + 4, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL A PAGAR:", 20, finalY + 10);
    doc.text(`$${datos.total.toFixed(2)}`, 75, finalY + 10, { align: "right" });

    // --- SECCIÓN DE CUPÓN / PIE DE PÁGINA ---
    finalY += 20;
    
    // Dibujamos un recuadro punteado para el cupón
    doc.setLineDash([1, 1], 0);
    doc.rect(5, finalY, 70, 25); 
    doc.setLineDash([], 0); 

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("ENJOY 20% OFF YOUR NEXT PURCHASE", pageWidth / 2, finalY + 6, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Use this code on our website:", pageWidth / 2, finalY + 11, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("WAS", pageWidth / 2, finalY + 18, { align: "center" });
    
    doc.setFontSize(8);
    doc.text("joicynailsupply.com", pageWidth / 2, finalY + 23, { align: "center" });

    // --- ACCIÓN DE IMPRESIÓN ---
    doc.autoPrint();
    const pdfBlob = doc.output('bloburl');
    window.open(pdfBlob, '_blank');
}


async function buscarClienteRealTime() {
    const input = document.getElementById("clienteNombre");
    const sugerencias = document.getElementById("listaSugerencias");
    const query = input.value.trim();

    if (query.length < 2) {
        sugerencias.style.display = "none";
        return;
    }

    try {
        const res = await fetch(`api/ventas.php?accion=buscar_cliente&query=${query}`);
        const clientes = await res.json();
console.log(clientes  );
        if (clientes.length > 0) {
            sugerencias.innerHTML = "";
            sugerencias.style.display = "block";

            clientes.forEach(c => {
                const li = document.createElement("li");
                li.className = "list-group-item list-group-item-action cursor-pointer";
                li.innerHTML = `<strong>${c.nombre}</strong> <small class="text-muted">(${c.telefono})</small>`;
                li.onclick = () => seleccionarCliente(c);
                sugerencias.appendChild(li);
            });
        } else {
            sugerencias.style.display = "none";
        }
    } catch (error) {
        console.error("Error buscando clientes:", error);
    }
}

// Función para llenar los campos cuando el usuario hace clic en una sugerencia
function seleccionarCliente(cliente) {
    document.getElementById("clienteNombre").value = cliente.nombre;
    document.getElementById("clienteEmail").value = cliente.email;
    document.getElementById("clienteTelefono").value = cliente.telefono;
    document.getElementById("listaSugerencias").style.display = "none";
}

// Cerrar sugerencias si se hace clic fuera del input
document.addEventListener("click", (e) => {
    if (e.target.id !== "clienteNombre") {
        document.getElementById("listaSugerencias").style.display = "none";
    }
});
