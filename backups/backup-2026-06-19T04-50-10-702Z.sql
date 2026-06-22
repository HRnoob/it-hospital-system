--
-- PostgreSQL database dump
--

\restrict Rc7wRUNjHvGDVGryCAQtOJ61PfyNKfeSrHeh6fMerGznBqX11z4x5y8iZ4nTkgm

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

--
-- Name: SupportLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SupportLevel" AS ENUM (
    'L1',
    'L2',
    'L3'
);


ALTER TYPE public."SupportLevel" OWNER TO postgres;

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
-- Name: asset_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_movements (
    id text NOT NULL,
    "assetId" text NOT NULL,
    "fromLocationId" text,
    "toLocationId" text,
    "movedById" text NOT NULL,
    reason text,
    notes text,
    "movedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.asset_movements OWNER TO postgres;

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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "supportLevel" public."SupportLevel" DEFAULT 'L1'::public."SupportLevel" NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('650b9d56-75a6-4aff-b6ac-477689088723', '907a49044b5eee9dff592f055d1bcdc196a854493bdc3cc766de1fe1e9d5ed27', '2026-05-20 11:44:31.398466+08', '20260520034431_init', NULL, NULL, '2026-05-20 11:44:31.325537+08', 1);
INSERT INTO public._prisma_migrations VALUES ('53fd5e4a-205e-46e3-bc65-f6982b5f7ed7', '87174fed6276149eaefa737f412f5d9ba534680b3027d98cc5a651e68e416f7a', '2026-06-08 14:36:42.598356+08', '20260608063642_add_asset_movements', NULL, NULL, '2026-06-08 14:36:42.521578+08', 1);
INSERT INTO public._prisma_migrations VALUES ('f6992acd-f2d8-492d-849b-980615b99dcb', '13f528b8d6366959775c2b77d5769660542ab875ff55c6912cd582cbb4e25032', '2026-06-08 15:08:44.411003+08', '20260608070844_add_support_level', NULL, NULL, '2026-06-08 15:08:44.400697+08', 1);


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
INSERT INTO public.activity_logs VALUES ('cmpm3byum0015fyib6t7d6xbc', 'cmpdiqmgl0000o6a58ogqwqsn', 'BACKUP', 'BACKUP', NULL, 'backup-2026-05-26T03-43-41-078Z.sql', '"{\"size\":45418}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:43:41.477');
INSERT INTO public.activity_logs VALUES ('cmpm3icsu0017fyib7hfn08v8', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:48:39.63');
INSERT INTO public.activity_logs VALUES ('cmpm3inbe0019fyibqt3ig9uy', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 03:48:53.258');
INSERT INTO public.activity_logs VALUES ('cmpm40ok7001ffyibuvy1hs46', 'cmpdiqmgl0000o6a58ogqwqsn', 'UPDATE', 'MORNING_CHECK', NULL, 'Morning check 2026-05-25', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-26 04:02:54.679');
INSERT INTO public.activity_logs VALUES ('cmpm4ltys001ifyibbeh4z70u', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 04:19:21.461');
INSERT INTO public.activity_logs VALUES ('cmpm4mrhu001kfyib5fxckljl', 'cmpe03ghz0000140azdmqfdbo', 'LOGOUT', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-05-26 04:20:04.914');
INSERT INTO public.activity_logs VALUES ('cmpsabv2m0001y2ivq5xk2w6q', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-05-30 11:46:11.086');
INSERT INTO public.activity_logs VALUES ('cmpvyyovn0001126s2cdv4ndg', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-02 01:39:05.458');
INSERT INTO public.activity_logs VALUES ('cmpvyzfnn0005126sko499sl4', 'cmpe03ghz0000140azdmqfdbo', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-01', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-02 01:39:40.163');
INSERT INTO public.activity_logs VALUES ('cmpw1w45g0007126ssh3ry74x', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-02 03:01:04.132');
INSERT INTO public.activity_logs VALUES ('cmpw5scee0009126snhqspn8i', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-02 04:50:06.662');
INSERT INTO public.activity_logs VALUES ('cmpz3jg3w0001q5nf3yi5thmi', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::ffff:10.0.101.197', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-04 06:10:30.859');
INSERT INTO public.activity_logs VALUES ('cmpz3jvjm0005q5nfoy8o0luz', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-03', '"{\"overallStatus\":\"NORMAL\"}"', '::ffff:10.0.101.197', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-04 06:10:50.866');
INSERT INTO public.activity_logs VALUES ('cmpz4642c000jq5nf51aj6p2p', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::ffff:10.5.51.49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-04 06:28:08.34');
INSERT INTO public.activity_logs VALUES ('cmpz4ajl6000nq5nf6w46yxxv', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmpz4ajke000lq5nfvu26njgs', 'DESKTOP-D2L01EP [01]', '"{\"assetCode\":\"PC-2026-003\"}"', '::ffff:10.5.51.49', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-04 06:31:35.082');
INSERT INTO public.activity_logs VALUES ('cmpzdq4s0000rq5nfc2jguoer', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-04 10:55:38.929');
INSERT INTO public.activity_logs VALUES ('cmq0pa4lc00017vuwkmpby30o', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-05 09:06:53.759');
INSERT INTO public.activity_logs VALUES ('cmq0pams500057vuww4x4xdkf', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-04', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-05 09:07:17.333');
INSERT INTO public.activity_logs VALUES ('cmq0pdbup00097vuwm8hbtyyi', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmq0pdbtp00077vuwnhg0znyg', 'Printer Medical Record', '"{\"assetCode\":\"PRI-2026-002\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-05 09:09:23.137');
INSERT INTO public.activity_logs VALUES ('cmq2cl2680001nfvbbg8dk3em', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-06 12:47:01.184');
INSERT INTO public.activity_logs VALUES ('cmq2cp96d0005nfvbehm4hgiw', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmq2cp95f0003nfvb978yxlh8', 'PC ALL IN ONE ', '"{\"assetCode\":\"PC-2026-004\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-06 12:50:16.885');
INSERT INTO public.activity_logs VALUES ('cmq4iec3k0001s3pzutccma4p', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 01:05:17.503');
INSERT INTO public.activity_logs VALUES ('cmq4ievds0005s3pzdjcsxv0t', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-07', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 01:05:42.496');
INSERT INTO public.activity_logs VALUES ('cmq4k4dqi0009s3pz6w7uc1ky', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-08 01:53:32.298');
INSERT INTO public.activity_logs VALUES ('cmq4tc9qh000bs3pz847jopm0', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 06:11:36.905');
INSERT INTO public.activity_logs VALUES ('cmq4u33ah000js3pz7epvuue9', 'cmpdiqmgl0000o6a58ogqwqsn', 'BACKUP', 'BACKUP', NULL, 'backup-2026-06-08T06-32-27-771Z.sql', '"{\"size\":62918}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 06:32:28.265');
INSERT INTO public.activity_logs VALUES ('cmq4uw1x70003ppvxg8zwntug', 'cmpdiqmgl0000o6a58ogqwqsn', 'MOVE', 'INVENTORY', 'cmq2cp95f0003nfvb978yxlh8', 'PC ALL IN ONE ', '"{\"fromLocation\":\"Ruang IT\",\"toLocation\":\"Ruang IT\",\"reason\":\"Penggantian\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 06:54:59.516');
INSERT INTO public.activity_logs VALUES ('cmq4vrtlm0001ez9mf8oma24u', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:19:41.722');
INSERT INTO public.activity_logs VALUES ('cmq4w18qg0004ez9mtgdliprm', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:27:01.24');
INSERT INTO public.activity_logs VALUES ('cmq4w1sap0006ez9mc9n3uj73', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:27:26.593');
INSERT INTO public.activity_logs VALUES ('cmq4w22el0008ez9mtcyr50fi', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:27:39.694');
INSERT INTO public.activity_logs VALUES ('cmq4w2z6v000aez9mkkg3ko03', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:28:22.183');
INSERT INTO public.activity_logs VALUES ('cmq4w3tze000dez9mt57v8ga7', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:29:02.09');
INSERT INTO public.activity_logs VALUES ('cmq4w42e1000fez9me7j6uw1q', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:29:12.986');
INSERT INTO public.activity_logs VALUES ('cmq4w9eti0001ka4vc6c3wovb', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:33:22.374');
INSERT INTO public.activity_logs VALUES ('cmq4w9ncd0003ka4vjrkisvn1', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:33:33.422');
INSERT INTO public.activity_logs VALUES ('cmq4wibaz00018j7gmss5f1vk', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:40:17.723');
INSERT INTO public.activity_logs VALUES ('cmq4wiben00038j7g6pkhdmg5', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:40:17.723');
INSERT INTO public.activity_logs VALUES ('cmq4widdn00058j7gl7pp9g5a', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:40:20.412');
INSERT INTO public.activity_logs VALUES ('cmq4wiohc00078j7gbo51p4fb', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:40:34.801');
INSERT INTO public.activity_logs VALUES ('cmq4wob1j0001jghf9hdvdbug', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:44:57.32');
INSERT INTO public.activity_logs VALUES ('cmq4wu7rj0001c1b0lx9vaxla', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:49:33.007');
INSERT INTO public.activity_logs VALUES ('cmq4wzy1n0001w8yd27x1z3je', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:54:00.347');
INSERT INTO public.activity_logs VALUES ('cmq4x07d10003w8ydnqmr2x7f', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:54:12.421');
INSERT INTO public.activity_logs VALUES ('cmq4x0l6l0005w8ydzll8bu12', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:54:30.333');
INSERT INTO public.activity_logs VALUES ('cmq4x0vl90007w8ydohuswyh1', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGIN', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:54:43.821');
INSERT INTO public.activity_logs VALUES ('cmq4x3ggp000bw8yd69jet56o', 'cmq4w3r8s000bez9mj5i1qw6m', 'ESCALATE', 'ISSUE', 'cmq4w6jr70001pnk7m3iprvim', 'kerusakan printer igd', '"{\"from\":\"L1\",\"to\":\"L2\",\"assignedTo\":\"IT_Support_Herry\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:56:44.185');
INSERT INTO public.activity_logs VALUES ('cmq4x6b39000dw8yd2ul2922d', 'cmq4w3r8s000bez9mj5i1qw6m', 'LOGOUT', 'AUTH', NULL, 'teknisirs@rsudmwm.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:58:57.19');
INSERT INTO public.activity_logs VALUES ('cmq4x6jea000fw8ydt29geoxg', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-08 07:59:07.954');
INSERT INTO public.activity_logs VALUES ('cmq4x8p96000hw8yd5mt89ir9', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-08 08:00:48.858');
INSERT INTO public.activity_logs VALUES ('cmq8tg8wz0001109g57fmq7hd', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 01:25:47.17');
INSERT INTO public.activity_logs VALUES ('cmq8tglm70005109gnr1uvype', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-10', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 01:26:03.631');
INSERT INTO public.activity_logs VALUES ('cmq8tlrig000f109ga568piok', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmq8tlrhl000d109gzjxkexn4', 'PRINTER', '"{\"assetCode\":\"PRI-2026-003\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 01:30:04.553');
INSERT INTO public.activity_logs VALUES ('cmq8u4ocb000r109gg02ut7np', 'cmpg5hsx70000jawkd4c6ol8i', 'LOGIN', 'AUTH', NULL, 'sandyit@rsud.co.id', 'null', '::ffff:10.0.101.138', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-11 01:44:46.907');
INSERT INTO public.activity_logs VALUES ('cmq8z19uv000t109g6dlwzckw', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 04:02:06.247');
INSERT INTO public.activity_logs VALUES ('cmq8z2juo000v109gxgcku9uq', 'cmpgd9qpe0009jawktjbk1x6m', 'LOGIN', 'AUTH', NULL, 'natanaellengkong07@gmail.com', 'null', '::ffff:10.0.101.133', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-11 04:03:05.856');
INSERT INTO public.activity_logs VALUES ('cmq94svxb000x109gkya8ki8i', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 06:43:32.639');
INSERT INTO public.activity_logs VALUES ('cmq94wyh80015109gmo2t0y46', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::ffff:10.0.101.131', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 06:46:42.573');
INSERT INTO public.activity_logs VALUES ('cmq98ibz30017109gca32sz6x', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 08:27:18.687');
INSERT INTO public.activity_logs VALUES ('cmq98pbmt001d109gupmt7frr', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmq98pblz001b109g4uj9phum', 'PC ALL IN ONE', '"{\"assetCode\":\"PC-2026-005\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-11 08:32:44.837');
INSERT INTO public.activity_logs VALUES ('cmqawziql0001mhlpwftkswvb', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-12 12:40:17.564');
INSERT INTO public.activity_logs VALUES ('cmqax00510005mhlpbv2excgi', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-11', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-12 12:40:40.118');
INSERT INTO public.activity_logs VALUES ('cmqeg2w7b00018mz4i4b2uvk9', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-14 23:58:06.214');
INSERT INTO public.activity_logs VALUES ('cmqeg3oqv00058mz46abewzpt', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-14', '"{\"overallStatus\":\"NORMAL\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-14 23:58:43.207');
INSERT INTO public.activity_logs VALUES ('cmqein2fd00078mz44pzzk016', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 01:09:46.634');
INSERT INTO public.activity_logs VALUES ('cmqeitcl4000n8mz40z7l2h3e', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmqeitck8000l8mz4i1efechy', 'Printer Medical Record (IGD)', '"{\"assetCode\":\"PRI-2026-004\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 01:14:39.737');
INSERT INTO public.activity_logs VALUES ('cmqejs2ib000v8mz45qbxgeeq', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGOUT', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 01:41:39.61');
INSERT INTO public.activity_logs VALUES ('cmqejsbjc000x8mz4n6irpn3w', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 01:41:51.336');
INSERT INTO public.activity_logs VALUES ('cmqekyttt000186rijqvuegkj', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-15 02:14:54.593');
INSERT INTO public.activity_logs VALUES ('cmqk5ez5h0001js04yvl11atv', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', 'null', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-18 23:46:11.187');
INSERT INTO public.activity_logs VALUES ('cmqk5ffdx0005js04bl94be94', 'cmpe03ghz0000140azdmqfdbo', 'CREATE', 'MORNING_CHECK', NULL, 'Morning check 2026-06-18', '"{\"overallStatus\":\"NORMAL\"}"', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-18 23:46:32.23');
INSERT INTO public.activity_logs VALUES ('cmqk5myl50007js04vsqi8r40', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', 'null', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-18 23:52:23.705');
INSERT INTO public.activity_logs VALUES ('cmqk5z7tq000njs04ti66a11m', 'cmpdiqmgl0000o6a58ogqwqsn', 'CREATE', 'INVENTORY', 'cmqk5z7sm000ljs04wy63mh5x', 'KIOSK', '"{\"assetCode\":\"MES-2026-001\"}"', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-19 00:01:55.55');
INSERT INTO public.activity_logs VALUES ('cmqk7xhtv00011gj1hof5020l', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-19 00:56:34.435');
INSERT INTO public.activity_logs VALUES ('cmqk850zq0001vvzzc483a3lk', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-19 01:02:25.863');
INSERT INTO public.activity_logs VALUES ('cmqk85fhm0003vvzz4775oncq', 'cmpe03ghz0000140azdmqfdbo', 'LOGIN', 'AUTH', NULL, 'herryrambet@gmail.com', NULL, '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-19 01:02:44.651');
INSERT INTO public.activity_logs VALUES ('cmqk870140009vvzzcviqko0n', 'cmpe03ghz0000140azdmqfdbo', 'ESCALATE', 'ISSUE', 'cmq8ti2260007109g7a0ye6he', 'PC AIO KASIR MRO TIDAK BERFUNGSI', '"{\"from\":\"L1\",\"to\":\"L2\",\"assignedTo\":\"IT_Support_Herry\"}"', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-19 01:03:57.929');
INSERT INTO public.activity_logs VALUES ('cmqk87bry000dvvzzx5rw9mox', 'cmpe03ghz0000140azdmqfdbo', 'ESCALATE', 'ISSUE', 'cmq2cqrx10007nfvba5pqdy6u', 'PC RUANGAN WALANG SENDOW TIDAK BERFUNGSI', '"{\"from\":\"L1\",\"to\":\"L2\",\"assignedTo\":\"IT_Support_Herry\"}"', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-19 01:04:13.151');
INSERT INTO public.activity_logs VALUES ('cmqk87qko000hvvzzu7rqskrq', 'cmpe03ghz0000140azdmqfdbo', 'ESCALATE', 'ISSUE', 'cmq8ti2260007109g7a0ye6he', 'PC AIO KASIR MRO TIDAK BERFUNGSI', '"{\"from\":\"L1\",\"to\":\"L2\",\"assignedTo\":\"IT_Support_Herry\"}"', '::ffff:10.0.101.207', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '2026-06-19 01:04:32.329');
INSERT INTO public.activity_logs VALUES ('cmqkesyed0001bhzzws2rsxp2', 'cmpdiqmgl0000o6a58ogqwqsn', 'LOGIN', 'AUTH', NULL, 'superadmin@rumahsakit.id', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '2026-06-19 04:08:59.941');


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
-- Data for Name: asset_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.asset_movements VALUES ('cmq4uw1x30001ppvxyjn0foa0', 'cmq2cp95f0003nfvb978yxlh8', 'cmpdiqmha000mo6a5nl6up25r', 'cmpdiqmha000mo6a5nl6up25r', 'cmpdiqmgl0000o6a58ogqwqsn', 'Penggantian', 'Kerusakan HDD yang menyebabkan Windows Error / Tidak terbaca', '2026-06-08 06:54:59.511');


--
-- Data for Name: asset_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.assets VALUES ('cmpz4ajke000lq5nfvu26njgs', 'PC-2026-003', 'DESKTOP-D2L01EP [01]', 'Rakitan', 'Rakitan', NULL, 'cmpdiqmgq0001o6a55qijvepi', 'cmpm2j8g30005fsf4hyolaw61', 'Kepala Ruangan Klabat', 'ACTIVE', 'EXCELLENT', '2026-06-04 00:00:00', '2027-06-04 00:00:00', 6799998.000000000000000000000000000000, 'CV. SAKIDJAH HIDAYAH', NULL, NULL, NULL, 'Windows 10 Pro', NULL, '/qrcodes/PC-2026-003.png', NULL, NULL, '2026-06-04 06:31:35.055', '2026-06-08 06:49:52.541');
INSERT INTO public.assets VALUES ('cmpm31gow000tfyibnqcfdcrc', 'ACC-2026-002', 'AC PRO - MTR', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-002-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2gb4b0000fsf46g4s1ef4', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.2', 'd0:21:f9:30:24:fe', NULL, NULL, '/qrcodes/ACC-2026-002.png', NULL, NULL, '2026-05-26 03:35:31.52', '2026-05-26 03:35:31.541');
INSERT INTO public.assets VALUES ('cmpm2x1qq000nfyib3pl9cexs', 'ACC-2026-001', 'AC PRO - MRO', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-001-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30002fsf4evoh46je', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.7', 'd0:21:f9:23:c9:b8', NULL, NULL, '/qrcodes/ACC-2026-001.png', NULL, NULL, '2026-05-26 03:32:05.523', '2026-05-26 03:36:05.5');
INSERT INTO public.assets VALUES ('cmq2cp95f0003nfvb978yxlh8', 'PC-2026-004', 'PC ALL IN ONE ', 'HP', 'HP 24 inch All-in-One Desktop PC 24-cb1021d', NULL, 'cmpdiqmgq0001o6a55qijvepi', 'cmpdiqmha000mo6a5nl6up25r', 'RU Walang Sendow', 'INACTIVE', 'BROKEN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PC-2026-004.png', NULL, NULL, '2026-06-06 12:50:16.851', '2026-06-08 06:54:59.508');
INSERT INTO public.assets VALUES ('cmpm35hpv000xfyibizdo7l88', 'ACC-2026-003', 'AC PRO - HCU 1', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-003-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30003fsf4vux6a6he', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.3', 'd0:21:f9:30:26:d8', NULL, NULL, '/qrcodes/ACC-2026-003.png', NULL, NULL, '2026-05-26 03:38:39.476', '2026-05-26 03:38:50.598');
INSERT INTO public.assets VALUES ('cmpm38sfc0011fyib9m8u217r', 'ACC-2026-004', 'AC PRO - HCU 2', 'UBIQUITI', 'UniFi UAP-AC-PRO', 'RSUD-ASSET-ACP-004-2026', 'cmpdiqmgv0005o6a59qxw4704', 'cmpm2j8g30003fsf4vux6a6he', 'IT', 'ACTIVE', 'EXCELLENT', NULL, NULL, NULL, NULL, NULL, '10.0.101.5', 'd0:21:f9:29:f8:8b', NULL, NULL, '/qrcodes/ACC-2026-004.png', NULL, NULL, '2026-05-26 03:41:13.32', '2026-05-26 03:41:13.332');
INSERT INTO public.assets VALUES ('cmpg754020008jawkqyoetk4j', 'PC-2026-002', 'PC MONITOR SERVER ', 'BUILT-UP', 'BUILT-UP', 'RSUD-ASSET-PC-001-2026', 'cmpdiqmgq0001o6a55qijvepi', 'cmpdiqmha000mo6a5nl6up25r', 'Tim IT', 'ACTIVE', 'GOOD', NULL, NULL, NULL, 'Gamers Gear', NULL, '10.0.101.207', '04-D4-C4-4C-2F-DB', 'Windows 10 Pro 64-bit', NULL, '/qrcodes/PC-2026-002.png', '72101851', NULL, '2026-05-22 00:43:43.106', '2026-05-26 03:52:52.013');
INSERT INTO public.assets VALUES ('cmq0pdbtp00077vuwnhg0znyg', 'PRI-2026-002', 'Printer Medical Record', 'EPSON', 'EPSON L121', 'PRI-2026-002', 'cmpdiqmgt0003o6a5dzlvk8xr', 'cmpm2j8g30002fsf4evoh46je', 'Winan', 'ACTIVE', 'GOOD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PRI-2026-002.png', NULL, NULL, '2026-06-05 09:09:23.102', '2026-06-05 09:09:23.129');
INSERT INTO public.assets VALUES ('cmq8tlrhl000d109gzjxkexn4', 'PRI-2026-003', 'Printer Gudang Farmasi', 'EPSON', 'L3110', NULL, 'cmpdiqmgt0003o6a5dzlvk8xr', 'cmpdiqmh8000ko6a51jy9bmct', 'Kepala Ruangan Farmasi', 'ACTIVE', 'GOOD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PRI-2026-003.png', NULL, NULL, '2026-06-11 01:30:04.521', '2026-06-11 01:34:04.336');
INSERT INTO public.assets VALUES ('cmpl35de20001hwd2v59eob0m', 'LAP-2026-001', 'LAPTOP ACER NITRO AN515-57', 'ACER', 'NITRO AN515-57', 'RSUD-ASSET-LAP-001-2026', 'cmpdiqmgs0002o6a5vnhcdt87', 'cmpdiqmha000mo6a5nl6up25r', 'Hein Herry Rambet. S.Kom', 'ACTIVE', 'GOOD', '2021-10-10 00:00:00', NULL, 18000000.000000000000000000000000000000, NULL, NULL, '192.168.1.158', '192.168.1.1', 'Windows 10 Pro', NULL, '/qrcodes/LAP-2026-001.png', '54 759 973', NULL, '2026-05-25 10:50:47.689', '2026-05-25 10:52:47.702');
INSERT INTO public.assets VALUES ('cmpm22urm000hfyibi3urquho', 'PRI-2026-001', 'Printer Keuangan', 'Epson', 'L121', 'RSUD-ASSET-PRNT-001-2026', 'cmpdiqmgt0003o6a5dzlvk8xr', 'cmpdiqmh9000lo6a5zlmneal0', 'Saskia Paraso', 'ACTIVE', 'GOOD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PRI-2026-001.png', NULL, NULL, '2026-05-26 03:08:36.802', '2026-06-11 01:34:19.547');
INSERT INTO public.assets VALUES ('cmq98pblz001b109g4uj9phum', 'PC-2026-005', 'PC ALL IN ONE', 'HP', 'All-in-One Desktop PC 24-cb1021d', NULL, 'cmpdiqmgq0001o6a55qijvepi', 'cmpdiqmh3000do6a5plx3nwc1', 'Kasir IGD', 'INACTIVE', 'BROKEN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PC-2026-005.png', NULL, NULL, '2026-06-11 08:32:44.808', '2026-06-11 08:32:44.832');
INSERT INTO public.assets VALUES ('cmqeitck8000l8mz4i1efechy', 'PRI-2026-004', 'Printer Medical Record (IGD)', 'Epson', 'Epson L121', NULL, 'cmpdiqmgt0003o6a5dzlvk8xr', 'cmpdiqmh3000do6a5plx3nwc1', NULL, 'ACTIVE', 'GOOD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '/qrcodes/PRI-2026-004.png', NULL, NULL, '2026-06-15 01:14:39.704', '2026-06-15 01:14:39.731');
INSERT INTO public.assets VALUES ('cmqk5z7sm000ljs04wy63mh5x', 'MES-2026-001', 'KIOSK', 'iMiN', 'iMiN s1 RK3288W', NULL, 'cmpdiqmgz000ao6a56mr5lki7', 'cmpm2j8g30002fsf4evoh46je', 'BPJS KIOSK', 'ACTIVE', 'GOOD', NULL, NULL, NULL, 'Transmedic', NULL, NULL, NULL, 'Android 7.1', NULL, '/qrcodes/MES-2026-001.png', NULL, NULL, '2026-06-19 00:01:55.51', '2026-06-19 00:01:55.542');


--
-- Data for Name: issue_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: issue_timelines; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.issue_timelines VALUES ('cmpm1uwpf000dfyibdk0jh9l8', 'cmpm1uwpc000bfyib4ott6n8t', 'Tiket Dibuka', 'Tiket TKT-2026-0001 dibuat oleh cmpg5hsx70000jawkd4c6ol8i', 'cmpg5hsx70000jawkd4c6ol8i', '2026-05-26 03:02:26.068');
INSERT INTO public.issue_timelines VALUES ('cmpm1vhxu000ffyibllqc51a1', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED', 'IT_Sandy', '2026-05-26 03:02:53.586');
INSERT INTO public.issue_timelines VALUES ('cmpm2mo1k000lfyibdso6fp0o', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-05-26 03:24:01.208');
INSERT INTO public.issue_timelines VALUES ('cmpm3v9mg001bfyib29bhyts1', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Status berubah dari RESOLVED menjadi CLOSED', 'Super Admin', '2026-05-26 03:58:42.04');
INSERT INTO public.issue_timelines VALUES ('cmpm3vlqk001dfyibnrigfsie', 'cmpm1uwpc000bfyib4ott6n8t', 'Update Tiket', 'Status berubah dari CLOSED menjadi RESOLVED', 'Super Admin', '2026-05-26 03:58:57.74');
INSERT INTO public.issue_timelines VALUES ('cmpz3m4ij0009q5nfii268qt7', 'cmpz3m4if0007q5nfumuoz9a9', 'Tiket Dibuka', 'Tiket TKT-2026-0002 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-04 06:12:35.803');
INSERT INTO public.issue_timelines VALUES ('cmpz3mff7000bq5nf4jx7whxt', 'cmpz3m4if0007q5nfumuoz9a9', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-04 06:12:49.939');
INSERT INTO public.issue_timelines VALUES ('cmpz3nr99000fq5nfpu2rfg6s', 'cmpz3nr98000dq5nfyv43ukf9', 'Tiket Dibuka', 'Tiket TKT-2026-0003 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-04 06:13:51.933');
INSERT INTO public.issue_timelines VALUES ('cmpz3nz5n000hq5nfl0w820ct', 'cmpz3nr98000dq5nfyv43ukf9', 'Update Tiket', 'Status berubah dari OPEN menjadi IN_PROGRESS', 'Super Admin', '2026-06-04 06:14:02.171');
INSERT INTO public.issue_timelines VALUES ('cmq0pdntu000b7vuwoatw5oi0', 'cmpz3nr98000dq5nfyv43ukf9', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi RESOLVED', 'Super Admin', '2026-06-05 09:09:38.659');
INSERT INTO public.issue_timelines VALUES ('cmq0pehpx000f7vuwvib8hdxa', 'cmq0pehpu000d7vuw5hp5p4l3', 'Tiket Dibuka', 'Tiket TKT-2026-0004 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-05 09:10:17.398');
INSERT INTO public.issue_timelines VALUES ('cmq0penbk000h7vuwr3rs9g48', 'cmq0pehpu000d7vuw5hp5p4l3', 'Update Tiket', 'Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-05 09:10:24.656');
INSERT INTO public.issue_timelines VALUES ('cmq0perue000j7vuw97nvo646', 'cmq0pehpu000d7vuw5hp5p4l3', 'Update Tiket', 'Status berubah dari OPEN menjadi IN_PROGRESS', 'Super Admin', '2026-06-05 09:10:30.519');
INSERT INTO public.issue_timelines VALUES ('cmq0peulj000l7vuw658kdbs4', 'cmq0pehpu000d7vuw5hp5p4l3', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi RESOLVED', 'Super Admin', '2026-06-05 09:10:34.088');
INSERT INTO public.issue_timelines VALUES ('cmq0pii7o000r7vuws3zabaqv', 'cmq0pii7m000p7vuwsodvy33z', 'Tiket Dibuka', 'Tiket TKT-2026-0005 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-05 09:13:24.661');
INSERT INTO public.issue_timelines VALUES ('cmq0piomr000t7vuwb5hdjm6b', 'cmq0pii7m000p7vuwsodvy33z', 'Update Tiket', 'Status berubah dari OPEN menjadi IN_PROGRESS, Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-05 09:13:32.98');
INSERT INTO public.issue_timelines VALUES ('cmq0pisos000v7vuwl354yveq', 'cmq0pii7m000p7vuwsodvy33z', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi RESOLVED', 'Super Admin', '2026-06-05 09:13:38.237');
INSERT INTO public.issue_timelines VALUES ('cmq2cqrx60009nfvb793r9uez', 'cmq2cqrx10007nfvba5pqdy6u', 'Tiket Dibuka', 'Tiket TKT-2026-0006 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-06 12:51:27.834');
INSERT INTO public.issue_timelines VALUES ('cmq2cr2p6000bnfvbtwo49y5z', 'cmq2cqrx10007nfvba5pqdy6u', 'Update Tiket', 'Status berubah dari OPEN menjadi IN_PROGRESS', 'Super Admin', '2026-06-06 12:51:41.802');
INSERT INTO public.issue_timelines VALUES ('cmq4ig2ps0007s3pzd1x7nadj', 'cmq2cqrx10007nfvba5pqdy6u', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi CLOSED', 'Super Admin', '2026-06-08 01:06:38.656');
INSERT INTO public.issue_timelines VALUES ('cmq4twg78000ds3pz7gv1wvms', 'cmq2cqrx10007nfvba5pqdy6u', 'Update Tiket', 'Status berubah dari CLOSED menjadi IN_PROGRESS, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-08 06:27:18.405');
INSERT INTO public.issue_timelines VALUES ('cmq8ti22a0009109ggveuboud', 'cmq8ti2260007109g7a0ye6he', 'Tiket Dibuka', 'Tiket TKT-2026-0007 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-11 01:27:11.603');
INSERT INTO public.issue_timelines VALUES ('cmq8tiajn000b109gdpfz4uuf', 'cmq8ti2260007109g7a0ye6he', 'Update Tiket', 'Status berubah dari OPEN menjadi IN_PROGRESS, Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-11 01:27:22.596');
INSERT INTO public.issue_timelines VALUES ('cmq8tmzhk000j109ghvhr678h', 'cmq8tmzhe000h109gi3t7rtfh', 'Tiket Dibuka', 'Tiket TKT-2026-0008 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-11 01:31:01.544');
INSERT INTO public.issue_timelines VALUES ('cmq8tn89g000l109gz3986b1c', 'cmq8tmzhe000h109gi3t7rtfh', 'Update Tiket', 'Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-11 01:31:12.916');
INSERT INTO public.issue_timelines VALUES ('cmq8tnbta000n109g37efcm18', 'cmq8tmzhe000h109gi3t7rtfh', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED', 'Super Admin', '2026-06-11 01:31:17.518');
INSERT INTO public.issue_timelines VALUES ('cmq8trzli000p109g2x2rg5uw', 'cmq2cqrx10007nfvba5pqdy6u', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi RESOLVED', 'Super Admin', '2026-06-11 01:34:54.963');
INSERT INTO public.issue_timelines VALUES ('cmq94tlj50011109g83wz4k7q', 'cmq94tlj2000z109gmcjqae6v', 'Tiket Dibuka', 'Tiket TKT-2026-0009 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-11 06:44:05.825');
INSERT INTO public.issue_timelines VALUES ('cmq94u4h60013109gx0mm4bd3', 'cmq94tlj2000z109gmcjqae6v', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-11 06:44:30.378');
INSERT INTO public.issue_timelines VALUES ('cmq98m6870019109gqnejm6xk', 'cmq2cqrx10007nfvba5pqdy6u', 'Update Tiket', 'Status berubah dari RESOLVED menjadi WAITING_PARTS', 'Super Admin', '2026-06-11 08:30:17.863');
INSERT INTO public.issue_timelines VALUES ('cmqax1i9m0009mhlp2ls6pn88', 'cmqax1i9i0007mhlpqqcpoten', 'Tiket Dibuka', 'Tiket TKT-2026-0010 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-12 12:41:50.267');
INSERT INTO public.issue_timelines VALUES ('cmqax1nrc000bmhlpseqvykpl', 'cmqax1i9i0007mhlpqqcpoten', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Support_Herry', 'Super Admin', '2026-06-12 12:41:57.384');
INSERT INTO public.issue_timelines VALUES ('cmqax3clm000fmhlpfctnfn4m', 'cmqax3clj000dmhlp4b5bjc6n', 'Tiket Dibuka', 'Tiket TKT-2026-0011 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-12 12:43:16.234');
INSERT INTO public.issue_timelines VALUES ('cmqax3goj000hmhlp75brfd1q', 'cmqax3clj000dmhlp4b5bjc6n', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-12 12:43:21.523');
INSERT INTO public.issue_timelines VALUES ('cmqeio7fm000b8mz4pow8jmry', 'cmqeio7fh00098mz4mu0v6sxe', 'Tiket Dibuka', 'Tiket TKT-2026-0012 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-15 01:10:39.779');
INSERT INTO public.issue_timelines VALUES ('cmqeiofbn000d8mz4uthf4ips', 'cmqeio7fh00098mz4mu0v6sxe', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-15 01:10:50.003');
INSERT INTO public.issue_timelines VALUES ('cmqeipw5a000h8mz4tgajjp5q', 'cmqeipw57000f8mz4zlt3zw4p', 'Tiket Dibuka', 'Tiket TKT-2026-0013 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-15 01:11:58.462');
INSERT INTO public.issue_timelines VALUES ('cmqeiq0wa000j8mz4ydnzvgw4', 'cmqeipw57000f8mz4zlt3zw4p', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-15 01:12:04.618');
INSERT INTO public.issue_timelines VALUES ('cmqeiuowi000r8mz4u5nshnjh', 'cmqeiuowd000p8mz4xs9tq8sw', 'Tiket Dibuka', 'Tiket TKT-2026-0014 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-15 01:15:42.355');
INSERT INTO public.issue_timelines VALUES ('cmqeiutkr000t8mz4gqvdmmhm', 'cmqeiuowd000p8mz4xs9tq8sw', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-15 01:15:48.411');
INSERT INTO public.issue_timelines VALUES ('cmqk5q0zi000bjs04b4d57ikk', 'cmqk5q0zb0009js04vipn8zxg', 'Tiket Dibuka', 'Tiket TKT-2026-0015 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-18 23:54:46.782');
INSERT INTO public.issue_timelines VALUES ('cmqk5q7xr000djs04c7bgyl4f', 'cmqk5q0zb0009js04vipn8zxg', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-18 23:54:55.791');
INSERT INTO public.issue_timelines VALUES ('cmqk5rj0q000hjs041frq3p5u', 'cmqk5rj0o000fjs04ytrgkpdo', 'Tiket Dibuka', 'Tiket TKT-2026-0016 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-18 23:55:56.81');
INSERT INTO public.issue_timelines VALUES ('cmqk5rmlw000jjs04hnmlrb4a', 'cmqk5rj0o000fjs04ytrgkpdo', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-18 23:56:01.46');
INSERT INTO public.issue_timelines VALUES ('cmqk6167y000rjs044i4kpuou', 'cmqk6167t000pjs0425mvqm3j', 'Tiket Dibuka', 'Tiket TKT-2026-0017 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-19 00:03:26.782');
INSERT INTO public.issue_timelines VALUES ('cmqk61sei000tjs047msvof1r', 'cmqk6167t000pjs0425mvqm3j', 'Update Tiket', 'Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-19 00:03:55.531');
INSERT INTO public.issue_timelines VALUES ('cmqk65ghx000xjs043iv2v5ye', 'cmqk65ghu000vjs04x57xeep1', 'Tiket Dibuka', 'Tiket TKT-2026-0018 dibuat oleh cmpdiqmgl0000o6a58ogqwqsn', 'cmpdiqmgl0000o6a58ogqwqsn', '2026-06-19 00:06:46.726');
INSERT INTO public.issue_timelines VALUES ('cmqk7xqih00031gj1r8gm870x', 'cmqk6167t000pjs0425mvqm3j', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED', 'Super Admin', '2026-06-19 00:56:45.69');
INSERT INTO public.issue_timelines VALUES ('cmqk7xysu00051gj1kky9gyw9', 'cmqk65ghu000vjs04x57xeep1', 'Update Tiket', 'Status berubah dari OPEN menjadi RESOLVED, Ditugaskan kepada IT_Sandy', 'Super Admin', '2026-06-19 00:56:56.431');
INSERT INTO public.issue_timelines VALUES ('cmqk86wwx0005vvzzp7ik84tp', 'cmq8ti2260007109g7a0ye6he', 'Update Tiket', 'Status berubah dari IN_PROGRESS menjadi WAITING_PARTS', 'IT_Support_Herry', '2026-06-19 01:03:53.889');
INSERT INTO public.issue_timelines VALUES ('cmqk870120007vvzz19chd0vt', 'cmq8ti2260007109g7a0ye6he', 'ESCALATED TO L2', 'Ticket di-eskalasi dari L1 (IT_Support_Herry) ke L2 (IT_Support_Herry)', 'IT_Support_Herry', '2026-06-19 01:03:57.927');
INSERT INTO public.issue_timelines VALUES ('cmqk87brx000bvvzzpobfyjbf', 'cmq2cqrx10007nfvba5pqdy6u', 'ESCALATED TO L2', 'Ticket di-eskalasi dari L1 (IT_Support_Herry) ke L2 (IT_Support_Herry)', 'IT_Support_Herry', '2026-06-19 01:04:13.149');
INSERT INTO public.issue_timelines VALUES ('cmqk87qkn000fvvzzu1jtw7eh', 'cmq8ti2260007109g7a0ye6he', 'ESCALATED TO L2', 'Ticket di-eskalasi dari L1 (IT_Support_Herry) ke L2 (IT_Support_Herry)', 'IT_Support_Herry', '2026-06-19 01:04:32.327');


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.issues VALUES ('cmqeio7fh00098mz4mu0v6sxe', 'TKT-2026-0012', 'PC Kasir tidak menyala', 'PC Kasir tidak menyala / tidak bisa digunakan', NULL, 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-15 01:10:49.995', NULL, '2026-06-15 03:10:39.772', false, '2026-06-15 01:10:39.774', '2026-06-15 01:10:49.996');
INSERT INTO public.issues VALUES ('cmq0pii7m000p7vuwsodvy33z', 'TKT-2026-0005', 'Laptop Medical Record (IGD) Tidak Terkoneksi Jaringan ', 'Laptop Medical Record (IGD) Tidak Terkoneksi Jaringan internet rumah sakit', NULL, 'HIGH', 'RESOLVED', 'Hardware, Jaringan', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-05 09:13:38.234', NULL, '2026-06-05 17:13:24.657', false, '2026-06-05 09:13:24.658', '2026-06-05 09:13:38.235');
INSERT INTO public.issues VALUES ('cmqeipw57000f8mz4zlt3zw4p', 'TKT-2026-0013', 'Laptop Medical Record (IGD) Tidak Terkoneksi Jaringan', 'Laptop Medical Record (IGD) Tidak Terkoneksi Jaringan', NULL, 'MEDIUM', 'RESOLVED', 'Laptop', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-15 01:12:04.615', NULL, '2026-06-16 01:11:58.459', false, '2026-06-15 01:11:58.46', '2026-06-15 01:12:04.616');
INSERT INTO public.issues VALUES ('cmqeiuowd000p8mz4xs9tq8sw', 'TKT-2026-0014', 'Printer Medical Record (IGD) tidak dapat digunakan', 'Printer Medical Record (IGD) tidak dapat digunakan, kertas tertahan di bagian roller', 'cmqeitck8000l8mz4i1efechy', 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-15 01:15:48.404', NULL, '2026-06-15 03:15:42.349', false, '2026-06-15 01:15:42.35', '2026-06-15 01:15:48.405');
INSERT INTO public.issues VALUES ('cmpm1uwpc000bfyib4ott6n8t', 'TKT-2026-0001', 'Printer tidak dapat mencetak', 'ink pad counter melebihi kapasitas (Bantalan tinta habis)', NULL, 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpg5hsx70000jawkd4c6ol8i', 'cmpg5hsx70000jawkd4c6ol8i', '2026-05-26 03:58:57.736', NULL, '2026-05-26 05:02:26.063', false, '2026-05-26 03:02:26.064', '2026-05-26 03:58:57.738');
INSERT INTO public.issues VALUES ('cmpz3m4if0007q5nfumuoz9a9', 'TKT-2026-0002', 'JARINGAN BERMASALAH', 'Laporan tidak tersedia layanan internet dari laboratorium', NULL, 'CRITICAL', 'RESOLVED', 'Jaringan', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-04 06:12:49.932', NULL, '2026-06-04 08:12:35.798', false, '2026-06-04 06:12:35.8', '2026-06-04 06:12:49.933');
INSERT INTO public.issues VALUES ('cmq8tmzhe000h109gi3t7rtfh', 'TKT-2026-0008', 'Printer tidak dapat mencetak', 'Printer tidak dapa mencetak dan muncul notifikasi Ink Pad counter full', 'cmq8tlrhl000d109gzjxkexn4', 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-11 01:31:17.513', NULL, '2026-06-11 03:31:01.537', false, '2026-06-11 01:31:01.539', '2026-06-11 01:31:17.514');
INSERT INTO public.issues VALUES ('cmpz3nr98000dq5nfyv43ukf9', 'TKT-2026-0003', 'SIMRS Lag / Lalod', 'Laporan tentang simrs dari IGD, simrs lag / lalod', NULL, 'HIGH', 'RESOLVED', 'Software', 'cmpdiqmgl0000o6a58ogqwqsn', NULL, '2026-06-05 09:09:38.654', NULL, '2026-06-04 14:13:51.931', false, '2026-06-04 06:13:51.932', '2026-06-05 09:09:38.656');
INSERT INTO public.issues VALUES ('cmqk5q0zb0009js04vipn8zxg', 'TKT-2026-0015', 'Mouse dan keyboard (IGD) tidak berfungsi', 'Mouse dan keyboard (IGD) tidak berfungsi, tim IT telah turun ke lokasi dan melakukan penggantian perangkat yang bermasalah (Hardware)', NULL, 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-18 23:54:55.773', NULL, '2026-06-19 01:54:46.774', false, '2026-06-18 23:54:46.775', '2026-06-18 23:54:55.776');
INSERT INTO public.issues VALUES ('cmq0pehpu000d7vuw5hp5p4l3', 'TKT-2026-0004', 'Printer tidak berfungsi', 'Printer tidak dapat mencetak', 'cmq0pdbtp00077vuwnhg0znyg', 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-05 09:10:34.084', NULL, '2026-06-05 11:10:17.393', false, '2026-06-05 09:10:17.394', '2026-06-05 09:10:34.086');
INSERT INTO public.issues VALUES ('cmq94tlj2000z109gmcjqae6v', 'TKT-2026-0009', 'Printer tidak dapat mencetak', 'Printer medrec tidak dapat mencetak', 'cmq0pdbtp00077vuwnhg0znyg', 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-11 06:44:30.372', NULL, '2026-06-11 08:44:05.822', false, '2026-06-11 06:44:05.823', '2026-06-11 06:44:30.373');
INSERT INTO public.issues VALUES ('cmqax1i9i0007mhlpqqcpoten', 'TKT-2026-0010', 'Printer MRO IGD tidak bisa mencetak', 'Printer tidak dapat digunakan', NULL, 'CRITICAL', 'RESOLVED', 'Hardware', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-12 12:41:57.376', NULL, '2026-06-12 14:41:50.261', false, '2026-06-12 12:41:50.263', '2026-06-12 12:41:57.377');
INSERT INTO public.issues VALUES ('cmqax3clj000dmhlp4b5bjc6n', 'TKT-2026-0011', 'Internet Gedung matuari tidak ada akses internet', 'Internet tidak ada akses internet', NULL, 'CRITICAL', 'RESOLVED', 'Jaringan', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-12 12:43:21.52', NULL, '2026-06-12 14:43:16.231', false, '2026-06-12 12:43:16.232', '2026-06-12 12:43:21.521');
INSERT INTO public.issues VALUES ('cmqk5rj0o000fjs04ytrgkpdo', 'TKT-2026-0016', 'Kabel HDMI Komputer kasir', 'Penggantian Kabel HDMI pada Komputer Kasir', NULL, 'CRITICAL', 'RESOLVED', 'Kabel', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-18 23:56:01.453', NULL, '2026-06-19 01:55:56.807', false, '2026-06-18 23:55:56.808', '2026-06-18 23:56:01.455');
INSERT INTO public.issues VALUES ('cmqk6167t000pjs0425mvqm3j', 'TKT-2026-0017', 'MESIN KIOSK TIDAK DAPAT MENCETAK (Kertas Thermal Habis)', 'Mesin kiosk tidak dapat mencetak (kertas thermal habis).
Tim IT telah melakukan penggantian kertas thermal (sandy)', 'cmqk5z7sm000ljs04wy63mh5x', 'CRITICAL', 'RESOLVED', 'BHP', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-19 00:56:45.682', NULL, '2026-06-19 02:03:26.776', false, '2026-06-19 00:03:26.777', '2026-06-19 00:56:45.685');
INSERT INTO public.issues VALUES ('cmqk65ghu000vjs04x57xeep1', 'TKT-2026-0018', 'JARINGAN BERMASALAH ', 'Jaringan di Poliklinik Interna dan Rehab Medik bermasalah.
Tim IT telah melakukan peninjauan terkait gangguan dan melakukan perbaikan (sandy & tisya)', NULL, 'CRITICAL', 'RESOLVED', 'Jaringan', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpg5hsx70000jawkd4c6ol8i', '2026-06-19 00:56:56.425', NULL, '2026-06-19 02:06:46.721', false, '2026-06-19 00:06:46.723', '2026-06-19 00:56:56.427');
INSERT INTO public.issues VALUES ('cmq2cqrx10007nfvba5pqdy6u', 'TKT-2026-0006', 'PC RUANGAN WALANG SENDOW TIDAK BERFUNGSI', 'PC tidak bisa digunakan ', 'cmq2cp95f0003nfvb978yxlh8', 'MEDIUM', 'WAITING_PARTS', 'Hardware, Software', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', '2026-06-11 01:34:54.956', NULL, '2026-06-09 12:51:27.828', false, '2026-06-06 12:51:27.829', '2026-06-19 01:04:13.145');
INSERT INTO public.issues VALUES ('cmq8ti2260007109g7a0ye6he', 'TKT-2026-0007', 'PC AIO KASIR MRO TIDAK BERFUNGSI', 'PC AIO KASIR MRO TIDAK BISA DIGUNAKAN ', NULL, 'MEDIUM', 'WAITING_PARTS', 'PC', 'cmpdiqmgl0000o6a58ogqwqsn', 'cmpe03ghz0000140azdmqfdbo', NULL, NULL, '2026-06-14 01:27:11.596', false, '2026-06-11 01:27:11.598', '2026-06-19 01:04:32.324');


--
-- Data for Name: kanban_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kanban_cards VALUES ('cmpl3dinc0005hwd2ud3kqcky', 'CHECK PRINTER', 'Pengecekan printer di seluruh rumah sakit', 'TODO', 'MEDIUM', '2026-05-26 00:00:00', NULL, '{Feature}', 0, NULL, '2026-05-25 10:57:07.752', '2026-05-25 10:57:07.752');
INSERT INTO public.kanban_cards VALUES ('cmpl3c4kq0003hwd280oqf1sq', 'INVENTARIS', 'Menginput semua inventaris menyangkut IT di seluruh rumah sakit', 'DOING', 'MEDIUM', '2026-05-26 00:00:00', NULL, '{Feature}', 0, NULL, '2026-05-25 10:56:02.858', '2026-05-26 03:59:13.746');
INSERT INTO public.kanban_cards VALUES ('cmpz5iq3u000pq5nf6assb7pj', 'PC BARU', 'Pembagian partisi dan input ke Sistem IT', 'TODO', 'MEDIUM', NULL, NULL, '{}', 0, NULL, '2026-06-04 07:05:56.395', '2026-06-04 07:05:56.395');
INSERT INTO public.kanban_cards VALUES ('cmq0pgnxj000n7vuw5t96ijq2', 'SET PC RUANGAN KLABAT', 'PC BARU MASIH DI DALAM DUS', 'DONE', 'HIGH', '2026-06-05 00:00:00', 'cmpe03ghz0000140azdmqfdbo', '{}', 0, NULL, '2026-06-05 09:11:58.76', '2026-06-05 09:12:04.161');


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
INSERT INTO public.locations VALUES ('cmpm2lfv40006fsf4msb3oylg', 'Kepegawaian', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpm2lfv40007fsf4036hu6h9', 'Perencanaan', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpm2lfv50008fsf45sxh6uy3', 'Satuan Pemeriksa Internal', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmpdiqmh9000lo6a5zlmneal0', 'Keuangan', 'Lantai 3', 'Gedung Poliklinik ');
INSERT INTO public.locations VALUES ('cmq4uotex000015pzr88z0mn6', 'Ruang Perawatan Klabat', 'Lantai 2', 'Gedung Rawat Inap');
INSERT INTO public.locations VALUES ('cmpm2j8g30005fsf4hyolaw61', 'Ruang Perawatan Anak', 'Lantai 2', 'Gedung Perawatan');


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
INSERT INTO public.morning_checks VALUES ('cmplxbjzv0003fyibced245oj', '2026-05-25', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-05-26 04:02:54.676', '2026-05-26 00:55:24.667', '2026-05-26 04:02:54.677');
INSERT INTO public.morning_checks VALUES ('cmpvyzfng0003126s7c0b4zjl', '2026-06-01', 'cmpe03ghz0000140azdmqfdbo', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'OK', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-02 01:39:40.147', '2026-06-02 01:39:40.156', '2026-06-02 01:39:40.156');
INSERT INTO public.morning_checks VALUES ('cmpz3jvji0003q5nfl34otpit', '2026-06-03', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-04 06:10:50.858', '2026-06-04 06:10:50.862', '2026-06-04 06:10:50.862');
INSERT INTO public.morning_checks VALUES ('cmq0pams200037vuwanxtqk2w', '2026-06-04', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-05 09:07:17.324', '2026-06-05 09:07:17.33', '2026-06-05 09:07:17.33');
INSERT INTO public.morning_checks VALUES ('cmq4ievdm0003s3pzf3bazf63', '2026-06-07', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-08 01:05:42.489', '2026-06-08 01:05:42.49', '2026-06-08 01:05:42.49');
INSERT INTO public.morning_checks VALUES ('cmq8tglm40003109go0s8ei40', '2026-06-10', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-11 01:26:03.627', '2026-06-11 01:26:03.629', '2026-06-11 01:26:03.629');
INSERT INTO public.morning_checks VALUES ('cmqax004y0003mhlpqaoa7lxh', '2026-06-11', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-12 12:40:40.112', '2026-06-12 12:40:40.114', '2026-06-12 12:40:40.114');
INSERT INTO public.morning_checks VALUES ('cmqeg3oqo00038mz4ftxyl82o', '2026-06-14', 'cmpdiqmgl0000o6a58ogqwqsn', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-14 23:58:43.196', '2026-06-14 23:58:43.2', '2026-06-14 23:58:43.2');
INSERT INTO public.morning_checks VALUES ('cmqk5ffdu0003js04kluw3w3f', '2026-06-18', 'cmpe03ghz0000140azdmqfdbo', 'OK', 'OK', 'OK', '{"db": null, "simrs": null, "google": null}', 'RUNNING', 'RUNNING', 'RUNNING', 'OK', 'OK', false, 'ISSUE', 0, NULL, '', 0, 0, '[]', '', 'NORMAL', '2026-06-18 23:46:32.225', '2026-06-18 23:46:32.226', '2026-06-18 23:46:32.226');


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

INSERT INTO public.users VALUES ('cmpgd9qpe0009jawktjbk1x6m', 'IT_Natan', 'natanaellengkong07@gmail.com', '$2a$10$5IjYbof3SuT1mFtdElapj.CLUmsIYLSZ8tbncah4YseyzJmlasQc.', 'ADMIN', NULL, true, '2026-05-22 03:35:16.851', '2026-05-22 03:35:16.851', 'L1');
INSERT INTO public.users VALUES ('cmpdiqmgl0000o6a58ogqwqsn', 'Super Admin', 'superadmin@rumahsakit.id', '$2a$10$93E7wuDvG.c9kw8NIKwXyO4hkuBK.uNrfmmkT1HFtNiVvkEnwilam', 'SUPERADMIN', NULL, true, '2026-05-20 03:45:04.053', '2026-06-08 07:25:09.163', 'L3');
INSERT INTO public.users VALUES ('cmpe03ghz0000140azdmqfdbo', 'IT_Support_Herry', 'herryrambet@gmail.com', '$2a$10$58.8C8XT8vmKeEirIs8j7e4W1BNo/7utcpSpIwwgZpQ/ypvEcgY26', 'ADMIN', NULL, true, '2026-05-20 11:50:56.328', '2026-06-08 07:25:09.163', 'L2');
INSERT INTO public.users VALUES ('cmpg5hsx70000jawkd4c6ol8i', 'IT_Sandy', 'sandyit@rsud.co.id', '$2a$10$3UmUb3bz1Mbwtq3jjwevquJ6KA0AT3RrXAChEuhdVQGEg3T567IrO', 'ADMIN', NULL, true, '2026-05-21 23:57:36.044', '2026-06-08 07:25:09.163', 'L2');
INSERT INTO public.users VALUES ('cmpm42oub001gfyib6sk60s3n', 'IT_Michael', 'michael_kele@rsud.com', '$2a$10$5ob7fqdyf1KLBjJ/g079SuRe8AezG0Z/gdJdDuVpigurNgsialkkO', 'ADMIN', NULL, true, '2026-05-26 04:04:28.356', '2026-06-08 07:25:09.163', 'L2');
INSERT INTO public.users VALUES ('cmq4w3r8s000bez9mj5i1qw6m', 'tekniri_1', 'teknisirs@rsudmwm.id', '$2a$10$Dtds84fCVkCjypBS1xquAOCJNW8m7D2jnqePc8wfqRXB0ifqM6EBW', 'VIEWER', NULL, true, '2026-06-08 07:28:58.54', '2026-06-08 07:28:58.54', 'L1');


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
-- Name: asset_movements asset_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT asset_movements_pkey PRIMARY KEY (id);


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
-- Name: asset_movements asset_movements_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT "asset_movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public.assets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: asset_movements asset_movements_fromLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT "asset_movements_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: asset_movements asset_movements_movedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT "asset_movements_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: asset_movements asset_movements_toLocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_movements
    ADD CONSTRAINT "asset_movements_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES public.locations(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
    ADD CONSTRAINT "issue_photos_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: issue_timelines issue_timelines_issueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.issue_timelines
    ADD CONSTRAINT "issue_timelines_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES public.issues(id) ON UPDATE CASCADE ON DELETE CASCADE;


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

\unrestrict Rc7wRUNjHvGDVGryCAQtOJ61PfyNKfeSrHeh6fMerGznBqX11z4x5y8iZ4nTkgm

