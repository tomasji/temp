DROP TYPE IF EXISTS task_type_enum CASCADE;
CREATE TYPE task_type_enum AS ENUM ('upload', 'download_shop', 'scheduled_sync');


DROP TABLE IF EXISTS tasks CASCADE;
CREATE SEQUENCE tasks_id_seq;
CREATE TABLE IF NOT EXISTS tasks (
	id   bigint PRIMARY KEY DEFAULT nextval('tasks_id_seq'),
	priority   int NOT NULL DEFAULT 1,
	task_type  task_type_enum NOT NULL,
	earliest_start  bigint,
	locked_by text,
	shop_id bigint NOT NULL,
	retry int DEFAULT 0
);
CREATE INDEX task_shop_idx ON tasks(shop_id);
CREATE INDEX task_locked_idx ON tasks(locked_by);
CREATE INDEX task_priority_idx ON tasks(priority);


-- Function get_task() is to be called when a free Worker asks for a new job.
-- It selects a tasks 
-- 	- with the highest priority
-- 	- that has not been scheduled for some future time
-- 	- and is related to a shop that is not being processed at the moment (by some other worker)
-- and markes it as 'locked / being processed'
DROP FUNCTION IF EXISTS get_task(p_worker text) CASCADE;
CREATE FUNCTION get_task(p_worker text) RETURNS tasks AS $$
    UPDATE tasks
        SET locked_by = p_worker
        WHERE id IN (
            SELECT id FROM tasks t
            WHERE locked_by IS NULL
            AND (earliest_start IS NULL OR earliest_start <= round(extract(epoch from now())))
            AND shop_id NOT IN (
                SELECT shop_id FROM tasks
                WHERE locked_by IS NOT NULL
                AND shop_id = t.shop_id
                LIMIT 1
            )
            ORDER BY priority
            LIMIT 1
        )
        RETURNING *;
$$ LANGUAGE SQL;



-- Function reschedule_task()
--     - sets the earliest_start of the task to now() + n seconds
--     - increments retry count
--     - resets locked_by
--     - deletes other possible tasks of the same type & shop
-- return 1 on success, 0 on task-not-found
DROP FUNCTION IF EXISTS reschedule_task(p_id bigint, p_delay int) CASCADE;
CREATE FUNCTION reschedule_task(p_id bigint, p_delay int)
RETURNS integer
AS $reschedule_task$
DECLARE
    v_task_row tasks%ROWTYPE;
BEGIN
    UPDATE tasks
        SET earliest_start = round(extract(epoch from now())) + p_delay,
            retry = retry + 1,
            locked_by = NULL

        WHERE id = p_id
        RETURNING * INTO v_task_row;
    
    IF FOUND THEN
        DELETE FROM tasks
            WHERE 
                id <> p_id AND
                task_type = v_task_row.task_type AND
                shop_id = v_task_row.shop_id;

        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END;
$reschedule_task$ LANGUAGE plpgsql;



-- COPY tasks (id, priority, task_type, earliest_start, locked_by, shop_id) FROM stdin;
-- 1	1	upload	\N	\N	1
-- 2	1	upload	\N	\N	1
-- 3	1	upload	\N	\N	6
-- \.
-- SELECT pg_catalog.setval('tasks_id_seq', 3, true);
