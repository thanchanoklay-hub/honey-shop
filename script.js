
// ==================================
// HONEY HOME - GOOGLE SHEETS API
// ==================================

const API_URL = "https://script.google.com/macros/s/AKfycbz9DA0SPEpmEyFHRsnWelqaz8i4Sva4PU7Dp81dQkWIfn3KcJxupiii7FyFHWqPz4E2vQ/exec";

let products = [];
let cart = [];

// Load products from Google Sheets
function loadProducts() {
    const callbackName = "honeyCallback_" + Date.now();

    window[callbackName] = function(data) {
        products = data.products || [];
        renderProducts();

        delete window[callbackName];
        document.getElementById("api-status").textContent =
            "เชื่อมต่อฐานข้อมูลสำเร็จ";
    };

    const script = document.createElement("script");

    script.src = API_URL + "?callback=" + callbackName;

    script.onerror = function() {
        document.getElementById("api-status").textContent =
            "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
        delete window[callbackName];
    };

    document.body.appendChild(script);
}

// Display products
function renderProducts() {
    const container = document.getElementById("product-list");

    container.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = "assets/images/" + product.image;
        image.alt = product.name;

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const description = document.createElement("p");
        description.textContent =
            "สินค้าคงเหลือ " + product.stock + " ชิ้น";

        const price = document.createElement("div");
        price.className = "price";
        price.textContent =
            Number(product.price).toLocaleString("th-TH") + " บาท";

        const button = document.createElement("button");
        button.className = "buy-button";
        button.textContent = "เพิ่มลงตะกร้า";
        button.onclick = () => addToCart(product.sku);

        info.append(name, description, price, button);
        card.append(image, info);
        container.appendChild(card);
    });
}

// Add product to cart
function addToCart(sku) {
    const product = products.find(p => p.sku === sku);

    if (!product) return;

    const existing = cart.find(item => item.sku === sku);
    const quantity = existing ? existing.quantity : 0;

    if (quantity >= Number(product.stock)) {
        alert("สินค้าไม่เพียงพอ");
        return;
    }

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            sku: product.sku,
            name: product.name,
            price: Number(product.price),
            quantity: 1
        });
    }

    updateCart();
}

// Update shopping cart
function updateCart() {
    const container = document.getElementById("cart-items");
    const totalElement = document.getElementById("cart-total");

    container.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        container.textContent = "ยังไม่มีสินค้าในตะกร้า";
        totalElement.textContent = "0";
        return;
    }

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("p");
        row.textContent =
            item.name + " × " + item.quantity +
            " = " + subtotal + " บาท ";

        const remove = document.createElement("button");
        remove.textContent = "ลบ";
        remove.onclick = () => removeFromCart(item.sku);

        row.appendChild(remove);
        container.appendChild(row);
    });

    totalElement.textContent = total.toLocaleString("th-TH");
}

// Remove product
function removeFromCart(sku) {
    cart = cart.filter(item => item.sku !== sku);
    updateCart();
}

// Submit order to Google Sheets
async function checkout() {
    if (cart.length === 0) {
        alert("กรุณาเลือกสินค้าก่อน");
        return;
    }

    const customerName = prompt("กรอกชื่อลูกค้า");
    if (!customerName || !customerName.trim()) return;

    const phone = prompt("กรอกเบอร์โทรศัพท์");
    if (!phone || !/^[0-9]{9,10}$/.test(phone.trim())) {
        alert("กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก");
        return;
    }

    const address = prompt("กรอกที่อยู่จัดส่ง");
    if (!address || !address.trim()) return;

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const order = {
        orderId: "ORD" + Date.now(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart.map(item => ({...item})),
        total: total
    };

    try {
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(order)
        });

        alert(
            "ส่งคำขอสั่งซื้อแล้ว\n" +
            "หมายเลขออเดอร์: " + order.orderId +
            "\nยอดรวม: " + total + " บาท" +
            "\nกรุณาตรวจสอบรายการในระบบร้านค้า"
        );

        cart = [];
        updateCart();

    } catch (error) {
        alert("ส่งคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่");
    }
}

// Start website
document.addEventListener("DOMContentLoaded", function() {
    loadProducts();
    updateCart();
});
