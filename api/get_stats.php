<?php
header('Content-Type: application/json');
require 'db.php';

try {
    // Venta Diaria
    $hoy = $pdo->query("SELECT SUM(total) as total FROM ventas WHERE DATE(fecha) = CURDATE()")->fetch();
    
    // Venta Semanal (Últimos 7 días)
    $semana = $pdo->query("SELECT SUM(total) as total FROM ventas WHERE fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)")->fetch();
    
    // Venta Mensual (Mes actual)
    $mes = $pdo->query("SELECT SUM(total) as total FROM ventas WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) AND YEAR(fecha) = YEAR(CURRENT_DATE())")->fetch();

    echo json_encode([
        'diaria' => $hoy['total'] ?? 0,
        'semanal' => $semana['total'] ?? 0,
        'mensual' => $mes['total'] ?? 0
    ]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>