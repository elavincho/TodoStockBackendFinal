// ============================================
// FACTURAS PROVEEDOR - MÓDULO DE TARJETAS
// ============================================

let productoCounter = 1;

// Función para inicializar event listeners de una tarjeta
function inicializarEventListenersTarjeta(card) {
  // Selector de producto
  const productoSelect = card.querySelector('.producto-select');
  if (productoSelect) {
    productoSelect.removeEventListener('change', autocompletarProductoHandler);
    productoSelect.addEventListener('change', autocompletarProductoHandler);
  }

  // Campos de calcular (cantidad, precio unitario)
  const calcularInputs = card.querySelectorAll('.calcular');
  calcularInputs.forEach(input => {
    input.removeEventListener('change', recalcularImporteHandler);
    input.addEventListener('change', recalcularImporteHandler);
  });
}

// Handlers para poder remover event listeners si es necesario
function autocompletarProductoHandler(event) {
  autocompletarProducto(event.target);
}

function recalcularImporteHandler(event) {
  recalcularImporte(event.target);
}

// Función para autocompletar producto
function autocompletarProducto(selectElement) {
  const card = selectElement.closest('.producto-card');
  const selectedOption = selectElement.options[selectElement.selectedIndex];

  if (selectedOption && selectedOption.value) {
    const productoNombre = selectedOption.getAttribute('data-nombre') || '';
    const productoPrecio = selectedOption.getAttribute('data-precio') || 0;

    const descripcionInput = card.querySelector('input[name="detalles[descripcion][]"]');
    const precioInput = card.querySelector('input[name="detalles[precioUnitario][]"]');
    const codigoInput = card.querySelector('input[name="detalles[codigo][]"]');
    const cantidadInput = card.querySelector('input[name="detalles[cantidad][]"]');
    const importeInput = card.querySelector('input[name="detalles[importe][]"]');

    if (descripcionInput) descripcionInput.value = productoNombre;
    if (precioInput) precioInput.value = productoPrecio;
    if (codigoInput) codigoInput.value = selectedOption.value;

    const cantidad = parseFloat(cantidadInput ? cantidadInput.value : 0) || 0;
    const precio = parseFloat(productoPrecio);
    if (importeInput) importeInput.value = (cantidad * precio).toFixed(2);

    recalcularTotales();
  }
}

// Función para agregar nuevo producto
function agregarProducto() {
  const container = document.getElementById('productosContainer');
  if (!container) return;

  // Validar que todas las cards tengan producto seleccionado
  const cards = container.querySelectorAll('.producto-card');
  for (let i = 0; i < cards.length; i++) {
    const select = cards[i].querySelector('select[name="detalles[productoId][]"]');
    if (!select || !select.value) {
      alert(`Seleccioná un producto en la fila #${i + 1} antes de agregar otro.`);
      select?.focus();
      return;
    }
  }

  const template = container.querySelector('.producto-card');
  if (!template) return;

  const newCard = template.cloneNode(true);

  // Limpiar valores
  newCard.querySelectorAll('input').forEach(input => {
    if (input.type !== 'button') {
      input.value = '';
    }
  });

  const selectElement = newCard.querySelector('select');
  if (selectElement) selectElement.value = '';

  const cantidadInput = newCard.querySelector('input[name="detalles[cantidad][]"]');
  if (cantidadInput) cantidadInput.value = '1';

  const precioInput = newCard.querySelector('input[name="detalles[precioUnitario][]"]');
  if (precioInput) precioInput.value = '0';

  const importeInput = newCard.querySelector('input[name="detalles[importe][]"]');
  if (importeInput) importeInput.value = '';

  const ivaSelect = newCard.querySelector('select[name="detalles[alicIva][]"]');
  if (ivaSelect) ivaSelect.value = '21%';

  // Inicializar event listeners para la nueva tarjeta
  inicializarEventListenersTarjeta(newCard);

  container.appendChild(newCard);
  recalcularTotales();
}

// Función para eliminar producto
function eliminarProducto(btn) {
  const card = btn.closest('.producto-card');
  const container = document.getElementById('productosContainer');
  if (!container) return;

  if (container.querySelectorAll('.producto-card').length > 1) {
    card.remove();
    recalcularTotales();
  } else {
    alert('Debe haber al menos un producto en la factura');
  }
}

// Recalcular importe de un producto específico
function recalcularImporte(inputElement) {
  const card = inputElement.closest('.producto-card');
  if (!card) return;

  const cantidad = parseFloat(card.querySelector('input[name="detalles[cantidad][]"]')?.value) || 0;
  const precio = parseFloat(card.querySelector('input[name="detalles[precioUnitario][]"]')?.value) || 0;
  const importe = cantidad * precio;

  const importeInput = card.querySelector('input[name="detalles[importe][]"]');
  if (importeInput) importeInput.value = importe.toFixed(2);

  recalcularTotales();
}

// Recalcular todos los totales
function recalcularTotales() {
  let subtotalNeto = 0;
  let iva21Total = 0;
  let iva105Total = 0;

  document.querySelectorAll('.producto-card').forEach(card => {
    const cantidad = parseFloat(card.querySelector('input[name="detalles[cantidad][]"]')?.value) || 0;
    const precio = parseFloat(card.querySelector('input[name="detalles[precioUnitario][]"]')?.value) || 0;
    const alicIva = card.querySelector('select[name="detalles[alicIva][]"]')?.value || '21%';
    const importe = cantidad * precio;

    subtotalNeto += importe;
    if (alicIva === '21%') {
      iva21Total += importe * 0.21;
    } else if (alicIva === '10.5%') {
      iva105Total += importe * 0.105;
    }
  });

  const otrosTributos = parseFloat(document.getElementById('otrosTributos')?.value) || 0;
  const total = subtotalNeto + iva21Total + iva105Total + otrosTributos;

  const subtotalNetoInput = document.getElementById('subtotalNeto');
  const iva21Input = document.getElementById('iva21');
  const iva105Input = document.getElementById('iva105');
  const totalInput = document.getElementById('total');

  if (subtotalNetoInput) subtotalNetoInput.value = subtotalNeto.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  if (iva21Input) iva21Input.value = iva21Total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  if (iva105Input) iva105Input.value = iva105Total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  if (totalInput) totalInput.value = total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
}

// Inicializar todas las tarjetas al cargar la página
function inicializarTodasLasTarjetas() {
  const tarjetas = document.querySelectorAll('.producto-card');
  tarjetas.forEach(tarjeta => {
    inicializarEventListenersTarjeta(tarjeta);
  });
}

// Inicializar event listeners al cargar la página
document.addEventListener('DOMContentLoaded', function () {
  // Inicializar todas las tarjetas existentes
  inicializarTodasLasTarjetas();

  // Otros tributos
  const otrosTributos = document.getElementById('otrosTributos');
  if (otrosTributos) {
    otrosTributos.addEventListener('change', recalcularTotales);
  }
});