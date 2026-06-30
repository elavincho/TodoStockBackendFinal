function agregarRenglon() {
  const tbody = document.querySelector("#conceptosTable tbody");
  const newRow = tbody.rows[0].cloneNode(true);
  newRow.querySelectorAll("input").forEach((input) => (input.value = ""));
  newRow.querySelector('input[name="conceptos[debe][]"]').value = "0";
  newRow.querySelector('input[name="conceptos[haber][]"]').value = "0";
  newRow.querySelector('input[name="conceptos[montoImpuesto][]"]').value = "0";
  tbody.appendChild(newRow);
  recalcularTotales();
}

function eliminarRenglon(btn) {
  const tbody = document.querySelector("#conceptosTable tbody");
  if (tbody.rows.length > 1) {
    btn.closest("tr").remove();
    recalcularTotales();
  }
}

function recalcularTotales() {
  let subtotalDebe = 0;
  let subtotalHaber = 0;
  let subtotalImpuesto = 0;
  let subtotalNeto = 0;

  document.querySelectorAll("#conceptosTable tbody tr").forEach((row) => {
    const debe =
      parseFloat(row.querySelector('input[name="conceptos[debe][]"]').value) ||
      0;
    const haber =
      parseFloat(row.querySelector('input[name="conceptos[haber][]"]').value) ||
      0;
    const impuesto =
      parseFloat(
        row.querySelector('input[name="conceptos[montoImpuesto][]"]').value,
      ) || 0;
    const neto = debe + haber + impuesto;

    subtotalDebe += debe;
    subtotalHaber += haber;
    subtotalImpuesto += impuesto;
    subtotalNeto += neto;

    row.querySelector('input[name="conceptos[netoRenglon][]"]').value =
      neto.toFixed(2);
  });

  document.getElementById("subtotalDebe").value = subtotalDebe.toLocaleString(
    "es-AR",
    { minimumFractionDigits: 2 },
  );
  document.getElementById("subtotalHaber").value = subtotalHaber.toLocaleString(
    "es-AR",
    { minimumFractionDigits: 2 },
  );
  document.getElementById("subtotalImpuesto").value =
    subtotalImpuesto.toLocaleString("es-AR", { minimumFractionDigits: 2 });
  document.getElementById("subtotalNeto").value = subtotalNeto.toLocaleString(
    "es-AR",
    { minimumFractionDigits: 2 },
  );

  calcularMontoAPagar();
}

function calcularMontoAPagar() {
  const subtotalNeto =
    parseFloat(
      document
        .getElementById("subtotalNeto")
        .value.replace(/\./g, "")
        .replace(",", "."),
    ) || 0;
  const retencion =
    parseFloat(document.getElementById("totalRetencion").value) || 0;
  const montoAPagar = subtotalNeto - retencion;
  document.getElementById("montoAPagar").value = montoAPagar.toFixed(2);
}

document.querySelectorAll(".calcular").forEach((input) => {
  input.addEventListener("change", recalcularTotales);
});

// Scripts Factura Proveedor

function agregarRenglon() {
  const tbody = document.querySelector("#detalleTable tbody");
  const newRow = tbody.rows[0].cloneNode(true);
  newRow.querySelectorAll("input").forEach((input) => {
    if (input.type !== "button") input.value = "";
  });
  newRow.querySelector('input[name="detalles[cantidad][]"]').value = "1";
  newRow.querySelector('input[name="detalles[precioUnitario][]"]').value = "0";
  tbody.appendChild(newRow);
  recalcularTotales();
}

function eliminarRenglon(btn) {
  const tbody = document.querySelector("#detalleTable tbody");
  if (tbody.rows.length > 1) {
    btn.closest("tr").remove();
    recalcularTotales();
  }
}

