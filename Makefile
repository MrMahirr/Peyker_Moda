# ============================================
# Peyker Moda — Docker Build & Deploy Komutları
# ============================================
# Kullanım: make <komut>
#
# Windows'ta GNU Make gereklidir:
#   winget install GnuWin32.Make
# veya doğrudan docker compose komutlarını kullanın.

# Değişkenler
COMPOSE_FILE = docker-compose.prod.yml
ENV_FILE = .env.docker
DC = docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

.PHONY: help build up down restart logs ps migrate seed clean rebuild

# ---- Yardım ----
help: ## Bu yardım mesajını gösterir
	@echo.
	@echo  Peyker Moda - Docker Komutlari
	@echo  ================================
	@echo.
	@echo  make build      - Tum Docker image'lari build eder
	@echo  make up         - Production stack'i baslatir
	@echo  make down       - Stack'i durdurur ve siler
	@echo  make restart    - Tum servisleri yeniden baslatir
	@echo  make logs       - Canli loglari gosterir
	@echo  make ps         - Container durumlarini gosterir
	@echo  make migrate    - Prisma migration calistirir
	@echo  make seed       - Database seed calistirir
	@echo  make clean      - Tum container, image ve volume'lari temizler
	@echo  make rebuild    - Temizle + Build + Baslat
	@echo.

# ---- Build ----
build: ## Tüm Docker image'ları build eder
	$(DC) build

build-api: ## Sadece API image'ını build eder
	$(DC) build api

build-admin: ## Sadece Admin image'ını build eder
	$(DC) build admin

build-storefront: ## Sadece Storefront image'ını build eder
	$(DC) build storefront

# ---- Run ----
up: ## Production stack'i başlatır (detached mode)
	$(DC) up -d

up-logs: ## Production stack'i başlatır ve logları gösterir
	$(DC) up

down: ## Stack'i durdurur
	$(DC) down

restart: ## Tüm servisleri yeniden başlatır
	$(DC) restart

restart-api: ## Sadece API servisini yeniden başlatır
	$(DC) restart api

restart-nginx: ## Sadece Nginx servisini yeniden başlatır
	$(DC) restart nginx

# ---- Monitoring ----
logs: ## Tüm servislerin loglarını gösterir (canlı)
	$(DC) logs -f

logs-api: ## Sadece API loglarını gösterir
	$(DC) logs -f api

logs-nginx: ## Sadece Nginx loglarını gösterir
	$(DC) logs -f nginx

ps: ## Container durumlarını gösterir
	$(DC) ps

# ---- Database ----
migrate: ## Prisma migration çalıştırır (production deploy)
	$(DC) exec api npx prisma migrate deploy --schema=./prisma/schema.prisma

seed: ## Database seed çalıştırır
	$(DC) exec api npx prisma db seed

# ---- Temizlik ----
clean: ## Tüm container, image ve volume'ları temizler
	$(DC) down -v --rmi local

rebuild: clean build up ## Temizle + Build + Başlat
