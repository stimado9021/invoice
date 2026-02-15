<?php
require 'db.php';
$input = json_decode(file_get_contents('php://input'), true);

if (isset($_GET['idUsuario'])) {
    $idUsuario = $_GET['idUsuario'];
    $rol = $_GET['rol'];
 
    $ip = $_SERVER['REMOTE_ADDR'];
    $accion='SALIDA';
    try {
        $stmt = $pdo->prepare("INSERT INTO auditoria_acceso (id_usuario,rol, accion, ip_address) VALUES (?,?, ?, ?)");
    $stmt->execute([$idUsuario,$rol,$accion, $ip]);
    echo json_encode([
        'success' => true
        ]);
    
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    
    
    
}