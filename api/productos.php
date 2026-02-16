<?php
header('Content-Type: application/json');
require 'db.php';

$nombre = isset($_GET['nombre']) ? $_GET['nombre'] : '';
$categoria = isset($_GET['categoria']) ? $_GET['categoria'] : '';
$id_categoria = isset($_GET['categoria_id']) ? $_GET['categoria_id'] : '';
$id_deposito = isset($_GET['idDeposito']) ? $_GET['idDeposito'] : '';
$accion = $_GET['accion'] ?? '';
if ($accion === 'buscar') {
        try {
        $sql = "SELECT 
            p.id, 
            p.codigoPro, 
            p.nombre, 
            p.precio, 
            c.nombre AS categoria_nombre, 
            COALESCE(sd.cantidad, 0) AS stock,
            -- Forzamos a que muestre el ID que estamos consultando aunque no haya stock
            ? AS id_deposito 
        FROM productos p
        LEFT JOIN categorias c ON p.id_categoria = c.id
        LEFT JOIN stock_depositos sd ON p.id = sd.id_producto AND sd.id_deposito = ?
        WHERE p.nombre LIKE ?";

// Ahora pasamos el ID del depósito dos veces: una para la columna y otra para el filtro del JOIN
$params = [$id_deposito, $id_deposito, "%$nombre%"];

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