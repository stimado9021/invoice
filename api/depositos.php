<?php
include 'db.php'; // Asegúrate de que la ruta a tu conexión sea correcta

try {
    $stmt = $pdo->query("SELECT id, nombre FROM tiendas ORDER BY nombre ASC");
    $depositos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: application/json');
    echo json_encode($depositos);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
exit;