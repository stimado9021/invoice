<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
//$precioNumerico = floatval($input['precio']);
$sql = "INSERT INTO productos (nombre,	codigoPro, precio, stock, id_categoria,idDeposito) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([
    $input['nombre'],
    $input['codigoPro'], 
    $input['precio'], 
    $input['stock'], 
    $input['id_categoria'],
    $input['deposito'] 
    
]);

echo json_encode(['success' => $success]);