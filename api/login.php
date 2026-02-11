<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['usuario']) || !isset($input['password'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$userQuery = $input['usuario'];
$password  = $input['password'];

try {
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ? OR nombre = ?");
    $stmt->execute([$userQuery, $userQuery]);
    $user = $stmt->fetch();

    // Importante: Aquí comparamos la clave. 
    // Si en tu DB la guardaste como texto plano, esto funcionará:
    if ($user && $password === $user['password']) {
        echo json_encode([
            'success' => true,
            'rol' => $user['rol'],
            'id' => $user['id'],
            'nombre' => $user['nombre']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Usuario o clave incorrecta']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error de DB: ' . $e->getMessage()]);
}