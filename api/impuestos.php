<?php
header('Content-Type: application/json');
require 'db.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo == 'GET') {
    // Obtener el último impuesto configurado y el historial
    $accion = $_GET['accion'] ?? 'actual';
    
    if ($accion == 'actual') {
        $stmt = $pdo->query("SELECT porcentaje FROM configuracion_impuestos ORDER BY fecha_cambio DESC LIMIT 1");
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
    } else if ($accion == 'historial') {
        $stmt = $pdo->query("SELECT i.porcentaje, i.fecha_cambio, u.nombre as usuario 
                             FROM configuracion_impuestos i 
                             JOIN usuarios u ON i.usuario_id = u.id 
                             ORDER BY i.fecha_cambio DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
}

if ($metodo == 'POST') {
    // Guardar nuevo impuesto
    $data = json_decode(file_get_contents("php://input"), true);
    $nuevo_porcentaje = $data['porcentaje'];
    $usuario_id = $data['usuario_id']; // ID del admin que cambia el impuesto

    $stmt = $pdo->prepare("INSERT INTO configuracion_impuestos (porcentaje, usuario_id) VALUES (?, ?)");
    if ($stmt->execute([$nuevo_porcentaje, $usuario_id])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}
?>