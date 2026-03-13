--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2026-02-18 15:26:40

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS public;


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 879 (class 1247 OID 17272)
-- Name: enum_InventoryMovements_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_InventoryMovements_type" AS ENUM (
    'in',
    'out',
    'transaction'
);


--
-- TOC entry 861 (class 1247 OID 17197)
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'admin',
    'cashier'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 17214)
-- Name: Categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Categories" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 17213)
-- Name: Categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 219
-- Name: Categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Categories_id_seq" OWNED BY public."Categories".id;


--
-- TOC entry 230 (class 1259 OID 33548)
-- Name: EndOfDayReconciliations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EndOfDayReconciliations" (
    id integer NOT NULL,
    date date NOT NULL,
    "startingCash" numeric(10,2) NOT NULL,
    "expectedCash" numeric(10,2) NOT NULL,
    "actualCash" numeric(10,2) NOT NULL,
    "cashDifference" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalCashSales" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalNonCashSales" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalTransactions" integer DEFAULT 0 NOT NULL,
    notes text,
    "closedBy" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 33547)
-- Name: EndOfDayReconciliations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EndOfDayReconciliations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 229
-- Name: EndOfDayReconciliations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EndOfDayReconciliations_id_seq" OWNED BY public."EndOfDayReconciliations".id;


--
-- TOC entry 234 (class 1259 OID 41754)
-- Name: ExpenseTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ExpenseTypes" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 41753)
-- Name: ExpenseTypes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ExpenseTypes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 233
-- Name: ExpenseTypes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ExpenseTypes_id_seq" OWNED BY public."ExpenseTypes".id;


--
-- TOC entry 236 (class 1259 OID 41763)
-- Name: Expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Expenses" (
    id integer NOT NULL,
    amount numeric(10,2) NOT NULL,
    type character varying(255) NOT NULL,
    location character varying(255) NOT NULL,
    notes text,
    "createdBy" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 41762)
-- Name: Expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Expenses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 235
-- Name: Expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Expenses_id_seq" OWNED BY public."Expenses".id;


--
-- TOC entry 228 (class 1259 OID 17280)
-- Name: InventoryMovements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."InventoryMovements" (
    id integer NOT NULL,
    "productId" integer NOT NULL,
    type public."enum_InventoryMovements_type" NOT NULL,
    quantity integer NOT NULL,
    reason character varying(255),
    "relatedTransactionId" integer,
    "userId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 17279)
-- Name: InventoryMovements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."InventoryMovements_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 227
-- Name: InventoryMovements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."InventoryMovements_id_seq" OWNED BY public."InventoryMovements".id;


--
-- TOC entry 222 (class 1259 OID 17225)
-- Name: Products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Products" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    sku character varying(255) NOT NULL,
    image character varying(255),
    inventory integer DEFAULT 0 NOT NULL,
    "categoryId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    "costToMake" numeric DEFAULT 0
);


--
-- TOC entry 221 (class 1259 OID 17224)
-- Name: Products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Products_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 221
-- Name: Products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Products_id_seq" OWNED BY public."Products".id;


--
-- TOC entry 232 (class 1259 OID 41747)
-- Name: StartingCashes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StartingCashes" (
    id integer NOT NULL,
    starting numeric(10,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 231 (class 1259 OID 41746)
-- Name: StartingCashes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StartingCashes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 231
-- Name: StartingCashes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StartingCashes_id_seq" OWNED BY public."StartingCashes".id;


--
-- TOC entry 226 (class 1259 OID 17255)
-- Name: TransactionItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransactionItems" (
    id integer NOT NULL,
    "transactionId" integer NOT NULL,
    "productId" integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    customername character varying
);


--
-- TOC entry 225 (class 1259 OID 17254)
-- Name: TransactionItems_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."TransactionItems_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 225
-- Name: TransactionItems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."TransactionItems_id_seq" OWNED BY public."TransactionItems".id;


--
-- TOC entry 224 (class 1259 OID 17242)
-- Name: Transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transactions" (
    id integer NOT NULL,
    total numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0,
    "cashierId" integer NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    mop character varying DEFAULT 'Cash'::character varying NOT NULL,
    "customerName" character varying
);


