<?php
header("Content-Type: application/json");
require_once "db.php"; // Tu conexión a la BD




// Dentro de api/ventas.php, después de la lógica de guardado
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'historial') {
    header("Content-Type: application/json");
    $periodo = $_GET['periodo'] ?? 'hoy';
$whereClause = "";

switch ($periodo) {
        case 'hoy':
            $whereClause = "WHERE DATE(v.fecha) = CURDATE()";
            break;
        case 'semana':
            $whereClause = "WHERE YEARWEEK(v.fecha, 1) = YEARWEEK(CURDATE(), 1)";
            break;
        case 'mes':
            $whereClause = "WHERE MONTH(v.fecha) = MONTH(CURDATE()) AND YEAR(v.fecha) = YEAR(CURDATE())";
            break;
        case 'todas':
            $whereClause = ""; 
            break;
        default:
            $whereClause = "WHERE DATE(v.fecha) = CURDATE()";
    }

    try {
        // Traemos la hora, el nombre del vendedor (haciendo JOIN con usuarios) y el total
        $stmt = $pdo->query("SELECT v.id, v.fecha, v.total, u.nombre as vendedor 
                             FROM ventas v 
                             JOIN usuarios u ON v.vendedor_id = u.id 
                             $whereClause
                             ORDER BY v.fecha DESC LIMIT 20");
         
        $ventas = $stmt->fetchAll(PDO::FETCH_ASSOC);
       
       echo json_encode([
            "status" => "success",
            "ventas" => $ventas
        ]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
    exit;
}


// Ejemplo rápido de la lógica en PHP
if ($_GET['accion'] === 'detalle') {
    header("Content-Type: application/json");
require_once "db.php"; // Tu conexión a la BD
   
    
    // Dentro de api/ventas.php, cuando accion == 'detalle'

$idVenta = $_GET['id'];
// var_dump($idVenta); 
// 1. Obtener la información general de la venta y el cliente
$queryVenta = "SELECT v.*, u.nombre as vendedor_nombre 
               FROM ventas v 
               LEFT JOIN usuarios u ON v.vendedor_id = u.id 
               WHERE v.id = $idVenta";

$resVenta = $pdo->query($queryVenta);

$venta = $resVenta->fetchAll(PDO::FETCH_ASSOC);
// var_dump($venta);
// 1. Obtener la información general de la venta y el cliente
$queryCliente = "SELECT c.*, c.nombre as cliente_nombre 
               FROM ventas v 
               LEFT JOIN clientes c ON v.cliente_id = c.id 
               WHERE v.id = $idVenta";

$resCliente = $pdo->query($queryCliente);

$cliente = $resCliente->fetchAll(PDO::FETCH_ASSOC);

// 2. Obtener los productos asociados a esa factura
// Nota: Ajusta 'venta_productos' al nombre real de tu tabla pivote
$sqlProductos = "SELECT dv.*, p.nombre 
                     FROM ventas_detalle dv
                     JOIN productos p ON dv.producto_id = p.id 
                     WHERE dv.venta_id  = :idVenta";
    
    $stmtProd = $pdo->prepare($sqlProductos);
    $stmtProd->execute([':idVenta' => $idVenta]);
    $productos = $stmtProd->fetchAll(PDO::FETCH_ASSOC);
// var_dump($productos);
// 3. Devolver todo en JSON para el JavaScript
// Estructura de respuesta esperada:
    echo json_encode([
        "status" => "success",
        "venta" => [$venta],
        "cliente" => [$cliente],
        "productos" => [$productos]
    ]);
    exit;
}


if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['accion']) && $_GET['accion'] === 'buscar_cliente') {
    header("Content-Type: application/json");
    $query = "%" . ($_GET['query'] ?? '') . "%";

    try {
        // Buscamos coincidencias por nombre o teléfono
        $stmt = $pdo->prepare("SELECT nombre, email, telefono FROM clientes 
                               WHERE nombre LIKE ?  
                               LIMIT 5");
        $stmt->execute([$query]);
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($clientes);
    } catch (Exception $e) {
        echo json_encode([]);
    }
    exit;
}