function recalcularTotales() {
  let subtotalNeto = 0;
  let iva21Total = 0;
  let iva105Total = 0;

  document.querySelectorAll("#detalleTable tbody tr").forEach((row) => {
    const cantidad =
      parseFloat(
        row.querySelector('input[name="detalles[cantidad][]"]').value,
      ) || 0;
    const precio =
      parseFloat(
        row.querySelector('input[name="detalles[precioUnitario][]"]').value,
      ) || 0;
    const alicIva = row.querySelector(
      'select[name="detalles[alicIva][]"]',
    ).value;
    const importe = cantidad * precio;

    row.querySelector('input[name="detalles[importe][]"]').value =
      importe.toFixed(2);

    subtotalNeto += importe;
    if (alicIva === "21%") {
      iva21Total += importe * 0.21;
    } else if (alicIva === "10.5%") {
      iva105Total += importe * 0.105;
    }
  });

  const otrosTributos =
    parseFloat(document.getElementById("otrosTributos").value) || 0;
  const total = subtotalNeto + iva21Total + iva105Total + otrosTributos;

  document.getElementById("subtotalNeto").value = subtotalNeto.toFixed(2);
  document.getElementById("iva21").value = iva21Total.toFixed(2);
  document.getElementById("iva105").value = iva105Total.toFixed(2);
  document.getElementById("total").value = total.toFixed(2);
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".calcular").forEach((input) => {
    input.addEventListener("change", recalcularTotales);
  });
  document
    .getElementById("otrosTributos")
    .addEventListener("change", recalcularTotales);
});

// JS crear ordenes de pago

const proveedorSelect = document.getElementById("proveedorId");
const cargarFacturasBtn = document.getElementById("cargarFacturas");
const facturasContainer = document.getElementById("facturasContainer");
const facturasListado = document.getElementById("facturasListado");
const seleccionarTodasCheckbox = document.getElementById("seleccionarTodas");
const totalSeleccionadoSpan = document.getElementById("totalSeleccionado");
const montoAPagarInput = document.getElementById("montoAPagar");

let facturasActuales = [];

if (proveedorSelect && cargarFacturasBtn) {
// Cargar facturas pendientes del proveedor
cargarFacturasBtn.addEventListener("click", async () => {
  const proveedorId = proveedorSelect.value;
  if (!proveedorId) {
    alert("Por favor, seleccione un proveedor primero");
    return;
  }

  try {
    const response = await fetch(
      `/ordenes-pago/facturas-pendientes/${proveedorId}`,
    );
    const data = await response.json();

    if (data.success && data.facturas.length > 0) {
      facturasActuales = data.facturas;
      mostrarFacturas(data.facturas);
      facturasContainer.style.display = "block";
    } else {
      facturasListado.innerHTML =
        '<p style="color: #999;">No hay facturas pendientes para este proveedor</p>';
      facturasContainer.style.display = "block";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al cargar facturas");
  }
});

function mostrarFacturas(facturas) {
  if (!facturas || facturas.length === 0) {
    facturasListado.innerHTML = "<p>No hay facturas pendientes</p>";
    return;
  }

  let html = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Sel.</th>
              <th style="padding: 8px; border: 1px solid #ddd;">N° Factura</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Fecha</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

  facturas.forEach((factura) => {
    const fecha = new Date(factura.fechaEmision).toLocaleDateString("es-AR");
    html += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
              <input type="checkbox" name="facturasSeleccionadas" value="${factura.id}" data-total="${factura.total}" class="factura-checkbox">
            </td>
            <td style="padding: 8px; border: 1px solid #ddd;">${factura.numero}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${fecha}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${factura.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
  });

  html += `</tbody></table>`;
  facturasListado.innerHTML = html;

  // Agregar event listeners a los checkboxes
  document.querySelectorAll(".factura-checkbox").forEach((cb) => {
    cb.addEventListener("change", recalcularTotal);
  });

  recalcularTotal();
}

function recalcularTotal() {
  let total = 0;
  document.querySelectorAll(".factura-checkbox:checked").forEach((cb) => {
    total += parseFloat(cb.dataset.total) || 0;
  });
  totalSeleccionadoSpan.textContent = total.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  });
  montoAPagarInput.value = total.toFixed(2);
}

// Seleccionar todas
seleccionarTodasCheckbox.addEventListener("change", () => {
  const checkboxes = document.querySelectorAll(".factura-checkbox");
  checkboxes.forEach((cb) => {
    cb.checked = seleccionarTodasCheckbox.checked;
  });
  recalcularTotal();
});

// Al cambiar proveedor, ocultar facturas
proveedorSelect.addEventListener("change", () => {
  facturasContainer.style.display = "none";
  facturasListado.innerHTML =
    '<p>Seleccione un proveedor y haga clic en "Cargar Facturas"</p>';
  seleccionarTodasCheckbox.checked = false;
  totalSeleccionadoSpan.textContent = "0.00";
  montoAPagarInput.value = "";
});

// Auto-cargar facturas si el proveedor viene preseleccionado
if (proveedorSelect.value) {
  cargarFacturasBtn.click();
}
} // fin if (proveedorSelect && cargarFacturasBtn)


