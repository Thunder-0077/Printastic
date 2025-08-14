// Order form estimator & submission simulation
const orderForm = document.getElementById('orderForm');
const qtyInput = document.getElementById('qtyInput');
const tierDisplay = document.getElementById('tierDisplay');
const estBreakdown = document.getElementById('estBreakdown');
const estTotal = document.getElementById('estTotal');
const formMsg = document.getElementById('formMsg');

function getTier(qty){
  if(qty>=50) return {label:'Bulk / Large', price:300};
  if(qty>=10) return {label:'Team / Medium', price:400};
  return {label:'Single / Small', price:500};
}
function format(n){return '₹'+n.toFixed(2);} 

function updateEstimate(){
  const qty = +qtyInput.value||0; const tier = getTier(qty);
  tierDisplay.innerHTML = `<strong>${tier.label}</strong> @ ₹${tier.price} each`;
  const total = qty * tier.price;
  estBreakdown.innerHTML = `<div>Base: ${format(qty * tier.price)}</div>`;
  estTotal.textContent = format(total);
}
qtyInput?.addEventListener('input', updateEstimate); updateEstimate();

orderForm?.addEventListener('submit', e => {
  e.preventDefault();
  formMsg.textContent = 'Submitting...';
  const fd = new FormData(orderForm);
  const qtyText = fd.get('sizes');
  let totalQty = 0;
  if(qtyText){
    // parse pattern S-10, M-4
    qtyText.toString().split(/[,\n]/).forEach(part=>{
      const m = part.match(/-(\d+)/); if(m) totalQty += +m[1];
    });
  }
  const tier = getTier(totalQty);
  const total = tier.price * totalQty;
  setTimeout(()=>{
  formMsg.textContent = `Order received! Estimated total ${format(total)} (${totalQty} items). We'll email confirmation shortly.`;
    orderForm.reset();
  estTotal.textContent = '₹0';
  }, 900);
});
