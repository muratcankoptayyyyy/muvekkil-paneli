from fastapi import APIRouter
from app.api.endpoints import auth, cases, admin

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# More routers will be added here:
# api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
# api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

@api_router.get("/ping")
async def ping():
    return {"message": "pong"}
