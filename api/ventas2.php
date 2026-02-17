<?php
header("Content-Type: application/json");
require_once "db.php"; // Tu conexión a la BD



$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No hay datos"]);
    exit;
}


try {
   $pdo->beginTransaction();

    // 1. REGISTRAR O IDENTIFICAR AL CLIENTE
    // Podrías buscar si el email ya existe para no duplicar, 
   $emailCliente = $data['cliente']['email'];

// Buscar si el email ya existe
$sqlCheck = "SELECT id FROM clientes WHERE email = ? LIMIT 1";
$stmtCheck = $pdo->prepare($sqlCheck);
$stmtCheck->execute([$emailCliente]);
$clienteExistente = $stmtCheck->fetch();
    
if ($clienteExistente) {
    // Si existe, usamos su ID actual
    $clienteId = $clienteExistente['id'];
} else {
    // pero para este ejemplo crearemos uno nuevo por venta:
    $sqlCliente = "INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)";
    $stmtCliente = $pdo->prepare($sqlCliente);
    $stmtCliente->execute([
        $data['cliente']['nombre'],
        $data['cliente']['email'],
        $data['cliente']['telefono']
    ]);
    $clienteId = $pdo->lastInsertId();
}

    // 2. REGISTRAR LA VENTA (Cabecera)
    $sqlVenta = "INSERT INTO ventas (vendedor_id, cliente_id, subtotal, impuesto, total,metodo_pago) VALUES (?, ?, ?, ?, ?,?)";
    $stmtVenta = $pdo->prepare($sqlVenta);
    $stmtVenta->execute([
        $data['vendedor_id'],
        $clienteId,
        $data['subtotal'],
        $data['impuesto'],
        $data['total'],
        $data['metodo_pago']
    ]);
    $venta_id = $pdo->lastInsertId();

    foreach ($data['productos'] as $prod) {
        
        $stmtDetalle = $pdo->prepare("INSERT INTO ventas_detalle (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)");
        $stmtDetalle->execute([$venta_id, $prod['id'], $prod['cantidad'], $prod['precio']]);       
        $stmtStock = $pdo->prepare("UPDATE stock_depositos SET cantidad = cantidad - ? WHERE id_producto = ?");
        $stmtStock->execute([$prod['cantidad'], $prod['id']]);
    }

    $pdo->commit();
    echo json_encode([
        "status" => "success", 
        "message" => "Venta realizada"
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

    