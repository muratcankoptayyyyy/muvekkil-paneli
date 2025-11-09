from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.core.database import engine
from app.models import user, case, document, notification, payment, task, timeline

# Database tablolarını oluştur
user.Base.metadata.create_all(bind=engine)
case.Base.metadata.create_all(bind=engine)
document.Base.metadata.create_all(bind=engine)
notification.Base.metadata.create_all(bind=engine)
payment.Base.metadata.create_all(bind=engine)
task.Base.metadata.create_all(bind=engine)
timeline.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Koptay Hukuk Bürosu Müvekkil Paneli API",
    version="1.0.0"
)

# CORS middleware - Allow frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://muvekkil-frontend.fly.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "Koptay Müvekkil Paneli API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
