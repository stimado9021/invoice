<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
//$precioNumerico = floatval($input['precio']);
$sql = "INSERT INTO productos (nombre,	codigoPro, precio,  id_categoria,idDeposito) VALUES (?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([
    $input['nombre'],
    $input['codigoPro'], 
    $input['precio'], 
    $input['id_categoria'],
    $input['deposito'] 
    
]);
$idPro=$venta_id = $pdo->lastInsertId();

$sql2 = "INSERT INTO stock_depositos (id_producto,	id_deposito, cantidad) VALUES (?, ?, ?)";
$stmt2 = $pdo->prepare($sql2);
$success2 = $stmt2->execute([
    $idPro,
    $input['deposito'],
    0     
]);


$id_user=$input['id_user'];

$sqlHistorial = "INSERT INTO historial_stock (id_producto, id_deposito, cantidad_agregada, tipo_movimiento, usuario_responsable) 
                         VALUES (?,?,?,?,?)";
    
    $stmtHist = $pdo->prepare($sqlHistorial);
    $stmtHist->execute([
        $idPro,
        $input['deposito'],
         0,
         'ENTRADA',
        $id_user
    ]);

  

echo json_encode(['success' => $success]);