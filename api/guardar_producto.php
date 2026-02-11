<?php
header('Content-Type: application/json');
require 'db.php';

$input = json_decode(file_get_contents('php://input'), true);

$sql = "INSERT INTO productos (nombre, precio, stock, id_categoria) VALUES (?, ?, ?, ?)";
$stmt = $pdo->prepare($sql);
$success = $stmt->execute([
    $input['nombre'], 
    $input['precio'], 
    $input['stock'], 
    $input['id_categoria']
]);

echo json_encode(['success' => $success]);