<?php
header('Content-Type: application/json');
require 'db.php';

$nombre = isset($_GET['nombre']) ? $_GET['nombre'] : '';
$categoria = isset($_GET['categoria']) ? $_GET['categoria'] : '';
$id_categoria = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : '';
$accion = $_GET['accion'] ?? '';
if ($accion === 'buscar') {
        try {
            $sql = "SELECT p.*, c.nombre as categoria_nombre 
                    FROM productos p 
                    LEFT JOIN categorias c ON p.id_categoria = c.id 
                    WHERE p.nombre LIKE ?";
            $params = ["%$nombre%"];

            if ($categoria != "") {
                $sql .= " AND p.id_categoria = ?";
                $params[] = $categoria;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            echo json_encode($productos);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
}

if ($accion === 'buscarCat') {
        try {
            $sql = "SELECT * FROM productos  WHERE id_categoria = ?";
            

            if ($id_categoria != "") {
               
                $params[] = $id_categoria;
            }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $productos = $stmt->fetchAll();

            echo json_encode($productos);
        } catch (Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
}