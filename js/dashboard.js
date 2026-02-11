document.addEventListener('DOMContentLoaded', () => {
    const nombre = localStorage.getItem('user_name');
    document.getElementById('user-info').innerText = `Bienvenido, ${nombre}`;
    
    // Aquí llamaríamos a las funciones de carga inicial
    cargarCategorias();
    cargarVentasResumen();
});

async function buscarProductos() {
    const nombre = document.getElementById('busquedaNombre').value;
    const cat = document.getElementById('filtroCategoria').value;

    const response = await fetch(`api/productos.php?nombre=${nombre}&categoria=${cat}`);
    const productos = await response.json();
    console.log(productos); // Luego renderizaremos esto en una tabla
}