--
-- PostgreSQL database dump
--

\restrict pw8znIvIbKN9cjcCwDtQoCAOOGlBoKudNOgfdobf6Sr92gskokmLNBVlDAlITsV

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: peyker_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO peyker_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: peyker_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO peyker_user;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO peyker_user;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'CANCELLED',
    'PAID'
);


ALTER TYPE public."InvoiceStatus" OWNER TO peyker_user;

--
-- Name: OrderSource; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."OrderSource" AS ENUM (
    'POS',
    'ONLINE',
    'PHONE'
);


ALTER TYPE public."OrderSource" OWNER TO peyker_user;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
    'RETURNED'
);


ALTER TYPE public."OrderStatus" OWNER TO peyker_user;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'OTHER'
);


ALTER TYPE public."PaymentMethod" OWNER TO peyker_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'PARTIAL',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO peyker_user;

--
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'COMPLETED'
);


ALTER TYPE public."ReturnStatus" OWNER TO peyker_user;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: peyker_user
--

CREATE TYPE public."TransactionType" AS ENUM (
    'INCOME',
    'EXPENSE'
);


ALTER TYPE public."TransactionType" OWNER TO peyker_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO peyker_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    "userId" text,
    action text NOT NULL,
    resource text NOT NULL,
    "resourceId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO peyker_user;

