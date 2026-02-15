document.addEventListener('DOMContentLoaded', () => {
    const nombre = localStorage.getItem('user_name');
    
    if (nombre  ) {
      document.getElementById('vendedorName').innerText = `Bienvenido, ${nombre}`;
    }
    
    
    // Aquí llamaríamos a las funciones de carga inicial
    cargarCategoriasPro();
    cargarDepositosPro(); 
    // cargarVentasResumen();
    cargarDepositos()
});

// async function buscarProductos() {
//     const nombre = document.getElementById('busquedaNombre').value;
//     const cat = document.getElementById('filtroCategoria').value;

//     const response = await fetch(`api/productos.php?nombre=${nombre}&categoria=${cat}`);
//     const productos = await response.json();
//     console.log(productos); // Luego renderizaremos esto en una tabla
// }

async function cerrarSesion() {
  // 1. Preguntar para evitar cierres accidentales
  if (confirm("¿Estás seguro de que deseas salir del sistema?")) {
    // 2. Limpiar todos los datos guardados en el navegador

    const idUsuario = localStorage.getItem('user_id');
    const rol = localStorage.getItem('user_rol');

    
    const response = await fetch(`api/logout.php?idUsuario=${idUsuario}&rol=${rol}`);

  
    if (response.ok) {
      const data = await response.json();
      console.log("Resultado auditoría:", data);
    } else {
      console.error("Error en el servidor:", response.status);
    }

    // 3. (Opcional) Si usas cookies, podrías borrarlas aquí

    localStorage.clear();
    sessionStorage.clear();

    // 4. Redirigir al login inmediatamente
    window.location.replace("index.html");
  }
}

function cargarCategoriasPro() {
  const select = document.getElementById("p_categoria");

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


function cargarDepositosPro() {
  const select = document.getElementById("p_idDeposito");

  fetch("api/depositos.php")
    .then((response) => response.json())
    .then((data) => {
     
      // Mantener la opción por defecto
      select.innerHTML = '<option value="">Todas los Depositos</option>';

      data.forEach((dep) => {
        const option = document.createElement("option");
        option.value = dep.id;
        option.textContent = dep.nombre;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando categorías:", error));
}

function cargarDepositos() {
  const select2 = document.getElementById("filtroDeposito");

  fetch("api/depositos.php")
    .then((response) => response.json())
    .then((data) => {
      // Mantener la opción por defecto
      // select2.innerHTML = '<option value="">Todos los Depositos</option>';
      select2.innerHTML = '';
      data.forEach((d) => {
        const option = document.createElement("option");
        option.value = d.id;
        option.textContent = d.nombre;
        select2.appendChild(option);
      });
    })
    .catch((error) => console.error("Error cargando categorías:", error));
}


function abrirModalStock(id, nombre) {
    // Seteamos los valores en el modal
    document.getElementById('idProductoStock').value = id;
    document.getElementById('nombreProductoStock').innerText = nombre;
    document.getElementById('nuevaCantidad').value = ""; // Limpiar input
    console.log(id,nombre)
    // Mostramos el modal
    const modal = new bootstrap.Modal(document.getElementById('modalAgregarStock'));
    modal.show();
}




function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valor || 0);
}

// const inputPrecio = document.getElementById('p_precio');

// 1. Al salir del campo: Aplicar formato
// inputPrecio.addEventListener('blur', function() {
//     // Extraer solo los números del valor actual
//     let valorNumerico = this.value.replace(/\D/g, "");
//     console.log(valorNumerico);
//     if (valorNumerico !== "") {
//         this.value = formatearMoneda(valorNumerico);
//     }
// });

// 2. Al hacer clic (foco): Quitar formato para editar solo el número
// inputPrecio.addEventListener('focus', function() {
//     // Eliminar todo lo que no sea número para que el usuario edite fácil
//     this.value = this.value.replace(/\D/g, "");
// });





// async function finalizarVenta() {
//   if (carrito.length === 0) {
//     alert("El carrito está vacío");
//     return;
//   }

//   const cliente = {
//         nombre: document.getElementById('clienteNombre').value.trim(),
//         email: document.getElementById('clienteEmail').value.trim(),
//         telefono: document.getElementById('clienteTelefono').value.trim()
//     };
// // VALIDACIÓN: Si falta cualquier dato, se detiene
//   if (!cliente.nombre || !cliente.email || !cliente.telefono) {
//     alert("⚠️ Por favor, complete todos los datos del cliente (Nombre, Email y Teléfono) antes de finalizar la venta.");
//     return; 
//   }
//   // Preparar los datos
//   const ventaData = {
//     cliente: cliente,
//     vendedor_id: localStorage.getItem("user_id"), // Asegúrate de guardar el ID al hacer login
//     subtotal: carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0),
//     impuesto: impuestoConfigurado,
//     total: parseFloat(
//       document.getElementById("resumenTotal").textContent.replace("$", ""),
//     ),
//     productos: carrito,
//   };
  

//   try {
//     const res = await fetch("api/ventas2.php", {
//       method: "POST",
//       body: JSON.stringify(ventaData),
//       headers: { "Content-Type": "application/json" },
//     });

//     const resultado = await res.json();

//     if (resultado.status === "success") {
      
//       alert("✅ Venta completada y stock actualizado.");
//       carrito = []; // Limpiar carrito
//       renderizarCarrito(); // Limpiar UI
//       const tabla = document.getElementById("tablaVentasBody");
//       if (tabla) {
//         tabla.innerHTML = "";
//       }


//         document.getElementById('clienteNombre').value="";
//         document.getElementById('clienteEmail').value="";
//         document.getElementById('clienteTelefono').value="";
     
//         document.getElementById('clienteNombre').focus();
//         imprimirFactura(ventaData, resultado.venta_id || "001");

//       // 4. LIMPIAR EL CUADRO DE TEXTO DE BÚSQUEDA (Lo que pediste)
//       const inputBusqueda = document.getElementById("busquedaNombre");
//       if (inputBusqueda) {
//         inputBusqueda.value = ""; // Vacía el texto escrito
//         //inputBusqueda.focus(); // Opcional: pone el cursor ahí para la siguiente venta
//       }
//       //cargarProductosVendedor(); // Recargar tabla para ver el nuevo stock
//     } else {
//       alert("❌ Error: " + resultado.message);
//     }
//   } catch (error) {
//     console.error("Error en la venta:", error);
//   }
// }