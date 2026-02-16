document.addEventListener('DOMContentLoaded', () => {
  const nombre = localStorage.getItem('user_name');

  if (nombre) {
    document.getElementById('vendedorName').innerText = `Bienvenido, ${nombre}`;
  }


  // Aquí llamaríamos a las funciones de carga inicial
  cargarCategoriasPro();
  cargarDepositosPro();
  // cargarVentasResumen();
  cargarDepositos()
});



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






async function guardarNuevoStock() {
  const idProducto = document.getElementById('idProductoStock').value;
  const cantidad = document.getElementById('nuevaCantidad').value;

  const idDeposito = document.getElementById('filtroDeposito').value;

  if (!cantidad || cantidad <= 0 || !idDeposito) {
    alert("Por favor, completa todos los campos correctamente.");
    return;
  }
  idUser = localStorage.getItem('user_id');
  const datos = new FormData();
  datos.append('id_producto', idProducto);
  datos.append('id_deposito', idDeposito);
  datos.append('cantidad', cantidad);
  datos.append('id_user', idUser);
  try {
    const response = await fetch('api/actualizar_stock.php', {
      method: 'POST',
      body: datos
    });

    const resultado = await response.json();

    if (resultado.success) {
      alert("Stock actualizado correctamente");
      buscarProductos()
      const elementoModal = document.getElementById('modalAgregarStock');
      const instanciaModal = bootstrap.Modal.getInstance(elementoModal);

      if (instanciaModal) {
        instanciaModal.hide();
      }
      //location.reload(); // Recarga para ver los cambios en la tabla principal
    } else {
      alert("Error: " + resultado.error);
    }
  } catch (error) {
    console.error("Error en la petición:", error);
    alert("No se pudo conectar con el servidor.");
  }
}