# Vela Single Worker Architecture
## Proof of Concept

Overview of the new architecture: [single-worker-architecture.md](single-worker-architecture.md) 

### What does it do?
example of upload task implementation

- one shop processed by one worker at a time
- task reschedule on failure
- upload task
	- create new section(s)
	- upload modified fields of the listing
	- upload variations
	- API call retries
	- shop statistics (countdown)
	- per second quota

*Talk is cheap. Show me the code.*

- one shop at a time -> controlled by plsql stored proc get_task() [src/worker/db/db.sql](src/worker/db/db.sql) 
- main() worker loop - gets an 'upload' task (for shop not being processed at the time) and runs the respective task handler. [src/worker/main.js](src/worker/main.js) 
- upload task handler [src/worker/upload.js](src/worker/upload.js) 
	- creates missing sections
	- working in 100 listing batches:
		- creates promises for uploading each listing
		- runs them asynchronously (in parallel; Promise.all())
	- each listing itself is processed in sequence (await)
		- PUT call to modify basic fields
		- POST variations
		- update sync status (# to upload...)
	- failed API calls are retried
	- the whole 'upload' task is re-scheduled if it fails (10s, 30min, 2hrs)
		- handled by the DB tasks.earliest_start
- etsy api [src/worker/etsy.js](src/worker/etsy.js) 
	- manages oauth signatures
	- takes care of 30 req/s quota 




### Installation

**app:**

	yarn install
	yarn run build

edit `etc/woker-config.json`

**database:**

have an existing vela db with $DATABASE_URL,
extend it with 

	psql $DATABASE_URL < src/worker/db/db.sql

(adds task table and related functions)

### Running
run the app

	node dist/worker.js


Make some modifications on the products

		-- check shop ids  ** here we use id=2 **
		SELECT id, property_value FROM shops WHERE property_name = 'name' ORDER BY id;

		DELETE FROM products WHERE shop_id = 2 AND property_name = '_modifiedByHive';
		INSERT INTO products (id, shop_id, property_name, property_value, modified_at) (SELECT distinct id, shop_id, '_modifiedByHive', true, now() FROM products WHERE shop_id = 2);
		UPDATE products SET modified_at = now() WHERE property_name IN ('title', 'description') AND shop_id = 2;


Insert 'upload' tasks

	psql $DATABASE_URL
		-- add upload task
		INSERT INTO tasks (task_type, shop_id) VALUES ('upload', 2);
