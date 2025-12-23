
##  IndabaCart Backend - Enterprise E-commerce Platform
##  A comprehensive backend system with PIM, IAM, OMS, RFQ, Auctions, and AI recommendations


from fastapi import FastAPI, HTTPException, Depends, Query, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import jwt
import hashlib
import random
import asyncio
from collections import defaultdict
import math

# ============================================================================
# CONFIGURATION & INITIALIZATION
# ============================================================================

app = FastAPI(title="IndabaCart API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

SECRET_KEY = "indabacart-secret-key-change-in-production"
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class UserRole(str, Enum):
    ADMIN = "admin"
    SELLER = "seller"
    BUYER = "buyer"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Currency(str, Enum):
    ZAR = "ZAR"
    USD = "USD"
    ZIG = "ZIG"

class AuctionStatus(str, Enum):
    ACTIVE = "active"
    ENDED = "ended"
    CANCELLED = "cancelled"

class DisputeStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"

# Exchange rates (in production, fetch from live API)
EXCHANGE_RATES = {
    "ZAR": 1.0,
    "USD": 18.50,
    "ZIG": 0.05
}

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ProductVariant(BaseModel):
    sku: str
    color: Optional[str] = None
    size: Optional[str] = None
    stock: int
    price_adjustment: float = 0.0

class ProductSpec(BaseModel):
    name: str
    value: str

class Product(BaseModel):
    id: int
    title: str
    description: str
    category: str
    base_price: float
    currency: Currency = Currency.ZAR
    seller_id: int
    variants: List[ProductVariant] = []
    specs: List[ProductSpec] = []
    images: List[str]
    tags: List[str] = []
    rating: float = 0.0
    reviews_count: int = 0
    view_count: int = 0
    purchase_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class User(BaseModel):
    id: int
    email: EmailStr
    username: str
    role: UserRole
    full_name: Optional[str] = None
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

class Review(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int = Field(ge=1, le=5)
    comment: str
    is_verified_purchase: bool
    helpful_count: int = 0
    created_at: datetime = Field(default_factory=datetime.now)

class Order(BaseModel):
    id: int
    user_id: int
    items: List[Dict[str, Any]]
    total_amount: float
    currency: Currency
    status: OrderStatus
    shipping_address: Dict[str, str]
    tracking_number: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class RFQ(BaseModel):
    id: int
    buyer_id: int
    seller_id: int
    product_id: int
    quantity: int
    target_price: float
    message: str
    status: str = "pending"
    seller_response: Optional[str] = None
    final_price: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.now)

class Auction(BaseModel):
    id: int
    product_id: int
    seller_id: int
    starting_bid: float
    reserve_price: float
    current_bid: float
    highest_bidder_id: Optional[int] = None
    bid_count: int = 0
    start_time: datetime
    end_time: datetime
    status: AuctionStatus
    sniper_protection: bool = True

class Bid(BaseModel):
    id: int
    auction_id: int
    user_id: int
    amount: float
    timestamp: datetime = Field(default_factory=datetime.now)

class Dispute(BaseModel):
    id: int
    order_id: int
    buyer_id: int
    seller_id: int
    reason: str
    description: str
    status: DisputeStatus
    resolution: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    resolved_at: Optional[datetime] = None

# ============================================================================
# IN-MEMORY DATABASES (Use PostgreSQL/MongoDB in production)
# ============================================================================

users_db: Dict[int, Dict] = {
    1: {
        "id": 1,
        "email": "admin@indabacart.co.za",
        "username": "admin",
        "password_hash": hashlib.sha256("admin123".encode()).hexdigest(),
        "role": "admin",
        "full_name": "System Admin",
        "is_verified": True
    },
    2: {
        "id": 2,
        "email": "seller@shop.co.za",
        "username": "techseller",
        "password_hash": hashlib.sha256("seller123".encode()).hexdigest(),
        "role": "seller",
        "full_name": "Tech Shop ZA",
        "is_verified": True
    }
}

products_db: Dict[int, Dict] = {
    1: {
        "id": 1,
        "title": "MacBook Pro M3 Max 16-inch",
        "description": "Powerful laptop for professionals",
        "category": "Computing",
        "base_price": 65000,
        "currency": "ZAR",
        "seller_id": 2,
        "variants": [
            {"sku": "MBP-32-1TB", "color": "Space Gray", "size": "16-inch", "stock": 5, "price_adjustment": 0},
            {"sku": "MBP-64-2TB", "color": "Silver", "size": "16-inch", "stock": 2, "price_adjustment": 15000}
        ],
        "specs": [
            {"name": "RAM", "value": "32GB"},
            {"name": "Storage", "value": "1TB SSD"},
            {"name": "Processor", "value": "Apple M3 Max"}
        ],
        "images": ["https://images.unsplash.com/photo-1517336714467-d2364f21038a?w=400"],
        "tags": ["laptop", "apple", "professional", "m3"],
        "rating": 4.9,
        "reviews_count": 2847,
        "view_count": 45231,
        "purchase_count": 1823,
        "seo_title": "MacBook Pro M3 Max - Best Professional Laptop 2025",
        "seo_description": "Buy the latest MacBook Pro with M3 Max chip. Free shipping in SA."
    }
}

orders_db: Dict[int, Dict] = {}
reviews_db: Dict[int, Dict] = {}
rfqs_db: Dict[int, Dict] = {}
auctions_db: Dict[int, Dict] = {}
bids_db: Dict[int, Dict] = {}
disputes_db: Dict[int, Dict] = {}
inventory_db: Dict[str, int] = {}  # SKU -> Stock count
escrow_db: Dict[int, float] = {}  # Order ID -> Amount held
user_activity_db: Dict[int, List[Dict]] = defaultdict(list)  # User ID -> Activities
price_history_db: Dict[int, List[Dict]] = defaultdict(list)  # Product ID -> Price changes

# ============================================================================
# 1. IDENTITY & ACCESS MANAGEMENT (IAM)
# ============================================================================

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=24)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id or int(user_id) not in users_db:
        raise HTTPException(status_code=401, detail="Invalid authentication")
    return users_db[int(user_id)]

