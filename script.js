// Honey Home - Shopping Cart System

// Product information
const products = [
    {
        sku: "HN001",
        name: "น้ำผึ้งดอกลำไย",
        price: 150,
        stock: 50
    },
    {
        sku: "HN002",
        name: "น้ำผึ้งดอกไม้ป่า",
        price: 180,
        stock: 40
    }
];

// Shopping cart
let cart = [];

// Add product to cart
function addToCart(sku) {

    const product = products.find(item => item.sku === sku);

    if (!product) {
        alert("ไม่พบสินค้า");
        return;
    }

    const existingItem = cart.find(item => item.sku === sku);

    const currentQuantity = existingItem
        ? existingItem.quantity
        : 0;

    if (currentQuantity >= product.stock) {
        alert("สินค้าไม่เพียงพอ");
        return;
    }

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            sku: product.sku,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateCart();

    alert("เพิ่มสินค้าลงตะกร้าแล้ว");
}

// Update cart display
function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>ยังไม่มีสินค้าในตะกร้า</p>";
        cartTotal.textContent = "0";
        return;
    }

    cartItems.innerHTML = "";

    cart.forEach(item => {

        const subtotal = item.price * item.quantity;

        total += subtotal;

        const div = document.createElement("div");

        div.innerHTML = `
            <p>
                ${item.name}
                × ${item.quantity}
                = ${subtotal} บาท
                <button onclick="removeFromCart('${item.sku}')">
                    ลบ
                </button>
            </p>
        `;

        cartItems.appendChild(div);
    });

    cartTotal.textContent = total.toLocaleString("th-TH");
}

// Remove product from cart
function removeFromCart(sku) {

    cart = cart.filter(item => item.sku !== sku);

    updateCart();
}

// Checkout
function checkout() {

    if (cart.length === 0) {
        alert("กรุณาเลือกสินค้าก่อนสั่งซื้อ");
        return;
    }

    const customerName = prompt("กรุณากรอกชื่อลูกค้า:");

    if (!customerName || !customerName.trim()) {
        alert("กรุณากรอกชื่อ");
        return;
    }

    const phone = prompt("กรุณากรอกเบอร์โทรศัพท์:");

    if (!phone || !/^[0-9]{9,10}$/.test(phone.trim())) {
        alert("กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก");
        return;
    }

    const address = prompt("กรุณากรอกที่อยู่จัดส่ง:");

    if (!address || !address.trim()) {
        alert("กรุณากรอกที่อยู่");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const order = {
        orderId: "ORD" + Date.now(),
        orderDate: new Date().toISOString(),
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: [...cart],
        total: total,
        status: "Pending",
        trackingNo: ""
    };

    // Save order in browser for demonstration
    const savedOrders = JSON.parse(
        localStorage.getItem("honeyOrders") || "[]"
    );

    savedOrders.push(order);

    localStorage.setItem(
        "honeyOrders",
        JSON.stringify(savedOrders)
    );

    alert(
        "สั่งซื้อสำเร็จ!\n" +
        "หมายเลขคำสั่งซื้อ: " + order.orderId +
        "\nยอดรวม: " + total + " บาท"
    );

    cart = [];

    updateCart();
}

// Initialize cart
document.addEventListener("DOMContentLoaded", updateCart);