--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.campaigns (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minPurchase" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "categoryIds" jsonb DEFAULT '[]'::jsonb,
    "productIds" jsonb DEFAULT '[]'::jsonb,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.campaigns OWNER TO peyker_user;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "imageUrl" text,
    "parentId" text,
    "order" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO peyker_user;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.coupons (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    "discountType" public."DiscountType" NOT NULL,
    "discountValue" numeric(10,2) NOT NULL,
    "minPurchase" numeric(10,2),
    "maxDiscount" numeric(10,2),
    "usageLimit" integer,
    "usageLimitPerCustomer" integer,
    "usageCount" integer DEFAULT 0 NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO peyker_user;

--
-- Name: customer_groups; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.customer_groups (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    discount numeric(5,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customer_groups OWNER TO peyker_user;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.customers (
    id text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    district text,
    "postalCode" text,
    notes text,
    "groupId" text,
    "totalSpent" numeric(12,2) DEFAULT 0 NOT NULL,
    "orderCount" integer DEFAULT 0 NOT NULL,
    "lastOrderDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "birthDate" timestamp(3) without time zone,
    gender public."Gender"
);


ALTER TABLE public.customers OWNER TO peyker_user;

--
-- Name: held_sales; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.held_sales (
    id text NOT NULL,
    "userId" text NOT NULL,
    "customerId" text,
    items jsonb NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.held_sales OWNER TO peyker_user;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.invoices (
    id text NOT NULL,
    "invoiceNo" text NOT NULL,
    "orderId" text NOT NULL,
    "customerName" text NOT NULL,
    "taxId" text,
    "taxOffice" text,
    amount numeric(10,2) NOT NULL,
    "taxRate" integer DEFAULT 20 NOT NULL,
    "taxAmount" numeric(10,2) NOT NULL,
    "pdfUrl" text,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    "issueDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO peyker_user;

--
-- Name: media; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.media (
    id text NOT NULL,
    filename text NOT NULL,
    key text NOT NULL,
    url text NOT NULL,
    mimetype text NOT NULL,
    size integer NOT NULL,
    folder text NOT NULL,
    alt text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.media OWNER TO peyker_user;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    "orderId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO peyker_user;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.orders (
    id text NOT NULL,
    "orderNumber" text NOT NULL,
    "customerId" text,
    "userId" text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    "paymentStatus" public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    source public."OrderSource" DEFAULT 'POS'::public."OrderSource" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "shippingCost" numeric(12,2) DEFAULT 0 NOT NULL,
    "totalAmount" numeric(12,2) NOT NULL,
    "paidAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    "couponCode" text,
    notes text,
    "shippingAddress" jsonb,
    "cargoTrackingCode" text,
    "cargoProvider" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.orders OWNER TO peyker_user;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.payments (
    id text NOT NULL,
    "orderId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    reference text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO peyker_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    "roleId" text NOT NULL
);


ALTER TABLE public.permissions OWNER TO peyker_user;

--
-- Name: pos_sessions; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.pos_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "openingBalance" numeric(12,2) NOT NULL,
    "closingBalance" numeric(12,2),
    "expectedBalance" numeric(12,2),
    difference numeric(12,2),
    "totalSales" numeric(12,2),
    "totalTransactions" integer,
    notes text,
    "openedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closedAt" timestamp(3) without time zone
);


ALTER TABLE public.pos_sessions OWNER TO peyker_user;

--
-- Name: products; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    sku text NOT NULL,
    barcode text,
    "basePrice" numeric(10,2) NOT NULL,
    "salePrice" numeric(10,2),
    cost numeric(10,2),
    "categoryId" text NOT NULL,
    brand text,
    images jsonb DEFAULT '[]'::jsonb,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO peyker_user;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    token text NOT NULL,
    "userId" text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO peyker_user;

--
-- Name: return_items; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.return_items (
    id text NOT NULL,
    "returnId" text NOT NULL,
    "variantId" text NOT NULL,
    quantity integer NOT NULL,
    reason text
);


ALTER TABLE public.return_items OWNER TO peyker_user;

--
-- Name: returns; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.returns (
    id text NOT NULL,
    "orderId" text NOT NULL,
    reason text NOT NULL,
    status public."ReturnStatus" DEFAULT 'PENDING'::public."ReturnStatus" NOT NULL,
    "refundAmount" numeric(12,2) NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.returns OWNER TO peyker_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    "displayName" text NOT NULL,
    description text,
    "isSystem" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO peyker_user;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.settings OWNER TO peyker_user;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    type public."TransactionType" NOT NULL,
    category text,
    amount numeric(12,2) NOT NULL,
    description text,
    reference text,
    "paymentMethod" public."PaymentMethod",
    "orderId" text,
    "transactionDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO peyker_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    phone text,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "failedLogins" integer DEFAULT 0 NOT NULL,
    "lastLoginAt" timestamp(3) without time zone,
    "lockedUntil" timestamp(3) without time zone,
    "roleId" text NOT NULL
);


ALTER TABLE public.users OWNER TO peyker_user;

--
-- Name: variants; Type: TABLE; Schema: public; Owner: peyker_user
--

CREATE TABLE public.variants (
    id text NOT NULL,
    "productId" text NOT NULL,
    sku text NOT NULL,
    barcode text,
    price numeric(10,2),
    stock integer DEFAULT 0 NOT NULL,
    size text,
    color text,
    "colorCode" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.variants OWNER TO peyker_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ebe17c9f-0e2a-4606-835a-fb2988a554f5	09fcd9983b291cc60e9e8e9f7239445b135bfb9b7a6373dd85aa594c9179eb3e	2026-03-04 08:01:36.881585+00	20260210210219_cargo_integration	\N	\N	2026-03-04 08:01:36.65314+00	1
1dd582fc-6776-4432-8e8b-652c645389c6	1745f136af2462cd34742ed7a8c228b203eac7d0dba91bcb1178c73b05539798	2026-03-04 08:01:36.913096+00	20260304074619_add_refresh_token_fk	\N	\N	2026-03-04 08:01:36.887732+00	1
e0a58259-3a77-4c2b-a00f-8bcdd3104676	c98aa9d1fafd474267ff9cf27aa10e57be975577b2645274dac01e2f8385cbdb	2026-03-04 08:02:04.236193+00	20260304080204_rbac_audit_lockout	\N	\N	2026-03-04 08:02:04.17059+00	1
4f22d88c-ba7e-47e3-a8fe-af3764587a62	e29c64dadda6faa5643e7a116ad4983c3b349bbb8d1128f73178795daf9d1b02	2026-03-04 08:24:33.378054+00	20260304082433_init_media	\N	\N	2026-03-04 08:24:33.349233+00	1
db72ae0f-e39d-4247-8f86-13cf75630ed7	523bf0482c0cbca905423b55dfef6d3efc676c19f95fc61df2402f1049eff458	2026-03-14 02:29:26.771679+00	20260314022926_add_invoice_paid_status	\N	\N	2026-03-14 02:29:26.760718+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.audit_logs (id, "userId", action, resource, "resourceId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.campaigns (id, name, description, "discountType", "discountValue", "minPurchase", "maxDiscount", "categoryIds", "productIds", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.categories (id, name, slug, description, "imageUrl", "parentId", "order", "isActive", "createdAt", "updatedAt") FROM stdin;
89c09b9f-1869-45d0-9a11-e0d305935004	Üst Giyim	ust-giyim	Tişört, Gömlek, Bluz vb.	\N	\N	0	t	2026-03-04 08:11:18.889	2026-03-04 08:11:18.889
8b6aed20-ed78-4ccc-85c7-611b53b70f39	Alt Giyim	alt-giyim	Pantolon, Etek, Şort vb.	\N	\N	0	t	2026-03-04 08:11:18.909	2026-03-04 08:11:18.909
13b3c8a0-9d92-4318-a14c-4015fae6bb68	Elbise	elbise	Günlük ve abiye elbiseler	\N	\N	0	t	2026-03-04 08:11:18.921	2026-03-04 08:11:18.921
afb30d4b-84a6-4353-aa4a-8956a7e9b3a1	Dış Giyim	dis-giyim	Ceket, Mont, Kaban vb.	\N	\N	0	t	2026-03-04 08:11:18.933	2026-03-04 08:11:18.933
ecb8ab27-0c95-4570-8867-6be0fa80b43b	Aksesuar	aksesuar	Çanta, Kemer, Takı vb.	\N	\N	0	t	2026-03-04 08:11:18.944	2026-03-04 08:11:18.944
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.coupons (id, code, description, "discountType", "discountValue", "minPurchase", "maxDiscount", "usageLimit", "usageLimitPerCustomer", "usageCount", "startDate", "endDate", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customer_groups; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.customer_groups (id, name, description, discount, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.customers (id, "firstName", "lastName", email, phone, address, city, district, "postalCode", notes, "groupId", "totalSpent", "orderCount", "lastOrderDate", "isActive", "createdAt", "updatedAt", "birthDate", gender) FROM stdin;
seed-customer-1	Ayşe	Yılmaz	musteri@ornek.com	5551234567	\N	\N	\N	\N	\N	\N	0.00	0	\N	t	2026-03-04 08:11:18.986	2026-03-04 08:11:18.986	\N	\N
\.


--
-- Data for Name: held_sales; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.held_sales (id, "userId", "customerId", items, notes, "createdAt") FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.invoices (id, "invoiceNo", "orderId", "customerName", "taxId", "taxOffice", amount, "taxRate", "taxAmount", "pdfUrl", status, "issueDate", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.media (id, filename, key, url, mimetype, size, folder, alt, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.order_items (id, "orderId", "variantId", quantity, "unitPrice", discount, total) FROM stdin;
239511d9-1a89-45e0-a905-0c607fe09868	f8e01f89-175e-4bfa-8236-bbc46625d132	4c17c138-4684-4376-b96c-8bcbd98cb0bd	1	250.00	0.00	250.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.orders (id, "orderNumber", "customerId", "userId", status, "paymentStatus", source, subtotal, "discountAmount", "shippingCost", "totalAmount", "paidAmount", "couponCode", notes, "shippingAddress", "cargoTrackingCode", "cargoProvider", "createdAt", "updatedAt") FROM stdin;
f8e01f89-175e-4bfa-8236-bbc46625d132	PM-20260314-59508	\N	70b04168-d7e0-441e-809a-4ef3bb92c206	COMPLETED	COMPLETED	POS	250.00	0.00	0.00	250.00	250.00	\N	POS Test	\N	\N	\N	2026-03-14 02:53:42.14	2026-03-14 02:53:42.14
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.payments (id, "orderId", amount, method, status, reference, notes, "createdAt", "updatedAt") FROM stdin;
6933ea7f-0e53-41ca-a021-fdf473379bf5	f8e01f89-175e-4bfa-8236-bbc46625d132	250.00	CASH	COMPLETED	\N	\N	2026-03-14 02:53:42.14	2026-03-14 02:53:42.14
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.permissions (id, resource, action, "roleId") FROM stdin;
2465a67b-da26-4a24-87ed-79c7bdeadb32	products	create	2fced816-8179-4380-beb6-114af241faeb
c1943d95-604e-4bd5-9bff-6cacd616d6ec	products	read	2fced816-8179-4380-beb6-114af241faeb
6221dbf7-8815-4068-a4e2-459ec058d941	products	update	2fced816-8179-4380-beb6-114af241faeb
547ce8e0-9b0c-4215-a0d1-9100a244a81c	products	delete	2fced816-8179-4380-beb6-114af241faeb
b1bac8fb-6ab9-47d3-b0df-4f1d78e5f053	categories	create	2fced816-8179-4380-beb6-114af241faeb
6f4ac8ad-58fe-4f5a-ae4b-f3ea341b972c	categories	read	2fced816-8179-4380-beb6-114af241faeb
53da78c5-da34-42f4-bfb7-7a070f00cc6e	categories	update	2fced816-8179-4380-beb6-114af241faeb
61d14c6c-f1eb-4dc0-b033-5bf9ad331297	categories	delete	2fced816-8179-4380-beb6-114af241faeb
750b4317-da63-4373-a22f-3093178875ed	variants	create	2fced816-8179-4380-beb6-114af241faeb
d19fe5e0-3219-49ba-8131-695256070334	variants	read	2fced816-8179-4380-beb6-114af241faeb
2eef7ffe-e715-4f06-a410-6d1f8b16c907	variants	update	2fced816-8179-4380-beb6-114af241faeb
3cac8fcd-7962-4128-a7ea-f5aa7960e11a	variants	delete	2fced816-8179-4380-beb6-114af241faeb
f0d64fff-9cb9-4107-b34d-7daecaf30c38	orders	create	2fced816-8179-4380-beb6-114af241faeb
da14f318-f497-4bd1-8177-39c1f8fe64d4	orders	read	2fced816-8179-4380-beb6-114af241faeb
5453ab5d-58a3-4032-b80b-692ae69b37a8	orders	update	2fced816-8179-4380-beb6-114af241faeb
2ed5b35f-4f84-4ac9-97e9-2e2f5b82dab2	orders	delete	2fced816-8179-4380-beb6-114af241faeb
01491c21-7dd2-4dc5-89f4-ed9f8b7e0c28	customers	create	2fced816-8179-4380-beb6-114af241faeb
0be8baed-db9c-4ff5-a80a-9f0b5a519f32	customers	read	2fced816-8179-4380-beb6-114af241faeb
02910d24-d0b4-4744-a23b-87a6eb75741e	customers	update	2fced816-8179-4380-beb6-114af241faeb
62747820-b925-418a-a7c5-eee4b17645f6	customers	delete	2fced816-8179-4380-beb6-114af241faeb
1ef3ba7b-8cc8-4d17-aae2-9d5990e4d560	customer-groups	create	2fced816-8179-4380-beb6-114af241faeb
c4331835-3231-4089-92e3-fadd6b65bb3b	customer-groups	read	2fced816-8179-4380-beb6-114af241faeb
4d0124ab-addb-4c71-88cf-0cdd6df442c9	customer-groups	update	2fced816-8179-4380-beb6-114af241faeb
10097d80-d6a1-40ce-bae7-61d07d9290fa	customer-groups	delete	2fced816-8179-4380-beb6-114af241faeb
651f1543-421a-4613-9919-ba5f2c8f6230	transactions	create	2fced816-8179-4380-beb6-114af241faeb
46f441e9-8803-407c-9d9d-11456a704429	transactions	read	2fced816-8179-4380-beb6-114af241faeb
8beadd0b-4cbd-4670-81ef-6352cb9bd08c	transactions	update	2fced816-8179-4380-beb6-114af241faeb
62281afe-33f5-469f-bf8c-1faf6cc77790	transactions	delete	2fced816-8179-4380-beb6-114af241faeb
ade71f78-61ac-4804-8667-4d149bafd1b0	invoices	create	2fced816-8179-4380-beb6-114af241faeb
2eb5b9cd-06b9-4e8a-886a-8c45d253aaeb	invoices	read	2fced816-8179-4380-beb6-114af241faeb
a98ec9b9-4f12-4db0-9448-0bece9838a79	invoices	update	2fced816-8179-4380-beb6-114af241faeb
bc328bc3-84a5-434c-b500-09e53cc9ed79	invoices	delete	2fced816-8179-4380-beb6-114af241faeb
12947f5a-c2e7-44b5-9e07-dca4621c523e	campaigns	create	2fced816-8179-4380-beb6-114af241faeb
2ee1e4c3-9a1e-4643-95bf-337eca9cff97	campaigns	read	2fced816-8179-4380-beb6-114af241faeb
a478d781-3e94-4247-9b51-da592b6569f6	campaigns	update	2fced816-8179-4380-beb6-114af241faeb
a9d6ada0-3812-49f4-847e-380fa5093f35	campaigns	delete	2fced816-8179-4380-beb6-114af241faeb
cf4beb6b-a067-45a2-a011-c39abc58ec08	coupons	create	2fced816-8179-4380-beb6-114af241faeb
0d8197b5-5fef-4a0b-81d1-784039290f81	coupons	read	2fced816-8179-4380-beb6-114af241faeb
67f31553-1327-4dc6-9749-b52593ce12ff	coupons	update	2fced816-8179-4380-beb6-114af241faeb
4b69f6d8-7c85-4187-b8e7-bb0091c2da2d	coupons	delete	2fced816-8179-4380-beb6-114af241faeb
5bf10434-6194-48ad-8063-e25599c957da	pos	create	2fced816-8179-4380-beb6-114af241faeb
afb1718c-2c54-4a72-93cc-0b83719a22a8	pos	read	2fced816-8179-4380-beb6-114af241faeb
c946f007-f7e2-4a49-9071-9f895b7d5d1b	pos	update	2fced816-8179-4380-beb6-114af241faeb
f2961922-d35f-4bac-9c7c-a606f674bb02	pos	delete	2fced816-8179-4380-beb6-114af241faeb
2b2bbefa-2702-4523-9cba-4ea9d3a00b72	dashboard	create	2fced816-8179-4380-beb6-114af241faeb
e8697aa8-28dc-4125-9dbf-70df304c75b3	dashboard	read	2fced816-8179-4380-beb6-114af241faeb
81a58d0d-678c-486f-acc3-b74fcdf8c1d6	dashboard	update	2fced816-8179-4380-beb6-114af241faeb
78b7ef9f-4abe-46b5-bd62-3174ac0dac01	dashboard	delete	2fced816-8179-4380-beb6-114af241faeb
52df5bf0-4fd5-4a15-8cae-9e72646d972b	users	create	2fced816-8179-4380-beb6-114af241faeb
120818dd-323c-4bb0-948d-2fd430b38662	users	read	2fced816-8179-4380-beb6-114af241faeb
3ed8680c-727d-4d0d-ab1b-6a5014fe291e	users	update	2fced816-8179-4380-beb6-114af241faeb
335bafb1-65fc-48c0-8014-160645c2014f	users	delete	2fced816-8179-4380-beb6-114af241faeb
6ba924d3-7890-4ca3-b56a-0eecabccc475	roles	create	2fced816-8179-4380-beb6-114af241faeb
82736234-f28b-4065-9476-46e2e9262a22	roles	read	2fced816-8179-4380-beb6-114af241faeb
32033e70-ca51-45b9-9e41-c50a8ee79b42	roles	update	2fced816-8179-4380-beb6-114af241faeb
1301785f-eebc-4aec-a30a-dbe17997d557	roles	delete	2fced816-8179-4380-beb6-114af241faeb
bab609f3-706e-40de-b784-aa09f273e9c8	settings	create	2fced816-8179-4380-beb6-114af241faeb
b11bdae4-dc74-4249-bcbe-fe7124d641d7	settings	read	2fced816-8179-4380-beb6-114af241faeb
72b3b6a5-4246-4036-8f76-b9ddfa58bb46	settings	update	2fced816-8179-4380-beb6-114af241faeb
167c53c7-ee56-408f-96f1-62c63402e3c7	settings	delete	2fced816-8179-4380-beb6-114af241faeb
e88b06d2-369c-40b4-a08d-f3204b196c7d	media	create	2fced816-8179-4380-beb6-114af241faeb
4f20514c-eb8d-4949-a48e-d60aae118653	media	read	2fced816-8179-4380-beb6-114af241faeb
299ceb39-c4a7-4efe-806c-362d7a70c48c	media	update	2fced816-8179-4380-beb6-114af241faeb
7193c659-af1b-40d6-bdb2-902616f76b0e	media	delete	2fced816-8179-4380-beb6-114af241faeb
0d23c0ab-cc2f-4fe8-a00a-4de8f35f935b	audit-logs	create	2fced816-8179-4380-beb6-114af241faeb
48e1fd20-cf8a-4f09-b5ce-b5fafefa7482	audit-logs	read	2fced816-8179-4380-beb6-114af241faeb
fc23c0a3-13d3-4f79-a09a-7e71a75cf7ac	audit-logs	update	2fced816-8179-4380-beb6-114af241faeb
9c78e0d0-4ab5-447b-a035-5801fb6ac792	audit-logs	delete	2fced816-8179-4380-beb6-114af241faeb
96ad3e6d-6008-4cf8-973e-3976710f6d11	cms	create	2fced816-8179-4380-beb6-114af241faeb
80c78c88-9da9-4cc8-8a47-db512b9079d9	cms	read	2fced816-8179-4380-beb6-114af241faeb
bccf11ea-4463-45a0-9593-8370f06aa1fa	cms	update	2fced816-8179-4380-beb6-114af241faeb
b93d012a-9ca0-41b2-90b5-aecfaab03d68	cms	delete	2fced816-8179-4380-beb6-114af241faeb
de51e1f0-696d-4545-8bca-3ae2d3d71033	products	create	26e56c01-a211-4248-a06a-0c4465ad0675
276ca16d-1991-463b-acae-6ce5edc3a06f	products	read	26e56c01-a211-4248-a06a-0c4465ad0675
fae740ce-d10f-43fc-abd3-5340a3724fd8	products	update	26e56c01-a211-4248-a06a-0c4465ad0675
b6cd4b7c-1ed5-4adf-9dc0-cd0d7c53bde2	products	delete	26e56c01-a211-4248-a06a-0c4465ad0675
7b88df23-2b5a-4dda-95f9-02b3ce4597e9	categories	create	26e56c01-a211-4248-a06a-0c4465ad0675
0be7bc24-4ccd-4a55-9988-4cdb3901e784	categories	read	26e56c01-a211-4248-a06a-0c4465ad0675
0534b491-d1f8-496e-8df6-92e43257d06b	categories	update	26e56c01-a211-4248-a06a-0c4465ad0675
67c73d89-4ca8-4b56-a14b-1b1c12dfe25c	categories	delete	26e56c01-a211-4248-a06a-0c4465ad0675
762cb38a-89e8-4941-a043-b8bd52f8a69e	variants	create	26e56c01-a211-4248-a06a-0c4465ad0675
741e8b37-7829-44c1-a8ef-ef6789bf2fcf	variants	read	26e56c01-a211-4248-a06a-0c4465ad0675
9f6f9a6f-2075-44cb-99ab-61b0c42ff908	variants	update	26e56c01-a211-4248-a06a-0c4465ad0675
9e7abae9-0a26-4168-aa6e-9d70923c128b	variants	delete	26e56c01-a211-4248-a06a-0c4465ad0675
4c301b68-8abb-413e-b08e-26adaed074a6	orders	create	26e56c01-a211-4248-a06a-0c4465ad0675
b0d90262-84be-4fd7-9171-a5c3e20abcca	orders	read	26e56c01-a211-4248-a06a-0c4465ad0675
d76e4ed0-c98d-4b1d-9493-b0d9d63f8ab4	orders	update	26e56c01-a211-4248-a06a-0c4465ad0675
44d2795b-f6e8-4962-9f27-62e3b2727546	orders	delete	26e56c01-a211-4248-a06a-0c4465ad0675
730f5fa6-291f-4fa6-94a4-314dfb91189d	customers	create	26e56c01-a211-4248-a06a-0c4465ad0675
42e4aa13-d212-4894-a9a3-ccc32e667495	customers	read	26e56c01-a211-4248-a06a-0c4465ad0675
95fffb34-af26-4463-a0b6-b9b27097d4b4	customers	update	26e56c01-a211-4248-a06a-0c4465ad0675
c99f2a36-ca71-4beb-913b-2fc1f56351d1	customers	delete	26e56c01-a211-4248-a06a-0c4465ad0675
7438b98b-a9f6-404c-b964-71a25727663d	customer-groups	create	26e56c01-a211-4248-a06a-0c4465ad0675
8066354f-f020-47fc-91ae-16b8e8ae14b3	customer-groups	read	26e56c01-a211-4248-a06a-0c4465ad0675
72e15dba-719c-4571-912d-fc14e56ce9f6	customer-groups	update	26e56c01-a211-4248-a06a-0c4465ad0675
5be3ff11-bd80-48f4-96b1-e0799fafd8bb	customer-groups	delete	26e56c01-a211-4248-a06a-0c4465ad0675
201f9223-40d4-439c-9e85-23795ad27361	transactions	create	26e56c01-a211-4248-a06a-0c4465ad0675
c29ad104-8419-4a04-9913-f4ac2bcad898	transactions	read	26e56c01-a211-4248-a06a-0c4465ad0675
c77d4af5-91c9-4a7d-acca-70216cef5f1c	transactions	update	26e56c01-a211-4248-a06a-0c4465ad0675
b8441905-dfdf-4dcc-8427-bfa6b2163f01	transactions	delete	26e56c01-a211-4248-a06a-0c4465ad0675
d960ac10-2fd0-4e14-b081-541d405d82c1	invoices	create	26e56c01-a211-4248-a06a-0c4465ad0675
958200af-768c-475c-813c-0103db18b92a	invoices	read	26e56c01-a211-4248-a06a-0c4465ad0675
d88eeff1-fd02-4c2b-8663-59b7a1b282ab	invoices	update	26e56c01-a211-4248-a06a-0c4465ad0675
bad77928-3b07-49e3-8a3f-9a9a0ce1eb16	invoices	delete	26e56c01-a211-4248-a06a-0c4465ad0675
1ee78fc4-2cf9-4c58-ab51-145e0156b08d	campaigns	create	26e56c01-a211-4248-a06a-0c4465ad0675
7f8836c6-ebbd-41bb-9be7-66a781fc81af	campaigns	read	26e56c01-a211-4248-a06a-0c4465ad0675
25d09a5c-9feb-4d13-bf6f-fd70cb1c6e10	campaigns	update	26e56c01-a211-4248-a06a-0c4465ad0675
8a86898d-fd08-41fe-bc65-60bcd836800f	campaigns	delete	26e56c01-a211-4248-a06a-0c4465ad0675
5de224ea-4b00-4706-9f9d-b9be26e4b7bc	coupons	create	26e56c01-a211-4248-a06a-0c4465ad0675
1a31fafa-cdfd-4e32-8d00-8a6d5ecf721f	coupons	read	26e56c01-a211-4248-a06a-0c4465ad0675
83230872-277e-4fb1-9950-3a3e3e3af0f0	coupons	update	26e56c01-a211-4248-a06a-0c4465ad0675
20c4ce0f-ed9c-4b95-afa4-0882397da9fb	coupons	delete	26e56c01-a211-4248-a06a-0c4465ad0675
e80975fc-349f-449a-a68f-edb763c68584	pos	create	26e56c01-a211-4248-a06a-0c4465ad0675
1a65fff1-82c4-475a-913b-0926f04139cf	pos	read	26e56c01-a211-4248-a06a-0c4465ad0675
f0773226-be9f-4901-96ef-22311800d7d4	pos	update	26e56c01-a211-4248-a06a-0c4465ad0675
c3795fe9-b57c-4cb0-bd5b-539b6578c41f	pos	delete	26e56c01-a211-4248-a06a-0c4465ad0675
016a3d8f-d2ce-494f-ad5e-9687e8bd3e64	dashboard	create	26e56c01-a211-4248-a06a-0c4465ad0675
f4fcaa37-88fc-4f2a-8e14-70fb86c913b6	dashboard	read	26e56c01-a211-4248-a06a-0c4465ad0675
e6b795c4-ab6b-4472-b4ba-35b921dd1d16	dashboard	update	26e56c01-a211-4248-a06a-0c4465ad0675
1f702dd1-6507-45be-b15d-df483c581a31	dashboard	delete	26e56c01-a211-4248-a06a-0c4465ad0675
cb8450dd-ff8b-4e10-8c34-84425c712cf0	users	create	26e56c01-a211-4248-a06a-0c4465ad0675
1f84d06d-ddc9-4c79-afab-15916a15a080	users	read	26e56c01-a211-4248-a06a-0c4465ad0675
e1207480-072d-4220-8896-3a06d12d9a21	users	update	26e56c01-a211-4248-a06a-0c4465ad0675
d92396bf-cf6c-4eaa-af91-8750f540cb4c	roles	create	26e56c01-a211-4248-a06a-0c4465ad0675
05ca358c-199c-4638-89dc-97e781614cef	roles	read	26e56c01-a211-4248-a06a-0c4465ad0675
e6d1ff23-f5ae-4c53-980a-5e2d3ec81ece	roles	update	26e56c01-a211-4248-a06a-0c4465ad0675
9816003a-6103-41a4-8400-a9a833a7e16a	settings	create	26e56c01-a211-4248-a06a-0c4465ad0675
1da9e93d-1434-489a-be0e-4e9ebd1719e1	settings	read	26e56c01-a211-4248-a06a-0c4465ad0675
f6048bd5-40a9-45f1-880b-bd611206ce5c	settings	update	26e56c01-a211-4248-a06a-0c4465ad0675
f7a5ff3e-35de-48a5-aa94-cb3047fd4748	media	create	26e56c01-a211-4248-a06a-0c4465ad0675
d256dfc4-d60c-4ccd-905b-8d6349805b29	media	read	26e56c01-a211-4248-a06a-0c4465ad0675
416e21b7-9f87-4501-b7d8-bbbf81411cad	media	update	26e56c01-a211-4248-a06a-0c4465ad0675
f1f9377b-4ee9-42d2-ac6b-2266df425924	media	delete	26e56c01-a211-4248-a06a-0c4465ad0675
717f6106-5e4f-4728-86bf-a381b3463ee8	audit-logs	create	26e56c01-a211-4248-a06a-0c4465ad0675
d39451f0-6d3a-4d22-8b89-367b262f683e	audit-logs	read	26e56c01-a211-4248-a06a-0c4465ad0675
da484ec7-4a75-47a8-bfda-cf8d22a3db32	audit-logs	update	26e56c01-a211-4248-a06a-0c4465ad0675
cefcc7f4-eae8-4630-8abd-f4a257ee2a6f	audit-logs	delete	26e56c01-a211-4248-a06a-0c4465ad0675
f5904ca1-ae8b-465b-ac44-e1168cdca7aa	cms	create	26e56c01-a211-4248-a06a-0c4465ad0675
cea6aa60-4534-48c1-a0cb-3734ca7ca39b	cms	read	26e56c01-a211-4248-a06a-0c4465ad0675
cb387cec-96e1-4b09-8b28-825e9e81e014	cms	update	26e56c01-a211-4248-a06a-0c4465ad0675
4cc5449f-5c8a-4051-9b81-31d571ae951a	cms	delete	26e56c01-a211-4248-a06a-0c4465ad0675
ed4c78e4-dc10-4e63-9c7a-9879d265fa81	products	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
77f0575b-5e3d-4552-bddb-502bf7d1a18b	products	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
eb180984-01a3-4636-98c7-11be35277920	products	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
0df7be5a-ebbb-4570-befc-068c6302c877	categories	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
786fbdda-2a66-4456-b6fd-c9d45357bdec	categories	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
70f4df31-9fd4-4132-aa42-78ed90b28d81	categories	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
aad193c5-1def-415a-abf8-34e2d04a9f93	variants	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
e5fb05c6-2444-4ad3-a036-1dfa679f5601	variants	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
39e97ba4-0ea9-49c0-9df1-967434a8da26	variants	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
5deca3f7-4077-4f30-ada9-51615e5e9413	orders	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
b1e2be01-f621-4312-9910-f952b104d559	orders	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
1d056221-d889-46c8-808e-dff062c7397d	orders	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
d5d8c16c-e497-4ca9-93be-2729be37449c	customers	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
255e200f-9f7a-4e92-a5eb-9b95e8ad9f09	customers	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
3d31b2b7-06cb-4130-981f-8839b9eddbd7	customers	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
16686dd0-d734-40be-9c7f-8f10e8f84ab1	customer-groups	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
20e46fda-4923-4dd7-9102-e0a3704c1689	customer-groups	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
ea41b706-e770-458a-b23c-3fcc8497f746	customer-groups	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
84714e5c-3636-4bc0-be58-8dd01e6b8fc7	dashboard	create	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
210ad4dc-3de5-48a9-81e2-01426e304db9	dashboard	read	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
16547662-4084-4f75-88ef-f12a81972426	dashboard	update	8b7c04b4-83cc-4bf8-8225-6ffcaeac4522
55f74fc2-1f51-4955-8273-415fd7f65d56	pos	create	18eaa108-1028-4999-8e23-a75cc973fed8
83ea485d-e522-4c9d-8047-725c23b1cac7	pos	read	18eaa108-1028-4999-8e23-a75cc973fed8
56a3911b-326d-445b-815e-d042f0acb95f	pos	update	18eaa108-1028-4999-8e23-a75cc973fed8
91b44d80-11c4-4fe7-8053-4b6c28809a14	pos	delete	18eaa108-1028-4999-8e23-a75cc973fed8
eab0fca6-f924-40ae-9abf-2192f7b4b59b	products	read	18eaa108-1028-4999-8e23-a75cc973fed8
b50b115f-1965-4381-8f67-bc7441b73ee7	variants	read	18eaa108-1028-4999-8e23-a75cc973fed8
8412d6da-c545-4d34-8af8-e20d44c0a8be	categories	read	18eaa108-1028-4999-8e23-a75cc973fed8
8ffd6960-f9ce-4e55-b2e9-3b06bcbb847a	customers	read	18eaa108-1028-4999-8e23-a75cc973fed8
c0f16620-43e8-45b1-ae32-0329f46dbf2b	customers	create	18eaa108-1028-4999-8e23-a75cc973fed8
b27ffeaa-2465-4fe2-b25c-ff8e8f6fbd9c	orders	read	18eaa108-1028-4999-8e23-a75cc973fed8
03168508-a339-43cb-b4c1-1befbb4f37ba	orders	create	18eaa108-1028-4999-8e23-a75cc973fed8
debc3048-4a9a-4f58-860f-4a08b9617b55	dashboard	read	18eaa108-1028-4999-8e23-a75cc973fed8
\.


--
-- Data for Name: pos_sessions; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.pos_sessions (id, "userId", "openingBalance", "closingBalance", "expectedBalance", difference, "totalSales", "totalTransactions", notes, "openedAt", "closedAt") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.products (id, name, slug, description, sku, barcode, "basePrice", "salePrice", cost, "categoryId", brand, images, "viewCount", "isActive", "isFeatured", "createdAt", "updatedAt") FROM stdin;
c8f0b5c3-a73a-4315-a2bd-6342720672b5	Basic Beyaz Tişört	basic-beyaz-tisort	%100 Pamuklu Temel Tişört	TS-WHT-001	8680000000001	250.00	\N	\N	89c09b9f-1869-45d0-9a11-e0d305935004	\N	[]	0	t	f	2026-03-04 08:11:18.965	2026-03-04 08:11:18.965
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.refresh_tokens (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
9ab685a9-8bb8-46d1-ad59-b13d3fa8b6bf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MGIwNDE2OC1kN2UwLTQ0MWUtODA5YS00ZWYzYmI5MmMyMDYiLCJpYXQiOjE3NzM0NTY4MzAsImV4cCI6MTc3NDA2MTYzMH0.EKldg5af6MpKPdSf-KrVMI-4vu_N_fazlUs-6LmG3vQ	70b04168-d7e0-441e-809a-4ef3bb92c206	2026-03-21 02:53:50.053	2026-03-14 02:53:50.055
\.


--
-- Data for Name: return_items; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.return_items (id, "returnId", "variantId", quantity, reason) FROM stdin;
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.returns (id, "orderId", reason, status, "refundAmount", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.roles (id, name, "displayName", description, "isSystem", "createdAt", "updatedAt") FROM stdin;
2fced816-8179-4380-beb6-114af241faeb	admin	Yönetici	Tam yetkili sistem yöneticisi	t	2026-03-04 08:11:18.592	2026-03-04 08:11:18.592
26e56c01-a211-4248-a06a-0c4465ad0675	manager	Müdür	Mağaza müdürü — kullanıcı ve ayar silme hariç tüm yetkiler	t	2026-03-04 08:11:18.663	2026-03-04 08:11:18.663
8b7c04b4-83cc-4bf8-8225-6ffcaeac4522	staff	Personel	Ürün, sipariş ve müşteri yönetimi	t	2026-03-04 08:11:18.685	2026-03-04 08:11:18.685
18eaa108-1028-4999-8e23-a75cc973fed8	cashier	Kasiyer	POS ve temel okuma yetkileri	t	2026-03-04 08:11:18.702	2026-03-04 08:11:18.702
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.settings (id, key, value, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.transactions (id, type, category, amount, description, reference, "paymentMethod", "orderId", "transactionDate", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.users (id, email, password, "firstName", "lastName", phone, avatar, "isActive", "createdAt", "updatedAt", "failedLogins", "lastLoginAt", "lockedUntil", "roleId") FROM stdin;
70b04168-d7e0-441e-809a-4ef3bb92c206	admin@peyker.com	$2b$10$FfSRJp5RRUDc4fdV15dPReBdcbYK6skHYiE2KSnmE4GHOP92PwqaS	Admin	Peyker	\N	\N	t	2026-03-04 08:11:18.846	2026-03-14 02:53:50.046	0	2026-03-14 02:53:50.045	\N	2fced816-8179-4380-beb6-114af241faeb
\.


--
-- Data for Name: variants; Type: TABLE DATA; Schema: public; Owner: peyker_user
--

COPY public.variants (id, "productId", sku, barcode, price, stock, size, color, "colorCode", "isActive", "createdAt", "updatedAt") FROM stdin;
31262eac-711d-4215-99c6-368ae39a3695	c8f0b5c3-a73a-4315-a2bd-6342720672b5	TS-WHT-001-M	\N	\N	15	M	Beyaz	#FFFFFF	t	2026-03-04 08:11:18.974	2026-03-04 08:11:18.974
df1a1215-db65-4cfa-8301-13266e3d5f2f	c8f0b5c3-a73a-4315-a2bd-6342720672b5	TS-WHT-001-L	\N	\N	8	L	Beyaz	#FFFFFF	t	2026-03-04 08:11:18.974	2026-03-04 08:11:18.974
4c17c138-4684-4376-b96c-8bcbd98cb0bd	c8f0b5c3-a73a-4315-a2bd-6342720672b5	TS-WHT-001-S	\N	\N	9	S	Beyaz	#FFFFFF	t	2026-03-04 08:11:18.974	2026-03-14 02:53:42.164
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customer_groups customer_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.customer_groups
    ADD CONSTRAINT customer_groups_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: held_sales held_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.held_sales
    ADD CONSTRAINT held_sales_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: pos_sessions pos_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT pos_sessions_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: return_items return_items_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT return_items_pkey PRIMARY KEY (id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: variants variants_pkey; Type: CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT variants_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- Name: audit_logs_resource_resourceId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "audit_logs_resource_resourceId_idx" ON public.audit_logs USING btree (resource, "resourceId");


--
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- Name: categories_slug_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX categories_slug_key ON public.categories USING btree (slug);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: customer_groups_name_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX customer_groups_name_key ON public.customer_groups USING btree (name);


--
-- Name: customers_email_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX customers_email_idx ON public.customers USING btree (email);


--
-- Name: customers_groupId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "customers_groupId_idx" ON public.customers USING btree ("groupId");


--
-- Name: customers_phone_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX customers_phone_idx ON public.customers USING btree (phone);


--
-- Name: invoices_invoiceNo_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX "invoices_invoiceNo_key" ON public.invoices USING btree ("invoiceNo");


--
-- Name: invoices_orderId_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX "invoices_orderId_key" ON public.invoices USING btree ("orderId");


--
-- Name: media_folder_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX media_folder_idx ON public.media USING btree (folder);


--
-- Name: media_key_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX media_key_key ON public.media USING btree (key);


--
-- Name: media_mimetype_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX media_mimetype_idx ON public.media USING btree (mimetype);


--
-- Name: order_items_orderId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "order_items_orderId_idx" ON public.order_items USING btree ("orderId");


--
-- Name: orders_createdAt_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "orders_createdAt_idx" ON public.orders USING btree ("createdAt");


--
-- Name: orders_customerId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "orders_customerId_idx" ON public.orders USING btree ("customerId");


--
-- Name: orders_orderNumber_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX "orders_orderNumber_key" ON public.orders USING btree ("orderNumber");


--
-- Name: orders_status_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX orders_status_idx ON public.orders USING btree (status);


--
-- Name: orders_userId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "orders_userId_idx" ON public.orders USING btree ("userId");


--
-- Name: payments_orderId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "payments_orderId_idx" ON public.payments USING btree ("orderId");


--
-- Name: permissions_roleId_resource_action_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX "permissions_roleId_resource_action_key" ON public.permissions USING btree ("roleId", resource, action);


--
-- Name: pos_sessions_userId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "pos_sessions_userId_idx" ON public.pos_sessions USING btree ("userId");


--
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: products_categoryId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "products_categoryId_idx" ON public.products USING btree ("categoryId");


--
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_userId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "refresh_tokens_userId_idx" ON public.refresh_tokens USING btree ("userId");


--
-- Name: return_items_returnId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "return_items_returnId_idx" ON public.return_items USING btree ("returnId");


--
-- Name: returns_orderId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "returns_orderId_idx" ON public.returns USING btree ("orderId");


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- Name: transactions_transactionDate_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "transactions_transactionDate_idx" ON public.transactions USING btree ("transactionDate");


--
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_roleId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "users_roleId_idx" ON public.users USING btree ("roleId");


--
-- Name: variants_barcode_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX variants_barcode_idx ON public.variants USING btree (barcode);


--
-- Name: variants_barcode_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX variants_barcode_key ON public.variants USING btree (barcode);


--
-- Name: variants_productId_idx; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE INDEX "variants_productId_idx" ON public.variants USING btree ("productId");


--
-- Name: variants_sku_key; Type: INDEX; Schema: public; Owner: peyker_user
--

CREATE UNIQUE INDEX variants_sku_key ON public.variants USING btree (sku);


--
-- Name: categories categories_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customers customers_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public.customer_groups(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: held_sales held_sales_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.held_sales
    ADD CONSTRAINT "held_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: held_sales held_sales_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.held_sales
    ADD CONSTRAINT "held_sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "invoices_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_variantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES public.variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payments payments_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: pos_sessions pos_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.pos_sessions
    ADD CONSTRAINT "pos_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_tokens refresh_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: return_items return_items_returnId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.return_items
    ADD CONSTRAINT "return_items_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES public.returns(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: returns returns_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT "returns_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_orderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: variants variants_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: peyker_user
--

ALTER TABLE ONLY public.variants
    ADD CONSTRAINT "variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: peyker_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pw8znIvIbKN9cjcCwDtQoCAOOGlBoKudNOgfdobf6Sr92gskokmLNBVlDAlITsV

