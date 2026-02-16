<?php
header('Content-Type: application/json');
require 'db.php';

// Recibimos el ID del producto y el ID del depósito
$id_producto = $_GET['id'] ?? null;
$id_deposito = $_GET['idDeposito'] ?? null; // Importante para saber qué stock mostrar

if (!$id_producto || !$id_deposito) {
    echo json_encode(['error' => 'Faltan parámetros obligatorios']);
    exit;
}

try {
    // Realizamos un LEFT JOIN para obtener los datos del producto 
    // y la cantidad específica en el depósito seleccionado
    $sql = "SELECT 
                p.*, 
                COALESCE(sd.cantidad, 0) AS stock 
            FROM productos p
            LEFT JOIN stock_depositos sd ON p.id = sd.id_producto AND sd.id_deposito = ?
            WHERE p.id = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id_deposito, $id_producto]);
    $resultado = $stmt->fetch();

    if ($resultado) {
        echo json_encode($resultado);
    } else {
        echo json_encode(['error' => 'Producto no encontrado']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}