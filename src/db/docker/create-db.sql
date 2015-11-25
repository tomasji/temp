--
-- WhatWine-Test database
--

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET statement_timeout = 0;
SET check_function_bodies = true;
SET client_min_messages = warning;

-- plpgsql EXTENSION
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA ww_test;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
SET search_path = public, ww_test;



-- Cleanup
DROP DATABASE IF EXISTS ww_test;

-- Create wwtusr and wwtadm roles unless they already exist in the db cluster
DO
$body$
DECLARE
  num_users integer;
BEGIN
	SELECT COUNT(*) INTO num_users FROM pg_user WHERE usename = 'wwtadm';
	IF num_users = 0 THEN
		CREATE ROLE wwtadm WITH LOGIN ENCRYPTED PASSWORD 'wwtadm_password';
	END IF;
	SELECT COUNT(*) INTO num_users FROM pg_user WHERE usename = 'wwtusr';
	IF num_users = 0 THEN
		CREATE ROLE wwtusr WITH LOGIN ENCRYPTED PASSWORD 'wwtusr_password';
	END IF;
END
$body$
;


---------------- Database creation ---------------------------------

CREATE DATABASE ww_test WITH TEMPLATE = template0 OWNER = wwtadm;
REVOKE ALL ON DATABASE ww_test FROM PUBLIC;
REVOKE ALL ON DATABASE ww_test FROM wwtadm;

GRANT CREATE, CONNECT, TEMPORARY ON DATABASE ww_test TO wwtadm;
GRANT CONNECT,TEMPORARY ON DATABASE ww_test TO wwtusr;




---------------- Table creation ---------------------------------

\connect ww_test

SET default_tablespace = '';
SET default_with_oids = false;

--------------------------------------------------------------------------------
CREATE TABLE keywords (
  id            text NOT NULL PRIMARY KEY,
  word          text NOT NULL
);
ALTER TABLE keywords OWNER TO wwtadm;


GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO wwtusr;
GRANT SELECT,USAGE ON ALL SEQUENCES IN SCHEMA public TO wwtusr;
