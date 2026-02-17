<?php
header('Content-Type: application/json');

// Asumiendo que db.php ahora devuelve un objeto PDO o define la conexión
require 'db.php'; 

if (isset($_POST['nombre']) && !empty(trim($_POST['nombre']))) {
    $nombre = trim($_POST['nombre']);

    try {
        // Preparar la consulta SQL
        $sql = "INSERT INTO categorias (nombre) VALUES (:nombre)";
        $stmt = $pdo->prepare($sql);

        // Vincular el parámetro y ejecutar
        $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);

        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'No se pudo insertar la categoría']);
        }
    } catch (PDOException $e) {
        // Capturar errores de la base de datos
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'El nombre de la categoría es obligatorio']);
}

// En PDO no es estrictamente necesario cerrar la conexión manualmente, 
// pero se hace asignando null si se desea:
$conexion = null;
?>