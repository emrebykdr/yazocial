# 🚀 Yazocial Frontend Planı (Vite + React + Profesyonel UI)

## 🎯 Amaç

* Minimal ama güçlü UI
* Göz yormayan dark mode
* Modern SaaS hissiyatı
* Hızlı ve ölçeklenebilir yapı

---

# ⚙️ 1. Vite + React Kurulum

```bash
npm create vite@latest client -- --template react
cd client
npm install
```

---

# 🎨 2. UI ve Stil Sistemi (KRİTİK)

## 🔥 Sadece Tailwind yetmez!

👉 Profesyonel görünüm için şunu ekle:

* Tailwind CSS
* **Design tokens (renk sistemi)**
* Component standardı

---

## Tailwind Kurulum

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 🔥 Dark Theme Renk Sistemi

`tailwind.config.js`

```js
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0f1115",
        surface: "#171a21",
        surface2: "#1f232b",
        border: "#2a2f3a",

        textPrimary: "#e6e6e6",
        textSecondary: "#9ca3af",

        primary: "#6366f1", // soft indigo
        primaryHover: "#4f46e5",

        success: "#22c55e",
        danger: "#ef4444"
      }
    }
  },
  plugins: []
};
```

---

## 🎯 UI Tasarım Kuralları

* ❌ Saf siyah (#000) kullanma
* ✔ Soft dark (gri tonları) kullan
* ✔ Kontrast: textPrimary vs surface
* ✔ Shadow yerine border kullan

---

# 📦 3. Gerekli Paketler

```bash
npm install react-router-dom axios zustand @tanstack/react-query lucide-react
```

---

# 🧱 4. Klasör Yapısı (GÜNCELLENDİ)

```bash
src/
│
├── components/
│   ├── ui/        # Button, Input, Card
│   ├── layout/    # Navbar, Sidebar
│
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Question.jsx
│   ├── Profile.jsx
│
├── services/
│   ├── api.js
│   ├── auth.service.js
│
├── store/
│   └── auth.store.js
│
├── hooks/
│
├── layouts/
│   └── MainLayout.jsx
│
├── styles/
│   └── globals.css
│
└── App.jsx
```

---

# 🌐 5. Routing (React Router)

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

# 🔌 6. Axios Setup

```js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

# ⚡ 7. Zustand (Auth Store)

```js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }, 
}));
```

---

# 🔥 8. React Query Setup

```js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();
```

---

# 🎨 9. UI Component Örneği (Button)

```jsx
export default function Button({ children }) {
  return (
    <button className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg transition">
      {children}
    </button>
  );
}
```

---

# 🧠 10. Layout Sistemi

```jsx
export default function MainLayout({ children }) {
  return (
    <div className="bg-background text-textPrimary min-h-screen">
      <div className="max-w-5xl mx-auto p-4">
        {children}
      </div>
    </div>
  );
}
```

---

# 🔥 11. Profesyonel Görünüm İçin Altın Kurallar

## ✔ Boşluk (spacing)

* p-4, p-6 kullan
* her şey sıkışık olmasın

## ✔ Border kullan

```css
border border-border
```

## ✔ Radius

```css
rounded-xl
```

## ✔ Hover efekti

```css
hover:bg-surface2
```

---

# 🎯 12. MVP UI Sayfaları

Başlangıçta:

* Home (feed)
* Login/Register
* Question Detail
* Profile

---

# 🧪 13. Test

```bash
npm run dev
```

---

# 🚀 SONUÇ

Bu yapı sana:

✔ Minimal ama profesyonel UI
✔ Dark mode göz yormayan tasarım
✔ Modern React mimarisi
✔ Ölçeklenebilir frontend

sağlar.

---

# 🧠 NEXT LEVEL (İstersen)

* 🔥 UI component library (shadcn/ui)
* 🔥 Skeleton loading
* 🔥 Infinite scroll
* 🔥 Dark/Light toggle
* 🔥 Animations (framer-motion)

Bunları eklersen proje direkt “startup kalitesi”ne çıkar.
