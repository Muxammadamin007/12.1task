
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  ArrowUpRight,
  Star,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import "./App.css";

const API = "https://dummyjson.com/products?limit=30";

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  // Fetch products and categories
  useEffect(() => {
    async function fetchStoreData() {
      try {
        setLoading(true);
        setError("");

        const [productsResponse, categoriesResponse] =
          await Promise.all([
            fetch(API),
            fetch("https://dummyjson.com/products/category-list"),
          ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
          throw new Error("Could not load products. Please try again.");
        }

        const productsData = await productsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setProducts(productsData.products);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStoreData();
  }, []);

  // Search, filter and sort
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, search, category, sort]);

  // Add product to cart
  function addToCart(product) {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previousCart, { ...product, quantity: 1 }];
    });
  }

  // Update product quantity
  function updateQuantity(id, amount) {
    setCart((previousCart) =>
      
      previousCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // Remove product
  function removeFromCart(id) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  }

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="store">

      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="logo">
          <span className="logo-icon">M.</span>
          <span>MONO<span className="logo-light"> / GOODS</span></span>
        </a>

        <nav className="nav-links">
          <a href="#products" className="active">Collection</a>
          <a href="#about">About</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag size={19} />
          <span>Bag</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">
            <span className="status-dot"></span>
            CURATED EVERYDAY OBJECTS
          </span>

          <h1>
            Less, but
            <br />
            <span>better.</span>
          </h1>

          <p>
            Thoughtfully selected essentials for modern living.
            Discover products that make everyday life better.
          </p>

          <a href="#products" className="hero-link">
            Explore collection <ArrowUpRight size={18} />
          </a>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=1000"
            alt="Minimal modern interior"
          />
          <div className="hero-label">
            <span>OBJECTS FOR EVERYDAY</span>
            <span>01 — 2026</span>
          </div>
        </div>
      </section>

      {/* PRODUCT SECTION */}
      <main className="products-section" id="products">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION / 2026</span>
            <h2>Find your essentials.</h2>
          </div>

          <span className="product-total">
            {filteredProducts.length} PRODUCTS
          </span>
        </div>

        {/* SEARCH AND SORT */}
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="sort-box">
            <SlidersHorizontal size={17} />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="categories">
          <button
            className={category === "all" ? "category active" : "category"}
            onClick={() => setCategory("all")}
          >
            All products
          </button>

          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "category active" : "category"}
              onClick={() => setCategory(item)}
            >
              {item.replaceAll("-", " ")}
            </button>
          ))}
        </div>

        {/* PRODUCT GRID */}
        {loading ? (
          <div className="message">
            <div className="loader"></div>
            <p>Curating your collection...</p>
          </div>
        ) : error ? (
          <div className="message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="message">
            <h3>No products found.</h3>
            <p>Try another search or category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    loading="lazy"
                  />

                  <button
                    className="add-button"
                    onClick={() => addToCart(product)}
                    aria-label={`Add ${product.title} to cart`}
                  >
                    <Plus size={20} />
                  </button>

                  {product.discountPercentage > 10 && (
                    <span className="discount-tag">SALE</span>
                  )}
                </div>

                <div className="product-info">
                  <div className="product-category">
                    {product.category.replaceAll("-", " ")}
                  </div>

                  <div className="product-name-row">
                    <h3>{product.title}</h3>
                    <span>{formatPrice(product.price)}</span>
                  </div>

                  <div className="product-rating">
                    <Star size={13} fill="currentColor" />
                    {product.rating.toFixed(1)}
                    <span> · {product.stock} in stock</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="footer" id="about">
        <div className="footer-logo">MONO.</div>
        <p>Thoughtful objects. Better everyday living.</p>
        <span>© 2026 MONO GOODS — STUDENT PROJECT</span>
      </footer>

      {/* SHOPPING CART */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR SELECTION</span>
                <h2>Your bag ({cartCount})</h2>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                <X size={23} />
              </button>
            </div>

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingBag size={38} />
                  <h3>Your bag is empty.</h3>
                  <p>Discover something you love.</p>

                  <button onClick={() => setCartOpen(false)}>
                    Continue shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img src={item.thumbnail} alt={item.title} />

                    <div className="cart-item-info">
                      <h4>{item.title}</h4>
                      <p>{formatPrice(item.price)}</p>

                      <div className="quantity">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Remove product"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>

              <p>Shipping calculated at checkout.</p>

              <button
                className="checkout-button"
                disabled={cart.length === 0}
                onClick={() =>
                  alert("Demo checkout — no real payment is processed.")
                }
              >
                Continue to checkout <ArrowUpRight size={18} />
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
