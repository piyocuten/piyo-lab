let uploadedImageSrc = '';
let uploadedStoreLogoSrc = '';
let uploadedQrisSrc = '';
let currentPaperBg = 'bg-white';

let products = [
  { id: Date.now(), name: 'Capcut Norenew', qty: 1, price: '27.200', desc: '1 bulan' }
];

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID').format(number);
}

function formatDateIndonesian(dateString) {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toLowerCase();
}

function saveConfigToStorage() {
  const config = {
    store: document.getElementById('inputStore').value,
    status: document.getElementById('inputStatus').value,
    cashier: document.getElementById('inputCashier').value,
    payment: document.getElementById('inputPayment').value,
    date: document.getElementById('inputDate').value,
    trx: document.getElementById('inputTrx').value,
    bg: currentPaperBg,
    logoAlign: document.getElementById('inputLogoAlign').value,
    logoSize: document.getElementById('inputLogoSize').value,
    storeLogoSrc: uploadedStoreLogoSrc,
    qrisAlign: document.getElementById('inputQrisAlign').value,
    qrisSize: document.getElementById('inputQrisSize').value,
    qrisSrc: uploadedQrisSrc,
    whatsapp: document.getElementById('inputWhatsapp').value,
    telegram: document.getElementById('inputTelegram').value,
    instagram: document.getElementById('inputInstagram').value,
    wmToggle: document.getElementById('inputWmToggle').checked,
    wmType: document.querySelector('input[name="wmType"]:checked').value,
    wmText: document.getElementById('inputWmText').value,
    wmSize: document.getElementById('inputWmSize').value,
    wmOpacity: document.getElementById('inputWmOpacity').value,
    wmImageSrc: uploadedImageSrc,
    stampToggle: document.getElementById('inputStampToggle').checked,
    stampPos: document.getElementById('inputStampPos').value,
    stampOpacity: document.getElementById('inputOpacity').value
  };

  localStorage.setItem('vyota_nota_config', JSON.stringify(config));
}

function loadConfigFromStorage() {
  const saved = localStorage.getItem('vyota_nota_config');
  
  const todayIso = new Date().toISOString().split('T')[0];
  document.getElementById('inputDate').value = todayIso;

  if (!saved) return;

  try {
    const config = JSON.parse(saved);

    document.getElementById('inputStore').value = config.store || '🍀 VYOTA STORE 🍀';
    document.getElementById('inputStatus').value = config.status || 'LUNAS';
    document.getElementById('inputCashier').value = config.cashier || 'vyo';
    document.getElementById('inputPayment').value = config.payment || 'QRIS';
    if (config.date) {
      document.getElementById('inputDate').value = config.date;
    }
    if (config.trx !== undefined) {
      document.getElementById('inputTrx').value = config.trx;
    }
    
    if (config.bg) changeBg(config.bg, false);

    if (config.logoAlign) document.getElementById('inputLogoAlign').value = config.logoAlign;
    if (config.logoSize) document.getElementById('inputLogoSize').value = config.logoSize;
    if (config.storeLogoSrc) uploadedStoreLogoSrc = config.storeLogoSrc;

    if (config.qrisAlign) document.getElementById('inputQrisAlign').value = config.qrisAlign;
    if (config.qrisSize) document.getElementById('inputQrisSize').value = config.qrisSize;
    if (config.qrisSrc) uploadedQrisSrc = config.qrisSrc;

    if (config.whatsapp) document.getElementById('inputWhatsapp').value = config.whatsapp;
    if (config.telegram) document.getElementById('inputTelegram').value = config.telegram;
    if (config.instagram) document.getElementById('inputInstagram').value = config.instagram;

    if (config.wmToggle !== undefined) document.getElementById('inputWmToggle').checked = config.wmToggle;
    if (config.wmType) {
      document.querySelector(`input[name="wmType"][value="${config.wmType}"]`).checked = true;
      toggleWmType(false);
    }
    if (config.wmText) document.getElementById('inputWmText').value = config.wmText;
    if (config.wmSize) document.getElementById('inputWmSize').value = config.wmSize;
    if (config.wmOpacity) document.getElementById('inputWmOpacity').value = config.wmOpacity;
    if (config.wmImageSrc) uploadedImageSrc = config.wmImageSrc;

    if (config.stampToggle !== undefined) document.getElementById('inputStampToggle').checked = config.stampToggle;
    if (config.stampPos) document.getElementById('inputStampPos').value = config.stampPos;
    if (config.stampOpacity) document.getElementById('inputOpacity').value = config.stampOpacity;

  } catch (e) {
    console.error("Gagal membaca setting tersimpan", e);
  }
}

