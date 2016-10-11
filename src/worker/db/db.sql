--
-- QAStats database
--

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET statement_timeout = 0;
SET check_function_bodies = true;
SET client_min_messages = warning;
SET search_path = public, qastats;



SET default_tablespace = '';
SET default_with_oids = false;

--------------------------------------------------------------------------------
-- projects
DROP TABLE IF EXISTS listings CASCADE;
CREATE TABLE listings (
  id            text,
  data          jsonb
);

