<?php
header('Content-Type: application/json');
require 'db.php';

$accion = $_GET['accion'] ?? '';

if ($accion == 'leer') {
    $stmt = $pdo->query("SELECT id, nombre, correo, rol FROM usuarios");
    echo json_encode($stmt->fetchAll());
}

if ($accion == 'guardar') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!empty($input['id'])) {
        // Editar
        if (!empty($input['pass'])) {
            $stmt = $pdo->prepare("UPDATE usuarios SET nombre=?, correo=?, password=?, rol=? WHERE id=?");
            $stmt->execute([$input['nombre'], $input['correo'], $input['pass'], $input['rol'], $input['id']]);
        } else {
            $stmt = $pdo->prepare("UPDATE usuarios SET nombre=?, correo=?, rol=? WHERE id=?");
            $stmt->execute([$input['nombre'], $input['correo'], $input['rol'], $input['id']]);
        }
    } else {
        // Crear
        $stmt = $pdo->prepare("INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input['nombre'], $input['correo'], $input['pass'], $input['rol']]);
    }
    echo json_encode(['success' => true]);
}
?>