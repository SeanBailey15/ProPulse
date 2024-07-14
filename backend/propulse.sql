\echo 'Delete and recreate propulse db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE propulse;
CREATE DATABASE propulse;
\connect propulse

\i propulse-schema.sql

\echo 'Delete and recreate propulse_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE propulse_test;
CREATE DATABASE propulse_test;
\connect propulse_test

\i propulse-schema.sql