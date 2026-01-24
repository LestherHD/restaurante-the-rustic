Ruta de Implementación Sugerida
Módulo 1: Bodega (Inventario Nivel 1): Gestión de compras, conversión de unidades (Libras/Gales -> Onzas) y cálculo de CXO base.

Módulo 2: Manufactura (Subrecetas Nivel 2): Procesamiento de carnes (ahumados) y salsas. Aquí se registra la merma (peso perdido) para ajustar el CXO de salida.

Módulo 3: Menú (Platos Finales Nivel 3): Armado de platos usando los CXO de los módulos anteriores.

Módulo 4: Operaciones y Alertas: Integración con ventas para descontar stock en cascada y notificaciones automáticas.

Prompt para Módulo 1: Bodega e Insumos (Nivel 1)
Copia este prompt para trabajarlo en tu IA de desarrollo. He incluido la lógica de "Añadir Stock" y la integración con lo que ya tengas realizado.

Instrucción: "Actúa como un desarrollador Senior. Vamos a implementar el Módulo de Bodega (Inventario Nivel 1) para un sistema de restaurante. Este módulo es el corazón del costo del negocio y debe integrarse con los módulos que ya tenemos desarrollados.

Objetivo Técnico: Crear un CRUD de ingredientes donde la unidad de medida interna sea siempre la Onza (oz), pero permitiendo compras en unidades comerciales (Libras, Kilos, Litros, etc.).

Lógica del Módulo:

Catálogo de Ingredientes: Cada registro debe tener:

Nombre, Categoría (Carnes, Vegetales, Lácteos, etc.).

Stock Actual (en oz) y Stock Mínimo (en oz).

CXO Histórico (Costo por onza promedio).

Funcionalidad: 'Añadir Stock' (Entrada de Almacén):

El usuario ingresa la compra especificando: Costo Total, Unidad de Compra (ej. Libra) y Cantidad Comprada.

Conversión: El sistema debe usar un factor de conversión para transformar la compra a onzas.


Ejemplo: Si entran 20 lbs de Brisket a $460.00 , el sistema registra 320 oz y calcula un nuevo CXO de $1.43.

Costo Promedio: Si ya había stock, el sistema debe promediar el CXO anterior con el nuevo para mantener la precisión.

Alertas Visuales:

Generar un reporte o notificación visual si el Stock Actual oz es menor o igual al Stock Mínimo oz.

Integración: Ten en cuenta que el proyecto ya tiene algunos módulos realizados. Diseña este módulo de forma que las tablas de ingredientes puedan ser consultadas fácilmente por futuros módulos de 'Recetas' y 'Subrecetas'.