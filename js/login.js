document.addEventListener('DOMContentLoaded', () => {
    cargarUsuariosLogin();
});

// Función para llenar el Combobox
async function cargarUsuariosLogin() {
    try {
        const response = await fetch('api/usuarios.php?accion=leer');
        const usuarios = await response.json();
        const select = document.getElementById('usuario');
        
        // Limpiamos el "Cargando..."
        select.innerHTML = '<option value="" disabled selected>-- Selecciona tu nombre --</option>';

        usuarios.forEach(u => {
            const option = document.createElement('option');
            option.value = u.nombre; // Usamos el correo/user para la validación
            option.textContent = u.nombre; // Mostramos el nombre real
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

// // Modificar la función de Validar Login
// document.getElementById('formLogin').addEventListener('submit', async (e) => {
//     e.preventDefault();
    
//     const usuario = document.getElementById('usuario').value;
//     const password = document.getElementById('password').value;
//     console.log(usuario, password);
//     if (!usuario) {
//         alert("Por favor, selecciona un usuario.");
//         return;
//     }

//     const response = await fetch('api/login.php', {
//         method: 'POST',
//         body: JSON.stringify({ usuario, password })
//     });

//     const res = await response.json();

//     if (res.success) {
//         localStorage.setItem('user_name', res.nombre);
//         localStorage.setItem('user_rol', res.rol);
        
//         // Redirigir según el rol
//         if (res.rol === 'admin') {
//             window.location.href = 'dashboard_admin.html';
//         } else {
//             window.location.href = 'dashboard_vendedor.html';
//         }
//     } else {
//         alert('Contraseña incorrecta.');
//     }
// });



document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;
  const mensaje = document.getElementById("mensaje");

  mensaje.innerHTML = '<span style="color: #d4af37">Verificando...</span>';
console.log(usuario,password);
  try {
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });

    const data = await response.json();
      
     console.log(data);
    if (data.success) {
      localStorage.setItem("user_role", data.rol);
      localStorage.setItem("user_name", data.nombre);
      localStorage.setItem("user_id", data.id);

      // Redirección con un pequeño delay para que se vea el efecto
      setTimeout(() => {
        // ... dentro del fetch del login .
         const routes = {
                admin: "dashboard_admin.html",
                vendedor: "dashboard_vendedor.html"
            };

            // CORRECCIÓN CLAVE: Usamos corchetes [] para acceder al objeto, no paréntesis ()
            const destino = routes[data.rol];
            console.log(destino);
            if (destino) {
                console.log("Redirigiendo a:", destino);
                window.location.href = destino;
            } else {
                throw new Error("Rol de usuario no reconocido");
            }
        
      }, 500);
    } else {
      mensaje.textContent = "Acceso denegado. Verifica tus datos.";
    }
  } catch (error) {
    mensaje.textContent = "Error al conectar con el servidor.";
  }
});
