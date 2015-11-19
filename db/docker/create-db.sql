--
-- QA hello listing database
--

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET statement_timeout = 0;
SET check_function_bodies = true;
SET client_min_messages = warning;

-- plpgsql EXTENSION
CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA qa_hello_db;
COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';
SET search_path = public, qa_hello_db;

---------------- postgres passwd ---------------------------------
ALTER ROLE postgres ENCRYPTED PASSWORD 'postgres';


-- Cleanup
DROP DATABASE IF EXISTS qa_hello_db;

-- Create hiveusr and hiveadm roles unless they already exist in the db cluster
DO
$body$
DECLARE
  num_users integer;
BEGIN
	SELECT COUNT(*) INTO num_users FROM pg_user WHERE usename = 'qa_hello';
	IF num_users = 0 THEN
		CREATE ROLE qa_hello WITH LOGIN ENCRYPTED PASSWORD 'qa_hello_password';
	END IF;
END
$body$
;


---------------- Database creation ---------------------------------

CREATE DATABASE qa_hello_db WITH TEMPLATE = template0 OWNER = qa_hello;
GRANT CONNECT,TEMPORARY ON DATABASE qa_hello_db TO qa_hello;




---------------- Table creation ---------------------------------

\connect qa_hello_db

SET default_tablespace = '';
SET default_with_oids = false;


-- data
CREATE TABLE data (
  name          text NOT NULL
);
ALTER TABLE data OWNER TO qa_hello;


-- config
CREATE TABLE config (
  id          text NOT NULL PRIMARY KEY,
  value       text NOT NULL
);
ALTER TABLE config OWNER TO qa_hello;


---------------- Data ---------------------------------
INSERT INTO data values('Lenka');
INSERT INTO data values('Martin');
INSERT INTO data values('Tereza');
