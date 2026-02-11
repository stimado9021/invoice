<?php
header("Content-Type: application/json");
require_once "db.php";

$accion = $_GET['accion'] ?? '';

if ($accion === 'resumen_hoy') {
    // Suma de ventas del día actual
    $stmt = $pdo->query("SELECT 
        COUNT(id) as total_ventas, 
        SUM(total) as ingresos_totales,
        (SELECT nombre FROM productos ORDER BY stock ASC LIMIT 1) as producto_critico
        FROM ventas WHERE DATE(fecha) = CURDATE()");
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
} 

if ($accion === 'historial_reciente') {
    // Últimas 10 ventas con nombre del vendedor
    $stmt = $pdo->query("SELECT v.*, u.nombre as vendedor 
                         FROM ventas v 
                         JOIN usuarios u ON v.vendedor_id = u.id 
                         ORDER BY v.fecha DESC LIMIT 10");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>