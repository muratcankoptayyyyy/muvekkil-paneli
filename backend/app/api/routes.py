from fastapi import APIRouter

api_router = APIRouter()

# Import and include routers here
# from app.api.endpoints import auth, users, cases, documents, payments, notifications

# api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
# api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
# api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
# api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
# api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

@api_router.get("/ping")
async def ping():
    return {"message": "pong"}
