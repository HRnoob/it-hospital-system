--
-- PostgreSQL database dump
--

\restrict 0A0PJSMHItLZn3TMJWwTalXmIpzuwsL08ahwielJDTaYQFEzBgqt8T9aUXIv7gd

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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
-- Name: AssetCondition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetCondition" AS ENUM (
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR',
    'BROKEN'
);


ALTER TYPE public."AssetCondition" OWNER TO postgres;

--
-- Name: AssetStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AssetStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'DISPOSED',
    'LOST'
);


ALTER TYPE public."AssetStatus" OWNER TO postgres;

--
-- Name: IssueStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."IssueStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'WAITING_PARTS',
    'RESOLVED',
    'CLOSED',
    'CANCELLED'
);


ALTER TYPE public."IssueStatus" OWNER TO postgres;

--
-- Name: KanbanColumn; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KanbanColumn" AS ENUM (
    'TODO',
    'DOING',
    'DONE'
);


ALTER TYPE public."KanbanColumn" OWNER TO postgres;

--
-- Name: OverallStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OverallStatus" AS ENUM (
    'NORMAL',
    'WARNING',
    'CRITICAL'
);


ALTER TYPE public."OverallStatus" OWNER TO postgres;

--
-- Name: PhotoType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PhotoType" AS ENUM (
    'BEFORE',
    'AFTER'
);


ALTER TYPE public."PhotoType" OWNER TO postgres;

--
-- Name: PhysicalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PhysicalStatus" AS ENUM (
    'UNCHECKED',
    'OK',
    'ISSUE',
    'CRITICAL'
);


ALTER TYPE public."PhysicalStatus" OWNER TO postgres;

--
-- Name: PingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PingStatus" AS ENUM (
    'UNCHECKED',
    'OK',
    'SLOW',
    'DOWN'
);


ALTER TYPE public."PingStatus" OWNER TO postgres;

--
-- Name: Priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Priority" AS ENUM (
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
);


ALTER TYPE public."Priority" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'SUPERADMIN',
    'ADMIN',
    'VIEWER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: ServiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServiceStatus" AS ENUM (
    'UNCHECKED',
    'RUNNING',
    'DEGRADED',
    'DOWN'
);


