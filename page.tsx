"use client";
import { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, Menu, ChevronDown, Zap, ShieldCheck, 
  MapPin, Star, TrendingUp, HelpCircle, BarChart, Truck, 
  Clock, Heart, Eye, ArrowRight
} from 'lucide-react';

// FIX: Define the Product structure for TypeScript
interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  specs?: Record<string, string>;
}

export default function IndabaCartFull() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async (query = "") => {
    try {
      const url = query 
        ? `http://localhost:8000/api/products?q=${query}` 
        : 'http://localhost:8000/api/products';
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Backend Error:", err);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-900 font-sans">
      
      {/* HEADER: Discovery Tier */}
      <header className="sticky top-0 z-[100] shadow-md">
        <div className="bg-white px-4 py-1.5 flex justify-between items-center text-[11px] font-bold border-b text-gray-500">
          <div className="flex gap-6">
            <span className="text-[#00664b] hover:underline cursor-pointer">Sell on IndabaCart</span>
            <span className="hover:text-blue-600 cursor-pointer flex items-center gap-1"><MapPin size={12}/> Find a Pickup Point</span>
          </div>
          <div className="flex gap-4 items-center uppercase tracking-tighter">
            <span className="hover:text-black cursor-pointer">Help</span>
            <div className="flex items-center gap-1 cursor-pointer border-l pl-4 font-bold text-gray-800">
              🇿🇦 EN <ChevronDown size={12}/>
            </div>
          </div>
        </div>
        
        <div className="bg-[#004d39] px-6 py-3 flex items-center gap-6">
          <h1 className="text-2xl font-black text-white tracking-tighter italic cursor-pointer">INDABACART</h1>
          
          <div className="flex flex-1 bg-white rounded-sm overflow-hidden h-11 shadow-inner">
            <div className="bg-gray-100 px-4 flex items-center gap-2 border-r text-[11px] font-black text-gray-500 uppercase">
              All <ChevronDown size={14}/>
            </div>
            <input 
              type="text" 
              placeholder="Search for products, brands and departments..." 
              className="flex-grow px-4 outline-none text-sm"
              onChange={(e) => {setSearchTerm(e.target.value); fetchProducts(e.target.value);}}
            />
            <button className="bg-[#f3a847] px-8 text-white hover:bg-[#e29636]"><Search size={22}/></button>
          </div>

          <div className="flex items-center gap-6 text-white font-black text-[11px] uppercase">
             <div className="flex flex-col items-center cursor-pointer hover:text-[#f3a847] relative">
              <ShoppingCart size={24}/>
              <span className="mt-1">Cart</span>
              <span className="absolute -top-1 -right-1 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px]">0</span>
            </div>
          </div>
        </div>

        <div className="bg-[#78b13f] px-6 py-1.5 flex gap-5 text-[10px] text-white font-black uppercase tracking-widest overflow-x-auto">
          <span className="flex items-center gap-1 text-black/30"><TrendingUp size={12}/> Trending:</span>
          {["Solar Inverters", "Air Fryers", "iPhone 16", "L-Shape Couches"].map(t => (
            <span key={t} className="hover:text-black cursor-pointer">{t}</span>
          ))}
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex gap-4 p-4">
        
        {/* SIDEBAR: Master Category List */}
        <aside className="w-64 flex-shrink-0 hidden xl:block">
          <div className="bg-white rounded shadow-sm border border-gray-100 sticky top-32 overflow-hidden">
            <div className="bg-gray-50 p-3 border-b font-black text-[11px] uppercase text-gray-400 flex items-center gap-2">
              <Menu size={16}/> Shop Departments
            </div>
            <ul className="text-[13px] font-bold text-gray-600">
              {["Computing", "Mobiles", "Gaming", "Audio", "Large Appliances", "Small Appliances", "TV & Video", "Smart Home"].map(cat => (
                <li key={cat} className="px-4 py-3 hover:bg-[#f1f3f6] hover:text-[#00664b] cursor-pointer flex justify-between items-center group">
                  {cat} <ChevronDown size={14} className="-rotate-90 text-gray-300 group-hover:text-[#00664b]"/>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {/* HERO: Urgency Slider */}
          <section className="relative h-[300px] bg-slate-900 rounded-sm overflow-hidden mb-6 shadow-md">
            <div className="absolute inset-0 flex items-center p-12 text-white z-10">
              <div className="max-w-md">
                <div className="flex items-center gap-2 text-orange-400 font-black text-sm mb-2"><Zap size={18} fill="currentColor"/> HOT DEALS</div>
                <h2 className="text-5xl font-black leading-none uppercase">Solar Backup <br/>Specials</h2>
                <button className="mt-6 bg-[#f3a847] px-8 py-3 rounded-sm font-black text-black text-xs uppercase">Shop Now</button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-60"></div>
            <img src="https://images.unsplash.com/photo-1509391366360-feaffa6032d5?w=800" className="w-full h-full object-cover" alt="Hero"/>
          </section>

          {/* DAILY DEALS */}
          <section className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-t-orange-500 mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Daily Deals</h3>
                <div className="flex items-center gap-2 mt-1 font-mono text-red-600 text-xs font-bold">
                   <Clock size={14}/> 08h : 42m : 12s
                </div>
              </div>
              <button className="text-blue-600 font-bold text-xs hover:underline">VIEW ALL</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="group cursor-pointer">
                  <div className="relative h-48 bg-[#f9f9f9] rounded-sm flex items-center justify-center p-4">
                    <img src={p.image} className="h-full w-full object-contain group-hover:scale-105 transition-transform" />
                  </div>
                  <h4 className="mt-3 font-bold text-sm text-gray-800 line-clamp-2">{p.title}</h4>
                  <div className="flex items-center gap-1 mt-1 text-orange-400"><Star size={10} fill="currentColor"/> <span className="text-[10px] text-gray-400 font-bold">{p.rating}</span></div>
                  <p className="text-xl font-black text-slate-900 mt-1">R {p.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          {/* COMPARISON MATRIX */}
          <section className="mb-12 bg-white rounded-sm shadow-sm border overflow-hidden">
            <div className="p-4 bg-gray-50 border-b font-black text-xs uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <BarChart size={18}/> Product Comparison Matrix
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-400 border-b bg-white">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Key Spec</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {products.map(p => (
                  <tr key={`comp-${p.id}`} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3 font-bold">
                      <img src={p.image} className="h-8 w-8 object-contain"/> {p.title}
                    </td>
                    <td className="p-4 text-gray-500">{Object.values(p.specs || {})[0] || "Standard"}</td>
                    <td className="p-4">
                       <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-[#78b13f] h-full" style={{width: `${(p.rating/5)*100}%`}}></div>
                       </div>
                    </td>
                    <td className="p-4 text-right font-black text-[#00664b]">R {p.price.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* BRAND WALL */}
          <section className="grid grid-cols-3 md:grid-cols-6 gap-4 opacity-30 grayscale hover:grayscale-0 transition-all mb-20">
            {["SAMSUNG", "APPLE", "LG", "SONY", "DELL", "HP"].map(brand => (
              <div key={brand} className="bg-white h-16 rounded-sm flex items-center justify-center font-black text-gray-400 border border-gray-100 text-[10px]">{brand}</div>
            ))}
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-16 px-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-2xl font-black text-[#00664b] mb-4 italic">INDABACART</h2>
            <p className="text-xs text-gray-400 font-medium">South Africa's premier B2B and B2C marketplace.</p>
          </div>
          <div>
            <h5 className="font-black text-xs uppercase mb-6 tracking-widest">Company</h5>
            <ul className="text-xs text-gray-500 space-y-3 font-bold">
              <li className="hover:text-[#00664b] cursor-pointer">About Us</li>
              <li className="hover:text-[#00664b] cursor-pointer">Sell on IndabaCart</li>
              <li className="hover:text-[#00664b] cursor-pointer">Deliver for Us</li>
            </ul>
          </div>
          <div className="bg-[#f9f9f9] p-6 rounded-sm border border-gray-100">
             <h5 className="font-black text-[#00664b] text-xs uppercase mb-2">Partner with us</h5>
             <button className="w-full bg-[#00664b] text-white py-3 text-[10px] font-black rounded-sm uppercase mt-4">Open Seller Account</button>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">© 2025 IndabaCart (Pty) Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