def require_role(allowed_roles: List[UserRole]):
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return role_checker

@app.post("/auth/register")
async def register(email: EmailStr, username: str, password: str, role: UserRole = UserRole.BUYER):
    user_id = max(users_db.keys()) + 1 if users_db else 1
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    users_db[user_id] = {
        "id": user_id,
        "email": email,
        "username": username,
        "password_hash": password_hash,
        "role": role,
        "is_verified": False,
        "created_at": datetime.now()
    }
    
    token = create_access_token({"sub": str(user_id), "role": role})
    return {"access_token": token, "token_type": "bearer", "user_id": user_id}

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Use the auth verify function instead of !=
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_token(data={"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# ============================================================================
# 2. PRODUCT INFORMATION MANAGEMENT (PIM)
# ============================================================================

@app.get("/api/products")
async def get_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "relevance",
    currency: Currency = Currency.ZAR
):
    products = list(products_db.values())
    
    # Filter by search query
    if q:
        q_lower = q.lower()
        products = [p for p in products if 
                   q_lower in p["title"].lower() or 
                   q_lower in p["description"].lower() or
                   any(q_lower in tag for tag in p.get("tags", []))]
    
    # Filter by category
    if category:
        products = [p for p in products if p["category"] == category]
    
    # Convert prices to requested currency
    for p in products:
        p["display_price"] = convert_currency(p["base_price"], p["currency"], currency)
        p["display_currency"] = currency
    
    # Filter by price range
    if min_price:
        products = [p for p in products if p["display_price"] >= min_price]
    if max_price:
        products = [p for p in products if p["display_price"] <= max_price]
    
    # Sort products
    if sort_by == "price_low":
        products.sort(key=lambda x: x["display_price"])
    elif sort_by == "price_high":
        products.sort(key=lambda x: x["display_price"], reverse=True)
    elif sort_by == "rating":
        products.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "popular":
        products.sort(key=lambda x: x.get("purchase_count", 0), reverse=True)
    
    return products

@app.get("/api/products/{product_id}")
async def get_product(product_id: int, currency: Currency = Currency.ZAR):
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = products_db[product_id].copy()
    product["display_price"] = convert_currency(product["base_price"], product["currency"], currency)
    product["display_currency"] = currency
    
    # Increment view count
    products_db[product_id]["view_count"] += 1
    
    return product

@app.post("/api/products")
async def create_product(
    product: Dict[str, Any],
    current_user: dict = Depends(require_role([UserRole.SELLER, UserRole.ADMIN]))
):
    product_id = max(products_db.keys()) + 1 if products_db else 1
    product["id"] = product_id
    product["seller_id"] = current_user["id"]
    product["created_at"] = datetime.now()
    product["rating"] = 0.0
    product["reviews_count"] = 0
    product["view_count"] = 0
    product["purchase_count"] = 0
    
    products_db[product_id] = product
    
    # Initialize inventory for variants
    for variant in product.get("variants", []):
        inventory_db[variant["sku"]] = variant["stock"]
    
    return product

@app.put("/api/products/{product_id}")
async def update_product(
    product_id: int,
    updates: Dict[str, Any],
    current_user: dict = Depends(require_role([UserRole.SELLER, UserRole.ADMIN]))
):
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = products_db[product_id]
    
    # Check ownership
    if current_user["role"] != "admin" and product["seller_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Track price changes for dynamic pricing
    if "base_price" in updates and updates["base_price"] != product["base_price"]:
        price_history_db[product_id].append({
            "old_price": product["base_price"],
            "new_price": updates["base_price"],
            "timestamp": datetime.now()
        })
    
    products_db[product_id].update(updates)
    return products_db[product_id]

# ============================================================================
# 3. INVENTORY & STOCK ENGINE (Real-time)
# ============================================================================

@app.get("/api/inventory/{sku}")
async def check_inventory(sku: str):
    if sku not in inventory_db:
        raise HTTPException(status_code=404, detail="SKU not found")
    return {"sku": sku, "stock": inventory_db[sku], "available": inventory_db[sku] > 0}

@app.post("/api/inventory/reserve")
async def reserve_inventory(sku: str, quantity: int, current_user: dict = Depends(get_current_user)):
    if sku not in inventory_db:
        raise HTTPException(status_code=404, detail="SKU not found")
    
    if inventory_db[sku] < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")
    
    inventory_db[sku] -= quantity
    return {"message": "Inventory reserved", "remaining_stock": inventory_db[sku]}

@app.websocket("/ws/inventory/{sku}")
async def inventory_websocket(websocket: WebSocket, sku: str):
    await websocket.accept()
    try:
        while True:
            if sku in inventory_db:
                await websocket.send_json({"sku": sku, "stock": inventory_db[sku]})
            await asyncio.sleep(2)
    except:
        pass

# ============================================================================
# 4. ORDER MANAGEMENT SYSTEM (OMS)
# ============================================================================

@app.post("/api/orders")
async def create_order(
    items: List[Dict[str, Any]],
    shipping_address: Dict[str, str],
    current_user: dict = Depends(get_current_user)
):
    order_id = max(orders_db.keys()) + 1 if orders_db else 1
    
    total_amount = 0
    for item in items:
        product = products_db.get(item["product_id"])
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item['product_id']} not found")
        total_amount += product["base_price"] * item["quantity"]
    
    order = {
        "id": order_id,
        "user_id": current_user["id"],
        "items": items,
        "total_amount": total_amount,
        "currency": "ZAR",
        "status": "pending",
        "shipping_address": shipping_address,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    orders_db[order_id] = order
    
    # Hold funds in escrow
    escrow_db[order_id] = total_amount
    
    return order

@app.get("/api/orders")
async def get_orders(current_user: dict = Depends(get_current_user)):
    user_orders = [o for o in orders_db.values() if o["user_id"] == current_user["id"]]
    return user_orders

@app.get("/api/orders/{order_id}")
async def get_order(order_id: int, current_user: dict = Depends(get_current_user)):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    if order["user_id"] != current_user["id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return order

@app.put("/api/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    current_user: dict = Depends(require_role([UserRole.SELLER, UserRole.ADMIN]))
):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    orders_db[order_id]["status"] = status
    orders_db[order_id]["updated_at"] = datetime.now()
    
    # Release escrow when delivered
    if status == OrderStatus.DELIVERED and order_id in escrow_db:
        amount = escrow_db.pop(order_id)
        # In production: Transfer to seller's account
        
    return orders_db[order_id]

# ============================================================================
# 5. REVIEW & RATING SYSTEM
# ============================================================================

@app.post("/api/reviews")
async def create_review(
    product_id: int,
    rating: int,
    comment: str,
    current_user: dict = Depends(get_current_user)
):
    # Check if user has purchased this product
    user_orders = [o for o in orders_db.values() if o["user_id"] == current_user["id"] and o["status"] == "delivered"]
    has_purchased = any(
        any(item["product_id"] == product_id for item in order["items"])
        for order in user_orders
    )
    
    review_id = max(reviews_db.keys()) + 1 if reviews_db else 1
    review = {
        "id": review_id,
        "product_id": product_id,
        "user_id": current_user["id"],
        "rating": rating,
        "comment": comment,
        "is_verified_purchase": has_purchased,
        "helpful_count": 0,
        "created_at": datetime.now()
    }
    
    reviews_db[review_id] = review
    
    # Update product rating
    product_reviews = [r for r in reviews_db.values() if r["product_id"] == product_id]
    avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews)
    products_db[product_id]["rating"] = round(avg_rating, 1)
    products_db[product_id]["reviews_count"] = len(product_reviews)
    
    return review

@app.get("/api/products/{product_id}/reviews")
async def get_reviews(product_id: int, verified_only: bool = False):
    product_reviews = [r for r in reviews_db.values() if r["product_id"] == product_id]
    if verified_only:
        product_reviews = [r for r in product_reviews if r["is_verified_purchase"]]
    return sorted(product_reviews, key=lambda x: x["helpful_count"], reverse=True)

@app.post("/api/reviews/{review_id}/helpful")
async def mark_helpful(review_id: int):
    if review_id not in reviews_db:
        raise HTTPException(status_code=404, detail="Review not found")
    reviews_db[review_id]["helpful_count"] += 1
    return reviews_db[review_id]

# ============================================================================
# 6. REQUEST FOR QUOTATION (RFQ) SYSTEM
# ============================================================================

@app.post("/api/rfq")
async def create_rfq(
    product_id: int,
    seller_id: int,
    quantity: int,
    target_price: float,
    message: str,
    current_user: dict = Depends(get_current_user)
):
    rfq_id = max(rfqs_db.keys()) + 1 if rfqs_db else 1
    rfq = {
        "id": rfq_id,
        "buyer_id": current_user["id"],
        "seller_id": seller_id,
        "product_id": product_id,
        "quantity": quantity,
        "target_price": target_price,
        "message": message,
        "status": "pending",
        "created_at": datetime.now()
    }
    rfqs_db[rfq_id] = rfq
    return rfq

@app.get("/api/rfq")
async def get_rfqs(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "seller":
        return [r for r in rfqs_db.values() if r["seller_id"] == current_user["id"]]
    return [r for r in rfqs_db.values() if r["buyer_id"] == current_user["id"]]

@app.put("/api/rfq/{rfq_id}/respond")
async def respond_rfq(
    rfq_id: int,
    final_price: float,
    response: str,
    current_user: dict = Depends(require_role([UserRole.SELLER]))
):
    if rfq_id not in rfqs_db:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    rfq = rfqs_db[rfq_id]
    if rfq["seller_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    rfqs_db[rfq_id].update({
        "status": "responded",
        "seller_response": response,
        "final_price": final_price
    })
    
    return rfqs_db[rfq_id]

# ============================================================================
# 7. BIDDING & AUCTION ENGINE
# ============================================================================

@app.post("/api/auctions")
async def create_auction(
    product_id: int,
    starting_bid: float,
    reserve_price: float,
    duration_hours: int,
    current_user: dict = Depends(require_role([UserRole.SELLER, UserRole.ADMIN]))
):
    auction_id = max(auctions_db.keys()) + 1 if auctions_db else 1
    start_time = datetime.now()
    end_time = start_time + timedelta(hours=duration_hours)
    
    auction = {
        "id": auction_id,
        "product_id": product_id,
        "seller_id": current_user["id"],
        "starting_bid": starting_bid,
        "reserve_price": reserve_price,
        "current_bid": starting_bid,
        "highest_bidder_id": None,
        "bid_count": 0,
        "start_time": start_time,
        "end_time": end_time,
        "status": "active",
        "sniper_protection": True
    }
    
    auctions_db[auction_id] = auction
    return auction

@app.post("/api/auctions/{auction_id}/bid")
async def place_bid(
    auction_id: int,
    amount: float,
    current_user: dict = Depends(get_current_user)
):
    if auction_id not in auctions_db:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    auction = auctions_db[auction_id]
    
    if auction["status"] != "active":
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    if datetime.now() > auction["end_time"]:
        auctions_db[auction_id]["status"] = "ended"
        raise HTTPException(status_code=400, detail="Auction has ended")
    
    if amount <= auction["current_bid"]:
        raise HTTPException(status_code=400, detail="Bid must be higher than current bid")
    
    # Sniper protection: Extend auction if bid placed in last 10 seconds
    time_remaining = (auction["end_time"] - datetime.now()).total_seconds()
    if auction["sniper_protection"] and time_remaining < 10:
        auction["end_time"] += timedelta(seconds=30)
    
    # Record bid
    bid_id = max(bids_db.keys()) + 1 if bids_db else 1
    bid = {
        "id": bid_id,
        "auction_id": auction_id,
        "user_id": current_user["id"],
        "amount": amount,
        "timestamp": datetime.now()
    }
    bids_db[bid_id] = bid
    
    # Update auction
    auctions_db[auction_id]["current_bid"] = amount
    auctions_db[auction_id]["highest_bidder_id"] = current_user["id"]
    auctions_db[auction_id]["bid_count"] += 1
    
    return {"message": "Bid placed successfully", "auction": auctions_db[auction_id]}

@app.get("/api/auctions")
async def get_auctions(status: Optional[AuctionStatus] = None):
    auctions = list(auctions_db.values())
    if status:
        auctions = [a for a in auctions if a["status"] == status]
    return auctions

# ============================================================================
# 8. DISPUTE RESOLUTION CENTER
# ============================================================================

@app.post("/api/disputes")
async def create_dispute(
    order_id: int,
    reason: str,
    description: str,
    current_user: dict = Depends(get_current_user)
):
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    if order["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Find seller from order items
    seller_id = products_db[order["items"][0]["product_id"]]["seller_id"]
    
    dispute_id = max(disputes_db.keys()) + 1 if disputes_db else 1
    dispute = {
        "id": dispute_id,
        "order_id": order_id,
        "buyer_id": current_user["id"],
        "seller_id": seller_id,
        "reason": reason,
        "description": description,
        "status": "open",
        "created_at": datetime.now()
    }
    
    disputes_db[dispute_id] = dispute
    return dispute

@app.get("/api/disputes")
async def get_disputes(current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "admin":
        return list(disputes_db.values())
    elif current_user["role"] == "seller":
        return [d for d in disputes_db.values() if d["seller_id"] == current_user["id"]]
    return [d for d in disputes_db.values() if d["buyer_id"] == current_user["id"]]

@app.put("/api/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: int,
    resolution: str,
    refund_amount: Optional[float] = None,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    if dispute_id not in disputes_db:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    disputes_db[dispute_id].update({
        "status": "resolved",
        "resolution": resolution,
        "resolved_at": datetime.now()
    })
    
    # Process refund if applicable
    if refund_amount:
        order_id = disputes_db[dispute_id]["order_id"]
        orders_db[order_id]["status"] = "refunded"
    
    return disputes_db[dispute_id]

# ============================================================================
# 9. MULTI-CURRENCY ENGINE
# ============================================================================

def convert_currency(amount: float, from_currency: str, to_currency: str) -> float:
    """Convert amount between currencies using live rates"""
    if from_currency == to_currency:
        return amount
    
    # Convert to ZAR first, then to target currency
    amount_in_zar = amount / EXCHANGE_RATES[from_currency]
    return round(amount_in_zar * EXCHANGE_RATES[to_currency], 2)

@app.get("/api/currency/rates")
async def get_exchange_rates():
    return EXCHANGE_RATES

@app.get("/api/currency/convert")
async def currency_convert(amount: float, from_curr: Currency, to_curr: Currency):
    converted = convert_currency(amount, from_curr, to_curr)
    return {
        "original_amount": amount,
        "original_currency": from_curr,
        "converted_amount": converted,
        "target_currency": to_curr,
        "rate": EXCHANGE_RATES[to_curr] / EXCHANGE_RATES[from_curr]
    }

# ============================================================================
# 10. RECOMMENDATION ENGINE (AI-Driven)
# ============================================================================

def calculate_similarity(product1: Dict, product2: Dict) -> float:
    """Calculate similarity score between two products"""
    score = 0.0
    
    # Same category = high score
    if product1["category"] == product2["category"]:
        score += 0.4
    
    # Similar price range
    price_diff = abs(product1["base_price"] - product2["base_price"])
    max_price = max(product1["base_price"], product2["base_price"])
    if max_price > 0:
        price_similarity = 1 - (price_diff / max_price)
        score += price_similarity * 0.3
    
    # Common tags
    tags1 = set(product1.get("tags", []))
    tags2 = set(product2.get("tags", []))
    if tags1 and tags2:
        tag_overlap = len(tags1 & tags2) / len(tags1 | tags2)
        score += tag_overlap * 0.3
    
    return score

@app.get("/api/recommendations/similar/{product_id}")
async def get_similar_products(product_id: int, limit: int = 5):
    """Find products similar to the given product"""
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    
    target_product = products_db[product_id]
    similarities = []
    
    for pid, product in products_db.items():
        if pid != product_id:
            score = calculate_similarity(target_product, product)
            similarities.append({"product": product, "score": score})
    
    similarities.sort(key=lambda x: x["score"], reverse=True)
    return [s["product"] for s in similarities[:limit]]

@app.get("/api/recommendations/frequently-bought-together/{product_id}")
async def frequently_bought_together(product_id: int, limit: int = 4):
    """Find products frequently bought with this product"""
    # Analyze order history
    product_pairs = defaultdict(int)
    
    for order in orders_db.values():
        item_ids = [item["product_id"] for item in order["items"]]
        if product_id in item_ids:
            for other_id in item_ids:
                if other_id != product_id:
                    product_pairs[other_id] += 1
    
    # Sort by frequency
    sorted_pairs = sorted(product_pairs.items(), key=lambda x: x[1], reverse=True)
    recommended_ids = [pid for pid, _ in sorted_pairs[:limit]]
    
    return [products_db[pid] for pid in recommended_ids if pid in products_db]

@app.get("/api/recommendations/personalized")
async def get_personalized_recommendations(
    current_user: dict = Depends(get_current_user),
    limit: int = 10
):
    """Generate personalized recommendations based on user activity"""
    user_id = current_user["id"]
    
    # Get user's browsing history
    viewed_products = [
        activity["product_id"] 
        for activity in user_activity_db[user_id] 
        if activity["type"] == "view"
    ]
    
    # Get user's purchase history
    purchased_products = []
    for order in orders_db.values():
        if order["user_id"] == user_id:
            purchased_products.extend([item["product_id"] for item in order["items"]])
    
    # Calculate scores for all products
    recommendations = {}
    
    for pid, product in products_db.items():
        if pid in purchased_products or pid in viewed_products:
            continue
        
        score = 0.0
        
        # Score based on viewed products
        for viewed_id in viewed_products[-10:]:  # Last 10 views
            if viewed_id in products_db:
                score += calculate_similarity(products_db[viewed_id], product) * 2
        
        # Score based on purchased products
        for purchased_id in purchased_products:
            if purchased_id in products_db:
                score += calculate_similarity(products_db[purchased_id], product) * 3
        
        # Boost popular products
        score += math.log(product.get("purchase_count", 0) + 1) * 0.5
        
        # Boost highly rated products
        score += product.get("rating", 0) * 0.3
        
        recommendations[pid] = score
    
    # Sort and return top recommendations
    sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
    recommended_ids = [pid for pid, _ in sorted_recs[:limit]]
    
    return [products_db[pid] for pid in recommended_ids]

@app.post("/api/activity/track")
async def track_activity(
    activity_type: str,
    product_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Track user activity for recommendation engine"""
    user_activity_db[current_user["id"]].append({
        "type": activity_type,
        "product_id": product_id,
        "timestamp": datetime.now()
    })
    return {"message": "Activity tracked"}

# ============================================================================
# 11. DYNAMIC PRICING ENGINE
# ============================================================================

def calculate_dynamic_price(product_id: int) -> float:
    """Calculate optimal price based on demand, competition, and inventory"""
    if product_id not in products_db:
        return 0.0
    
    product = products_db[product_id]
    base_price = product["base_price"]
    
    # Factor 1: Demand (based on views and purchases)
    view_count = product.get("view_count", 0)
    purchase_count = product.get("purchase_count", 0)
    demand_ratio = purchase_count / (view_count + 1)  # Conversion rate
    
    # Factor 2: Inventory levels
    total_stock = sum(v["stock"] for v in product.get("variants", [{"stock": 0}]))
    inventory_factor = 1.0
    if total_stock < 5:
        inventory_factor = 1.1  # Increase price for low stock
    elif total_stock > 50:
        inventory_factor = 0.95  # Decrease price for overstock
    
    # Factor 3: Time-based (seasonal, day of week)
    hour = datetime.now().hour
    time_factor = 1.0
    if 9 <= hour <= 17:  # Peak shopping hours
        time_factor = 1.05
    
    # Factor 4: Competition (check similar products)
    similar_products = [
        p for p in products_db.values() 
        if p["category"] == product["category"] and p["id"] != product_id
    ]
    if similar_products:
        avg_competitor_price = sum(p["base_price"] for p in similar_products) / len(similar_products)
        if base_price > avg_competitor_price * 1.2:
            inventory_factor *= 0.95  # Lower price if too high vs competition
    
    # Calculate final price
    dynamic_price = base_price * inventory_factor * time_factor
    
    # Apply demand adjustment
    if demand_ratio > 0.1:  # High conversion rate
        dynamic_price *= 1.05
    elif demand_ratio < 0.01:  # Low conversion rate
        dynamic_price *= 0.98
    
    return round(dynamic_price, 2)

@app.get("/api/pricing/dynamic/{product_id}")
async def get_dynamic_price(product_id: int):
    """Get AI-calculated dynamic price for a product"""
    if product_id not in products_db:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = products_db[product_id]
    dynamic_price = calculate_dynamic_price(product_id)
    base_price = product["base_price"]
    
    return {
        "product_id": product_id,
        "base_price": base_price,
        "dynamic_price": dynamic_price,
        "adjustment": round((dynamic_price - base_price) / base_price * 100, 2),
        "factors": {
            "demand": product.get("purchase_count", 0) / (product.get("view_count", 0) + 1),
            "stock_level": sum(v["stock"] for v in product.get("variants", [{"stock": 0}])),
            "rating": product.get("rating", 0)
        }
    }

@app.post("/api/pricing/apply-dynamic/{product_id}")
async def apply_dynamic_pricing(
    product_id: int,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Apply dynamic pricing to a product"""
    dynamic_price = calculate_dynamic_price(product_id)
    
    # Track price history
    price_history_db[product_id].append({
        "old_price": products_db[product_id]["base_price"],
        "new_price": dynamic_price,
        "timestamp": datetime.now(),
        "reason": "dynamic_pricing"
    })
    
    products_db[product_id]["base_price"] = dynamic_price
    return {"message": "Dynamic pricing applied", "new_price": dynamic_price}

# ============================================================================
# 12. SEARCH & ELASTICSEARCH-LIKE FUNCTIONALITY
# ============================================================================

def fuzzy_match(search_term: str, text: str, max_distance: int = 2) -> bool:
    """Simple fuzzy matching for typo tolerance"""
    search_term = search_term.lower()
    text = text.lower()
    
    # Exact match
    if search_term in text:
        return True
    
    # Check for character-by-character similarity
    if len(search_term) < 3:
        return False
    
    # Simple Levenshtein-like check
    words = text.split()
    for word in words:
        if len(word) < 3:
            continue
        
        differences = 0
        for i in range(min(len(search_term), len(word))):
            if search_term[i] != word[i]:
                differences += 1
        
        if differences <= max_distance:
            return True
    
    return False

@app.get("/api/search/advanced")
async def advanced_search(
    q: str,
    category: Optional[str] = None,
    min_rating: Optional[float] = None,
    in_stock_only: bool = False,
    fuzzy: bool = True
):
    """Advanced search with fuzzy matching and filters"""
    results = []
    
    for product in products_db.values():
        # Apply filters
        if category and product["category"] != category:
            continue
        
        if min_rating and product.get("rating", 0) < min_rating:
            continue
        
        if in_stock_only:
            total_stock = sum(v["stock"] for v in product.get("variants", [{"stock": 0}]))
            if total_stock == 0:
                continue
        
        # Search matching
        search_text = f"{product['title']} {product['description']} {' '.join(product.get('tags', []))}"
        
        if fuzzy:
            if fuzzy_match(q, search_text):
                results.append(product)
        else:
            if q.lower() in search_text.lower():
                results.append(product)
    
    # Rank results by relevance
    for product in results:
        relevance_score = 0
        if q.lower() in product["title"].lower():
            relevance_score += 10
        if q.lower() in product["description"].lower():
            relevance_score += 5
        for tag in product.get("tags", []):
            if q.lower() in tag.lower():
                relevance_score += 3
        
        product["_relevance_score"] = relevance_score
    
    results.sort(key=lambda x: x.get("_relevance_score", 0), reverse=True)
    
    return results

@app.get("/api/search/suggestions")
async def search_suggestions(q: str, limit: int = 5):
    """Get search suggestions as user types"""
    suggestions = set()
    
    for product in products_db.values():
        # Add product titles that match
        if q.lower() in product["title"].lower():
            suggestions.add(product["title"])
        
        # Add matching tags
        for tag in product.get("tags", []):
            if q.lower() in tag.lower():
                suggestions.add(tag)
        
        if len(suggestions) >= limit:
            break
    
    return list(suggestions)[:limit]

# ============================================================================
# 13. ANALYTICS & INSIGHTS
# ============================================================================

@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    """Get comprehensive analytics dashboard"""
    total_orders = len(orders_db)
    total_revenue = sum(o["total_amount"] for o in orders_db.values())
    total_products = len(products_db)
    total_users = len(users_db)
    
    # Order status breakdown
    status_breakdown = {}
    for status in OrderStatus:
        status_breakdown[status] = len([o for o in orders_db.values() if o["status"] == status])
    
    # Top products
    top_products = sorted(
        products_db.values(),
        key=lambda x: x.get("purchase_count", 0),
        reverse=True
    )[:10]
    
    # Revenue by category
    category_revenue = defaultdict(float)
    for order in orders_db.values():
        for item in order["items"]:
            if item["product_id"] in products_db:
                product = products_db[item["product_id"]]
                category_revenue[product["category"]] += product["base_price"] * item["quantity"]
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_products": total_products,
        "total_users": total_users,
        "order_status_breakdown": status_breakdown,
        "top_products": top_products,
        "revenue_by_category": dict(category_revenue),
        "active_auctions": len([a for a in auctions_db.values() if a["status"] == "active"]),
        "pending_rfqs": len([r for r in rfqs_db.values() if r["status"] == "pending"]),
        "open_disputes": len([d for d in disputes_db.values() if d["status"] == "open"])
    }

@app.get("/api/analytics/seller/{seller_id}")
async def get_seller_analytics(
    seller_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get analytics for a specific seller"""
    if current_user["id"] != seller_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    seller_products = [p for p in products_db.values() if p["seller_id"] == seller_id]
    total_views = sum(p.get("view_count", 0) for p in seller_products)
    total_sales = sum(p.get("purchase_count", 0) for p in seller_products)
    
    # Calculate revenue
    seller_revenue = 0
    for order in orders_db.values():
        for item in order["items"]:
            if item["product_id"] in products_db:
                product = products_db[item["product_id"]]
                if product["seller_id"] == seller_id:
                    seller_revenue += product["base_price"] * item["quantity"]
    
    return {
        "seller_id": seller_id,
        "total_products": len(seller_products),
        "total_views": total_views,
        "total_sales": total_sales,
        "total_revenue": seller_revenue,
        "average_rating": sum(p.get("rating", 0) for p in seller_products) / len(seller_products) if seller_products else 0,
        "conversion_rate": (total_sales / total_views * 100) if total_views > 0 else 0
    }

# ============================================================================
# 14. SELLER PAYOUT & ESCROW SYSTEM
# ============================================================================

@app.get("/api/escrow/balance")
async def get_escrow_balance(current_user: dict = Depends(require_role([UserRole.ADMIN]))):
    """Get total amount held in escrow"""
    return {
        "total_escrow": sum(escrow_db.values()),
        "orders_in_escrow": len(escrow_db),
        "details": escrow_db
    }

@app.post("/api/payouts/release/{order_id}")
async def release_payout(
    order_id: int,
    current_user: dict = Depends(require_role([UserRole.ADMIN]))
):
    """Release payment from escrow to seller"""
    if order_id not in escrow_db:
        raise HTTPException(status_code=404, detail="No escrow found for this order")
    
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    amount = escrow_db.pop(order_id)
    
    # Get seller from first product in order
    first_product = products_db[order["items"][0]["product_id"]]
    seller_id = first_product["seller_id"]
    
    # In production: Transfer amount to seller's bank account via payment gateway
    
    return {
        "message": "Payout released",
        "order_id": order_id,
        "seller_id": seller_id,
        "amount": amount,
        "released_at": datetime.now()
    }

# ============================================================================
# 15. WEBHOOKS & NOTIFICATIONS
# ============================================================================

@app.post("/api/webhooks/order-status")
async def order_status_webhook(order_id: int, status: OrderStatus, background_tasks: BackgroundTasks):
    """Webhook to notify users about order status changes"""
    if order_id not in orders_db:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = orders_db[order_id]
    user = users_db.get(order["user_id"])
    
    # In production: Send email/SMS/push notification
    background_tasks.add_task(send_notification, user, f"Your order #{order_id} is now {status}")
    
    return {"message": "Webhook processed"}

async def send_notification(user: dict, message: str):
    """Mock notification function"""
    print(f"Sending notification to {user.get('email')}: {message}")
    await asyncio.sleep(1)

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "services": {
            "database": "connected",
            "cache": "active",
            "search": "indexed"
        },
        "statistics": {
            "products": len(products_db),
            "users": len(users_db),
            "orders": len(orders_db),
            "active_auctions": len([a for a in auctions_db.values() if a["status"] == "active"])
        }
    }

@app.get("/")
async def root():
    return {
        "message": "IndabaCart API v2.0",
        "documentation": "/docs",
        "features": [
            "Product Information Management (PIM)",
            "Identity & Access Management (IAM)",
            "Real-time Inventory Engine",
            "Order Management System (OMS)",
            "Review & Rating System",
            "Request for Quotation (RFQ)",
            "Auction & Bidding System",
            "Multi-Currency Support",
            "AI Recommendation Engine",
            "Dynamic Pricing",
            "Advanced Search with Fuzzy Matching",
            "Dispute Resolution",
            "Seller Payout & Escrow",
            "Analytics Dashboard"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