--
-- TOC entry 223 (class 1259 OID 17241)
-- Name: Transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Transactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 223
-- Name: Transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Transactions_id_seq" OWNED BY public."Transactions".id;


--
-- TOC entry 218 (class 1259 OID 17202)
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public."enum_Users_role" DEFAULT 'cashier'::public."enum_Users_role" NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 17201)
-- Name: Users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 217
-- Name: Users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Users_id_seq" OWNED BY public."Users".id;


--
-- TOC entry 4743 (class 2604 OID 17217)
-- Name: Categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories" ALTER COLUMN id SET DEFAULT nextval('public."Categories_id_seq"'::regclass);


--
-- TOC entry 4752 (class 2604 OID 33551)
-- Name: EndOfDayReconciliations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EndOfDayReconciliations" ALTER COLUMN id SET DEFAULT nextval('public."EndOfDayReconciliations_id_seq"'::regclass);


--
-- TOC entry 4758 (class 2604 OID 41757)
-- Name: ExpenseTypes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExpenseTypes" ALTER COLUMN id SET DEFAULT nextval('public."ExpenseTypes_id_seq"'::regclass);


--
-- TOC entry 4759 (class 2604 OID 41766)
-- Name: Expenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenses" ALTER COLUMN id SET DEFAULT nextval('public."Expenses_id_seq"'::regclass);


--
-- TOC entry 4751 (class 2604 OID 17283)
-- Name: InventoryMovements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryMovements" ALTER COLUMN id SET DEFAULT nextval('public."InventoryMovements_id_seq"'::regclass);


--
-- TOC entry 4744 (class 2604 OID 17228)
-- Name: Products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products" ALTER COLUMN id SET DEFAULT nextval('public."Products_id_seq"'::regclass);


--
-- TOC entry 4757 (class 2604 OID 41750)
-- Name: StartingCashes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StartingCashes" ALTER COLUMN id SET DEFAULT nextval('public."StartingCashes_id_seq"'::regclass);


--
-- TOC entry 4750 (class 2604 OID 17258)
-- Name: TransactionItems id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionItems" ALTER COLUMN id SET DEFAULT nextval('public."TransactionItems_id_seq"'::regclass);


--
-- TOC entry 4747 (class 2604 OID 17245)
-- Name: Transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transactions" ALTER COLUMN id SET DEFAULT nextval('public."Transactions_id_seq"'::regclass);


--
-- TOC entry 4741 (class 2604 OID 17205)
-- Name: Users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users" ALTER COLUMN id SET DEFAULT nextval('public."Users_id_seq"'::regclass);


--
-- TOC entry 4945 (class 0 OID 17214)
-- Dependencies: 220
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Categories" VALUES (1, 'Beverages', 'Hot and cold drinks including coffee, tea, and juice.', '2025-07-27 00:22:00.82757+08', '2025-07-27 00:22:00.82757+08');
INSERT INTO public."Categories" VALUES (2, 'Desserts', 'Cakes, pastries, and other sweet treats.', '2025-07-27 00:22:00.82757+08', '2025-07-27 00:22:00.82757+08');
INSERT INTO public."Categories" VALUES (3, 'Sandwiches', 'Prepared sandwiches with various fillings.', '2025-07-27 00:22:00.82757+08', '2025-07-27 00:22:00.82757+08');
INSERT INTO public."Categories" VALUES (4, 'Miscellaneous', 'Other items not classified under main categories.', '2025-07-27 00:22:00.82757+08', '2025-07-27 00:22:00.82757+08');


--
-- TOC entry 4955 (class 0 OID 33548)
-- Dependencies: 230
-- Data for Name: EndOfDayReconciliations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."EndOfDayReconciliations" VALUES (1, '2025-11-15', 1000.00, 1262.00, 1265.00, 3.00, 262.00, 0.00, 1, NULL, 1, '2025-11-16 01:46:50.66+08');


--
-- TOC entry 4959 (class 0 OID 41754)
-- Dependencies: 234
-- Data for Name: ExpenseTypes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ExpenseTypes" VALUES (1, 'main', '2025-12-13 17:33:52.564+08', '2025-12-13 17:33:52.564+08');


