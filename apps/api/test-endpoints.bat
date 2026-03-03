@echo off
echo Testing Login...
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@peyker.com\",\"password\":\"admin123\"}" > login_res.json 2>&1
echo.
echo Testing Categories...
curl http://localhost:3001/api/categories > categories_res.json 2>&1
echo.
echo Testing Products...
curl http://localhost:3001/api/products > products_res.json 2>&1
echo.
echo Done.
