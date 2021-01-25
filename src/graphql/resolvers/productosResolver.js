const { db } = require("../../connection");
module.exports = {
  Query: {
    productos(root, { id }) {
      if (id === undefined)
        return db.any("select * from productos order by id desc");
      else return db.any("select * from productos WHERE id=$1;", [id]);
    }
  },
  Producto: {
    descripcion(producto) {
      return db.one(
        `select distinct dp.* from descripcion_productos dp, productos p where dp.id = $1;`,
        [producto.id_descripcion_producto]
      );
    }
  },
  Mutation: {
    async updateProducto(root, { producto }) {
      if (producto === undefined) {
        return null;
      } else {
        let originalProducto = await db.one(
          `select * from productos p where p.id = $1;`,
          [producto.id]
        );

        let pCostoCompraNoIva =
          producto.costo_compra_no_iva === undefined
            ? originalProducto.costo_compra_no_iva
            : producto.costo_compra_no_iva;

        let pCostoVentaNoIva =
          producto.costo_venta_no_iva === undefined
            ? originalProducto.costo_venta_no_iva
            : producto.costo_venta_no_iva;

        let pCantidadDisponible =
          producto.cantidad_disponible === undefined
            ? originalProducto.cantidad_disponible
            : producto.cantidad_disponible;

        let pFechaExpiracion =
          producto.fecha_expiracion === undefined
            ? originalProducto.fecha_expiracion
            : producto.fecha_expiracion;

        let pIdDescripcionProducto =
          producto.id_descripcion_producto === undefined
            ? originalProducto.id_descripcion_producto
            : producto.id_descripcion_producto;

        const query = `update productos set costo_compra_no_iva = $2, 
        costo_venta_no_iva = $3, cantidad_disponible = $4, fecha_expiracion = $5, 
        id_descripcion_producto = $6 where id = $1 returning *;`;
        let result = db.one(query, [
          producto.id,
          pCostoCompraNoIva,
          pCostoVentaNoIva,
          pCantidadDisponible,
          pFechaExpiracion,
          pIdDescripcionProducto
        ]);
        return result;
      }
    },
    deleteProducto(root, { id }) {
      db.one(`delete from productos where id = $1;`, [id]);
      return id;
    },
    createProducto(root, { producto }) {
      console.log(producto);
      let result = db.one(
        `insert into productos (
        costo_compra_no_iva, costo_venta_no_iva, cantidad_disponible, 
        fecha_expiracion, id_descripcion_producto
        ) values (
          $1, $2, $3, $4, $5
        ) returning *;`,
        [
          producto.costo_compra_no_iva,
          producto.costo_venta_no_iva,
          producto.cantidad_disponible,
          producto.fecha_expiracion,
          producto.id_descripcion_producto
        ]
      );
      return result;
    }
  }
};