ALTER TYPE public."ServiceStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    "userId" text NOT NULL,
    action text NOT NULL,
    module text NOT NULL,
    "targetId" text,
    "targetName" text,
    detail jsonb,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: asset_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_categories (
    id text NOT NULL,
    name text NOT NULL,
    icon text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.asset_categories OWNER TO postgres;

--
-- Name: asset_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_photos (
    id text NOT NULL,
    "assetId" text NOT NULL,
    url text NOT NULL,
    caption text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.asset_photos OWNER TO postgres;

--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id text NOT NULL,
    "assetCode" text NOT NULL,
    name text NOT NULL,
    brand text,
    model text,
    "serialNumber" text,
    "categoryId" text NOT NULL,
    "locationId" text,
    "assignedTo" text,
    status public."AssetStatus" DEFAULT 'ACTIVE'::public."AssetStatus" NOT NULL,
    condition public."AssetCondition" DEFAULT 'GOOD'::public."AssetCondition" NOT NULL,
    "purchaseDate" timestamp(3) without time zone,
    "warrantyExpiry" timestamp(3) without time zone,
    "purchasePrice" numeric(65,30),
    vendor text,
    "vendorContact" text,
    "ipAddress" text,
    "macAddress" text,
    "osVersion" text,
    notes text,
    "qrCodeUrl" text,
    "rustdeskId" text,
    "guacamoleId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: issue_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue_photos (
    id text NOT NULL,
    "issueId" text NOT NULL,
    url text NOT NULL,
    type public."PhotoType" NOT NULL,
    caption text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.issue_photos OWNER TO postgres;

--
-- Name: issue_timelines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issue_timelines (
    id text NOT NULL,
    "issueId" text NOT NULL,
    action text NOT NULL,
    description text,
    "changedBy" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.issue_timelines OWNER TO postgres;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.issues (
    id text NOT NULL,
    "ticketNumber" text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "assetId" text,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    status public."IssueStatus" DEFAULT 'OPEN'::public."IssueStatus" NOT NULL,
    category text,
    "reportedById" text NOT NULL,
    "assignedToId" text,
    "resolvedAt" timestamp(3) without time zone,
    resolution text,
    "slaDeadline" timestamp(3) without time zone,
    "slaBreached" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.issues OWNER TO postgres;

--
-- Name: kanban_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kanban_cards (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "column" public."KanbanColumn" DEFAULT 'TODO'::public."KanbanColumn" NOT NULL,
    priority public."Priority" DEFAULT 'MEDIUM'::public."Priority" NOT NULL,
    "dueDate" timestamp(3) without time zone,
    "assignedToId" text,
    labels text[],
    "position" integer DEFAULT 0 NOT NULL,
    "relatedIssueId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kanban_cards OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id text NOT NULL,
    name text NOT NULL,
    floor text,
    building text
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: maintenance_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_logs (
    id text NOT NULL,
    "scheduleId" text NOT NULL,
    "assetId" text,
    "doneById" text NOT NULL,
    notes text,
    result text,
    "performedAt" timestamp(3) without time zone NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_logs OWNER TO postgres;

--
-- Name: maintenance_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_schedules (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    "assetId" text,
    category text,
    frequency text NOT NULL,
    "nextDueDate" timestamp(3) without time zone NOT NULL,
    "assignedToName" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.maintenance_schedules OWNER TO postgres;

--
-- Name: morning_checks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.morning_checks (
    id text NOT NULL,
    "checkDate" date NOT NULL,
    "filledById" text NOT NULL,
    "pingGoogle" public."PingStatus" DEFAULT 'UNCHECKED'::public."PingStatus" NOT NULL,
    "pingSimrs" public."PingStatus" DEFAULT 'UNCHECKED'::public."PingStatus" NOT NULL,
    "pingDatabase" public."PingStatus" DEFAULT 'UNCHECKED'::public."PingStatus" NOT NULL,
    "pingLatencyMs" jsonb,
    "simrsStatus" public."ServiceStatus" DEFAULT 'UNCHECKED'::public."ServiceStatus" NOT NULL,
    "pacsStatus" public."ServiceStatus" DEFAULT 'UNCHECKED'::public."ServiceStatus" NOT NULL,
    "unifiedStatus" public."ServiceStatus" DEFAULT 'UNCHECKED'::public."ServiceStatus" NOT NULL,
    "upsStatus" public."PhysicalStatus" DEFAULT 'UNCHECKED'::public."PhysicalStatus" NOT NULL,
    "cableStatus" public."PhysicalStatus" DEFAULT 'UNCHECKED'::public."PhysicalStatus" NOT NULL,
    "serverTempOk" boolean,
    "acStatus" public."PhysicalStatus" DEFAULT 'UNCHECKED'::public."PhysicalStatus" NOT NULL,
    "prtgAlertCount" integer DEFAULT 0 NOT NULL,
    "prtgAlerts" jsonb,
    "prtgNotes" text,
    "totalAP" integer DEFAULT 0 NOT NULL,
    "onlineAP" integer DEFAULT 0 NOT NULL,
    "offlineAPList" jsonb,
    notes text,
    "overallStatus" public."OverallStatus" DEFAULT 'NORMAL'::public."OverallStatus" NOT NULL,
    "completedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.morning_checks OWNER TO postgres;

--
-- Name: network_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.network_assets (
    id text NOT NULL,
    "assetId" text NOT NULL,
    "ipAddress" text NOT NULL,
    "macAddress" text,
    port integer,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.network_assets OWNER TO postgres;

--
-- Name: network_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.network_targets (
    id text NOT NULL,
    name text NOT NULL,
    host text NOT NULL,
    type text NOT NULL,
    port integer,
    "isActive" boolean DEFAULT true NOT NULL,
    category text
);


ALTER TABLE public.network_targets OWNER TO postgres;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    label text,
    "group" text,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'VIEWER'::public."Role" NOT NULL,
    avatar text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('650b9d56-75a6-4aff-b6ac-477689088723', '907a49044b5eee9dff592f055d1bcdc196a854493bdc3cc766de1fe1e9d5ed27', '2026-05-20 11:44:31.398466+08', '20260520034431_init', NULL, NULL, '2026-05-20 11:44:31.325537+08', 1);


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.activity_logs VALUES ('cmpla5zb00003ls4lf7m5151v', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:07:13.404');
INSERT INTO public.activity_logs VALUES ('cmpla67280005ls4lefv1ezav', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:07:23.456');
INSERT INTO public.activity_logs VALUES ('cmpla6b2l0007ls4la9lozze9', 'cmpe03ghz0000140azdmqfdbo', 'LOGOUT', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:07:28.654');
INSERT INTO public.activity_logs VALUES ('cmpla6iv30009ls4lhyyc261m', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:07:38.752');
INSERT INTO public.activity_logs VALUES ('cmplamsyy000bls4l8saq5454', 'cmpdiqmgl0000o6a58ogqwqsn', 'BACKUP', 'BACKUP', NULL, 'backup-2026-05-25T14-20-18-062Z.sql', '"{\"size\":36889}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:20:18.346');
INSERT INTO public.activity_logs VALUES ('cmplan0ko000dls4l676y6de3', 'cmpdiqmgl0000o6a58ogqwqsn', 'RESTORE', 'BACKUP', NULL, 'backup-2026-05-25T14-20-18-062Z.sql', '"{\"success\":true}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-25 14:20:28.201');
INSERT INTO public.activity_logs VALUES ('cmplxb1me0001fyib2920l0kc', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 00:55:00.853');
INSERT INTO public.activity_logs VALUES ('cmplxbjzz0005fyibf9mjjzda', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-05-25', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 00:55:24.672');
INSERT INTO public.activity_logs VALUES ('cmpm1pcwq0007fyibh1kuhlph', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 02:58:07.13');
INSERT INTO public.activity_logs VALUES ('cmpm1pxcj0009fyibp8gwryon', 'cmpg5hsx70000jawkd4c6ol8i', 'LOGIN', 'AUTH', NULL, 'sandyit@rsud.co.id', 'null', '::ffff:10.0.101.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 02:58:33.619');
INSERT INTO public.activity_logs VALUES ('cmpm22ush000jfyibnoi4g4yg', 'cmpg5hsx70000jawkd4c6ol8i', 'CREATE', 'INVENTORY', 'cmpm22urm000hfyibi3urquho', 'Printer', '"{\"assetCode\":\"PRI-2026-001\"}"', '::ffff:10.0.101.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 03:08:36.833');
INSERT INTO public.activity_logs VALUES ('cmpm2x1rj000pfyib44t4hoaw', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmpm2x1qq000nfyib3pl9cexs', 'AC PRO - MRO', '"{\"assetCode\":\"ACC-2026-001\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:32:05.551');
INSERT INTO public.activity_logs VALUES ('cmpm2yiok000rfyibr8d07nl6', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 03:33:14.132');
INSERT INTO public.activity_logs VALUES ('cmpm31gpl000vfyibqisad6s5', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmpm31gow000tfyibnqcfdcrc', 'AC PRO - MTR', '"{\"assetCode\":\"ACC-2026-002\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:35:31.546');
INSERT INTO public.activity_logs VALUES ('cmpm35hqc000zfyib0dst9vqw', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmpm35hpv000xfyibizdo7l88', 'AC PRO - HCU 1', '"{\"assetCode\":\"ACC-2026-003\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:38:39.492');
INSERT INTO public.activity_logs VALUES ('cmpm38sfr0013fyibsu391gof', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmpm38sfc0011fyib9m8u217r', 'AC PRO - HCU 2', '"{\"assetCode\":\"ACC-2026-004\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:41:13.335');


--
-- Data for Name: asset_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.asset_categories VALUES ('cmpdiqmgq0001o6a55qijvepi', 'PC', 'Monitor', 'Desktop Computer', '2026-05-20 03:45:04.058');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgs0002o6a5vnhcdt87', 'Laptop', 'Laptop', 'Notebook / Laptop', '2026-05-20 03:45:04.06');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgt0003o6a5dzlvk8xr', 'Printer', 'Printer', 'Printer & Multifunction', '2026-05-20 03:45:04.061');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgu0004o6a5oh7z52tq', 'Scanner', 'Scan', 'Document Scanner', '2026-05-20 03:45:04.062');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgv0005o6a59qxw4704', 'Access Point', 'Wifi', 'Wireless Access Point', '2026-05-20 03:45:04.063');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgw0006o6a5sxbbm78n', 'Switch', 'Network', 'Network Switch', '2026-05-20 03:45:04.064');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgx0007o6a5rznpcsos', 'UPS', 'Battery', 'Uninterruptible Power Supply', '2026-05-20 03:45:04.065');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgx0008o6a5on1r8h27', 'Server', 'Server', 'Server Hardware', '2026-05-20 03:45:04.066');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgy0009o6a5sid1qzp0', 'TV Pelayanan', 'Tv', 'Patient Information Display', '2026-05-20 03:45:04.067');
INSERT INTO public.asset_categories VALUES ('cmpdiqmgz000ao6a56mr5lki7', 'Mesin Antrol', 'Ticket', 'Queue Machine', '2026-05-20 03:45:04.068');
INSERT INTO public.asset_categories VALUES ('cmpdiqmh0000bo6a5mv54pd65', 'Finger Machine', 'Fingerprint', 'Attendance Device', '2026-05-20 03:45:04.068');
INSERT INTO public.asset_categories VALUES ('cmpfkb4nr0007ax87qimsuo8z', 'Router', 'Router', 'Network Router', '2026-05-21 14:04:32.728');


--
-- Data for Name: asset_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.assets VALUES ('cmpm22urm000hfyibi3urquho', 'PRI-2026-001', 'Printer', 'Epson', 'L121', 'RSUD-ASSET-PRNT-001-2026', 'cmpdiqmgt0003o6a5dzlvk8xr', 'cmpdiqmh9000lo6a5zlmneal0', 'Saskia Paraso', 'ACTIVE', 'GOOD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PRI-2026-001.png', NULL, NULL, '2026-05-26 03:08:36.802', '2026-05-26 03:23:43.885');
INSERT INTO public.assets VALUES ('cmpm31gow000tfyibnqcfdcrc', 'ACC-2026-002', 'AC PRO - MTR', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-002-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2gb4b0000fsf46g4s1ef4', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.2', 'd0:21:f9:30:24:fe', NULL, NULL, '/qrcodes/ACC-2026-002.png', NULL, NULL, '2026-05-26 03:35:31.52', '2026-05-26 03:35:31.541');
INSERT INTO public.assets VALUES ('cmpm2x1qq000nfyib3pl9cexs', 'ACC-2026-001', 'AC PRO - MRO', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-001-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30002fsf4evoh46je', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.7', 'd0:21:f9:23:c9:b8', NULL, NULL, '/qrcodes/ACC-2026-001.png', NULL, NULL, '2026-05-26 03:32:05.523', '2026-05-26 03:36:05.5');
INSERT INTO public.assets VALUES ('cmpm35hpv000xfyibizdo7l88', 'ACC-2026-003', 'AC PRO - HCU 1', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-003-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30003fsf4vux6a6he', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.3', 'd0:21:f9:30:26:d8', NULL, NULL, '/qrcodes/ACC-2026-003.png', NULL, NULL, '2026-05-26 03:38:39.476', '2026-05-26 03:38:50.598');
INSERT INTO public.assets VALUES ('cmpm38sfc0011fyib9m8u217r', 'ACC-2026-004', 'AC PRO - HCU 2', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-004-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30003fsf4vux6a6he', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.5', 'd0:21:f9:29:f8:8b', NULL, NULL, '/qrcodes/ACC-2026-004.png', NULL, NULL, '2026-05-26 03:41:13.32', '2026-05-26 03:41:13.332');
INSERT INTO public.assets VALUES ('cmpg754020008jawkqyoetk4j', 'PC-2026-002', 'PC MONITOR SERVER ', 'BUILT-UP', 'BUILT-UP', 'RSUD-ASSET-PC-001-2026', 'cmpdiqmgq0001o6a55qijvepi', 'cmpdiqmha000mo6a5nl6up25r', 'Tim IT', 'ACTIVE', 'GOOD', NULL, NULL, NULL, 'Gamers Gear', NULL, '10.0.101.207', '04-D4-C4-4C-2F-DB', 'Windows 10 Pro 64-bit', NULL, '/qrcodes/PC-2026-002.png', '72101851', NULL, '2026-05-22 00:43:43.106', '2026-05-26 03:42:12.376');
INSERT INTO public.assets VALUES ('cmpl35de20001hwd2v59eob0m', 'LAP-2026-001', 'LAPTOP ACER NITRO AN515-57', 'ACER', 'NITRO AN515-57', 'RSUD-ASSET-LAP-001-2026', 'cmpdiqmgs0002o6a5vnhcdt87', 'cmpdiqmha000mo6a5nl6up25r', 'Hein Herry Rambet. S.Kom', 'ACTIVE', 'GOOD', '2021-10-10 00:00:00', NULL, 18000000.000000000000000000000000000000, NULL, NULL, '192.168.1.158', '192.168.1.1', 'Windows 10 Pro', NULL, '/qrcodes/LAP-2026-001.png', '54 759 973', NULL, '2026-05-25 10:50:47.689', '2026-05-25 10:52:47.702');


--
-- Data for Name: issue_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: issue_timelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.issue_timelines VALUES ('cmpm1uwpf000dfyibdk0jh9l8', 'cmpm1uwpc000bfyib4ott6n8t', 'Tiket Dibuka', 'Tiket TKT-2026-0001 dibuat oleh cmpg5hsx70000jawkd4c6ol8i', 'cmpg5hsx70000jawkd4c6ol8i', '2026-05-26 03:02:26.068');
INSERT INTO public.issue_timelines VALUES ('cmpm1vhxu000ffyibllqc51a1', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED', 'IT_Sandy', '2026-05-26 03:02:53.586');
INSERT INTO public.issue_timelines VALUES ('cmpm2mo1k000lfyibdso6fp0o', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-05-26 03:24:01.208');


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.issues VALUES ('cmpm1uwpc000bfyib4ott6n8t', 'TKT-2026-0001', 'Printer tidak dapat mencetak', 'ink pad counter melebihi kapasitas (Bantalan tinta habis)', NULL, 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpg5hsx70000jawkd4c6ol8i', 'cmpg5hsx70000jawkd4c6ol8i', '2026-05-26 03:24:01.203', NULL, '2026-05-26 05:02:26.063', false, '2026-05-26 03:02:26.064', '2026-05-26 03:24:01.204');


--
-- Data for Name: kanban_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kanban_cards VALUES ('cmpl3dinc0005hwd2ud3kqcky', 'CHECK PRINTER', 'Pengecekan printer di seluruh rumah sakit', 'TODO', 'MEDIUM', '2026-05-26 00:00:00', NULL, '{Feature}', 0, NULL, '2026-05-25 10:57:07.752', '2026-05-25 10:57:07.752');
INSERT INTO public.kanban_cards VALUES ('cmpl3c4kq0003hwd280oqf1sq', 'INVENTARIS', 'Menginput semua inventaris menyangkut IT di seluruh rumah sakit', 'DONE', 'MEDIUM', '2026-05-26 00:00:00', NULL, '{Feature}', 0, NULL, '2026-05-25 10:56:02.858', '2026-05-26 03:42:50.052');


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.locations VALUES ('cmpdiqmh7000io6a5l2mn9jav', 'Ruang Perawatan Lumalundung', 'Lantai 2', 'Gedung Rawat Inap');
INSERT INTO public.locations VALUES ('cmpdiqmh8000jo6a5k6uykh4v', 'Ruang Perawatan Tumatenden', 'Lantai 3', 'Gedung Rawat Inap');
INSERT INTO public.locations VALUES ('cmpdiqmh8000ko6a51jy9bmct', 'Gudang Farmasi', 'Lantai 2', 'Gedung Hijau');
INSERT INTO public.locations VALUES ('cmpdiqmh1000co6a525xs6cl4', 'Server Room', 'Lantai 2', 'Gedung Hijau');
INSERT INTO public.locations VALUES ('cmpdiqmh3000do6a5plx3nwc1', 'IGD', 'Lantai 1', 'Gedung Orange');
INSERT INTO public.locations VALUES ('cmpdiqmh4000eo6a5on4fjswc', 'Radiologi', 'Lantai 2', 'Gedung Matuari');
INSERT INTO public.locations VALUES ('cmpdiqmh5000fo6a514zx0wr9', 'Laboratorium', 'Lantai 2', 'Gedung Lab');
INSERT INTO public.locations VALUES ('cmpdiqmh5000go6a5z2rnwfbb', 'Poli Umum', 'Lantai 2', 'Gedung Poliklinik');
INSERT INTO public.locations VALUES ('cmpdiqmh6000ho6a5f5xe1bao', 'Poli Gigi', 'Lantai 2', 'Gedung Poliklinik');
INSERT INTO public.locations VALUES ('cmpdiqmha000mo6a5nl6up25r', 'Ruang IT', 'Lantai 2', 'Gedung Utama');
INSERT INTO public.locations VALUES ('cmpm2gb4b0000fsf46g4s1ef4', 'Ruang Perawatan Matuari', 'Lantai 2', 'Lantai 2');
INSERT INTO public.locations VALUES ('cmpm2j8g20001fsf4p5thod8q', 'Filling MRO', 'Lantai 2', 'Gedung Hijau');
INSERT INTO public.locations VALUES ('cmpm2j8g30002fsf4evoh46je', 'Medical Record', 'Lantai 1', 'Gedung Hijau');
INSERT INTO public.locations VALUES ('cmpm2j8g30003fsf4vux6a6he', 'ICU', 'Lantai 1', 'Gedung Biru');
INSERT INTO public.locations VALUES ('cmpm2j8g30004fsf423f0mb1h', 'Nicu', 'Lantai 3', 'Gedung Perawatan');
INSERT INTO public.locations VALUES ('cmpm2j8g30005fsf4hyolaw61', 'Ruang Perawatan Anak', 'Lantai 2', NULL);
INSERT INTO public.locations VALUES ('cmpm2lfv40006fsf4msb3oylg', 'Kepegawaian', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpm2lfv40007fsf4036hu6h9', 'Perencanaan', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpm2lfv50008fsf45sxh6uy3', 'Satuan Pemeriksa Internal', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpdiqmh9000lo6a5zlmneal0', 'Keuangan', 'Lantai 3', 'Gedung Poliklinik ');


--
-- Data for Name: maintenance_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: maintenance_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: morning_checks; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.morning_checks VALUES ('cmpe07vt40002140akm8lbe8u', '2026-05-19', 'cmpe03ghz0000140azdmqfdbo', 'UNCHECKED', 'UNCHECKED', 'UNCHECKED', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'UNCHECKED', 'UNCHECKED', 'UNCHECKED', 'UNCHECKED', false, 'UNCHECKED', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-20 11:54:22.79', '2026-05-20 11:54:22.792', '2026-05-20 11:54:22.792');
INSERT INTO public.morning_checks VALUES ('cmpdwn80g000111byiw4ch3gu', '2026-05-19', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'DOWN', 'DOWN', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', true, 'OK', 0, NULL, '', 0, 0, '[]', 'Test morning check', 'NORMAL', '2026-05-20 15:35:37.582', '2026-05-20 10:14:19.984', '2026-05-20 15:35:37.583');
INSERT INTO public.morning_checks VALUES ('cmpfir78k0005yt70t8zplkrl', '2026-05-20', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'DOWN', 'DOWN', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', true, 'OK', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-21 13:29:53.856', '2026-05-21 13:21:03.333', '2026-05-21 13:29:53.857');
INSERT INTO public.morning_checks VALUES ('cmpg5letb0002jawkp01dhobh', '2026-05-21', 'cmpg5hsx70000jawkd4c6ol8i', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-22 00:00:24.382', '2026-05-22 00:00:24.383', '2026-05-22 00:00:24.383');
INSERT INTO public.morning_checks VALUES ('cmpge8rry001fjawk9v8mjjhr', '2026-05-21', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 33, 1, '[]', 'AC Dalam Tahap Perbaikan', 'WARNING', '2026-05-22 04:02:31.197', '2026-05-22 04:02:31.198', '2026-05-22 04:02:31.198');
INSERT INTO public.morning_checks VALUES ('cmpl8aqbt0001ls4le5daetzb', '2026-05-24', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'DOWN', 'DOWN', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-25 13:14:55.815', '2026-05-25 13:14:55.817', '2026-05-25 13:14:55.817');
INSERT INTO public.morning_checks VALUES ('cmplxbjzv0003fyibced245oj', '2026-05-25', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-26 00:55:24.666', '2026-05-26 00:55:24.667', '2026-05-26 00:55:24.667');


--
-- Data for Name: network_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: network_targets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.network_targets VALUES ('cmpdiqmhb000no6a5y5e0erkd', 'Google DNS', '8.8.8.8', 'ping', NULL, true, 'Internet');
INSERT INTO public.network_targets VALUES ('cmpdiqmhc000oo6a595xkmjs3', 'SIMRS Server', '10.0.101.192', 'ping', NULL, true, 'Server Aplikasi');
INSERT INTO public.network_targets VALUES ('cmpdiqmhd000po6a5fub5xmso', 'Database Server', '10.0.101.191', 'ping', NULL, true, 'Server Database');
INSERT INTO public.network_targets VALUES ('cmpdiqmhe000qo6a53rjhhct2', 'Unified Controller', '10.0.101.100', 'http', 8080, true, 'Jaringan');
INSERT INTO public.network_targets VALUES ('cmpdiqmhe000ro6a5uhsxdo0q', 'PACS Server', '10.0.101.193', 'ping', NULL, true, 'Server Aplikasi');
INSERT INTO public.network_targets VALUES ('cmpfkb4o5000oax879rz806sy', 'Google DNS', '8.8.8.8', 'ping', NULL, true, 'Internet');
INSERT INTO public.network_targets VALUES ('cmpfkb4o6000pax87lnyuztlv', 'SIMRS Server', '10.0.101.192', 'ping', NULL, true, 'Server Aplikasi');
INSERT INTO public.network_targets VALUES ('cmpfkb4o7000qax87srna8sn9', 'Database Server', '10.0.101.191', 'ping', NULL, true, 'Server Database');
INSERT INTO public.network_targets VALUES ('cmpfkb4o8000rax8740zj5j5t', 'Unified Controller', '10.0.101.100', 'http', 8080, true, 'Jaringan');
INSERT INTO public.network_targets VALUES ('cmpfkb4o9000sax87js2ey5uq', 'PACS Server', '10.0.101.193', 'ping', NULL, true, 'Server Aplikasi');


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.system_settings VALUES ('cmpdiqmhi000uo6a5s7xaiez7', 'sla_critical_hours', '2', 'SLA Critical (jam)', 'sla', '2026-05-20 03:45:04.087');
INSERT INTO public.system_settings VALUES ('cmpdiqmhj000vo6a5bwclp1bi', 'sla_high_hours', '8', 'SLA High (jam)', 'sla', '2026-05-20 03:45:04.087');
INSERT INTO public.system_settings VALUES ('cmpdiqmhk000wo6a5pkmfiqxk', 'sla_medium_hours', '24', 'SLA Medium (jam)', 'sla', '2026-05-20 03:45:04.088');
INSERT INTO public.system_settings VALUES ('cmpdiqmhk000xo6a55ov9p5y1', 'sla_low_hours', '72', 'SLA Low (jam)', 'sla', '2026-05-20 03:45:04.089');
INSERT INTO public.system_settings VALUES ('cmpdiqmhl000yo6a5m017zst9', 'repeat_failure_threshold', '3', 'Threshold Repeat Failure', 'alert', '2026-05-20 03:45:04.09');
INSERT INTO public.system_settings VALUES ('cmpdiqmhm000zo6a5y4dt3qoz', 'repeat_failure_days', '30', 'Window Repeat Failure (hari)', 'alert', '2026-05-20 03:45:04.09');
INSERT INTO public.system_settings VALUES ('cmpfkb4oi0013ax87jprlbvp5', 'hospital_phone', '(0431) 892811', 'Telepon RS', 'identity', '2026-05-22 03:57:09.344');
INSERT INTO public.system_settings VALUES ('cmpfkb4oj0015ax87jcjil8xw', 'hospital_website', 'www.rscontoh.id', 'Website RS', 'identity', '2026-05-22 03:57:09.344');
INSERT INTO public.system_settings VALUES ('cmpdiqmhm0010o6a5k7ia4dxv', 'it_head_name', 'Kepala IT', 'Nama Kepala IT', 'report', '2026-05-22 03:57:09.345');
INSERT INTO public.system_settings VALUES ('cmpdiqmhn0011o6a518y2yxz2', 'it_head_title', 'Kepala Divisi Teknologi Informasi', 'Jabatan Kepala IT', 'report', '2026-05-22 03:57:09.345');
INSERT INTO public.system_settings VALUES ('cmpfkb4ok0016ax87c8mjt3r9', 'report_header_text', 'LAPORAN IT RUMAH SAKIT', 'Header Laporan', 'report', '2026-05-22 03:57:09.346');
INSERT INTO public.system_settings VALUES ('cmpfkb4ol0017ax87s4tjsg24', 'report_footer_text', 'Dokumen ini adalah laporan resmi IT TEAM RSUD Maria Walanda Maramis', 'Footer Laporan', 'report', '2026-05-22 03:57:09.347');
INSERT INTO public.system_settings VALUES ('cmpfkb4ol0018ax87jj2osq49', 'app_name', 'IT TEAM', 'Nama Aplikasi', 'branding', '2026-05-22 03:57:09.347');
INSERT INTO public.system_settings VALUES ('cmpfkb4om0019ax878ct3ajqg', 'app_short_name', 'RSUD Maria Walanda Maramis', 'Nama Singkat', 'branding', '2026-05-22 03:57:09.348');
INSERT INTO public.system_settings VALUES ('cmpfkb4on001aax87xixbm9d8', 'primary_color', '#00E5FF', 'Warna Utama', 'branding', '2026-05-22 03:57:09.348');
INSERT INTO public.system_settings VALUES ('cmpfkb4oi0014ax87ks538fa6', 'hospital_email', 'rsudmwm.minut@gmail.com', 'Email RS', 'identity', '2026-05-22 03:57:09.34');
INSERT INTO public.system_settings VALUES ('cmpdiqmhf000so6a5zld79ez0', 'hospital_name', 'RSUD Maria Walanda Maramis', 'Nama Rumah Sakit', 'identity', '2026-05-22 03:57:09.343');
INSERT INTO public.system_settings VALUES ('cmpdiqmhh000to6a5udzg03mi', 'hospital_address', 'Jl. Arnold Mononutu Kelurahan Sarongsong II Kecamatan Airmadidi Kabupaten Minahasa Utara, Sulawesi Utara, Indonesia', 'Alamat RS', 'identity', '2026-05-22 03:57:09.343');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('cmpdiqmgl0000o6a58ogqwqsn', 'Super Admin', 'superadmin@rumahsakit.id', '$2a$10$93E7wuDvG.c9kw8NIKwXyO4hkuBK.uNrfmmkT1HFtNiVvkEnwilam', 'SUPERADMIN', NULL, true, '2026-05-20 03:45:04.053', '2026-05-20 03:45:04.053');
INSERT INTO public.users VALUES ('cmpe03ghz0000140azdmqfdbo', 'IT_Support_Herry', 'herryrambet@gmail.com', '$2a$10$58.8C8XT8vmKeEirIs8j7e4W1BNo/7utcpSpIwwgZpQ/ypvEcgY26', 'ADMIN', NULL, true, '2026-05-20 11:50:56.328', '2026-05-20 11:51:14.198');
INSERT INTO public.users VALUES ('cmpg5hsx70000jawkd4c6ol8i', 'IT_Sandy', 'sandyit@rsud.co.id', '$2a$10$3UmUb3bz1Mbwtq3jjwevquJ6KA0AT3RrXAChEuhdVQGEg3T567IrO', 'ADMIN', NULL, true, '2026-05-21 23:57:36.044', '2026-05-21 23:57:36.044');
INSERT INTO public.users VALUES ('cmpgd9qpe0009jawktjbk1x6m', 'IT_Natan', 'natanaellengkong07@gmail.com', '$2a$10$5IjYbof3SuT1mFtdElapj.CLUmsIYLSZ8tbncah4YseyzJmlasQc.', 'ADMIN', NULL, true, '2026-05-22 03:35:16.851', '2026-05-22 03:35:16.851');


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: asset_categories asset_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_categories
    ADD CONSTRAINT asset_categories_pkey PRIMARY KEY (id);


--
-- Name: asset_photos asset_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_photos
    ADD CONSTRAINT asset_photos_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: issue_photos issue_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_photos
    ADD CONSTRAINT issue_photos_pkey PRIMARY KEY (id);


--
-- Name: issue_timelines issue_timelines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_timelines
    ADD CONSTRAINT issue_timelines_pkey PRIMARY KEY (id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: kanban_cards kanban_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT kanban_cards_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintenance_logs maintenance_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT maintenance_logs_pkey PRIMARY KEY (id);


--
-- Name: maintenance_schedules maintenance_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_schedules
    ADD CONSTRAINT maintenance_schedules_pkey PRIMARY KEY (id);


--
-- Name: morning_checks morning_checks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.morning_checks
    ADD CONSTRAINT morning_checks_pkey PRIMARY KEY (id);


--
-- Name: network_assets network_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.network_assets
    ADD CONSTRAINT network_assets_pkey PRIMARY KEY (id);


--
-- Name: network_targets network_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.network_targets
    ADD CONSTRAINT network_targets_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: asset_categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX asset_categories_name_key ON public.asset_categories USING btree (name);


--
-- Name: assets_assetCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "assets_assetCode_key" ON public.assets USING btree ("assetCode");


--
-- Name: issues_ticketNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "issues_ticketNumber_key" ON public.issues USING btree ("ticketNumber");


--
-- Name: locations_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX locations_name_key ON public.locations USING btree (name);


--
-- Name: morning_checks_checkDate_filledById_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "morning_checks_checkDate_filledById_key" ON public.morning_checks USING btree ("checkDate", "filledById");


--
-- Name: system_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: activity_logs activity_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_photos asset_photos_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_photos
    ADD CONSTRAINT "asset_photos_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assets assets_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public.asset_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: assets assets_locationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT "assets_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: issue_photos issue_photos_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_photos
    ADD CONSTRAINT "issue_photos_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issue_timelines issue_timelines_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_timelines
    ADD CONSTRAINT "issue_timelines_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: issues issues_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: issues issues_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: issues issues_reportedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT "issues_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: kanban_cards kanban_cards_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kanban_cards
    ADD CONSTRAINT "kanban_cards_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_logs maintenance_logs_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT "maintenance_logs_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: maintenance_logs maintenance_logs_doneById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT "maintenance_logs_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: maintenance_logs maintenance_logs_scheduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_logs
    ADD CONSTRAINT "maintenance_logs_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES public.maintenance_schedules(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: morning_checks morning_checks_filledById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.morning_checks
    ADD CONSTRAINT "morning_checks_filledById_fkey" FOREIGN KEY ("filledById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: network_assets network_assets_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.network_assets
    ADD CONSTRAINT "network_assets_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict 0A0PJSMHItLZn3TMJWwTalXmIpzuwsL08ahwielJDTaYQFEzBgqt8T9aUXIv7gd