function resetSettings() {
  if (confirm('Yakin mau reset semua gambar dan settingan toko ke awal?')) {
    localStorage.removeItem('vyota_nota_config');
    location.reload();
  }
}

function addItemInput() {
  products.push({ id: Date.now(), name: '', qty: 1, price: '0', desc: '' });
  renderFormItems();
  updateReceipt();
}

function removeItemInput(id) {
  if (products.length <= 1) {
    alert('Minimal harus ada 1 produk.');
    return;
  }
  products = products.filter(p => p.id !== id);
  renderFormItems();
  updateReceipt();
}

function renderFormItems() {
  const container = document.getElementById('itemsFormContainer');
  container.innerHTML = '';

  products.forEach((p, index) => {
    const itemHtml = `
      <div class="p-3 bg-white rounded-xl border border-gray-200 relative space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-[11px] font-bold text-gray-400">Produk #${index + 1}</span>
          ${products.length > 1 ? `<button onclick="removeItemInput(${p.id})" class="text-red-400 hover:text-red-600 text-xs font-bold">✕ Hapus</button>` : ''}
        </div>
        
        <div>
          <input type="text" value="${p.name}" oninput="updateProductData(${p.id}, 'name', this.value)" placeholder="Nama Produk" class="w-full p-1.5 text-xs border rounded-lg focus:outline-pink-400">
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <input type="number" min="1" value="${p.qty}" oninput="updateProductData(${p.id}, 'qty', this.value)" placeholder="Qty" class="w-full p-1.5 text-xs border rounded-lg focus:outline-pink-400">
          </div>
          <div>
            <input type="text" value="${p.price}" oninput="updateProductData(${p.id}, 'price', this.value)" placeholder="Harga Rp" class="w-full p-1.5 text-xs border rounded-lg focus:outline-pink-400">
          </div>
        </div>

        <div>
          <input type="text" value="${p.desc}" oninput="updateProductData(${p.id}, 'desc', this.value)" placeholder="Keterangan singkat (opsional)" class="w-full p-1.5 text-xs border rounded-lg focus:outline-pink-400">
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', itemHtml);
  });
}

function updateProductData(id, field, value) {
  const product = products.find(p => p.id === id);
  if (product) {
    product[field] = value;
    updateReceipt();
  }
}

function toggleWmType(shouldUpdate = true) {
  const type = document.querySelector('input[name="wmType"]:checked').value;
  const textGroup = document.getElementById('wmTextInputGroup');
  const imgGroup = document.getElementById('wmImageInputGroup');
  
  if (type === 'text') {
    textGroup.classList.remove('hidden');
    imgGroup.classList.add('hidden');
  } else {
    textGroup.classList.add('hidden');
    imgGroup.classList.remove('hidden');
  }
  if (shouldUpdate) updateReceipt();
}

function handleStoreLogoUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedStoreLogoSrc = e.target.result;
      updateReceipt();
    }
    reader.readAsDataURL(file);
  }
}

function handleQrisUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedQrisSrc = e.target.result;
      updateReceipt();
    }
    reader.readAsDataURL(file);
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedImageSrc = e.target.result;
      updateReceipt();
    }
    reader.readAsDataURL(file);
  }
}

function updateReceipt() {
  const store = document.getElementById('inputStore').value;
  const time = document.getElementById('inputTime').value;
  const payment = document.getElementById('inputPayment').value;
  const rawDate = document.getElementById('inputDate').value;
  const date = formatDateIndonesian(rawDate) || rawDate;
  const trxVal = document.getElementById('inputTrx').value.trim();
  const cashier = document.getElementById('inputCashier').value;
  const status = document.getElementById('inputStatus').value;
  
  const stampToggle = document.getElementById('inputStampToggle').checked;
  const stampPos = document.getElementById('inputStampPos').value;
  const opacityVal = document.getElementById('inputOpacity').value;

  const previewContainer = document.getElementById('previewItemsContainer');
  previewContainer.innerHTML = '';
  
  let subtotal = 0;

  products.forEach(p => {
    const qty = parseInt(p.qty) || 1;
    const rawPrice = (p.price || '0').toString().replace(/[^0-9]/g, '');
    const priceNum = parseInt(rawPrice) || 0;
    const itemTotal = priceNum * qty;
    subtotal += itemTotal;

    const itemPreviewHtml = `
      <div>
        <div class="flex justify-between items-start font-semibold">
          <div>
            <span>${p.name || 'Nama Produk'}</span>
            <span class="text-[10px] text-gray-500 font-normal block">${qty}x @ Rp${formatRupiah(priceNum)}</span>
          </div>
          <span class="font-semibold">Rp${formatRupiah(itemTotal)}</span>
        </div>
        ${p.desc ? `<span class="text-[10px] text-gray-400 block mt-0.5">${p.desc}</span>` : ''}
      </div>
    `;
    previewContainer.insertAdjacentHTML('beforeend', itemPreviewHtml);
  });

  const rawDiscount = (document.getElementById('inputDiscount').value || '0').toString().replace(/[^0-9]/g, '');
  const discountVal = parseInt(rawDiscount) || 0;
  const discountType = document.getElementById('inputDiscountType').value;

  let discountAmount = discountType === 'percent' ? Math.round((subtotal * discountVal) / 100) : discountVal;
  const rawFee = (document.getElementById('inputFee').value || '0').toString().replace(/[^0-9]/g, '');
  const feeAmount = parseInt(rawFee) || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + feeAmount);

  document.getElementById('previewSubtotal').innerText = 'Rp' + formatRupiah(subtotal);

  const discountRow = document.getElementById('previewDiscountRow');
  if (discountAmount > 0) {
    discountRow.classList.remove('hidden');
    document.getElementById('previewDiscountLabel').innerText = discountType === 'percent' ? `(${discountVal}%)` : '';
    document.getElementById('previewDiscount').innerText = '-Rp' + formatRupiah(discountAmount);
  } else {
    discountRow.classList.add('hidden');
  }

  const feeRow = document.getElementById('previewFeeRow');
  if (feeAmount > 0) {
    feeRow.classList.remove('hidden');
    document.getElementById('previewFee').innerText = '+Rp' + formatRupiah(feeAmount);
  } else {
    feeRow.classList.add('hidden');
  }

  document.getElementById('previewTotal').innerText = 'Rp' + formatRupiah(grandTotal);

  const logoContainer = document.getElementById('logoContainer');
  const logoImg = document.getElementById('previewStoreLogo');
  const logoAlign = document.getElementById('inputLogoAlign').value;
  const logoSize = document.getElementById('inputLogoSize').value;

  if (uploadedStoreLogoSrc) {
    logoContainer.classList.remove('hidden');
    logoImg.src = uploadedStoreLogoSrc;
    logoImg.style.width = logoSize + 'px';
    logoContainer.className = logoAlign === 'left' ? "flex justify-start mb-1.5" : logoAlign === 'right' ? "flex justify-end mb-1.5" : "flex justify-center mb-1.5";
  } else {
    logoContainer.classList.add('hidden');
  }
  document.getElementById('logoSizeVal').innerText = logoSize + 'px';

  const qrisContainer = document.getElementById('qrisContainer');
  const qrisImgWrapper = document.getElementById('qrisImgWrapper');
  const qrisImg = document.getElementById('previewQrisImg');
  const qrisAlign = document.getElementById('inputQrisAlign').value;
  const qrisSize = document.getElementById('inputQrisSize').value;

  if (uploadedQrisSrc) {
    qrisContainer.classList.remove('hidden');
    qrisImg.src = uploadedQrisSrc;
    qrisImg.style.width = qrisSize + 'px';
    qrisImgWrapper.className = qrisAlign === 'left' ? "flex justify-start mb-1" : qrisAlign === 'right' ? "flex justify-end mb-1" : "flex justify-center mb-1";
  } else {
    qrisContainer.classList.add('hidden');
  }
  document.getElementById('qrisSizeVal').innerText = qrisSize + 'px';

  const socialValues = {
    whatsapp: document.getElementById('inputWhatsapp').value.trim(),
    telegram: document.getElementById('inputTelegram').value.trim(),
    instagram: document.getElementById('inputInstagram').value.trim()
  };
  const socialsPreview = document.getElementById('previewSocials');
  document.getElementById('previewWhatsapp').innerText = socialValues.whatsapp;
  document.getElementById('previewTelegram').innerText = socialValues.telegram;
  document.getElementById('previewInstagram').innerText = socialValues.instagram;
  socialsPreview.classList.toggle('hidden', !Object.values(socialValues).some(Boolean));

  const wmToggle = document.getElementById('inputWmToggle').checked;
  const wmType = document.querySelector('input[name="wmType"]:checked').value;
  const wmSize = document.getElementById('inputWmSize').value;
  const wmOpacity = document.getElementById('inputWmOpacity').value;

  const container = document.getElementById('previewWmContainer');
  const textEl = document.getElementById('previewWmText');
  const imgEl = document.getElementById('previewWmImg');

  if (wmToggle) {
    container.style.display = 'flex';
    container.style.opacity = wmOpacity / 100;

    if (wmType === 'text') {
      imgEl.classList.add('hidden');
      textEl.classList.remove('hidden');
      textEl.innerText = document.getElementById('inputWmText').value;
      textEl.style.fontSize = (wmSize / 3) + 'px';
    } else {
      textEl.classList.add('hidden');
      if (uploadedImageSrc) {
        imgEl.classList.remove('hidden');
        imgEl.src = uploadedImageSrc;
        imgEl.style.width = wmSize + 'px';
      }
    }
  } else {
    container.style.display = 'none';
  }

  document.getElementById('wmSizeVal').innerText = wmSize + 'px';
  document.getElementById('wmOpacityVal').innerText = wmOpacity + '%';

  document.getElementById('previewStore').innerText = store || 'NAMA TOKO';
  document.getElementById('previewTrx').innerText = 'TRX #' + (trxVal || '');
  document.getElementById('previewTimeHeader').innerText = time;
  document.getElementById('previewPayment').innerText = payment;
  document.getElementById('previewDate').innerText = date;
  document.getElementById('previewCashier').innerText = cashier;
  document.getElementById('opacityVal').innerText = opacityVal + '%';

  const stamp = document.getElementById('previewStamp');
  const stampControls = document.getElementById('stampControlsGroup');

  if (stampToggle) {
    stamp.style.display = 'block';
    stampControls.classList.remove('opacity-40', 'pointer-events-none');
    stamp.innerText = status;

    stamp.style.opacity = opacityVal / 100;
    stamp.style.left = stamp.style.right = stamp.style.top = stamp.style.bottom = stamp.style.transform = '';

    if (stampPos === 'left') {
      stamp.style.top = '-1.2rem'; stamp.style.left = '1rem'; stamp.style.transform = 'rotate(-12deg)';
    } else if (stampPos === 'center') {
      stamp.style.top = '50%'; stamp.style.left = '50%'; stamp.style.transform = 'translate(-50%, -50%) rotate(-12deg)';
    } else if (stampPos === 'right') {
      stamp.style.bottom = '-1.2rem'; stamp.style.right = '1rem'; stamp.style.transform = 'rotate(-12deg)';
    }

    let colorClasses = "absolute border-2 font-black px-2.5 py-0.5 rounded uppercase tracking-[0.14em] bg-transparent transition-all duration-200 text-xs ";
    colorClasses += status === 'LUNAS' ? "border-pink-500 text-pink-500" : status === 'PENDING' ? "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500";
    stamp.className = colorClasses;
    stamp.style.backgroundColor = 'transparent';
    stamp.style.lineHeight = '1.2';
    stamp.style.letterSpacing = '0.14em';
    stamp.style.zIndex = '30';
  } else {
    stamp.style.display = 'none';
    stampControls.classList.add('opacity-40', 'pointer-events-none');
  }

  saveConfigToStorage();
}

function setCurrentTimeOnly() {
  const now = new Date();
  document.getElementById('inputTime').value = now.toTimeString().split(' ')[0];
  updateReceipt();
}

function setCurrentDateOnly() {
  const now = new Date();
  const todayIso = now.toISOString().split('T')[0];
  document.getElementById('inputDate').value = todayIso;
  updateReceipt();
}

function changeBg(colorClass, shouldUpdate = true) {
  currentPaperBg = colorClass;
  const card = document.getElementById('receiptCard');
  
  const bgClassesToRemove = ['bg-white', 'bg-pink-50', 'bg-yellow-50', 'bg-blue-50', 'bg-green-50'];
  bgClassesToRemove.forEach(cls => card.classList.remove(cls));
  
  card.classList.add(colorClass);

  if (shouldUpdate) updateReceipt();
}

function previewReceipt() {
  const card = document.getElementById('receiptCard');
  html2canvas(card, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  }).then(canvas => {
    const dataUrl = canvas.toDataURL('image/png');
    const previewWindow = window.open('', '_blank', 'width=440,height=820');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Preview Nota</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                background: #fdf2f8;
                padding: 20px;
                font-family: Arial, sans-serif;
              }
              img {
                max-width: 100%;
                height: auto;
                border-radius: 18px;
                box-shadow: 0 14px 28px rgba(0,0,0,0.12);
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="Preview Nota" />
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  });
}

function downloadReceipt() {
  const card = document.getElementById('receiptCard');
  html2canvas(card, { scale: 2, useCORS: true, allowTaint: true }).then(canvas => {
    const link = document.createElement('a');
    link.download = 'nota-pembayaran.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

renderFormItems();
loadConfigFromStorage();
updateReceipt();