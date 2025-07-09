document.addEventListener("DOMContentLoaded", () => {
  const booksContainer = document.getElementById("books-container");
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  let cart = JSON.parse(localStorage.getItem("bookCart")) || [];

  const fetchBooks = async () => {
    try {
      const response = await fetch(
        "https://striveschool-api.herokuapp.com/books"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const books = await response.json();
      displayBooks(books);
    } catch (error) {
      console.error("Errore nel recupero dei libri:", error);
      booksContainer.innerHTML =
        '<p class="text-danger">Impossibile caricare i libri. Riprova più tardi.</p>';
    }
  };

  const displayBooks = (books) => {
    books.forEach((book) => {
      const col = document.createElement("div");
      col.className = "col-md-4 col-lg-3 book-card";
      col.innerHTML = `
                <div class="card h-100 d-flex flex-column">
                    <img src="${book.img}" class="card-img-top" alt="${book.title}" style="height: 200px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">Prezzo: €${book.price}</p>
                        <div class="mt-auto d-flex justify-content-between">
                            <button class="btn btn-danger btn-sm discard-btn" data-book-id="${book.asin}">Scarta</button>
                            <button class="btn btn-primary btn-sm buy-now-btn" data-book-id="${book.asin}" data-book-title="${book.title}" data-book-price="${book.price}">Compra ora</button>
                        </div>
                    </div>
                </div>
            `;
      booksContainer.appendChild(col);
    });

    document.querySelectorAll(".discard-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const card = event.target.closest(".book-card");
        if (card) {
          card.remove();
        }
      });
    });

    document.querySelectorAll(".buy-now-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const bookId = event.target.dataset.bookId;
        const bookTitle = event.target.dataset.bookTitle;
        const bookPrice = parseFloat(event.target.dataset.bookPrice);
        addToCart({ asin: bookId, title: bookTitle, price: bookPrice });
      });
    });
  };

  const addToCart = (book) => {
    const existingItem = cart.find((item) => item.asin === book.asin);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...book, quantity: 1 });
    }
    saveCart();
    renderCart();
  };

  const removeFromCart = (asin) => {
    cart = cart.filter((item) => item.asin !== asin);
    saveCart();
    renderCart();
  };

  const saveCart = () => {
    localStorage.setItem("bookCart", JSON.stringify(cart));
  };

  const renderCart = () => {
    cartItemsList.innerHTML = "";
    let total = 0;
    if (cart.length === 0) {
      cartItemsList.innerHTML =
        '<li class="list-group-item text-muted">Il carrello è vuoto.</li>';
    } else {
      cart.forEach((item) => {
        const li = document.createElement("li");
        li.className = "list-group-item cart-item";
        li.innerHTML = `
                    <span>${item.title} (x${item.quantity}) - €${(
          item.price * item.quantity
        ).toFixed(2)}</span>
                    <button class="btn btn-danger btn-sm remove-from-cart-btn" data-book-id="${
                      item.asin
                    }">Rimuovi</button>
                `;
        cartItemsList.appendChild(li);
        total += item.price * item.quantity;
      });
    }
    cartTotalElement.textContent = `Totale: €${total.toFixed(2)}`;

    document.querySelectorAll(".remove-from-cart-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        const bookId = event.target.dataset.bookId;
        removeFromCart(bookId);
      });
    });
  };

  // Inizializza la pagina
  fetchBooks();
  renderCart(); // Renderizza il carrello all'avvio
});
