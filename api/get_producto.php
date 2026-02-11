<?php
header('Content-Type: application/json');
require 'db.php';

$id = $_GET['id'];
$stmt = $pdo->prepare("SELECT * FROM productos WHERE id = ?");
$stmt->execute([$id]);
echo json_encode($stmt->fetch());