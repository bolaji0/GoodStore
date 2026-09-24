// build film-strip perforation dots
['filmRow1','filmRow2','filmRow3','filmRow4'].forEach(id => {
  const row = document.getElementById(id);
  if(!row) return;
  for(let i=0;i<40;i++){
    const s = document.createElement('span');
    row.appendChild(s);
  }
});

// Countdown to end of day
function updateCountdown(){
  const now = new Date();
  const end = new Date(now);
  end.setHours(23,59,59,999);
  let diff = Math.max(0, end - now);
  const h = String(Math.floor(diff/3600000)).padStart(2,'0');
  const m = String(Math.floor((diff%3600000)/60000)).padStart(2,'0');
  const s = String(Math.floor((diff%60000)/1000)).padStart(2,'0');
  const el = document.getElementById('countdown');
  if(el) el.textContent = `${h}:${m}:${s}`;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Pricing: 1 unit = 12,000. 2 units = 19,500. Each unit after that adds 5,000.
function unitPrice(qty){
  if(qty <= 1) return 12000;
  return 19500 + (qty - 2) * 5000;
}

// Plan cards — clicking one jumps the quantity to match its label
const plans = document.querySelectorAll('.plan');
const planLabel = document.getElementById('planLabel');
const totalPrice = document.getElementById('totalPrice');
const stickyPrice = document.getElementById('stickyPrice');
const qtyVal = document.getElementById('qtyVal');

let state = { qty: 1 };

function qtyFromLabel(label){
  const match = label.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
}

function selectPlanForQty(qty){
  plans.forEach(p => {
    p.classList.toggle('selected', qtyFromLabel(p.dataset.label) === qty);
  });
}

plans.forEach(p => {
  if(p.classList.contains('popular')) p.classList.add('selected');
  p.addEventListener('click', () => {
    state.qty = qtyFromLabel(p.dataset.label);
    qtyVal.textContent = state.qty;
    plans.forEach(x => x.classList.remove('selected'));
    p.classList.add('selected');
    renderTotal();
  });
});

function formatNaira(n){
  return '₦' + n.toLocaleString('en-NG');
}

function renderTotal(){
  const total = unitPrice(state.qty);
  planLabel.textContent = `${state.qty} Unit${state.qty > 1 ? 's' : ''}`;
  totalPrice.textContent = formatNaira(total);
  stickyPrice.textContent = formatNaira(total);
}
renderTotal();

document.getElementById('qtyMinus').addEventListener('click', () => {
  state.qty = Math.max(1, state.qty - 1);
  qtyVal.textContent = state.qty;
  selectPlanForQty(state.qty);
  renderTotal();
});
document.getElementById('qtyPlus').addEventListener('click', () => {
  state.qty = Math.min(10, state.qty + 1);
  qtyVal.textContent = state.qty;
  selectPlanForQty(state.qty);
  renderTotal();
});

// Form validation + submit
const form = document.getElementById('orderForm');
const modalOverlay = document.getElementById('modalOverlay');
const modalText = document.getElementById('modalText');
const whatsappConfirm = document.getElementById('whatsappConfirm');

function setInvalid(fieldId, invalid){
  const el = document.getElementById(fieldId);
  if(!el) return;
  el.classList.toggle('invalid', invalid);
}

function validPhone(v){
  const digits = v.replace(/\D/g,'');
  return digits.length >= 10 && digits.length <= 14;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('fullname').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const stateSel = document.getElementById('state').value;
  const address = document.getElementById('address').value.trim();

  let ok = true;
  setInvalid('field-name', name.length < 3); if(name.length < 3) ok = false;
  setInvalid('field-phone', !validPhone(phone)); if(!validPhone(phone)) ok = false;
  setInvalid('field-state', !stateSel); if(!stateSel) ok = false;
  setInvalid('field-address', address.length < 6); if(address.length < 6) ok = false;

  if(!ok) return;

  const total = unitPrice(state.qty);
  const label = `${state.qty} Unit${state.qty > 1 ? 's' : ''}`;
  modalText.textContent = `${name}, your order for ${label} (${formatNaira(total)}) to ${stateSel} is confirmed. We'll call ${phone} shortly — pay the rider in cash on arrival.`;

  const waText = encodeURIComponent(
    `Hi AmpliScreen, I'd like to confirm my order:\nName: ${name}\nPhone: ${phone}\nState: ${stateSel}\nAddress: ${address}\nPack: ${label}\nTotal: ${formatNaira(total)} (Pay on Delivery)`
  );
  whatsappConfirm.href = `https://wa.me/2348054624377?text=${waText}`;

  modalOverlay.classList.add('open');
});

document.getElementById('closeModal').addEventListener('click', () => {
  modalOverlay.classList.remove('open');
});
modalOverlay.addEventListener('click', (e) => {
  if(e.target === modalOverlay) modalOverlay.classList.remove('open');
});