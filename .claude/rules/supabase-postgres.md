# Supabase Postgres Best Practices

These rules apply when writing or modifying Supabase queries, creating migrations, or troubleshooting database performance in this project. Based on Supabase's official Postgres optimization guidelines, adapted for the Blue Taxi Admin dashboard.

## RLS & Security (Critical)

This project uses RLS on all tables. The server client (`lib/supabase/server.ts`) passes user context via cookies so RLS policies evaluate correctly. The admin client bypasses RLS — only use it when the operation genuinely requires it.

**Cache `auth.uid()` in policies**: RLS policies that call `auth.uid()` directly execute the function for every row evaluated. On large tables (drivers, trips, orders), this causes severe slowdowns. Wrap it in a subselect so Postgres evaluates it once:

```sql
-- Slow: auth.uid() called per row
create policy "users see own data" on trips
  for select using (user_id = auth.uid());

-- Fast: auth.uid() evaluated once
create policy "users see own data" on trips
  for select using (user_id = (select auth.uid()));
```

**Index columns used in RLS policies**: If a policy filters on `user_id`, that column needs an index. Without it, the policy triggers a sequential scan on every query, even simple ones.

## Indexing (Critical)

Missing indexes are the most common performance problem. The driver, passenger, and trip tables will grow — indexes prevent queries from degrading as data scales.

**Index foreign key columns**: Postgres does not auto-index foreign keys. Without indexes, JOINs and CASCADE deletes do full table scans. Every FK column should have an index:

```sql
-- Always index FK columns
create index orders_customer_id_idx on orders (customer_id);
```

**Use composite indexes for multi-column filters**: When queries filter on multiple columns (e.g., status + date), a single composite index outperforms separate indexes. Place equality columns first, range columns last:

```sql
-- Good: status (=) before created_at (>)
create index trips_status_date_idx on trips (status, created_at);
```

**Use partial indexes for filtered subsets**: If queries consistently filter the same condition (e.g., active drivers, pending trips), a partial index is smaller and faster:

```sql
-- Only index active drivers, not soft-deleted ones
create index drivers_active_email_idx on drivers (email)
  where deleted_at is null;
```

## Schema Design (High)

**Primary keys**: Use `bigint generated always as identity` for sequential IDs. Avoid random UUIDs (v4) on large tables — they cause index fragmentation. If you need distributed IDs, use UUIDv7 (time-ordered).

**Data types matter**:
- `timestamptz` not `timestamp` — always store timezone info, otherwise Supabase returns ambiguous times
- `numeric(10,2)` not `float` for money (fares, fees, payments) — float arithmetic introduces rounding errors
- `text` not `varchar(n)` unless you genuinely need a length constraint — same performance, fewer artificial limits
- `bigint` not `int` for IDs — `int` overflows at ~2.1 billion

**Index FK columns**: Postgres doesn't create indexes on foreign key columns automatically. Missing FK indexes cause slow JOINs and painfully slow CASCADE operations. Run this query to find missing ones:

```sql
select conrelid::regclass as table_name, a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

## Query Patterns (Medium-High)

**Avoid N+1 queries**: The Supabase JS client supports nested selects that resolve to JOINs, so use them instead of looping. For example, fetching drivers with their documents should be one query with a nested select, not one query per driver:

```typescript
// Good: single query with nested select
const { data } = await supabase
  .from('drivers')
  .select('*, documents(*)')
  .eq('status', 'active');

// Bad: N+1 loop
const drivers = await supabase.from('drivers').select('*');
for (const driver of drivers.data) {
  const docs = await supabase.from('documents').select('*').eq('driver_id', driver.id);
}
```

**Use cursor pagination for large lists**: The driver and passenger tables will grow. OFFSET-based pagination gets slower on deeper pages because Postgres scans all skipped rows. Use keyset/cursor pagination instead:

```sql
-- Slow on page 100: scans 2000 rows to skip past them
select * from drivers order by id limit 20 offset 1980;

-- Fast on any page: index lookup from last seen ID
select * from drivers where id > $last_id order by id limit 20;
```

## Transactions & Locking (Medium)

**Keep transactions short**: Long transactions hold locks that block other queries. Never make HTTP calls or external API requests inside a transaction. Do the external work first, then wrap only the database update in a transaction:

```sql
-- Bad: lock held during slow external call
begin;
  select * from trips where id = 1 for update;
  -- ...HTTP call to payment API takes 3 seconds...
  update trips set status = 'paid' where id = 1;
commit;

-- Good: only hold lock for the actual update
begin;
  update trips set status = 'paid', payment_id = $1
  where id = $2 and status = 'pending'
  returning *;
commit;
```

## Monitoring

When debugging slow queries, use `EXPLAIN ANALYZE` to see what Postgres is actually doing. Look for sequential scans on large tables — they usually mean a missing index. The Supabase Dashboard also provides query performance insights under Database > Query Performance.
