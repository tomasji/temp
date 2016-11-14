CREATE TYPE task_type_enum AS ENUM ('upload', 'download_shop', 'scheduled_sync');

CREATE TABLE IF NOT EXISTS tasks (
	id   bigint PRIMARY KEY,
	priority   int,
	task_type  task_type_enum,
	earliest_start  bigint,
	locked_by text,
	shop_id text,
	retry int default 0
);
CREATE INDEX task_shop_idx ON tasks(shop_id);
CREATE INDEX task_locked_idx ON tasks(locked_by);
CREATE INDEX task_priority_idx ON tasks(priority);


COPY tasks (id, priority, task_type, earliest_start, locked_by, shop_id) FROM stdin;
1	2	download_shop	\N	\N	shop-1
2	2	download_shop	\N	\N	shop-2
3	2	download_shop	\N	\N	shop-3
4	1	upload	\N	\N	shop-3
5	1	upload	\N	\N	shop-3
\.


-- Function get_task() is to be called when a free Worker asks for a new job.
-- It selects a tasks 
-- 	- with the highest priority
-- 	- that has not been scheduled for some future time
-- 	- and is related to a shop that is not being processed at the moment (by some other worker)
-- and markes it as 'locked / being processed'
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