// Función para autocompletar datos del producto seleccionado
    function autocompletarProducto(selectElement) {
      const row = selectElement.closest('tr');
      const selectedOption = selectElement.options[selectElement.selectedIndex];
      
      if (selectedOption.value) {
        const productoNombre = selectedOption.getAttribute('data-nombre') || '';
        const productoPrecio = selectedOption.getAttribute('data-precio') || 0;
        
        row.querySelector('input[name="detalles[descripcion][]"]').value = productoNombre;
        row.querySelector('input[name="detalles[precioUnitario][]"]').value = productoPrecio;
        row.querySelector('input[name="detalles[codigo][]"]').value = selectedOption.value;
        
        // Recalcular importe
        const cantidad = parseFloat(row.querySelector('input[name="detalles[cantidad][]"]').value) || 0;
        const precio = parseFloat(productoPrecio);
        row.querySelector('input[name="detalles[importe][]"]').value = (cantidad * precio).toFixed(2);
        
        recalcularTotales();
      }
    }
    
    function agregarRenglon() {
      const tbody = document.querySelector('#detalleTable tbody');
      const newRow = tbody.rows[0].cloneNode(true);
      newRow.querySelectorAll('input').forEach(input => {
        if (input.type !== 'button' && input.type !== 'checkbox') input.value = '';
        if (input.type === 'checkbox') input.checked = true;
      });
      newRow.querySelector('select').value = '';
      newRow.querySelector('input[name="detalles[cantidad][]"]').value = '1';
      newRow.querySelector('input[name="detalles[precioUnitario][]"]').value = '0';
      tbody.appendChild(newRow);
      
      // Agregar event listener al nuevo select
      newRow.querySelector('.producto-select').addEventListener('change', function() {
        autocompletarProducto(this);
      });
      
      recalcularTotales();
    }
    
    function eliminarRenglon(btn) {
      const tbody = document.querySelector('#detalleTable tbody');
      if (tbody.rows.length > 1) {
        btn.closest('tr').remove();
        recalcularTotales();
      }
    }
    
    function recalcularTotales() {
      let subtotalNeto = 0;
      let iva21Total = 0;
      let iva105Total = 0;
      
      document.querySelectorAll('#detalleTable tbody tr').forEach(row => {
        const cantidad = parseFloat(row.querySelector('input[name="detalles[cantidad][]"]').value) || 0;
        const precio = parseFloat(row.querySelector('input[name="detalles[precioUnitario][]"]').value) || 0;
        const alicIva = row.querySelector('select[name="detalles[alicIva][]"]').value;
        const importe = cantidad * precio;
        
        row.querySelector('input[name="detalles[importe][]"]').value = importe.toFixed(2);
        
        subtotalNeto += importe;
        if (alicIva === '21%') {
          iva21Total += importe * 0.21;
        } else if (alicIva === '10.5%') {
          iva105Total += importe * 0.105;
        }
      });
      
      const otrosTributos = parseFloat(document.getElementById('otrosTributos').value) || 0;
      const total = subtotalNeto + iva21Total + iva105Total + otrosTributos;
      
      document.getElementById('subtotalNeto').value = subtotalNeto.toFixed(2);
      document.getElementById('iva21').value = iva21Total.toFixed(2);
      document.getElementById('iva105').value = iva105Total.toFixed(2);
      document.getElementById('total').value = total.toFixed(2);
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      document.querySelectorAll('.producto-select').forEach(select => {
        select.addEventListener('change', function() {
          autocompletarProducto(this);
        });
      });
      
      document.querySelectorAll('.calcular').forEach(input => {
        input.addEventListener('change', recalcularTotales);
      });
      document.getElementById('otrosTributos').addEventListener('change', recalcularTotales);
    });



    // Asegurar que los event listeners funcionen para nuevas filas
function inicializarEventListenersParaFila(productoRow, detalleRow) {
  const selectProducto = productoRow.querySelector('.producto-select');
  const inputCantidad = productoRow.querySelector('input[name="detalles[cantidad][]"]');
  const inputPrecio = detalleRow.querySelector('input[name="detalles[precioUnitario][]"]');
  
  if (selectProducto) {
    selectProducto.addEventListener('change', function() {
      autocompletarProducto(this);
    });
  }
  
  if (inputCantidad) {
    inputCantidad.addEventListener('change', function() {
      recalcularImporte(this);
    });
  }
  
  if (inputPrecio) {
    inputPrecio.addEventListener('change', function() {
      recalcularImportePorRow(this);
    });
  }
}