--
-- TOC entry 4961 (class 0 OID 41763)
-- Dependencies: 236
-- Data for Name: Expenses; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Expenses" VALUES (1, 100.00, 'main', 'admin', 'test', 1, '2025-12-13 17:33:52.612+08');


--
-- TOC entry 4953 (class 0 OID 17280)
-- Dependencies: 228
-- Data for Name: InventoryMovements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."InventoryMovements" VALUES (1, 7, 'in', 999, 'test', NULL, 1, '2025-09-17 00:46:38.691+08');


--
-- TOC entry 4947 (class 0 OID 17225)
-- Dependencies: 222
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Products" VALUES (8, 'Chocolate Cake Slice', 85.00, 'SKU-003', 'uploads/choco_cake.jpg', 16, 2, '2025-07-27 00:22:21.425716+08', '2025-08-07 08:37:43.045+08', 0);
INSERT INTO public."Products" VALUES (10, 'Bottled Water', 30.00, 'SKU-005', '/uploads/1754409431182-drinks iced series non coffee creamy choco matcha latte coffee series cafe mocha cafe latte spanish late americano refresher strawberry blast cakes and pastries (see available on store) (1).png', 75, 4, '2025-07-27 00:22:21.425716+08', '2025-08-07 08:40:13.558+08', 0);
INSERT INTO public."Products" VALUES (9, 'Ham & Cheese Sandwich', 95.00, 'SKU-004', 'uploads/ham_cheese.jpg', 20, 3, '2025-07-27 00:22:21.425716+08', '2025-08-07 08:40:34.84+08', 0);
INSERT INTO public."Products" VALUES (11, 'Spanish Latte', 12.00, '1', '/uploads/1753558356511-merls.jpg', 34, 1, '2025-07-27 03:32:36.514+08', '2026-01-06 17:04:54.881+08', 0);
INSERT INTO public."Products" VALUES (6, 'Cappuccino', 120.00, 'SKU-001', 'uploads/cappuccino.jpg', 45, 1, '2025-07-27 00:22:21.425716+08', '2026-01-06 17:04:54.887+08', 0);
INSERT INTO public."Products" VALUES (7, 'Iced Latte', 130.00, 'SKU-002', 'uploads/iced_latte.jpg', 978, 1, '2025-07-27 00:22:21.425716+08', '2026-01-06 17:04:54.889+08', 0);


--
-- TOC entry 4957 (class 0 OID 41747)
-- Dependencies: 232
-- Data for Name: StartingCashes; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."StartingCashes" VALUES (1, 1500.00, '2025-11-21 23:58:30.416+08', '2025-11-21 23:58:30.416+08');
INSERT INTO public."StartingCashes" VALUES (2, 6000.00, '2025-11-23 00:01:03.66+08', '2025-11-23 04:34:50.396+08');


