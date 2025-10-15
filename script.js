// Sample products data
const products = [
  {
    id: 1,
    name: "Burger Bò Phô Mai",
    price: 65000,
    image: "burgerbo.jpg",
  },
  {
    id: 2,
    name: "Gà Rán Giòn Tan",
    price: 55000,
    image: "garan.jpg",
  },
  {
    id: 3,
    name: "Pizza Hải Sản",
    price: 120000,
    image: "seafoodpizza.jpg",
  },
  {
    id: 4,
    name: "Khoai Tây Chiên",
    price: 35000,
    image: "khoaitay.jpg",
  },
  {
    id: 5,
    name: "Mì Ý Sốt Bò Băm",
    price: 75000,
    image: "spagetti.jpg",
  },
  {
    id: 6,
    name: "Coca Cola",
    price: 20000,
    image: "coca.jpg",
  },
  {
    id: 7,
    name: "Burger Gà Giòn",
    price: 60000,
    image: "burgerga.jpg",
  },
  {
    id: 8,
    name: "Combo Gia Đình",
    price: 250000,
    image: "combo.jpg",
  },
]

// Voucher codes
const vouchers = {
  GOAN10: { discount: 0.1, minOrder: 200000, name: "Giảm 10%" },
  GOAN20: { discount: 0.2, minOrder: 500000, name: "Giảm 20%" },
  FREESHIP: { discount: 30000, minOrder: 300000, name: "Miễn phí ship", isFixed: true },
}

// Initialize cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || []
let appliedVoucher = null

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cartCount")
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    cartCount.textContent = totalItems
  }
}

// Format currency
function formatCurrency(amount) {
  return amount.toLocaleString("vi-VN") + "đ"
}

