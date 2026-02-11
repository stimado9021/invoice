<?php
header('Content-Type: application/json');
require 'db.php';

// Suma solo el campo impuesto_total de la tabla facturas
$stmt = $pdo->query("SELECT SUM(impuesto_total) as total_impuestos FROM facturas");
$res = $stmt->fetch();

echo json_encode(['impuestos_pagados' => $res['total_impuestos'] ?? 0]);