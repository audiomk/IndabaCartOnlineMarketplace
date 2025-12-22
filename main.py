from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List

app = FastAPI()

# Enable CORS so Next.js can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expanded Product Database
PRODUCTS = [
    {
        "id": 1, 
        "title": "MacBook Pro M3 Max", 
        "price": 65000, 
        "category": "Computing", 
        "image": "https://images.unsplash.com/photo-1517336714467-d2364f21038a?w=400",
        "rating": 4.9,
        "specs": {"RAM": "32GB", "Storage": "1TB", "Battery": "22hrs"}
    },
    {
        "id": 2, 
        "title": "Dell XPS 13 Ultrabook", 
        "price": 28500, 
        "category": "Computing", 
        "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
        "rating": 4.5,
        "specs": {"RAM": "16GB", "Storage": "512GB", "Battery": "14hrs"}
    },
    {
        "id": 3, 
        "title": "Samsung 65\" OLED TV", 
        "price": 32000, 
        "category": "TV & Video", 
        "image": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
        "rating": 4.8,
        "specs": {"Resolution": "4K", "Refresh": "120Hz"}
    },
    {
        "id": 4, 
        "title": "Smart Air Fryer XL", 
        "price": 2450, 
        "category": "Small Appliances", 
        "image": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
        "rating": 4.2,
        "specs": {"Capacity": "5.5L", "Power": "1700W"}
    }
]

@app.get("/api/products")
async def get_products(q: Optional[str] = None):
    if q:
        return [p for p in PRODUCTS if q.lower() in p["title"].lower()]
    return PRODUCTS