--
-- TOC entry 4951 (class 0 OID 17255)
-- Dependencies: 226
-- Data for Name: TransactionItems; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TransactionItems" VALUES (1, 1, 9, 1, 95.00, 95.00, '2025-07-27 03:04:13.045+08', '2025-07-27 03:04:13.045+08', NULL);
INSERT INTO public."TransactionItems" VALUES (2, 2, 9, 1, 95.00, 95.00, '2025-07-27 03:05:59.917+08', '2025-07-27 03:05:59.917+08', NULL);
INSERT INTO public."TransactionItems" VALUES (3, 2, 10, 1, 30.00, 30.00, '2025-07-27 03:05:59.921+08', '2025-07-27 03:05:59.921+08', NULL);
INSERT INTO public."TransactionItems" VALUES (4, 2, 8, 1, 85.00, 85.00, '2025-07-27 03:05:59.923+08', '2025-07-27 03:05:59.923+08', NULL);
INSERT INTO public."TransactionItems" VALUES (5, 3, 11, 7, 12.00, 84.00, '2025-07-27 04:19:52.644+08', '2025-07-27 04:19:52.644+08', NULL);
INSERT INTO public."TransactionItems" VALUES (6, 4, 8, 1, 85.00, 85.00, '2025-07-27 10:43:08.689+08', '2025-07-27 10:43:08.689+08', NULL);
INSERT INTO public."TransactionItems" VALUES (7, 5, 6, 1, 120.00, 120.00, '2025-07-27 11:27:34.522+08', '2025-07-27 11:27:34.522+08', NULL);
INSERT INTO public."TransactionItems" VALUES (8, 6, 7, 1, 130.00, 130.00, '2025-07-27 11:55:39.059+08', '2025-07-27 11:55:39.059+08', NULL);
INSERT INTO public."TransactionItems" VALUES (9, 7, 9, 1, 95.00, 95.00, '2025-07-27 12:02:40.22+08', '2025-07-27 12:02:40.22+08', NULL);
INSERT INTO public."TransactionItems" VALUES (14, 8, 11, 2, 12.00, 24.00, '2025-08-06 05:37:18.475+08', '2025-08-06 05:37:18.475+08', NULL);
INSERT INTO public."TransactionItems" VALUES (15, 8, 10, 3, 30.00, 90.00, '2025-08-06 05:37:18.478+08', '2025-08-06 05:37:18.478+08', NULL);
INSERT INTO public."TransactionItems" VALUES (16, 9, 10, 2, 30.00, 60.00, '2025-08-06 06:07:34.504+08', '2025-08-06 06:07:34.504+08', NULL);
INSERT INTO public."TransactionItems" VALUES (17, 10, 10, 1, 30.00, 30.00, '2025-08-06 06:10:32.201+08', '2025-08-06 06:10:32.201+08', NULL);
INSERT INTO public."TransactionItems" VALUES (18, 11, 10, 1, 30.00, 30.00, '2025-08-07 01:24:49.41+08', '2025-08-07 01:24:49.41+08', NULL);
INSERT INTO public."TransactionItems" VALUES (19, 12, 10, 1, 30.00, 30.00, '2025-08-07 01:27:45.413+08', '2025-08-07 01:27:45.413+08', NULL);
INSERT INTO public."TransactionItems" VALUES (20, 13, 10, 1, 30.00, 30.00, '2025-08-07 01:28:58.728+08', '2025-08-07 01:28:58.728+08', NULL);
INSERT INTO public."TransactionItems" VALUES (21, 14, 10, 1, 30.00, 30.00, '2025-08-07 01:30:03.222+08', '2025-08-07 01:30:03.222+08', NULL);
INSERT INTO public."TransactionItems" VALUES (22, 15, 10, 1, 30.00, 30.00, '2025-08-07 01:30:35.038+08', '2025-08-07 01:30:35.038+08', NULL);
INSERT INTO public."TransactionItems" VALUES (23, 16, 10, 1, 30.00, 30.00, '2025-08-07 01:31:42.068+08', '2025-08-07 01:31:42.068+08', NULL);
INSERT INTO public."TransactionItems" VALUES (24, 17, 10, 1, 30.00, 30.00, '2025-08-07 01:33:16.518+08', '2025-08-07 01:33:16.518+08', NULL);
INSERT INTO public."TransactionItems" VALUES (25, 18, 10, 1, 30.00, 30.00, '2025-08-07 01:34:52.406+08', '2025-08-07 01:34:52.406+08', NULL);
INSERT INTO public."TransactionItems" VALUES (26, 19, 9, 1, 95.00, 95.00, '2025-08-07 02:57:35.662+08', '2025-08-07 02:57:35.662+08', NULL);
INSERT INTO public."TransactionItems" VALUES (27, 19, 8, 1, 85.00, 85.00, '2025-08-07 02:57:35.666+08', '2025-08-07 02:57:35.666+08', NULL);
INSERT INTO public."TransactionItems" VALUES (28, 19, 6, 1, 120.00, 120.00, '2025-08-07 02:57:35.669+08', '2025-08-07 02:57:35.669+08', NULL);
INSERT INTO public."TransactionItems" VALUES (29, 19, 7, 2, 130.00, 260.00, '2025-08-07 02:57:35.671+08', '2025-08-07 02:57:35.671+08', NULL);
INSERT INTO public."TransactionItems" VALUES (30, 20, 8, 1, 85.00, 85.00, '2025-08-07 08:37:43.043+08', '2025-08-07 08:37:43.043+08', NULL);
INSERT INTO public."TransactionItems" VALUES (31, 21, 10, 1, 30.00, 30.00, '2025-08-07 08:38:43.091+08', '2025-08-07 08:38:43.091+08', NULL);
INSERT INTO public."TransactionItems" VALUES (32, 22, 10, 2, 30.00, 60.00, '2025-08-07 08:40:13.555+08', '2025-08-07 08:40:13.555+08', NULL);
INSERT INTO public."TransactionItems" VALUES (33, 23, 9, 1, 95.00, 95.00, '2025-08-07 08:40:34.838+08', '2025-08-07 08:40:34.838+08', NULL);
INSERT INTO public."TransactionItems" VALUES (34, 24, 7, 1, 130.00, 130.00, '2025-08-17 22:46:54.258+08', '2025-08-17 22:46:54.258+08', NULL);
INSERT INTO public."TransactionItems" VALUES (35, 25, 7, 1, 130.00, 130.00, '2025-08-17 22:47:05.232+08', '2025-08-17 22:47:05.232+08', NULL);
INSERT INTO public."TransactionItems" VALUES (36, 26, 7, 20, 130.00, 2600.00, '2025-09-17 00:45:40.782+08', '2025-09-17 00:45:40.782+08', NULL);
INSERT INTO public."TransactionItems" VALUES (37, 27, 7, 10, 130.00, 1300.00, '2025-09-17 00:46:11.377+08', '2025-09-17 00:46:11.377+08', NULL);
INSERT INTO public."TransactionItems" VALUES (38, 28, 7, 12, 130.00, 1560.00, '2025-09-17 00:47:01.475+08', '2025-09-17 00:47:01.475+08', NULL);
INSERT INTO public."TransactionItems" VALUES (39, 29, 7, 6, 130.00, 780.00, '2025-09-17 00:47:38.042+08', '2025-09-17 00:47:38.042+08', NULL);
INSERT INTO public."TransactionItems" VALUES (40, 30, 11, 1, 12.00, 12.00, '2025-11-16 01:45:09.035+08', '2025-11-16 01:45:09.035+08', NULL);
INSERT INTO public."TransactionItems" VALUES (41, 30, 6, 1, 120.00, 120.00, '2025-11-16 01:45:09.045+08', '2025-11-16 01:45:09.045+08', NULL);
INSERT INTO public."TransactionItems" VALUES (42, 30, 7, 1, 130.00, 130.00, '2025-11-16 01:45:09.047+08', '2025-11-16 01:45:09.047+08', NULL);
INSERT INTO public."TransactionItems" VALUES (43, 31, 7, 1, 130.00, 130.00, '2025-11-23 00:01:43.902+08', '2025-11-23 00:01:43.902+08', NULL);
INSERT INTO public."TransactionItems" VALUES (44, 31, 6, 1, 120.00, 120.00, '2025-11-23 00:01:43.907+08', '2025-11-23 00:01:43.907+08', NULL);
INSERT INTO public."TransactionItems" VALUES (45, 31, 11, 1, 12.00, 12.00, '2025-11-23 00:01:43.909+08', '2025-11-23 00:01:43.909+08', NULL);
INSERT INTO public."TransactionItems" VALUES (46, 32, 11, 1, 12.00, 12.00, '2026-01-06 17:04:54.878+08', '2026-01-06 17:04:54.878+08', NULL);
INSERT INTO public."TransactionItems" VALUES (47, 32, 6, 1, 120.00, 120.00, '2026-01-06 17:04:54.886+08', '2026-01-06 17:04:54.886+08', NULL);
INSERT INTO public."TransactionItems" VALUES (48, 32, 7, 1, 130.00, 130.00, '2026-01-06 17:04:54.888+08', '2026-01-06 17:04:54.888+08', NULL);


