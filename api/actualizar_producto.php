<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);
//$precioNumerico = floatval($input['precio']);
$sql = "UPDATE productos SET nombre=?, precio=?,  id_categoria=?, codigoPro=? ,idDeposito=?  WHERE id=?";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([
    $input['nombre'], 
    $input['precio'], 
    $input['id_categoria'],
    $input['codigoPro'],
    $input['deposito'],    
    $input['id']
]);

echo json_encode(['success' => $success]);