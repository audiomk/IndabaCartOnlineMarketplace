"use client";
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Menu, ChevronDown, Zap, ShieldCheck, 
  MapPin, Star, TrendingUp, HelpCircle, BarChart, Truck, 
  Clock, Heart, Eye, ArrowRight, User, Globe, Package,
  Award, MessageCircle, Camera, BookOpen, TrendingDown,
  Gift, Share2, ChevronLeft, ChevronRight, Filter, X
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  specs?: Record<string, string>;
  seller?: string;
  sellerRating?: number;
  priceHistory?: number[];
  bulkPricing?: {quantity: number, price: number}[];
  inStock: boolean;
  badge?: string;
}

export default function IndabaCartFull() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [heroSlide, setHeroSlide] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);

  const EXTENDED_PRODUCTS: Product[] = [
    {
      id: 1, 
      title: "MacBook Pro M3 Max 16-inch", 
      price: 65000, 
      category: "Computing", 
      image: "https://images.unsplash.com/photo-1517336714467-d2364f21038a?w=400",
      rating: 4.9,
      reviews: 2847,
      specs: {"RAM": "32GB", "Storage": "1TB SSD", "Battery": "22hrs", "Display": "16.2\" Retina"},
      seller: "Apple Official Store",
      sellerRating: 4.9,
      priceHistory: [68000, 67500, 66000, 65500, 65000],
      inStock: true,
      badge: "Best Seller"
    },
    {
      id: 2, 
      title: "Dell XPS 13 Plus Ultrabook", 
      price: 28500, 
      category: "Computing", 
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
      rating: 4.5,
      reviews: 1523,
      specs: {"RAM": "16GB", "Storage": "512GB SSD", "Battery": "14hrs", "Display": "13.4\" FHD+"},
      seller: "Dell Direct",
      sellerRating: 4.7,
      priceHistory: [32000, 30500, 29000, 28800, 28500],
      inStock: true
    },
    {
      id: 3, 
      title: "Samsung 65\" S95C OLED TV", 
      price: 32000, 
      category: "TV & Video", 
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
      rating: 4.8,
      reviews: 892,
      specs: {"Resolution": "4K OLED", "Refresh": "120Hz", "HDR": "HDR10+", "Smart": "Tizen OS"},
      seller: "Samsung Official",
      sellerRating: 4.8,
      inStock: true,
      badge: "Hot Deal"
    },
    {
      id: 4, 
      title: "Philips XXL Smart Air Fryer", 
      price: 2450, 
      category: "Small Appliances", 
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
      rating: 4.2,
      reviews: 3421,
      specs: {"Capacity": "5.5L", "Power": "1700W", "Programs": "13", "App": "Yes"},
      seller: "Home Essentials ZA",
      sellerRating: 4.3,
      bulkPricing: [{quantity: 1, price: 2450}, {quantity: 5, price: 2200}, {quantity: 10, price: 1950}],
      inStock: true
    },
    {
      id: 5,
      title: "Defy 5kW Hybrid Solar Inverter",
      price: 18500,
      category: "Solar & Power",
      image: "https://images.unsplash.com/photo-1509391366360-feaffa6032d5?w=400",
      rating: 4.6,
      reviews: 645,
      specs: {"Power": "5kW", "Battery": "Compatible", "Warranty": "5 Years", "Type": "Hybrid"},
      seller: "Solar Solutions SA",
      sellerRating: 4.5,
      bulkPricing: [{quantity: 1, price: 18500}, {quantity: 3, price: 17000}, {quantity: 5, price: 16000}],
      inStock: true,
      badge: "Trending"
    },
    {
      id: 6,
      title: "HP Pavilion 15.6\" Laptop i7",
      price: 15999,
      category: "Computing",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
      rating: 4.3,
      reviews: 987,
      specs: {"RAM": "16GB", "Storage": "512GB SSD", "Battery": "10hrs", "Display": "15.6\" FHD"},
      seller: "Tech Hub SA",
      sellerRating: 4.4,
      priceHistory: [17999, 16999, 16500, 16200, 15999],
      inStock: true
    },
    {
      id: 7,
      title: "iPhone 16 Pro Max 256GB",
      price: 25999,
      category: "Mobiles",
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400",
      rating: 4.9,
      reviews: 4231,
      specs: {"Storage": "256GB", "Camera": "48MP Pro", "Chip": "A18 Pro", "Display": "6.7\""},
      seller: "iStore",
      sellerRating: 4.9,
      inStock: true,
      badge: "New Arrival"
    },
    {
      id: 8,
      title: "Sony WH-1000XM5 Headphones",
      price: 6999,
      category: "Audio",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
      rating: 4.7,
      reviews: 2156,
      specs: {"Type": "Over-Ear", "ANC": "Industry Leading", "Battery": "30hrs", "Wireless": "Bluetooth 5.2"},
      seller: "Sony Centre",
      sellerRating: 4.8,
      inStock: true
    }
  ];

  const heroSlides = [
    {
      title: "Solar Backup Specials",
      subtitle: "Power Your Home - Save 30%",
      image: "https://images.unsplash.com/photo-1509391366360-feaffa6032d5?w=800",
      badge: "HOT DEALS"
    },
    {
      title: "Summer Sale",
      subtitle: "Up to 50% Off Electronics",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
      badge: "LIMITED TIME"
    },
    {
      title: "Smart Home Revolution",
      subtitle: "Upgrade Your Living Space",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
      badge: "NEW ARRIVALS"
    }
  ];

  const categories = {
    "Electronics": ["Laptops", "Tablets", "Cameras", "Accessories"],
    "Mobiles": ["Smartphones", "Feature Phones", "Accessories", "Wearables"],
    "Computing": ["Laptops", "Desktops", "Monitors", "Components"],
    "TV & Video": ["Smart TVs", "Streaming Devices", "Projectors", "Home Theater"],
    "Audio": ["Headphones", "Speakers", "Soundbars", "Hi-Fi Systems"],
    "Solar & Power": ["Inverters", "Solar Panels", "Batteries", "UPS Systems"],
    "Large Appliances": ["Refrigerators", "Washing Machines", "Dishwashers", "Stoves"],
    "Small Appliances": ["Air Fryers", "Microwaves", "Blenders", "Coffee Makers"],
    "Gaming": ["Consoles", "Games", "Accessories", "PC Gaming"],
    "Smart Home": ["Security", "Lighting", "Thermostats", "Assistants"]
  };

  const trendingSearches = ["iPhone 16", "Solar Inverters", "Air Fryers", "L-Shape Couches", "Gaming Laptops", "4K TVs"];

  useEffect(() => {
    setProducts(EXTENDED_PRODUCTS);
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleProductView = (product: Product) => {
    setViewedProducts(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [product, ...filtered].slice(0, 6);
    });
  };

  const toggleCompare = (id: number) => {
    setSelectedCompare(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id].slice(0, 3)
    );
  };

  const ComparisonMatrix = () => {
    const compareProducts = products.filter(p => selectedCompare.includes(p.id));
    if (compareProducts.length < 2) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="font-black text-lg">Product Comparison</h3>
            <button onClick={() => {setCompareMode(false); setSelectedCompare([]);}} className="p-2 hover:bg-gray-100 rounded">
              <X size={20}/>
            </button>
          </div>
          <div className="p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-black text-sm">Feature</th>
                  {compareProducts.map(p => (
                    <th key={p.id} className="p-4 text-center">
                      <img src={p.image} className="h-24 w-24 object-contain mx-auto mb-2"/>
                      <div className="font-bold text-sm">{p.title}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">Price</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 text-center font-black text-lg text-green-600">R {p.price.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">Rating</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={16} fill="#f59e0b" className="text-orange-400"/>
                        <span className="font-bold">{p.rating}</span>
                        <span className="text-gray-400 text-xs">({p.reviews})</span>
                      </div>
                    </td>
                  ))}
                </tr>
                {Object.keys(compareProducts[0].specs || {}).map(spec => (
                  <tr key={spec} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-bold">{spec}</td>
                    {compareProducts.map(p => (
                      <td key={p.id} className="p-4 text-center text-gray-600">{p.specs?.[spec] || "-"}</td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">Seller</td>
                  {compareProducts.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <div className="text-sm text-gray-600">{p.seller}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star size={12} fill="#10b981" className="text-green-500"/>
                        <span className="text-xs font-bold">{p.sellerRating}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const PriceHistoryChart = ({history}: {history: number[]}) => {
    if (!history || history.length === 0) return null;
    const max = Math.max(...history);
    const min = Math.min(...history);
    const current = history[history.length - 1];
    const savings = max - current;
    const savingsPercent = ((savings / max) * 100).toFixed(0);

    return (
      <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown size={14} className="text-green-600"/>
          <span className="text-xs font-bold text-green-700">Price Drop: R{savings.toLocaleString()} ({savingsPercent}% off peak price)</span>
        </div>
        <div className="flex items-end gap-1 h-12">
          {history.map((price, i) => {
            const height = ((price - min) / (max - min)) * 100;
            return (
              <div key={i} className="flex-1 bg-green-200 rounded-t" style={{height: `${height}%`}}></div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-gray-500 font-mono">
          <span>5w ago</span>
          <span>Today</span>
        </div>
      </div>
    );
  };

  const BulkPricingLadder = ({pricing}: {pricing: {quantity: number, price: number}[]}) => {
    if (!pricing || pricing.length === 0) return null;

    return (
      <div className="mt-3 border border-blue-200 rounded overflow-hidden">
        <div className="bg-blue-50 p-2 text-xs font-black text-blue-700 uppercase flex items-center gap-2">
          <Package size={14}/> Bulk Discount Available
        </div>
        <div className="divide-y">
          {pricing.map((tier, i) => (
            <div key={i} className="flex justify-between items-center p-2 hover:bg-blue-50">
              <span className="text-xs font-bold text-gray-600">
                {tier.quantity === 1 ? "1 unit" : `${tier.quantity}+ units`}
              </span>
              <span className="text-sm font-black text-blue-600">R{tier.price.toLocaleString()}/unit</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans">
      
      {compareMode && <ComparisonMatrix />}

      {/* HEADER */}
      <header className="sticky top-0 z-[100] shadow-md">
        {/* Top Bar */}
        <div className="bg-white px-4 py-1.5 flex justify-between items-center text-[11px] font-bold border-b text-gray-500">
          <div className="flex gap-6">
            <span className="text-[#00664b] hover:underline cursor-pointer flex items-center gap-1">
              <Award size={12}/> Sell on IndabaCart
            </span>
            <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1">
              <MapPin size={12}/> Find a Pickup Point
            </span>
            <span className="hover:text-orange-600 cursor-pointer flex items-center gap-1">
              <Truck size={12}/> Track Order
            </span>
          </div>
          <div className="flex gap-4 items-center uppercase tracking-tighter">
            <span className="hover:text-black cursor-pointer flex items-center gap-1">
              <HelpCircle size={12}/> Help
            </span>
            <div className="flex items-center gap-1 cursor-pointer border-l pl-4 font-bold text-gray-800">
              <Globe size={12}/> 🇿🇦 EN <ChevronDown size={12}/>
            </div>
            <div className="flex items-center gap-1 cursor-pointer border-l pl-4 font-bold text-gray-800">
              <User size={12}/> Sign In
            </div>
          </div>
        </div>
        
        {/* Main Header */}
        <div className="bg-[#004d39] px-6 py-3 flex items-center gap-6">
          <h1 className="text-2xl font-black text-white tracking-tighter italic cursor-pointer">INDABACART</h1>
          
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="flex bg-white rounded-sm overflow-hidden h-11 shadow-inner">
              <button 
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="bg-gray-100 px-4 flex items-center gap-2 border-r text-[11px] font-black text-gray-500 uppercase hover:bg-gray-200"
              >
                <Menu size={14}/> All <ChevronDown size={14}/>
              </button>
              <input 
                type="text" 
                placeholder="Search for products, brands and departments..." 
                className="flex-grow px-4 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="bg-[#f3a847] px-8 text-white hover:bg-[#e29636]">
                <Search size={22}/>
              </button>
            </div>
            
            {/* Category Dropdown */}
            {categoryOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-2xl rounded border w-[600px] z-50">
                <div className="grid grid-cols-2 gap-4 p-6">
                  {Object.entries(categories).map(([cat, subs]) => (
                    <div key={cat}>
                      <div className="font-black text-sm text-gray-800 mb-2">{cat}</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {subs.map(sub => (
                          <li key={sub} className="hover:text-[#00664b] cursor-pointer hover:translate-x-1 transition-transform">
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-white font-black text-[11px] uppercase">
            <div className="flex flex-col items-center cursor-pointer hover:text-[#f3a847]">
              <Heart size={24}/>
              <span className="mt-1">Wishlist</span>
            </div>
            <div className="flex flex-col items-center cursor-pointer hover:text-[#f3a847] relative">
              <ShoppingCart size={24}/>
              <span className="mt-1">Cart</span>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">0</span>
            </div>
          </div>
        </div>

        {/* Trending Bar */}
        <div className="bg-[#78b13f] px-6 py-1.5 flex gap-5 text-[10px] text-white font-black uppercase tracking-widest overflow-x-auto">
          <span className="flex items-center gap-1 text-black/30">
            <TrendingUp size={12}/> Trending:
          </span>
          {trendingSearches.map(t => (
            <span key={t} className="hover:text-black cursor-pointer whitespace-nowrap">{t}</span>
          ))}
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex gap-4 p-4">
        
        {/* SIDEBAR */}
        <aside className="w-64 flex-shrink-0 hidden xl:block space-y-4">
          {/* Categories */}
          <div className="bg-white rounded shadow-sm border border-gray-100 sticky top-32 overflow-hidden">
            <div className="bg-gray-50 p-3 border-b font-black text-[11px] uppercase text-gray-400 flex items-center gap-2">
              <Menu size={16}/> Shop Departments
            </div>
            <ul className="text-[13px] font-bold text-gray-600">
              {Object.keys(categories).map(cat => (
                <li key={cat} className="px-4 py-3 hover:bg-[#f1f3f6] hover:text-[#00664b] cursor-pointer flex justify-between items-center group">
                  {cat} 
                  <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-[#00664b]"/>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-[#00664b] to-[#004d39] rounded shadow-sm p-4 text-white">
            <h3 className="font-black text-xs uppercase mb-3 flex items-center gap-2">
              <Award size={14}/> Partner With Us
            </h3>
            <p className="text-xs mb-3 opacity-90">Start selling to millions of customers</p>
            <button className="w-full bg-white text-[#00664b] py-2 text-[10px] font-black rounded uppercase hover:bg-gray-100">
              Open Seller Account
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* HERO SLIDER */}
          <section className="relative h-[350px] bg-slate-900 rounded-sm overflow-hidden mb-6 shadow-md">
            {heroSlides.map((slide, i) => (
              <div 
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 ${i === heroSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 flex items-center p-12 text-white z-10">
                  <div className="max-w-md">
                    <div className="flex items-center gap-2 text-orange-400 font-black text-sm mb-2">
                      <Zap size={18} fill="currentColor"/> {slide.badge}
                    </div>
                    <h2 className="text-5xl font-black leading-none uppercase">{slide.title}</h2>
                    <p className="text-xl mt-2 opacity-90">{slide.subtitle}</p>
                    <button className="mt-6 bg-[#f3a847] px-8 py-3 rounded-sm font-black text-black text-xs uppercase hover:bg-[#e29636] flex items-center gap-2">
                      Shop Now <ArrowRight size={16}/>
                    </button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60"></div>
                <img src={slide.image} className="w-full h-full object-cover" alt={slide.title}/>
              </div>
            ))}
            
            {/* Slider Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {heroSlides.map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setHeroSlide(i)}
                  className={`h-2 rounded-full transition-all ${i === heroSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-20"
            >
              <ChevronLeft size={24} className="text-white"/>
            </button>
            <button 
              onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full z-20"
            >
              <ChevronRight size={24} className="text-white"/>
            </button>
          </section>

          {/* DAILY DEALS */}
          <section className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-t-orange-500 mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Daily Deals</h3>
                <div className="flex items-center gap-2 mt-1 font-mono text-red-600 text-xs font-bold">
                  <Clock size={14}/> 08h : 42m : 12s remaining
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCompareMode(!compareMode)}
                  className={`text-xs font-bold px-3 py-1.5 rounded border ${compareMode ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-600'}`}
                >
                  <Filter size={12} className="inline mr-1"/> Compare Mode {selectedCompare.length > 0 && `(${selectedCompare.length})`}
                </button>
                {selectedCompare.length >= 2 && (
                  <button 
                    onClick={() => setCompareMode(true)}
                    className="text-xs font-bold px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    View Comparison
                  </button>
                )}
                <button className="text-blue-600 font-bold text-xs hover:underline">VIEW ALL</button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="group cursor-pointer relative" onClick={() => handleProductView(p)}>
                  {p.badge && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase z-10">
                      {p.badge}
                    </div>
                  )}
                  {compareMode && (
                    <button
                      onClick={(e) => {e.stopPropagation(); toggleCompare(p.id);}}
                      className={`absolute top-2 right-2 z-10 w-6 h-6 rounded border-2 flex items-center justify-center ${selectedCompare.includes(p.id) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                    >
                      {selectedCompare.includes(p.id) && <div className="w-3 h-3 bg-white rounded-sm"></div>}
                    </button>
                  )}
                  
                  <div className="relative h-48 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-4">
                    <img src={p.image} className="h-full w-full object-contain group-hover:scale-105 transition-transform" alt={p.title}/>
                    <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={16} className="text-gray-400 hover:text-red-500"/>
                    </button>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-[#00664b]">{p.title}</h4>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star size={12} fill="#f59e0b" className="text-orange-400"/>
                        <span className="text-xs font-bold text-gray-700">{p.rating}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">({p.reviews.toLocaleString()})</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-xl font-black text-slate-900">R {p.price.toLocaleString()}</p>
                      {p.priceHistory && p.priceHistory[0] > p.price && (
                        <span className="text-xs text-gray-400 line-through">R{p.priceHistory[0].toLocaleString()}</span>
                      )}
                    </div>
                    
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                      <ShieldCheck size={10}/> by {p.seller}
                    </div>
                    
                    {p.priceHistory && <PriceHistoryChart history={p.priceHistory} />}
                    {p.bulkPricing && <BulkPricingLadder pricing={p.bulkPricing} />}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INSPIRED BY YOUR HISTORY */}
          <section className="bg-white p-6 rounded-sm shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                <Eye size={20}/> Inspired by your browsing history
              </h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">VIEW ALL</button>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4">
              {products.slice(4, 8).map(p => (
                <div key={`inspired-${p.id}`} className="flex-shrink-0 w-48 group cursor-pointer" onClick={() => handleProductView(p)}>
                  <div className="relative h-40 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-4">
                    <img src={p.image} className="h-full w-full object-contain group-hover:scale-105 transition-transform" alt={p.title}/>
                  </div>
                  <h4 className="mt-2 font-bold text-xs text-gray-800 line-clamp-2">{p.title}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={10} fill="#f59e0b" className="text-orange-400"/>
                    <span className="text-[10px] text-gray-600 font-bold">{p.rating}</span>
                  </div>
                  <p className="text-base font-black text-slate-900 mt-1">R {p.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          {/* POPULAR IN YOUR RECENT CATEGORY */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-sm shadow-sm border border-blue-100 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600"/> Popular in Computing
                </h3>
                <p className="text-xs text-gray-500 mt-1">Based on your recent activity in this category</p>
              </div>
              <button className="text-blue-600 font-bold text-xs hover:underline">EXPLORE COMPUTING</button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {products.filter(p => p.category === "Computing").concat(products.filter(p => p.category === "Mobiles")).slice(0, 5).map(p => (
                <div key={`popular-${p.id}`} className="bg-white rounded-sm p-3 group cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleProductView(p)}>
                  <div className="relative h-32 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-2 mb-3">
                    {p.badge && (
                      <div className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
                        Popular
                      </div>
                    )}
                    <img src={p.image} className="h-full w-full object-contain group-hover:scale-110 transition-transform" alt={p.title}/>
                  </div>
                  <h4 className="font-bold text-xs text-gray-800 line-clamp-2 mb-2">{p.title}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={10} fill="#f59e0b" className="text-orange-400"/>
                    <span className="text-[10px] text-gray-600 font-bold">{p.rating}</span>
                    <span className="text-[9px] text-gray-400">({p.reviews})</span>
                  </div>
                  <p className="text-base font-black text-slate-900">R {p.price.toLocaleString()}</p>
                  <button className="w-full mt-2 bg-blue-600 text-white py-1.5 text-[10px] font-bold rounded hover:bg-blue-700">
                    Quick View
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SHOPPERS LIKE YOU ALSO BOUGHT */}
          <section className="bg-white p-6 rounded-sm shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                  <Heart size={20} className="text-pink-600"/> Shoppers like you also bought
                </h3>
                <p className="text-xs text-gray-500 mt-1">Recommendations based on similar browsing patterns</p>
              </div>
              <button className="text-blue-600 font-bold text-xs hover:underline">SEE MORE</button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                {
                  id: 101,
                  title: "Logitech MX Master 3S Wireless Mouse",
                  price: 1899,
                  image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
                  rating: 4.8,
                  reviews: 1243,
                  badge: "Often bought with laptops",
                  matchScore: 92
                },
                {
                  id: 102,
                  title: "USB-C Multiport Hub 7-in-1",
                  price: 649,
                  image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400",
                  rating: 4.4,
                  reviews: 876,
                  badge: "Perfect pair",
                  matchScore: 88
                },
                {
                  id: 103,
                  title: "Dell UltraSharp 27\" 4K Monitor",
                  price: 8999,
                  image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
                  rating: 4.7,
                  reviews: 654,
                  badge: "Frequently combined",
                  matchScore: 85
                },
                {
                  id: 104,
                  title: "Mechanical Keyboard RGB Backlit",
                  price: 1299,
                  image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
                  rating: 4.6,
                  reviews: 1567,
                  badge: "Popular combo",
                  matchScore: 83
                }
              ].map(p => (
                <div key={`also-${p.id}`} className="group cursor-pointer relative">
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[8px] font-black px-2 py-1 rounded-full z-10 flex items-center gap-1">
                    <Heart size={8} fill="white"/> {p.matchScore}% Match
                  </div>
                  
                  <div className="relative h-48 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-4 mb-3">
                    <img src={p.image} className="h-full w-full object-contain group-hover:scale-105 transition-transform" alt={p.title}/>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded px-2 py-1 mb-2">
                    <span className="text-[9px] text-purple-700 font-bold uppercase">{p.badge}</span>
                  </div>
                  
                  <h4 className="font-bold text-sm text-gray-800 line-clamp-2 mb-2">{p.title}</h4>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} fill="#f59e0b" className="text-orange-400"/>
                    <span className="text-xs font-bold text-gray-700">{p.rating}</span>
                    <span className="text-[10px] text-gray-400">({p.reviews})</span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl font-black text-slate-900">R {p.price.toLocaleString()}</p>
                  </div>
                  
                  <button className="w-full mt-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 text-[10px] font-black rounded hover:from-pink-700 hover:to-purple-700">
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* LUXURY BEAUTY GIFT SETS */}
          <section className="bg-gradient-to-br from-amber-50 via-rose-50 to-pink-50 p-8 rounded-sm shadow-sm border border-amber-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                  <Gift size={24} className="text-amber-600"/> Luxury Beauty Gift Sets
                </h3>
                <p className="text-sm text-gray-600 mt-1">Premium curated collections for that special someone</p>
              </div>
              <button className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-6 py-2 text-xs font-black rounded-full hover:from-amber-700 hover:to-rose-700 flex items-center gap-2">
                SHOP LUXURY <ArrowRight size={14}/>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 201,
                  title: "Dior Prestige Skincare Collection",
                  price: 12500,
                  image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
                  rating: 4.9,
                  reviews: 234,
                  includes: "Serum, Cream, Eye Treatment",
                  badge: "Limited Edition"
                },
                {
                  id: 202,
                  title: "Tom Ford Private Blend Set",
                  price: 8900,
                  image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400",
                  rating: 4.8,
                  reviews: 567,
                  includes: "3 x 50ml Fragrances",
                  badge: "Bestseller"
                },
                {
                  id: 203,
                  title: "La Mer Deluxe Holiday Set",
                  price: 15999,
                  image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400",
                  rating: 5.0,
                  reviews: 189,
                  includes: "Full Size + Deluxe Samples",
                  badge: "Exclusive"
                }
              ].map(p => (
                <div key={`luxury-${p.id}`} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute top-3 right-3 bg-amber-600 text-white text-[9px] font-black px-3 py-1 rounded-full z-10">
                      {p.badge}
                    </div>
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title}/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  
                  <div className="p-5">
                    <h4 className="font-black text-base text-gray-800 mb-2">{p.title}</h4>
                    
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} fill={i < Math.floor(p.rating) ? "#f59e0b" : "none"} className="text-orange-400"/>
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({p.reviews})</span>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-3">
                      <div className="text-[9px] text-amber-700 font-bold uppercase mb-1">Set Includes:</div>
                      <div className="text-xs text-gray-700 font-semibold">{p.includes}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-black text-gray-900">R {p.price.toLocaleString()}</p>
                      <button className="bg-gradient-to-r from-amber-600 to-rose-600 text-white px-4 py-2 text-[10px] font-black rounded hover:from-amber-700 hover:to-rose-700">
                        ADD TO CART
                      </button>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-bold">
                      <Truck size={12}/> Free luxury gift wrapping included
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MORE ITEMS TO CONSIDER */}
          <section className="bg-white p-6 rounded-sm shadow-sm border-l-4 border-l-indigo-600 mb-8">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                <Package size={20} className="text-indigo-600"/> More items to consider
              </h3>
              <p className="text-xs text-gray-500 mt-1">Complete your setup with these complementary products</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  id: 301,
                  title: "Laptop Stand Adjustable Aluminum",
                  price: 549,
                  image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200",
                  rating: 4.5,
                  reviews: 892,
                  why: "Ergonomic companion for your laptop",
                  discount: 15
                },
                {
                  id: 302,
                  title: "Laptop Sleeve Premium Leather 15\"",
                  price: 399,
                  image: "https://images.unsplash.com/photo-1585695968280-f2d03c1cafb8?w=200",
                  rating: 4.6,
                  reviews: 1234,
                  why: "Protect your investment in style",
                  discount: 20
                },
                {
                  id: 303,
                  title: "Wireless Charging Pad Fast Charge",
                  price: 299,
                  image: "https://images.unsplash.com/photo-1591290619762-c588a66e3c83?w=200",
                  rating: 4.4,
                  reviews: 2341,
                  why: "Keep all your devices charged",
                  discount: 10
                },
                {
                  id: 304,
                  title: "Blue Light Blocking Glasses",
                  price: 449,
                  image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=200",
                  rating: 4.3,
                  reviews: 567,
                  why: "Reduce eye strain during long sessions",
                  discount: 25
                }
              ].map(p => (
                <div key={`consider-${p.id}`} className="flex gap-4 p-4 rounded border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group cursor-pointer">
                  <div className="w-24 h-24 flex-shrink-0 bg-[#f9f9f9] rounded flex items-center justify-center p-2">
                    <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform" alt={p.title}/>
                  </div>
                  
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm text-gray-800 mb-1">{p.title}</h4>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={10} fill="#f59e0b" className="text-orange-400"/>
                      <span className="text-[10px] text-gray-600 font-bold">{p.rating}</span>
                      <span className="text-[9px] text-gray-400">({p.reviews.toLocaleString()})</span>
                    </div>
                    
                    <div className="bg-indigo-50 border border-indigo-200 rounded px-2 py-1 mb-2 inline-block">
                      <span className="text-[9px] text-indigo-700 font-bold">💡 {p.why}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-black text-gray-900">R {p.price}</p>
                      <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded">-{p.discount}%</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center gap-2">
                    <button className="bg-indigo-600 text-white px-4 py-2 text-[10px] font-black rounded hover:bg-indigo-700 whitespace-nowrap">
                      Add to Cart
                    </button>
                    <button className="border border-gray-300 text-gray-600 px-4 py-2 text-[10px] font-bold rounded hover:border-indigo-600 hover:text-indigo-600 whitespace-nowrap">
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-2 mx-auto">
                Show More Recommendations <ChevronDown size={16}/>
              </button>
            </div>
          </section>

          {/* COMPARISON MATRIX TABLE */}
          <section className="mb-8 bg-white rounded-sm shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <BarChart size={18}/> Top 3 Laptops - Detailed Comparison
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-gray-400 border-b bg-white">
                    <th className="p-4">Product Details</th>
                    <th className="p-4">RAM</th>
                    <th className="p-4">Storage</th>
                    <th className="p-4">Battery</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {products.filter(p => p.category === "Computing").slice(0, 3).map(p => (
                    <tr key={`comp-${p.id}`} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="h-12 w-12 object-contain"/>
                          <div>
                            <div className="font-bold text-sm">{p.title}</div>
                            <div className="text-[10px] text-gray-500">by {p.seller}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 font-semibold">{p.specs?.RAM || "-"}</td>
                      <td className="p-4 text-gray-600 font-semibold">{p.specs?.Storage || "-"}</td>
                      <td className="p-4 text-gray-600 font-semibold">{p.specs?.Battery || "-"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star size={12} fill="#f59e0b" className="text-orange-400"/>
                          <span className="font-bold text-sm">{p.rating}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-black text-lg text-[#00664b]">R {p.price.toLocaleString()}</div>
                        <button className="text-[10px] text-blue-600 font-bold hover:underline">Add to Cart</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* BRAND STOREFRONTS */}
          <section className="mb-8">
            <h3 className="text-xl font-black text-gray-800 mb-4 uppercase">Official Brand Stores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {name: "Apple", logo: "🍎", bg: "from-slate-800 to-slate-600"},
                {name: "Samsung", logo: "📱", bg: "from-blue-600 to-blue-400"},
                {name: "Sony", logo: "🎮", bg: "from-slate-700 to-slate-500"},
                {name: "LG", logo: "📺", bg: "from-red-600 to-red-400"}
              ].map(brand => (
                <div key={brand.name} className={`bg-gradient-to-br ${brand.bg} h-32 rounded-sm flex flex-col items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-lg`}>
                  <div className="text-4xl mb-2">{brand.logo}</div>
                  <div className="font-black text-sm">{brand.name} Official Store</div>
                  <div className="text-[10px] opacity-75 mt-1">Explore Collection →</div>
                </div>
              ))}
            </div>
          </section>

          {/* USER GALLERY */}
          <section className="mb-8 bg-white p-6 rounded-sm shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-2">
                <Camera size={20}/> Customer Photos
              </h3>
              <button className="text-blue-600 font-bold text-xs hover:underline">UPLOAD YOUR PHOTO</button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 ring-blue-500">
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=200&h=200&fit=crop`} 
                    className="w-full h-full object-cover"
                    alt={`Customer photo ${i}`}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* EXPERT GUIDES */}
          <section className="mb-8">
            <h3 className="text-xl font-black text-gray-800 mb-4 uppercase flex items-center gap-2">
              <BookOpen size={20}/> Expert Buying Guides
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {title: "How to Choose the Right Solar Inverter", img: "https://images.unsplash.com/photo-1509391366360-feaffa6032d5?w=400"},
                {title: "Gaming Laptop Buying Guide 2025", img: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=400"},
                {title: "Smart Home Setup for Beginners", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"}
              ].map((guide, i) => (
                <div key={i} className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="h-40 overflow-hidden">
                    <img src={guide.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={guide.title}/>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-sm text-gray-800 group-hover:text-[#00664b]">{guide.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 font-bold">
                      Read More <ArrowRight size={12}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Q&A SECTION */}
          <section className="mb-8 bg-white p-6 rounded-sm shadow-sm">
            <h3 className="text-xl font-black text-gray-800 mb-4 uppercase flex items-center gap-2">
              <MessageCircle size={20}/> Community Q&A
            </h3>
            <div className="space-y-4">
              {[
                {q: "Does this inverter work with lithium batteries?", a: "Yes, it's compatible with both lead-acid and lithium batteries.", votes: 42},
                {q: "What's the warranty period?", a: "Standard 5-year manufacturer warranty included.", votes: 28},
                {q: "Can I install this myself?", a: "We recommend professional installation for safety and warranty coverage.", votes: 35}
              ].map((qa, i) => (
                <div key={i} className="border-b pb-4 last:border-b-0">
                  <div className="font-bold text-sm text-gray-800 flex items-start gap-2">
                    <span className="text-blue-600 font-black">Q:</span> {qa.q}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 flex items-start gap-2 ml-5">
                    <span className="text-green-600 font-black">A:</span> {qa.a}
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-5">
                    <button className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1">
                      👍 {qa.votes} helpful
                    </button>
                    <button className="text-xs text-gray-500 hover:text-blue-600">Reply</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-blue-600 font-bold text-xs hover:underline">Ask a Question</button>
          </section>

          {/* BRAND WALL */}
          <section className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            {["SAMSUNG", "APPLE", "LG", "SONY", "DELL", "HP"].map(brand => (
              <div key={brand} className="bg-white h-16 rounded-sm flex items-center justify-center font-black text-gray-400 border border-gray-100 text-[10px] cursor-pointer hover:border-gray-300">
                {brand}
              </div>
            ))}
          </section>

          {/* RECENTLY VIEWED */}
          {viewedProducts.length > 0 && (
            <section className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-t-purple-500">
              <h3 className="text-xl font-black text-gray-800 mb-4 uppercase flex items-center gap-2">
                <Clock size={20}/> Your Recently Viewed Items
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {viewedProducts.map(p => (
                  <div key={`viewed-${p.id}`} className="flex-shrink-0 w-40">
                    <div className="h-32 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-2">
                      <img src={p.image} className="h-full w-full object-contain" alt={p.title}/>
                    </div>
                    <h4 className="mt-2 font-bold text-xs text-gray-800 line-clamp-2">{p.title}</h4>
                    <p className="text-sm font-black text-slate-900 mt-1">R {p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 mt-20 py-16 px-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div>
              <h2 className="text-2xl font-black text-[#00664b] mb-4 italic">INDABACART</h2>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                South Africa's premier B2B and B2C marketplace. Connecting buyers and sellers since 2020.
              </p>
              <div className="flex gap-3 mt-4">
                {['📘', '🐦', '📷', '💼'].map((icon, i) => (
                  <div key={i} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00664b] hover:text-white text-sm">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-xs uppercase mb-4 tracking-widest text-gray-700">Company</h5>
              <ul className="text-xs text-gray-500 space-y-2 font-bold">
                <li className="hover:text-[#00664b] cursor-pointer">About Us</li>
                <li className="hover:text-[#00664b] cursor-pointer">Careers</li>
                <li className="hover:text-[#00664b] cursor-pointer">Press & Media</li>
                <li className="hover:text-[#00664b] cursor-pointer">Investor Relations</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-black text-xs uppercase mb-4 tracking-widest text-gray-700">Sell</h5>
              <ul className="text-xs text-gray-500 space-y-2 font-bold">
                <li className="hover:text-[#00664b] cursor-pointer">Sell on IndabaCart</li>
                <li className="hover:text-[#00664b] cursor-pointer">Seller Dashboard</li>
                <li className="hover:text-[#00664b] cursor-pointer">Fulfillment Services</li>
                <li className="hover:text-[#00664b] cursor-pointer">Advertising</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-black text-xs uppercase mb-4 tracking-widest text-gray-700">Support</h5>
              <ul className="text-xs text-gray-500 space-y-2 font-bold">
                <li className="hover:text-[#00664b] cursor-pointer">Help Center</li>
                <li className="hover:text-[#00664b] cursor-pointer">Track Order</li>
                <li className="hover:text-[#00664b] cursor-pointer">Returns & Refunds</li>
                <li className="hover:text-[#00664b] cursor-pointer">Contact Us</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-[#00664b] to-[#004d39] p-6 rounded-sm">
              <h5 className="font-black text-white text-xs uppercase mb-2 flex items-center gap-2">
                <Award size={14}/> Start Selling Today
              </h5>
              <p className="text-xs text-white/80 mb-4">Join thousands of successful sellers</p>
              <button className="w-full bg-white text-[#00664b] py-3 text-[10px] font-black rounded-sm uppercase hover:bg-gray-100">
                Open Seller Account
              </button>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-6 text-xs text-gray-500">
              <span className="hover:text-[#00664b] cursor-pointer">Terms of Service</span>
              <span className="hover:text-[#00664b] cursor-pointer">Privacy Policy</span>
              <span className="hover:text-[#00664b] cursor-pointer">Cookie Preferences</span>
            </div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
              © 2025 IndabaCart (Pty) Ltd. All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
