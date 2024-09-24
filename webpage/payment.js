class Pix {
  constructor(pixKey, description, merchantName, merchantCity, txid, amount) {
    this.pixKey = pixKey;
    this.description = description;
    this.merchantName = merchantName;
    this.merchantCity = merchantCity;
    this.txid = txid;
    this.amount = amount.toFixed(2);
    this.ID_PAYLOAD_FORMAT_INDICATOR = "00";
    this.ID_MERCHANT_ACCOUNT_INFORMATION = "26";
    this.ID_MERCHANT_ACCOUNT_INFORMATION_GUI = "00";
    this.ID_MERCHANT_ACCOUNT_INFORMATION_KEY = "01";
    this.ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION = "02";
    this.ID_MERCHANT_CATEGORY_CODE = "52";
    this.ID_TRANSACTION_CURRENCY = "53";
    this.ID_TRANSACTION_AMOUNT = "54";
    this.ID_COUNTRY_CODE = "58";
    this.ID_MERCHANT_NAME = "59";
    this.ID_MERCHANT_CITY = "60";
    this.ID_ADDITIONAL_DATA_FIELD_TEMPLATE = "62";
    this.ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID = "05";
    this.ID_CRC16 = "63";
  }

  _getValue(id, value) {
    const size = String(value.length).padStart(2, "0");
    return id + size + value;
  }

  _getMechantAccountInfo() {
    const gui = this._getValue(
      this.ID_MERCHANT_ACCOUNT_INFORMATION_GUI,
      "br.gov.bcb.pix"
    );
    const key = this._getValue(
      this.ID_MERCHANT_ACCOUNT_INFORMATION_KEY,
      this.pixKey
    );
    const description = this._getValue(
      this.ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION,
      this.description
    );
    return this._getValue(
      this.ID_MERCHANT_ACCOUNT_INFORMATION,
      gui + key + description
    );
  }

  _getAdditionalDataFieldTemplate() {
    const txid = this._getValue(
      this.ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID,
      this.txid
    );
    return this._getValue(this.ID_ADDITIONAL_DATA_FIELD_TEMPLATE, txid);
  }

  getPayload() {
    const payload =
      this._getValue(this.ID_PAYLOAD_FORMAT_INDICATOR, "01") +
      this._getMechantAccountInfo() +
      this._getValue(this.ID_MERCHANT_CATEGORY_CODE, "0000") +
      this._getValue(this.ID_TRANSACTION_CURRENCY, "986") +
      this._getValue(this.ID_TRANSACTION_AMOUNT, this.amount) +
      this._getValue(this.ID_COUNTRY_CODE, "BR") +
      this._getValue(this.ID_MERCHANT_NAME, this.merchantName) +
      this._getValue(this.ID_MERCHANT_CITY, this.merchantCity) +
      this._getAdditionalDataFieldTemplate();
    return payload + this._getCRC16(payload);
  }

  _getCRC16(payload) {
    function ord(str) {
      return str.charCodeAt(0);
    }
    function dechex(number) {
      if (number < 0) {
        number = 0xffffffff + number + 1;
      }
      return parseInt(number, 10).toString(16);
    }
    payload = payload + this.ID_CRC16 + "04";
    let polinomio = 0x1021;
    let resultado = 0xffff;
    let length;
    if ((length = payload.length) > 0) {
      for (let offset = 0; offset < length; offset++) {
        resultado ^= ord(payload[offset]) << 8;
        for (let bitwise = 0; bitwise < 8; bitwise++) {
          if ((resultado <<= 1) & 0x10000) resultado ^= polinomio;
          resultado &= 0xffff;
        }
      }
    }
    return this.ID_CRC16 + "04" + dechex(resultado).toUpperCase();
  }
}

var payload = "";

function formatCurrency(input) {
  input = input.replace(/\D/g, "");
  let value = parseFloat(input);
  return "R$ " + value.toFixed(2);
}

document.getElementById("pix_value").addEventListener("input", function () {
  this.value = formatCurrency(this.value);
  generateQRCode();
});

function generateQRCode() {
  var rawPixValue = document.getElementById("pix_value").value;
  var pixValue =
    parseFloat(rawPixValue.replace("R$", "").trim().replace(",", ".")) || 0;

  var pixKey = "felipe@publio.dev";
  var description = "Presente de Casamento";
  var merchantName = "FELIPE CANTON DE OLIVEIRA PU";
  var merchantCity = "SAOPAULO";
  var txid = "CASAMENTO" + Date.now();

  const pix = new Pix(
    pixKey,
    description,
    merchantName,
    merchantCity,
    txid,
    pixValue
  );
  payload = pix.getPayload();

  displayQRCode(payload);
  displayPixCopy(payload);
}

function displayQRCode(payload) {
  const qrContainer = document.getElementById("qr-code-container");
  qrContainer.innerHTML = "";

  // Create a wrapper div for positioning
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";

  // Generate QR code
  new QRCode(wrapper, {
    text: payload,
    width: 228,
    height: 228,
  });

  // Create an overlay div for the PIX logo
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = "20%";
  overlay.style.height = "20%";
  overlay.style.backgroundImage = 'url("assets/pix.png")';
  overlay.style.backgroundSize = "contain";
  overlay.style.backgroundRepeat = "no-repeat";
  overlay.style.backgroundPosition = "center";

  // Add the overlay to the wrapper
  wrapper.appendChild(overlay);

  // Add the wrapper to the container
  qrContainer.appendChild(wrapper);
}

function displayPixCopy(payload) {
  const pixCopyInput = document.getElementById("pix-copy");
  pixCopyInput.value = payload.substring(0, 30) + "...";
  document.getElementById("copy_payload_button").disabled = false;
}

document
  .getElementById("copy_payload_button")
  .addEventListener("click", copyPayloadToClipboard);

function copyPayloadToClipboard() {
  navigator.clipboard.writeText(payload).then(function () {
    var copySuccessMessage = document.getElementById("copy_success_message");
    copySuccessMessage.style.display = "block";
    setTimeout(function () {
      copySuccessMessage.style.display = "none";
    }, 2000);
  });
}

document
  .getElementById("payment-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      amount: document.getElementById("pix_value").value,
    };

    fetch("https://api-casamento.publio.dev/gifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        window.location.href = "thank-you.html";
      })
      .catch((error) => {
        console.error("Error submitting the form:", error);
      });
  });

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

document.addEventListener("DOMContentLoaded", function () {
  var amount = getUrlParameter("amount");
  if (amount) {
    var pixValueInput = document.getElementById("pix_value");
    pixValueInput.value = formatCurrency(amount);
    generateQRCode();
  }
});
