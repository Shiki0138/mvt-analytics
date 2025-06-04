from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello World", "status": "working"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "mvt-analytics"}

@app.get("/test")
def test():
    return {"test": "success", "timestamp": "2024-06-04"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 