import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ad = {
  id: number;
  title: string;
  price: number | null;
  category: string;
  city: string;
  description: string;
  image: string;
  date: string;
  views: number;
  favorites: number;
  seller: string;
  sellerRating: number;
  sellerDeals: number;
  condition: "new" | "used" | "excellent";
  urgent: boolean;
  promoted: boolean;
  phone: string;
};

type Page = "feed" | "ad" | "post" | "cabinet" | "favorites" | "messages";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "all", label: "Все", icon: "LayoutGrid" },
  { id: "electronics", label: "Электроника", icon: "Smartphone" },
  { id: "auto", label: "Авто", icon: "Car" },
  { id: "realty", label: "Недвижимость", icon: "Home" },
  { id: "clothes", label: "Одежда", icon: "Shirt" },
  { id: "furniture", label: "Мебель", icon: "Sofa" },
  { id: "sport", label: "Спорт", icon: "Dumbbell" },
  { id: "work", label: "Работа", icon: "Briefcase" },
  { id: "services", label: "Услуги", icon: "Wrench" },
  { id: "kids", label: "Детское", icon: "Baby" },
];

const CITIES = ["Все города", "Москва", "Санкт-Петербург", "Новосибирск", "Казань", "Екатеринбург"];

const MOCK_ADS: Ad[] = [
  { id: 1, title: "iPhone 15 Pro Max 256GB", price: 89900, category: "electronics", city: "Москва", description: "Продаю iPhone 15 Pro Max в идеальном состоянии. Куплен месяц назад, есть все документы и коробка. Чехол и защитное стекло в подарок. Торг уместен.", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop", date: "Сегодня, 14:32", views: 842, favorites: 34, seller: "Алексей К.", sellerRating: 4.9, sellerDeals: 47, condition: "excellent", urgent: false, promoted: true, phone: "+7 (999) 123-45-67" },
  { id: 2, title: "Toyota Camry 2021 2.5L", price: 2850000, category: "auto", city: "Санкт-Петербург", description: "Продаю Toyota Camry 2021 года, 2.5 литра, автомат. Один владелец, полный сервисный пакет. ПТС оригинал, не бита, не крашена.", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop", date: "Вчера, 10:15", views: 1243, favorites: 89, seller: "Дмитрий В.", sellerRating: 5.0, sellerDeals: 12, condition: "excellent", urgent: true, promoted: false, phone: "+7 (812) 456-78-90" },
  { id: 3, title: "Квартира 2к, 58м² у метро", price: 8500000, category: "realty", city: "Москва", description: "Продаётся двухкомнатная квартира 58 кв.м. в 5 минутах от метро Щёлковская. Свежий ремонт, встроенная кухня, тёплый пол в ванной.", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", date: "2 дня назад", views: 567, favorites: 121, seller: "АН Простор", sellerRating: 4.7, sellerDeals: 234, condition: "excellent", urgent: false, promoted: true, phone: "+7 (495) 789-01-23" },
  { id: 4, title: "MacBook Pro 14\" M3 Pro", price: 149000, category: "electronics", city: "Казань", description: "MacBook Pro 14 дюймов с чипом M3 Pro. 18GB RAM, 512GB SSD. Покупал для работы, продаю в связи с переходом на стационарный ПК.", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop", date: "3 дня назад", views: 398, favorites: 28, seller: "Марина Л.", sellerRating: 4.8, sellerDeals: 31, condition: "new", urgent: false, promoted: false, phone: "+7 (843) 234-56-78" },
  { id: 5, title: "Диван угловой IKEA KIVIK", price: 28000, category: "furniture", city: "Москва", description: "Продаю угловой диван IKEA KIVIK в отличном состоянии. Чехлы стираны, пружины целые. Самовывоз, помогу разобрать.", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", date: "4 дня назад", views: 213, favorites: 15, seller: "Ольга Н.", sellerRating: 4.6, sellerDeals: 8, condition: "used", urgent: true, promoted: false, phone: "+7 (926) 345-67-89" },
  { id: 6, title: "Велосипед Trek Marlin 7", price: 42000, category: "sport", city: "Новосибирск", description: "Горный велосипед Trek Marlin 7, размер рамы L, 2022 год. Проехал около 500 км, всё в рабочем состоянии. Продаю в связи с переездом.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", date: "5 дней назад", views: 176, favorites: 22, seller: "Игорь П.", sellerRating: 4.9, sellerDeals: 19, condition: "excellent", urgent: false, promoted: false, phone: "+7 (383) 456-78-90" },
  { id: 7, title: "Пальто женское Max Mara S", price: 12500, category: "clothes", city: "Москва", description: "Продаю пальто Max Mara, размер S, цвет верблюжий. Носила один сезон, состояние отличное. Есть бирка. Торг минимальный.", image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=300&fit=crop", date: "Сегодня, 09:00", views: 94, favorites: 31, seller: "Анна С.", sellerRating: 4.5, sellerDeals: 14, condition: "excellent", urgent: false, promoted: false, phone: "+7 (916) 567-89-01" },
  { id: 8, title: "Ремонт квартир под ключ", price: null, category: "services", city: "Москва", description: "Бригада с 10-летним опытом выполнит ремонт любой сложности. Составим смету бесплатно. Работаем по договору. Гарантия 2 года.", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop", date: "Сегодня, 11:20", views: 312, favorites: 44, seller: "СтройМастер", sellerRating: 4.8, sellerDeals: 87, condition: "new", urgent: false, promoted: true, phone: "+7 (495) 678-90-12" },
  { id: 9, title: "PlayStation 5 + 3 игры", price: 52000, category: "electronics", city: "Екатеринбург", description: "Продаю PS5 дисковую версию с 3 играми: God of War Ragnarök, Spider-Man 2, FIFA 24. Всё в идеале, коробки на месте.", image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=300&fit=crop", date: "2 дня назад", views: 534, favorites: 67, seller: "Роман Б.", sellerRating: 4.7, sellerDeals: 23, condition: "excellent", urgent: false, promoted: false, phone: "+7 (343) 789-01-23" },
  { id: 10, title: "Детская кроватка + матрас", price: 7500, category: "kids", city: "Санкт-Петербург", description: "Кроватка трансформер для детей от 0 до 5 лет. Матрас кокосовый + пружинный в комплекте. Цвет белый, без сколов.", image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400&h=300&fit=crop", date: "3 дня назад", views: 89, favorites: 12, seller: "Юлия М.", sellerRating: 5.0, sellerDeals: 6, condition: "used", urgent: false, promoted: false, phone: "+7 (812) 890-12-34" },
  { id: 11, title: "Samsung 65\" QLED 4K", price: 67000, category: "electronics", city: "Москва", description: "Телевизор Samsung 65 дюймов QLED, 4K, 120Гц, Smart TV. Покупал год назад за 120к, продаю в связи с переездом. В идеальном состоянии.", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&h=300&fit=crop", date: "Вчера, 18:00", views: 421, favorites: 55, seller: "Сергей Т.", sellerRating: 4.6, sellerDeals: 29, condition: "excellent", urgent: true, promoted: false, phone: "+7 (926) 901-23-45" },
  { id: 12, title: "Офис-менеджер, от 60 000₽", price: 60000, category: "work", city: "Москва", description: "Требуется офис-менеджер в современный офис. График 5/2 с 9 до 18, полный соцпакет, ДМС. Опыт от 1 года. Хороший коллектив.", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", date: "Сегодня, 08:30", views: 267, favorites: 8, seller: "ООО ТехКом", sellerRating: 4.4, sellerDeals: 156, condition: "new", urgent: false, promoted: true, phone: "+7 (495) 012-34-56" },
];

const MESSAGES = [
  { id: 1, from: "Алексей К.", text: "Здравствуйте! Ещё актуально?", time: "14:45", unread: true, ad: "iPhone 15 Pro Max" },
  { id: 2, from: "Дмитрий В.", text: "Торг возможен?", time: "12:30", unread: true, ad: "Toyota Camry" },
  { id: 3, from: "Марина Л.", text: "Спасибо, договорились!", time: "Вчера", unread: false, ad: "MacBook Pro 14\"" },
];

const fmtPrice = (p: number | null) => {
  if (p === null) return "Договорная";
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1)} млн ₽`;
  if (p >= 1_000) return `${(p / 1_000).toFixed(0)} 000 ₽`;
  return `${p} ₽`;
};

const conditionLabel: Record<string, { label: string; color: string }> = {
  new:       { label: "Новое",         color: "#16a34a" },
  excellent: { label: "Отличное",      color: "#2563eb" },
  used:      { label: "Б/у",           color: "#d97706" },
};

// ─── Components ───────────────────────────────────────────────────────────────

function Header({ page, setPage, favCount, msgCount }: {
  page: Page; setPage: (p: Page) => void;
  favCount: number; msgCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <button onClick={() => setPage("feed")} className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)" }}>
            <Icon name="Tag" size={18} className="text-white" />
          </div>
          <span className="font-black text-xl hidden sm:block" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>
            Avito<span style={{ color: "var(--brand)" }}>+</span>
          </span>
        </button>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
          <input
            placeholder="Поиск по объявлениям..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--surface-3)", border: "1.5px solid transparent", color: "var(--text-1)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--brand)"; e.target.style.background = "white"; }}
            onBlur={(e) => { e.target.style.borderColor = "transparent"; e.target.style.background = "var(--surface-3)"; }}
          />
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: "favorites" as Page, icon: "Heart", count: favCount },
            { id: "messages" as Page, icon: "MessageCircle", count: msgCount },
            { id: "cabinet" as Page, icon: "User", count: 0 },
          ].map(({ id, icon, count }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: page === id ? "var(--brand-light)" : "transparent",
                color: page === id ? "var(--brand)" : "var(--text-2)",
              }}
            >
              <Icon name={icon} size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center badge-pulse"
                  style={{ background: "var(--brand)", fontSize: "10px", fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setPage("post")}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-white shrink-0 transition-all duration-200 hover:opacity-90 active:scale-95"
          style={{ background: "var(--brand)" }}
        >
          <Icon name="Plus" size={16} />
          Подать объявление
        </button>

        <button className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-3)" }} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name="Menu" size={18} style={{ color: "var(--text-2)" }} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-2 animate-fade-in-up" style={{ borderTop: "1px solid var(--border)" }}>
          {[
            { id: "favorites" as Page, label: "Избранное", icon: "Heart", count: favCount },
            { id: "messages" as Page, label: "Сообщения", icon: "MessageCircle", count: msgCount },
            { id: "cabinet" as Page, label: "Кабинет", icon: "User", count: 0 },
          ].map(({ id, label, icon, count }) => (
            <button key={id} onClick={() => { setPage(id); setMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: page === id ? "var(--brand-light)" : "var(--surface-3)", color: page === id ? "var(--brand)" : "var(--text-1)" }}>
              <Icon name={icon} size={16} />
              {label}
              {count > 0 && <span className="ml-auto w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold" style={{ background: "var(--brand)" }}>{count}</span>}
            </button>
          ))}
          <button onClick={() => { setPage("post"); setMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: "var(--brand)" }}>
            <Icon name="Plus" size={16} />Подать объявление
          </button>
        </div>
      )}
    </header>
  );
}

function AdCard({ ad, onOpen, isFav, onFav }: {
  ad: Ad; onOpen: () => void; isFav: boolean; onFav: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="ad-card rounded-2xl overflow-hidden cursor-pointer animate-fade-in-up"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      onClick={onOpen}
    >
      <div className="relative" style={{ aspectRatio: "4/3", overflow: "hidden" }}>
        <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        {ad.promoted && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white text-xs font-bold"
            style={{ background: "var(--brand)" }}>Реклама</span>
        )}
        {ad.urgent && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-white text-xs font-bold"
            style={{ background: "var(--danger)" }}>Срочно</span>
        )}
        <button
          onClick={onFav}
          className="absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90"
          style={{ background: isFav ? "var(--brand)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)" }}
        >
          <Icon name="Heart" size={15} style={{ color: isFav ? "white" : "var(--text-2)", fill: isFav ? "white" : "none" }} />
        </button>
      </div>
      <div className="p-3">
        <div className="font-black text-base mb-0.5" style={{ color: ad.price ? "var(--brand)" : "var(--text-1)", fontFamily: "'Montserrat', sans-serif" }}>
          {fmtPrice(ad.price)}
        </div>
        <div className="text-sm font-medium mb-1.5 line-clamp-2" style={{ color: "var(--text-1)" }}>{ad.title}</div>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{ad.city}</span>
          <span className="text-xs" style={{ color: "var(--text-3)" }}>{ad.date}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
            style={{ background: `${conditionLabel[ad.condition].color}18`, color: conditionLabel[ad.condition].color }}>
            {conditionLabel[ad.condition].label}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-3)" }}>
            <Icon name="Eye" size={11} />{ad.views}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function FeedPage({ setPage, setSelectedAd, favorites, toggleFav }: {
  setPage: (p: Page) => void;
  setSelectedAd: (ad: Ad) => void;
  favorites: number[];
  toggleFav: (id: number) => void;
}) {
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Все города");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"date" | "price_asc" | "price_desc" | "views">("date");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    let ads = MOCK_ADS.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (city !== "Все города" && a.city !== city) return false;
      if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (priceFrom && a.price !== null && a.price < Number(priceFrom)) return false;
      if (priceTo && a.price !== null && a.price > Number(priceTo)) return false;
      return true;
    });
    if (sort === "price_asc") ads = [...ads].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === "price_desc") ads = [...ads].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sort === "views") ads = [...ads].sort((a, b) => b.views - a.views);
    return ads;
  }, [category, city, search, sort, priceFrom, priceTo]);

  const promoted = MOCK_ADS.filter((a) => a.promoted).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero banner */}
      <div
        className="rounded-2xl p-6 mb-6 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg,#f97316 0%,#ea580c 50%,#c2410c 100%)", boxShadow: "0 8px 30px rgba(249,115,22,0.3)" }}
      >
        <div className="flex-1">
          <div className="text-white font-black text-2xl mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Найди всё, что нужно
          </div>
          <div className="text-white/80 text-sm mb-4">Более 12 000 объявлений по всей России</div>
          <div className="flex gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 text-white text-sm font-semibold">
              <Icon name="Shield" size={14} />Безопасная сделка
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 text-white text-sm font-semibold">
              <Icon name="Truck" size={14} />Доставка
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 text-white text-sm font-semibold">
              <Icon name="Star" size={14} />Рейтинг продавцов
            </div>
          </div>
        </div>
        <Icon name="ShoppingBag" size={72} className="text-white/20 hidden md:block shrink-0" />
      </div>

      {/* Categories scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0"
            style={{
              background: category === cat.id ? "var(--brand)" : "var(--surface)",
              color: category === cat.id ? "white" : "var(--text-2)",
              border: `1px solid ${category === cat.id ? "var(--brand)" : "var(--border)"}`,
              boxShadow: category === cat.id ? "0 4px 15px rgba(249,115,22,0.3)" : "none",
            }}
          >
            <Icon name={cat.icon} size={15} />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="rounded-2xl p-5 sticky top-24" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-bold text-base mb-4" style={{ color: "var(--text-1)" }}>Фильтры</div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Город</div>
              <select value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="mb-4">
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Цена, ₽</div>
              <div className="flex gap-2">
                <input placeholder="От" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                <input placeholder="До" value={priceTo} onChange={(e) => setPriceTo(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
              </div>
            </div>

            <div className="mb-5">
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Сортировка</div>
              {[
                { val: "date", label: "По дате" },
                { val: "price_asc", label: "Сначала дешевле" },
                { val: "price_desc", label: "Сначала дороже" },
                { val: "views", label: "По просмотрам" },
              ].map(({ val, label }) => (
                <button key={val} onClick={() => setSort(val as typeof sort)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-all"
                  style={{ background: sort === val ? "var(--brand-light)" : "transparent", color: sort === val ? "var(--brand)" : "var(--text-2)" }}>
                  {sort === val && <Icon name="Check" size={13} />}
                  {sort !== val && <div className="w-[13px]" />}
                  {label}
                </button>
              ))}
            </div>

            <button onClick={() => { setCategory("all"); setCity("Все города"); setPriceFrom(""); setPriceTo(""); setSort("date"); }}
              className="w-full py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-3)" }} />
              <input placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              <Icon name="SlidersHorizontal" size={15} />Фильтры
            </button>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              {(["grid", "list"] as const).map((v) => (
                <button key={v} onClick={() => setViewMode(v)}
                  className="w-9 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: viewMode === v ? "var(--brand)" : "transparent" }}>
                  <Icon name={v === "grid" ? "LayoutGrid" : "List"} size={15} style={{ color: viewMode === v ? "white" : "var(--text-3)" }} />
                </button>
              ))}
            </div>
            <span className="text-sm ml-auto" style={{ color: "var(--text-3)" }}>
              {filtered.length} объявлений
            </span>
          </div>

          {/* Mobile filters */}
          {filterOpen && (
            <div className="lg:hidden rounded-2xl p-4 mb-4 animate-fade-in-up" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-3)" }}>Город</div>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-3)" }}>Сортировка</div>
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                    <option value="date">По дате</option>
                    <option value="price_asc">Дешевле</option>
                    <option value="price_desc">Дороже</option>
                    <option value="views">По просмотрам</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Promoted */}
          {category === "all" && search === "" && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Zap" size={15} style={{ color: "var(--brand)" }} />
                <span className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Рекламные объявления</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {promoted.map((ad) => (
                  <AdCard key={ad.id} ad={ad} isFav={favorites.includes(ad.id)}
                    onOpen={() => { setSelectedAd(ad); setPage("ad"); }}
                    onFav={(e) => { e.stopPropagation(); toggleFav(ad.id); }} />
                ))}
              </div>
              <div className="my-6 border-t" style={{ borderColor: "var(--border)" }} />
            </div>
          )}

          {/* Grid/List */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Icon name="SearchX" size={48} className="mx-auto mb-4" style={{ color: "var(--text-3)" }} />
              <div className="font-bold text-lg mb-2" style={{ color: "var(--text-1)" }}>Ничего не найдено</div>
              <div className="text-sm" style={{ color: "var(--text-3)" }}>Попробуйте изменить фильтры или поисковый запрос</div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((ad, i) => (
                <div key={ad.id} style={{ animationDelay: `${i * 40}ms` }}>
                  <AdCard ad={ad} isFav={favorites.includes(ad.id)}
                    onOpen={() => { setSelectedAd(ad); setPage("ad"); }}
                    onFav={(e) => { e.stopPropagation(); toggleFav(ad.id); }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((ad) => (
                <div key={ad.id} className="ad-card rounded-2xl overflow-hidden flex gap-4 cursor-pointer animate-fade-in-up p-4"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onClick={() => { setSelectedAd(ad); setPage("ad"); }}>
                  <img src={ad.image} alt={ad.title} className="w-32 h-24 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-lg" style={{ color: "var(--brand)", fontFamily: "'Montserrat', sans-serif" }}>{fmtPrice(ad.price)}</div>
                    <div className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>{ad.title}</div>
                    <div className="text-sm line-clamp-1 mb-2" style={{ color: "var(--text-2)" }}>{ad.description}</div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-3)" }}>
                      <span>{ad.city}</span><span>·</span><span>{ad.date}</span>
                      <span className="flex items-center gap-1"><Icon name="Eye" size={11} />{ad.views}</span>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleFav(ad.id); }}
                    className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: favorites.includes(ad.id) ? "var(--brand)" : "var(--surface-3)" }}>
                    <Icon name="Heart" size={16} style={{ color: favorites.includes(ad.id) ? "white" : "var(--text-3)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdPage({ ad, setPage, isFav, onFav }: { ad: Ad; setPage: (p: Page) => void; isFav: boolean; onFav: () => void }) {
  const [showPhone, setShowPhone] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  const related = MOCK_ADS.filter((a) => a.category === ad.category && a.id !== ad.id).slice(0, 4);

  const sendMsg = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    setMsgText("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <button onClick={() => setPage("feed")} className="flex items-center gap-2 mb-5 text-sm font-semibold transition-all hover:opacity-70"
        style={{ color: "var(--text-2)" }}>
        <Icon name="ArrowLeft" size={16} />Назад к списку
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <img src={ad.image} alt={ad.title} className="w-full object-cover" style={{ maxHeight: "420px" }} />
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-3xl font-black mb-1" style={{ color: "var(--brand)", fontFamily: "'Montserrat', sans-serif" }}>
                  {fmtPrice(ad.price)}
                </div>
                <h1 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>{ad.title}</h1>
              </div>
              <button onClick={onFav}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0"
                style={{ background: isFav ? "var(--brand)" : "var(--surface-3)" }}>
                <Icon name="Heart" size={20} style={{ color: isFav ? "white" : "var(--text-3)" }} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {ad.urgent && <span className="px-3 py-1 rounded-xl text-sm font-bold text-white" style={{ background: "var(--danger)" }}>Срочно</span>}
              {ad.promoted && <span className="px-3 py-1 rounded-xl text-sm font-bold" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>Продвигается</span>}
              <span className="px-3 py-1 rounded-xl text-sm font-semibold" style={{ background: `${conditionLabel[ad.condition].color}18`, color: conditionLabel[ad.condition].color }}>
                {conditionLabel[ad.condition].label}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-5 text-sm" style={{ color: "var(--text-3)" }}>
              <span className="flex items-center gap-1"><Icon name="MapPin" size={13} />{ad.city}</span>
              <span className="flex items-center gap-1"><Icon name="Clock" size={13} />{ad.date}</span>
              <span className="flex items-center gap-1"><Icon name="Eye" size={13} />{ad.views} просмотров</span>
              <span className="flex items-center gap-1"><Icon name="Heart" size={13} />{ad.favorites + (isFav ? 1 : 0)}</span>
            </div>

            <div className="border-t pt-5" style={{ borderColor: "var(--border)" }}>
              <div className="font-bold mb-3" style={{ color: "var(--text-1)" }}>Описание</div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{ad.description}</p>
            </div>
          </div>
        </div>

        {/* Right — Seller + Contact */}
        <div className="flex flex-col gap-4">
          {/* Seller */}
          <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0"
                style={{ background: "var(--brand)" }}>
                {ad.seller[0]}
              </div>
              <div>
                <div className="font-bold" style={{ color: "var(--text-1)" }}>{ad.seller}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Icon name="Star" size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                  <span style={{ color: "var(--text-1)", fontWeight: 600 }}>{ad.sellerRating}</span>
                  <span style={{ color: "var(--text-3)" }}>· {ad.sellerDeals} сделок</span>
                </div>
              </div>
            </div>

            <button onClick={() => setShowPhone(!showPhone)}
              className="w-full py-3 rounded-xl font-bold text-sm text-white mb-2 transition-all hover:opacity-90"
              style={{ background: "var(--brand)" }}>
              {showPhone ? (
                <span className="flex items-center justify-center gap-2"><Icon name="Phone" size={15} />{ad.phone}</span>
              ) : (
                <span className="flex items-center justify-center gap-2"><Icon name="Phone" size={15} />Показать телефон</span>
              )}
            </button>

            <div className="text-xs text-center" style={{ color: "var(--text-3)" }}>
              Отвечает обычно в течение часа
            </div>
          </div>

          {/* Message */}
          <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="font-bold mb-3" style={{ color: "var(--text-1)" }}>Написать продавцу</div>
            {msgSent ? (
              <div className="text-center py-4 animate-scale-in">
                <Icon name="CheckCircle" size={36} className="mx-auto mb-2" style={{ color: "var(--success)" }} />
                <div className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>Сообщение отправлено!</div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-3">
                  {["Ещё актуально?", "Торг возможен?", "Могу приехать сегодня"].map((t) => (
                    <button key={t} onClick={() => setMsgText(t)}
                      className="text-left px-3 py-2 rounded-xl text-sm transition-all"
                      style={{ background: "var(--surface-3)", color: "var(--text-2)", border: msgText === t ? `1px solid var(--brand)` : "1px solid transparent" }}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea rows={3} value={msgText} onChange={(e) => setMsgText(e.target.value)}
                  placeholder="Ваше сообщение..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-3"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
                <button onClick={sendMsg}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: msgText.trim() ? "var(--brand)" : "var(--surface-3)", color: msgText.trim() ? "white" : "var(--text-3)" }}>
                  Отправить
                </button>
              </>
            )}
          </div>

          {/* Safety */}
          <div className="rounded-2xl p-4" style={{ background: "var(--brand-light)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Shield" size={16} style={{ color: "var(--brand)" }} />
              <span className="font-bold text-sm" style={{ color: "var(--brand)" }}>Безопасная сделка</span>
            </div>
            <div className="text-xs" style={{ color: "var(--brand-dark)" }}>
              Передавайте деньги только после осмотра товара. Не переводите предоплату незнакомцам.
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-10">
          <div className="font-bold text-lg mb-4" style={{ color: "var(--text-1)", fontFamily: "'Montserrat', sans-serif" }}>Похожие объявления</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((a) => (
              <AdCard key={a.id} ad={a} isFav={false} onOpen={() => {}} onFav={(e) => e.stopPropagation()} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PostPage({ setPage }: { setPage: (p: Page) => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title: "", category: "", price: "", city: "", description: "", condition: "used", phone: "", name: "" });
  const [submitted, setSubmitted] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid1 = form.category && form.title.length > 5;
  const valid2 = form.price !== undefined && form.city && form.description.length > 10;
  const valid3 = form.phone.length >= 10 && form.name.length > 1;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-scale-in"
          style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))", boxShadow: "0 8px 30px rgba(249,115,22,0.4)" }}>
          <Icon name="CheckCircle" size={36} className="text-white" />
        </div>
        <div className="font-black text-2xl mb-2" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>
          Объявление подано!
        </div>
        <div className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
          Оно появится на сайте после проверки модератором (обычно 15 минут)
        </div>
        <button onClick={() => { setPage("feed"); setSubmitted(false); setStep(1); setForm({ title: "", category: "", price: "", city: "", description: "", condition: "used", phone: "", name: "" }); }}
          className="px-8 py-3 rounded-xl font-bold text-white"
          style={{ background: "var(--brand)" }}>
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setPage("feed")} style={{ color: "var(--text-3)" }}><Icon name="ArrowLeft" size={20} /></button>
        <h1 className="font-black text-xl" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>Подать объявление</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0"
              style={{ background: step >= s ? "var(--brand)" : "var(--surface-3)", color: step >= s ? "white" : "var(--text-3)" }}>
              {step > s ? <Icon name="Check" size={14} /> : s}
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: step === s ? "var(--text-1)" : "var(--text-3)" }}>
              {s === 1 ? "Категория" : s === 2 ? "Детали" : "Контакты"}
            </span>
            {s < 3 && <div className="flex-1 h-0.5" style={{ background: step > s ? "var(--brand)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6 animate-fade-in-up" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Категория *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                  <button key={cat.id} onClick={() => set("category", cat.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: form.category === cat.id ? "var(--brand)" : "var(--surface-3)",
                      color: form.category === cat.id ? "white" : "var(--text-2)",
                      border: `1px solid ${form.category === cat.id ? "var(--brand)" : "transparent"}`,
                    }}>
                    <Icon name={cat.icon} size={14} />{cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Заголовок *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="Например: iPhone 15 Pro 256GB черный"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", border: `1px solid ${form.title.length > 5 ? "var(--brand)" : "var(--border)"}`, color: "var(--text-1)" }} />
              <div className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{form.title.length}/100</div>
            </div>
            <button onClick={() => setStep(2)} disabled={!valid1}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all"
              style={{ background: valid1 ? "var(--brand)" : "var(--surface-3)", color: valid1 ? "white" : "var(--text-3)", cursor: valid1 ? "pointer" : "not-allowed" }}>
              Далее
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Цена, ₽</label>
                <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)}
                  placeholder="0 = Договорная"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Город *</label>
                <select value={form.city} onChange={(e) => set("city", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }}>
                  <option value="">Выберите...</option>
                  {CITIES.filter((c) => c !== "Все города").map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Состояние</label>
              <div className="flex gap-2">
                {[{ v: "new", l: "Новое" }, { v: "excellent", l: "Отличное" }, { v: "used", l: "Б/у" }].map(({ v, l }) => (
                  <button key={v} onClick={() => set("condition", v)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: form.condition === v ? "var(--brand)" : "var(--surface-3)", color: form.condition === v ? "white" : "var(--text-2)" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Описание *</label>
              <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)}
                placeholder="Опишите товар подробнее: состояние, комплектация, причина продажи..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
              <div className="text-xs mt-1" style={{ color: "var(--text-3)" }}>{form.description.length}/2000</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>Назад</button>
              <button onClick={() => setStep(3)} disabled={!valid2} className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: valid2 ? "var(--brand)" : "var(--surface-3)", color: valid2 ? "white" : "var(--text-3)", cursor: valid2 ? "pointer" : "not-allowed" }}>
                Далее
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Ваше имя *</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Как к вам обращаться?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>Телефон *</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                placeholder="+7 (999) 000-00-00"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
            </div>
            <div className="p-4 rounded-xl" style={{ background: "var(--brand-light)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <div className="text-sm font-bold mb-2" style={{ color: "var(--brand)" }}>Проверьте данные</div>
              <div className="text-xs space-y-1" style={{ color: "var(--brand-dark)" }}>
                <div>📌 {CATEGORIES.find((c) => c.id === form.category)?.label} · {form.title}</div>
                <div>💰 {form.price ? `${Number(form.price).toLocaleString()} ₽` : "Договорная"} · {form.city}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: "var(--surface-3)", color: "var(--text-2)" }}>Назад</button>
              <button onClick={() => setSubmitted(true)} disabled={!valid3} className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: valid3 ? "var(--brand)" : "var(--surface-3)", color: valid3 ? "white" : "var(--text-3)", cursor: valid3 ? "pointer" : "not-allowed" }}>
                Опубликовать
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FavoritesPage({ ads, setPage, setSelectedAd, toggleFav }: {
  ads: Ad[]; setPage: (p: Page) => void; setSelectedAd: (a: Ad) => void; toggleFav: (id: number) => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-black text-xl" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>
          Избранное
        </h1>
        <span className="px-2.5 py-0.5 rounded-xl text-sm font-bold" style={{ background: "var(--brand)", color: "white" }}>{ads.length}</span>
      </div>
      {ads.length === 0 ? (
        <div className="text-center py-20">
          <Icon name="Heart" size={48} className="mx-auto mb-4" style={{ color: "var(--text-3)" }} />
          <div className="font-bold text-lg mb-2" style={{ color: "var(--text-1)" }}>Избранное пусто</div>
          <div className="text-sm mb-5" style={{ color: "var(--text-3)" }}>Нажмите ❤ на любом объявлении, чтобы сохранить</div>
          <button onClick={() => setPage("feed")} className="px-6 py-3 rounded-xl font-bold text-white" style={{ background: "var(--brand)" }}>
            К объявлениям
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} isFav={true}
              onOpen={() => { setSelectedAd(ad); setPage("ad"); }}
              onFav={(e) => { e.stopPropagation(); toggleFav(ad.id); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function MessagesPage() {
  const [active, setActive] = useState<number | null>(1);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState(MESSAGES.map((m) => ({ ...m, history: [{ from: m.from, text: m.text, mine: false }] })));

  const send = () => {
    if (!input.trim() || active === null) return;
    setChats((prev) => prev.map((c) => c.id === active ? { ...c, history: [...c.history, { from: "Я", text: input, mine: true }], unread: false } : c));
    setInput("");
  };

  const activeChat = chats.find((c) => c.id === active);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="font-black text-xl mb-5" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>Сообщения</h1>
      <div className="rounded-2xl overflow-hidden flex" style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "500px" }}>
        {/* List */}
        <div className="w-72 shrink-0 border-r overflow-y-auto" style={{ borderColor: "var(--border)" }}>
          {chats.map((chat) => (
            <button key={chat.id} onClick={() => setActive(chat.id)}
              className="w-full flex items-start gap-3 p-4 transition-all text-left"
              style={{ background: active === chat.id ? "var(--brand-light)" : "transparent", borderBottom: "1px solid var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                style={{ background: "var(--brand)" }}>{chat.from[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{chat.from}</span>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>{chat.time}</span>
                </div>
                <div className="text-xs truncate" style={{ color: "var(--text-3)" }}>{chat.ad}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: "var(--text-2)" }}>{chat.history[chat.history.length - 1].text}</div>
              </div>
              {chat.unread && <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "var(--brand)" }} />}
            </button>
          ))}
        </div>

        {/* Chat */}
        {activeChat ? (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: "var(--border)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                style={{ background: "var(--brand)" }}>{activeChat.from[0]}</div>
              <div>
                <div className="font-semibold text-sm" style={{ color: "var(--text-1)" }}>{activeChat.from}</div>
                <div className="text-xs" style={{ color: "var(--text-3)" }}>{activeChat.ad}</div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {activeChat.history.map((msg, i) => (
                <div key={i} className={`flex ${msg.mine ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs px-4 py-2.5 rounded-2xl text-sm"
                    style={{
                      background: msg.mine ? "var(--brand)" : "var(--surface-3)",
                      color: msg.mine ? "white" : "var(--text-1)",
                      borderBottomRightRadius: msg.mine ? 4 : undefined,
                      borderBottomLeftRadius: !msg.mine ? 4 : undefined,
                    }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Введите сообщение..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--text-1)" }} />
              <button onClick={send} className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--brand)" }}>
                <Icon name="Send" size={16} className="text-white" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: "var(--text-3)" }}>
            Выберите чат
          </div>
        )}
      </div>
    </div>
  );
}

function CabinetPage({ setPage, favCount }: { setPage: (p: Page) => void; favCount: number }) {
  const stats = [
    { label: "Активных объявлений", val: "3", icon: "Tag", color: "var(--brand)" },
    { label: "В избранном", val: String(favCount), icon: "Heart", color: "#e11d48" },
    { label: "Непрочитанных", val: "2", icon: "MessageCircle", color: "#7c3aed" },
    { label: "Просмотров", val: "1 847", icon: "Eye", color: "#0891b2" },
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white"
          style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-dark))" }}>
          А
        </div>
        <div>
          <div className="font-black text-xl" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>Алексей Иванов</div>
          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-3)" }}>
            <Icon name="Star" size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
            <span>4.9 · 47 сделок · На сайте с 2022</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Icon name={s.icon} size={20} className="mb-2" style={{ color: s.color }} />
            <div className="font-black text-2xl" style={{ fontFamily: "'Montserrat', sans-serif", color: "var(--text-1)" }}>{s.val}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: "Tag", label: "Мои объявления", desc: "3 активных · 12 завершённых", action: () => {}, color: "var(--brand)" },
          { icon: "Heart", label: "Избранное", desc: `${favCount} сохранённых объявлений`, action: () => setPage("favorites"), color: "#e11d48" },
          { icon: "MessageCircle", label: "Сообщения", desc: "2 непрочитанных", action: () => setPage("messages"), color: "#7c3aed" },
          { icon: "Settings", label: "Настройки профиля", desc: "Телефон, email, уведомления", action: () => {}, color: "#0891b2" },
        ].map(({ icon, label, desc, action, color }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-4 p-5 rounded-2xl text-left transition-all hover:shadow-md ad-card"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}18` }}>
              <Icon name={icon} size={22} style={{ color }} />
            </div>
            <div>
              <div className="font-bold" style={{ color: "var(--text-1)" }}>{label}</div>
              <div className="text-sm" style={{ color: "var(--text-3)" }}>{desc}</div>
            </div>
            <Icon name="ChevronRight" size={18} className="ml-auto" style={{ color: "var(--text-3)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [page, setPage] = useState<Page>("feed");
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [favorites, setFavorites] = useState<number[]>([1, 3]);

  const toggleFav = (id: number) =>
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const favAds = MOCK_ADS.filter((a) => favorites.includes(a.id));
  const unreadMsgs = MESSAGES.filter((m) => m.unread).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2)" }}>
      <Header page={page} setPage={setPage} favCount={favorites.length} msgCount={unreadMsgs} />
      <main>
        {page === "feed" && <FeedPage setPage={setPage} setSelectedAd={setSelectedAd} favorites={favorites} toggleFav={toggleFav} />}
        {page === "ad" && selectedAd && <AdPage ad={selectedAd} setPage={setPage} isFav={favorites.includes(selectedAd.id)} onFav={() => toggleFav(selectedAd.id)} />}
        {page === "post" && <PostPage setPage={setPage} />}
        {page === "favorites" && <FavoritesPage ads={favAds} setPage={setPage} setSelectedAd={setSelectedAd} toggleFav={toggleFav} />}
        {page === "messages" && <MessagesPage />}
        {page === "cabinet" && <CabinetPage setPage={setPage} favCount={favorites.length} />}
      </main>
    </div>
  );
}