--
-- TOC entry 4949 (class 0 OID 17242)
-- Dependencies: 224
-- Data for Name: Transactions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Transactions" VALUES (1, 95.00, 0.00, 1, '2025-07-27 03:04:13.019+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (2, 210.00, 0.00, 1, '2025-07-27 03:05:59.913+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (3, 84.00, 0.00, 1, '2025-07-27 04:19:52.638+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (4, 85.00, 0.00, 1, '2025-07-27 10:43:08.676+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (5, 120.00, 0.00, 1, '2025-07-27 11:27:34.515+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (6, 130.00, 0.00, 1, '2025-07-27 11:55:39.055+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (7, 95.00, 0.00, 1, '2025-07-27 12:02:40.218+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (8, 114.00, 0.00, 1, '2025-08-06 05:27:55.023+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (9, 60.00, 0.00, 1, '2025-08-06 06:07:34.496+08', 'GCash', NULL);
INSERT INTO public."Transactions" VALUES (10, 30.00, 0.00, 1, '2025-08-06 06:10:32.197+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (11, 30.00, 0.00, 1, '2025-08-07 01:24:49.384+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (12, 30.00, 0.00, 1, '2025-08-07 01:27:45.41+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (13, 30.00, 0.00, 1, '2025-08-07 01:28:58.725+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (14, 30.00, 0.00, 1, '2025-08-07 01:30:03.219+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (15, 30.00, 0.00, 1, '2025-08-07 01:30:35.035+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (16, 30.00, 0.00, 1, '2025-08-07 01:31:42.065+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (17, 30.00, 0.00, 1, '2025-08-07 01:33:16.515+08', 'Cash', NULL);
INSERT INTO public."Transactions" VALUES (18, 30.00, 0.00, 1, '2025-08-07 01:34:52.4+08', 'Cash', 'dan');
INSERT INTO public."Transactions" VALUES (19, 560.00, 0.00, 1, '2025-08-07 02:57:35.655+08', 'Cash', 'dan');
INSERT INTO public."Transactions" VALUES (20, 85.00, 0.00, 1, '2025-08-07 08:37:43.039+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (21, 30.00, 0.00, 1, '2025-08-07 08:38:43.088+08', 'Cash', 'dan1');
INSERT INTO public."Transactions" VALUES (22, 60.00, 0.00, 1, '2025-08-07 08:40:13.552+08', 'Cash', 'dan');
INSERT INTO public."Transactions" VALUES (23, 95.00, 0.00, 1, '2025-08-07 08:40:34.834+08', 'Cash', 'dan12');
INSERT INTO public."Transactions" VALUES (24, 130.00, 0.00, 1, '2025-08-17 22:46:54.214+08', 'Cash', 'cutomer');
INSERT INTO public."Transactions" VALUES (25, 130.00, 0.00, 1, '2025-08-17 22:47:05.231+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (26, 2600.00, 0.00, 1, '2025-09-17 00:45:40.732+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (27, 1300.00, 0.00, 1, '2025-09-17 00:46:11.373+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (28, 1560.00, 0.00, 1, '2025-09-17 00:47:01.471+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (29, 780.00, 0.00, 1, '2025-09-17 00:47:38.038+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (30, 262.00, 0.00, 1, '2025-11-16 01:45:09.029+08', 'Cash', 'iiii');
INSERT INTO public."Transactions" VALUES (31, 262.00, 0.00, 1, '2025-11-23 00:01:43.861+08', 'Cash', 'test');
INSERT INTO public."Transactions" VALUES (32, 262.00, 0.00, 1, '2026-01-06 17:04:54.856+08', 'Cash', 'test');


--
-- TOC entry 4943 (class 0 OID 17202)
-- Dependencies: 218
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Users" VALUES (1, 'admin', '$2a$10$/fSj0Jfqj7hxH8wOdrXPpOx3cQDBr/H5sR6aot4G2wme91DqpR3KO', 'admin', '2025-07-26 03:03:16.767939+08', '2025-07-26 03:03:16.767939+08');
INSERT INTO public."Users" VALUES (2, 'cashier1', '$2y$10$oaXmx7yZAT7L2hi0HiorieDUuxnI0lnsrZ/FkXyJ2cxHftGuLnhtK', 'cashier', '2025-07-26 03:03:16.767939+08', '2025-07-26 03:03:16.767939+08');


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 219
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 1, false);


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 229
-- Name: EndOfDayReconciliations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EndOfDayReconciliations_id_seq"', 1, true);


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 233
-- Name: ExpenseTypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ExpenseTypes_id_seq"', 1, true);


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 235
-- Name: Expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Expenses_id_seq"', 1, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 227
-- Name: InventoryMovements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InventoryMovements_id_seq"', 1, true);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 221
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Products_id_seq"', 11, true);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 231
-- Name: StartingCashes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StartingCashes_id_seq"', 2, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 225
-- Name: TransactionItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TransactionItems_id_seq"', 48, true);


--
-- TOC entry 4986 (class 0 OID 0)
-- Dependencies: 223
-- Name: Transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Transactions_id_seq"', 32, true);


--
-- TOC entry 4987 (class 0 OID 0)
-- Dependencies: 217
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Users_id_seq"', 1, false);


--
-- TOC entry 4765 (class 2606 OID 17223)
-- Name: Categories Categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_name_key" UNIQUE (name);


--
-- TOC entry 4767 (class 2606 OID 17221)
-- Name: Categories Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categories"
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- TOC entry 4779 (class 2606 OID 33561)
-- Name: EndOfDayReconciliations EndOfDayReconciliations_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EndOfDayReconciliations"
    ADD CONSTRAINT "EndOfDayReconciliations_date_key" UNIQUE (date);


--
-- TOC entry 4781 (class 2606 OID 33559)
-- Name: EndOfDayReconciliations EndOfDayReconciliations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EndOfDayReconciliations"
    ADD CONSTRAINT "EndOfDayReconciliations_pkey" PRIMARY KEY (id);


--
-- TOC entry 4785 (class 2606 OID 41761)
-- Name: ExpenseTypes ExpenseTypes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExpenseTypes"
    ADD CONSTRAINT "ExpenseTypes_name_key" UNIQUE (name);


--
-- TOC entry 4787 (class 2606 OID 41759)
-- Name: ExpenseTypes ExpenseTypes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ExpenseTypes"
    ADD CONSTRAINT "ExpenseTypes_pkey" PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 41770)
-- Name: Expenses Expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_pkey" PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 17285)
-- Name: InventoryMovements InventoryMovements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryMovements"
    ADD CONSTRAINT "InventoryMovements_pkey" PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 17233)
-- Name: Products Products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_pkey" PRIMARY KEY (id);


--
-- TOC entry 4771 (class 2606 OID 17235)
-- Name: Products Products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_sku_key" UNIQUE (sku);


--
-- TOC entry 4783 (class 2606 OID 41752)
-- Name: StartingCashes StartingCashes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StartingCashes"
    ADD CONSTRAINT "StartingCashes_pkey" PRIMARY KEY (id);


--
-- TOC entry 4775 (class 2606 OID 17260)
-- Name: TransactionItems TransactionItems_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_pkey" PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 17248)
-- Name: Transactions Transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_pkey" PRIMARY KEY (id);


--
-- TOC entry 4761 (class 2606 OID 17210)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 17212)
-- Name: Users Users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_username_key" UNIQUE (username);


--
-- TOC entry 4797 (class 2606 OID 33562)
-- Name: EndOfDayReconciliations EndOfDayReconciliations_closedBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EndOfDayReconciliations"
    ADD CONSTRAINT "EndOfDayReconciliations_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- TOC entry 4798 (class 2606 OID 41771)
-- Name: Expenses Expenses_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Expenses"
    ADD CONSTRAINT "Expenses_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 17286)
-- Name: InventoryMovements InventoryMovements_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryMovements"
    ADD CONSTRAINT "InventoryMovements_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 17291)
-- Name: InventoryMovements InventoryMovements_relatedTransactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryMovements"
    ADD CONSTRAINT "InventoryMovements_relatedTransactionId_fkey" FOREIGN KEY ("relatedTransactionId") REFERENCES public."Transactions"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4796 (class 2606 OID 17296)
-- Name: InventoryMovements InventoryMovements_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."InventoryMovements"
    ADD CONSTRAINT "InventoryMovements_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 17236)
-- Name: Products Products_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Products"
    ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Categories"(id) ON UPDATE CASCADE;


--
-- TOC entry 4792 (class 2606 OID 17266)
-- Name: TransactionItems TransactionItems_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Products"(id) ON UPDATE CASCADE;


--
-- TOC entry 4793 (class 2606 OID 17261)
-- Name: TransactionItems TransactionItems_transactionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionItems"
    ADD CONSTRAINT "TransactionItems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES public."Transactions"(id) ON UPDATE CASCADE;


--
-- TOC entry 4791 (class 2606 OID 17249)
-- Name: Transactions Transactions_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transactions"
    ADD CONSTRAINT "Transactions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


-- Completed on 2026-02-18 15:26:40

--
-- PostgreSQL database dump complete
--

