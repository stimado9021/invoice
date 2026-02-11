CREATE DATABASE joicy_nails_db;
USE joicy_nails_db;

-- Tabla de Usuarios (Admin y Vendedores)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    correo VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'vendedor') NOT NULL
);

-- Categorías de Productos
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Inventario de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    id_categoria INT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id)
);

-- Cabecera de Factura
CREATE TABLE facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_nombre VARCHAR(100),
    cliente_correo VARCHAR(100),
    cliente_telefono VARCHAR(20),
    subtotal DECIMAL(10,2),
    impuesto_total DECIMAL(10,2),
    total DECIMAL(10,2),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

-- Detalle de Factura
CREATE TABLE factura_detalle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_factura INT,
    id_producto INT,
    cantidad INT,
    precio_unitario DECIMAL(10,2),
    FOREIGN KEY (id_factura) REFERENCES facturas(id),
    FOREIGN KEY (id_producto) REFERENCES productos(id)
);

-- Registros iniciales de prueba
INSERT INTO usuarios (nombre, correo, password, rol) VALUES 
('Administrador', 'admin@joicy.com', 'admin123', 'admin'),
('Vendedor 1', 'ventas@joicy.com', 'venta123', 'vendedor');

INSERT INTO categorias (nombre) VALUES ('Acrílicos'), ('Geles'), ('Herramientas');