// Load products on home page
function loadProducts() {
  const productsGrid = document.getElementById("productsGrid")
  if (!productsGrid) return

  productsGrid.innerHTML = products
    .map(
      (product) => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">${formatCurrency(product.price)}</p>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}


function addToCart(productId) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Nếu chưa đăng nhập
  if (!currentUser) {
    const addBtn = event.target // nút vừa bấm
    addBtn.classList.add("shake") // hiệu ứng rung
    showLoginModal() // hiện modal đăng nhập
    return
  }

  const product = products.find((p) => p.id === productId)
  if (!product) return

  const existingItem = cart.find((item) => item.id === productId)

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  updateCartCount()

  // Thông báo thành công
  showNotification("Đã thêm vào giỏ hàng!")
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div")
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `
  notification.textContent = message
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out"
    setTimeout(() => notification.remove(), 300)
  }, 2000)
}

// Search functionality
function setupSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")
  const searchSuggestions = document.getElementById("searchSuggestions")

  if (!searchInput || !searchBtn) return

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim()

    if (query === "") {
      searchSuggestions.classList.remove("show")
      searchSuggestions.innerHTML = ""
      return
    }

    // Filter products based on query
    const matches = products.filter((product) => product.name.toLowerCase().includes(query))

    if (matches.length > 0) {
      searchSuggestions.innerHTML = matches
        .map(
          (product) => `
            <div class="suggestion-item" onclick="selectSuggestion(${product.id}, '${product.name.replace(/'/g, "\\'")}')">
              <img src="${product.image}" alt="${product.name}" class="suggestion-item-image">
              <div class="suggestion-item-info">
                <div class="suggestion-item-name">${product.name}</div>
                <div class="suggestion-item-price">${formatCurrency(product.price)}</div>
              </div>
            </div>
          `,
        )
        .join("")
      searchSuggestions.classList.add("show")
    } else {
      searchSuggestions.innerHTML = '<div class="no-suggestions">Không tìm thấy món ăn phù hợp</div>'
      searchSuggestions.classList.add("show")
    }
  })

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.classList.remove("show")
    }
  })

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim()
    const productCards = document.querySelectorAll(".product-card")

    productCards.forEach((card) => {
      const productName = card.querySelector(".product-name").textContent.toLowerCase()
      if (productName.includes(query) || query === "") {
        card.style.display = "block"
      } else {
        card.style.display = "none"
      }
    })

    searchSuggestions.classList.remove("show")
  }

  searchBtn.addEventListener("click", performSearch)
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      performSearch()
    }
  })
}

function selectSuggestion(productId, productName) {
  const searchInput = document.getElementById("searchInput")
  const searchSuggestions = document.getElementById("searchSuggestions")

  searchInput.value = productName
  searchSuggestions.classList.remove("show")

  // Scroll to the product
  const productCard = document.querySelector(`.product-card[data-id="${productId}"]`)
  if (productCard) {
    productCard.scrollIntoView({ behavior: "smooth", block: "center" })
    productCard.style.animation = "none"
    setTimeout(() => {
      productCard.style.animation = "pulse 0.5s ease-in-out"
    }, 10)
  }
}

// Login form
function setupLoginForm() {
  const loginForm = document.getElementById("loginForm")
  if (!loginForm) return

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || []
    const user = users.find((u) => u.email === email && u.password === password)

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      showSuccessPopup()
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    } else {
      alert("Email hoặc mật khẩu không đúng!")
    }
  })
}

// Register form
function setupRegisterForm() {
  const registerForm = document.getElementById("registerForm")
  if (!registerForm) return

  registerForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const name = document.getElementById("registerName").value
    const email = document.getElementById("registerEmail").value
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("registerConfirmPassword").value

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users")) || []

    // Check if email already exists
    if (users.find((u) => u.email === email)) {
      alert("Email đã được sử dụng!")
      return
    }

    // Add new user
    const newUser = { name, email, password }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    showSuccessPopup()
    setTimeout(() => {
      window.location.href = "index.html"
    }, 2000)
  })
}

// Show success popup
function showSuccessPopup() {
  const popup = document.getElementById("successPopup")
  if (popup) {
    popup.classList.add("show")
  }
}

// Load cart page
function loadCartPage() {
  const cartItems = document.getElementById("cartItems")
  if (!cartItems) return

  if (cart.length === 0) {
    // Nếu giỏ hàng trống, hiển thị thông báo
    cartItems.innerHTML = `
      <div class="empty-cart" style="text-align:center; padding:50px; font-size:18px; color:#666;">
        🛒 Giỏ hàng của bạn đang trống
      </div>
    `
    document.getElementById("subtotal").textContent = "0đ"
    document.getElementById("total").textContent = "30.000đ"
    return
  }

  // Nếu có sản phẩm, hiển thị bình thường
  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">${formatCurrency(item.price)}</p>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Xóa</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")

  updateCartSummary()
}


// Update quantity
function updateQuantity(productId, change) {
  const item = cart.find((item) => item.id === productId)
  if (!item) return

  item.quantity += change

  if (item.quantity <= 0) {
    removeFromCart(productId)
    return
  }

  localStorage.setItem("cart", JSON.stringify(cart))
  loadCartPage()
  updateCartCount()
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  localStorage.setItem("cart", JSON.stringify(cart))
  loadCartPage()
  updateCartCount()
  showNotification("Đã xóa khỏi giỏ hàng!")
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 30000
  const total = subtotal + shipping

  document.getElementById("subtotal").textContent = formatCurrency(subtotal)
  document.getElementById("total").textContent = formatCurrency(total)
}

// Load checkout page
function loadCheckoutPage() {
  const orderItems = document.getElementById("orderItems")
  if (!orderItems) return

  if (cart.length === 0) {
    window.location.href = "cart.html"
    return
  }

  orderItems.innerHTML = cart
    .map(
      (item) => `
        <div class="order-item">
            <div>
                <div class="order-item-name">${item.name}</div>
                <div class="order-item-quantity">Số lượng: ${item.quantity}</div>
            </div>
            <div>${formatCurrency(item.price * item.quantity)}</div>
        </div>
    `,
    )
    .join("")

  updateCheckoutSummary()
}

// Update checkout summary
function updateCheckoutSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 30000
  let discount = 0

  if (appliedVoucher) {
    if (appliedVoucher.isFixed) {
      discount = appliedVoucher.discount
    } else {
      discount = subtotal * appliedVoucher.discount
    }
  }

  const total = subtotal + shipping - discount

  document.getElementById("checkoutSubtotal").textContent = formatCurrency(subtotal)
  document.getElementById("checkoutShipping").textContent = formatCurrency(shipping)

  const discountRow = document.getElementById("discountRow")
  if (discount > 0) {
    discountRow.style.display = "flex"
    document.getElementById("discountAmount").textContent = "-" + formatCurrency(discount)
  } else {
    discountRow.style.display = "none"
  }

  document.getElementById("checkoutTotal").textContent = formatCurrency(total)
}

// Apply voucher
function setupVoucher() {
  const applyVoucherBtn = document.getElementById("applyVoucher")
  if (!applyVoucherBtn) return

  applyVoucherBtn.addEventListener("click", () => {
    const voucherCode = document.getElementById("voucherCode").value.toUpperCase().trim()
    const voucherMessage = document.getElementById("voucherMessage")
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (!voucherCode) {
      voucherMessage.textContent = "Vui lòng nhập mã giảm giá!"
      voucherMessage.className = "voucher-message error"
      return
    }

    const voucher = vouchers[voucherCode]

    if (!voucher) {
      voucherMessage.textContent = "Mã giảm giá không hợp lệ!"
      voucherMessage.className = "voucher-message error"
      appliedVoucher = null
      updateCheckoutSummary()
      return
    }

    if (subtotal < voucher.minOrder) {
      voucherMessage.textContent = `Đơn hàng tối thiểu ${formatCurrency(voucher.minOrder)} để sử dụng mã này!`
      voucherMessage.className = "voucher-message error"
      appliedVoucher = null
      updateCheckoutSummary()
      return
    }

    appliedVoucher = voucher
    voucherMessage.textContent = `Áp dụng thành công mã ${voucher.name}!`
    voucherMessage.className = "voucher-message success"
    updateCheckoutSummary()
  })
}

// Checkout form
function setupCheckoutForm() {
  const checkoutForm = document.getElementById("checkoutForm")
  if (!checkoutForm) return

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value
    const phone = document.getElementById("phone").value
    const address = document.getElementById("address").value
    const payment = document.querySelector('input[name="payment"]:checked').value

    // Save order
    const order = {
      id: Date.now(),
      customer: { fullName, phone, address },
      items: cart,
      payment,
      voucher: appliedVoucher,
      date: new Date().toISOString(),
    }

    const orders = JSON.parse(localStorage.getItem("orders")) || []
    orders.push(order)
    localStorage.setItem("orders", JSON.stringify(orders))

    // Clear cart
    cart = []
    localStorage.setItem("cart", JSON.stringify(cart))
    appliedVoucher = null

    // Show success popup
    showSuccessPopup()

    setTimeout(() => {
      window.location.href = "index.html"
    }, 2000)
  })
}

function updateUserInterface() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const userInfo = document.getElementById("userInfo")
  const loginLink = document.getElementById("loginLink")
  const userGreeting = document.getElementById("userGreeting")

  if (currentUser && userInfo && loginLink && userGreeting) {
    // User is logged in
    userGreeting.textContent = `Xin chào, ${currentUser.name}!`
    userInfo.style.display = "flex"
    loginLink.style.display = "none"
  } else if (userInfo && loginLink) {
    // User is not logged in
    userInfo.style.display = "none"
    loginLink.style.display = "block"
  }
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn")
  if (!logoutBtn) return

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser")
    showNotification("Đã đăng xuất thành công!")
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  })
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html"
  const navLinks = document.querySelectorAll(".nav-link")

  navLinks.forEach((link) => {
    link.classList.remove("active")
    const linkHref = link.getAttribute("href")

    // Check if link matches current page
    if (linkHref === currentPage || (currentPage === "" && linkHref === "index.html")) {
      link.classList.add("active")
    }
    // Special case for cart page
    if (currentPage === "cart.html" && linkHref === "cart.html") {
      link.classList.add("active")
    }
    // Special case for checkout page
    if (currentPage === "checkout.html" && linkHref === "checkout.html") {
      link.classList.add("active")
    }
  })
}

function checkLoginForCart() {
  const currentPage = window.location.pathname.split("/").pop()
  if (currentPage === "cart.html") {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    if (!currentUser) {
      showLoginModal()
    }
  }
}

function showLoginModal() {
  const modal = document.createElement("div")
  modal.className = "login-modal"
  modal.innerHTML = `
    <div class="login-modal-content">
      <div class="login-modal-icon">🔒</div>
      <h3>Vui lòng đăng nhập</h3>
      <p>Bạn cần đăng nhập để sử dụng giỏ hàng và đặt hàng</p>
      <div class="login-modal-buttons">
        <button class="modal-login-btn" onclick="window.location.href='login.html'">Đăng nhập</button>
        <button class="modal-register-btn" onclick="window.location.href='register.html'">Đăng ký</button>
      </div>
    </div>
  `
  document.body.appendChild(modal)

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove()
      window.location.href = "index.html"
    }
  })
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount()
  loadProducts()
  setupSearch()
  setupLoginForm()
  setupRegisterForm()
  loadCartPage()
  loadCheckoutPage()
  setupVoucher()
  setupCheckoutForm()
  updateUserInterface()
  setupLogout()
  setActiveNavLink()
  checkLoginForCart()
})
// --- Cập nhật trạng thái active trên thanh menu ---
document.querySelectorAll(".nav-link").forEach(link => {
  // Khi click vào một menu link
  link.addEventListener("click", function () {
    // Xóa active cũ
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    // Gán active mới
    this.classList.add("active");
  });
});

// Nếu bạn dùng nhiều trang (index.html, cart.html, login.html, v.v.)
window.addEventListener("DOMContentLoaded", () => {
  const currentPage = location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
});
// Lấy tất cả các link trong navbar
const navLinks = document.querySelectorAll(".nav-link");

// Lấy trang hiện tại dựa trên URL
const currentPage = window.location.pathname.split("/").pop();

// Lặp qua từng link để thêm hoặc bỏ class active
navLinks.forEach(link => {
  const linkPage = link.getAttribute("href");

  // Nếu link này khớp với trang hiện tại => thêm class active
  if (currentPage === linkPage) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }

  // Khi người dùng nhấn link, đổi active sang đúng trang
  link.addEventListener("click", () => {
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
  });
});


// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`
document.head.appendChild(style)
const style2 = document.createElement("style");
style2.textContent = `
/* Làm mờ nền khi hiện modal đăng nhập */
.login-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 4000;
}

/* Hiệu ứng rung cho nút Thêm vào giỏ */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}
.shake {
  animation: shake 0.4s;
}
`;
document.head.appendChild(style2);

