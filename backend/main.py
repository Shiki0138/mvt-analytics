from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World", "service": "MVT Analytics"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "mvt-analytics"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 