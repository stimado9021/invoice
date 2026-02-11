<?php
header('Content-Type: application/json');
require 'db.php';

$id = $_GET['id'];

if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && $id) {
    $stmt = $pdo->prepare("DELETE FROM productos WHERE id = ?");
    $success = $stmt->execute([$id]);
    echo json_encode(['success' => $success]);
}
?>