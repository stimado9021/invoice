<?php
header('Content-Type: application/json');
require 'db.php'; // Tu archivo original con $pdo

// Captura de datos del formulario
$id_producto = $_POST['id_producto'] ?? null;
$id_deposito = $_POST['id_deposito'] ?? null;
$cantidad    = isset($_POST['cantidad']) ? intval($_POST['cantidad']) : 0;
$usuario     = $_POST['id_user'] ?? 'Administrador'; // Asegúrate de enviar id_user desde el JS

if (!$id_producto || !$id_deposito || $cantidad <= 0) {
    echo json_encode(["success" => false, "error" => "Faltan datos obligatorios o cantidad no válida"]);
    exit;
}

try {
    // En PDO se usa beginTransaction()
    $pdo->beginTransaction();

    // 1. Actualizar el stock actual (Suma si ya existe, crea si no)
    // El nombre de los campos debe coincidir con tu tabla 'stock_depositos'
    $sqlStock = "INSERT INTO stock_depositos (id_producto, id_deposito, cantidad) 
                 VALUES (:id_p, :id_d, :cant) 
                 ON DUPLICATE KEY UPDATE cantidad = cantidad + :cant_update";
    
    $stmtStock = $pdo->prepare($sqlStock);
    $stmtStock->execute([
        ':id_p' => $id_producto,
        ':id_d' => $id_deposito,
        ':cant' => $cantidad,
        ':cant_update' => $cantidad
    ]);

    // 2. Registrar el movimiento en el historial para control de fechas y horas
    $sqlHistorial = "INSERT INTO historial_stock (id_producto, id_deposito, cantidad_agregada, tipo_movimiento, usuario_responsable) 
                     VALUES (:id_p, :id_d, :cant, 'entrada', :user)";
    
    $stmtHist = $pdo->prepare($sqlHistorial);
    $stmtHist->execute([
        ':id_p' => $id_producto,
        ':id_d' => $id_deposito,
        ':cant' => $cantidad,
        ':user' => $usuario
    ]);

    // Confirmamos la transacción
    $pdo->commit();
    echo json_encode(["success" => true]);

} catch (Exception $e) {
    // Si algo falla, deshacemos los cambios para no dejar datos a medias
    if ($pdo->inTransaction()) {
        $pdo->rollback();
    }
    echo json_encode(["success" => false, "error" => "Error en la base de datos: " . $e->getMessage()]);
}