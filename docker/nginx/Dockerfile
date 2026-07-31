# ============================================
# Peyker Moda — Nginx Reverse Proxy
# ============================================
# SOLID: ISP — Yalnızca routing, TLS termination ve security headers
# Uygulama mantığı container'ların kendisinde kalır

FROM nginx:1.27-alpine

# Default config'i kaldır
RUN rm /etc/nginx/conf.d/default.conf

# Custom reverse proxy config
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/nginx-health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
