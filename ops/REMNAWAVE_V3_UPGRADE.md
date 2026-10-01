# Coordinated Remnawave 3.x / Remnashop upgrade

This bot requires Remnawave >=3.2.1. Its SDK is pinned to an exact v3-compatible
commit. User IDs are bigint integers; squad/node UUIDs and VLESS credentials stay
UUIDs. Public Web App subscription IDs remain strings in the JSON contract.

## Rehearsal and backups

1. Back up both PostgreSQL databases with `pg_dump -Fc`, PostgreSQL roles with
   `pg_dumpall --globals-only`, all compose files and secrets. Restrict snapshots
   to root (`0700` directories, `0600` files); never commit them.
2. Before the panel drops user UUIDs, run
   `sudo python3 scripts/remnawave_v3_preflight.py --output /absolute/backup/path`.
   Every existing bot subscription must have an exact panel UUID -> `t_id` match.
3. Rehearse restoration in `remnawave-v3-stage.compose.yml`: use a dedicated
   directory with `panel.env` and `bot.env`. Rename the copied panel's
   `JWT_AUTH_SECRET` to `APP_SECRET` while preserving its value. Keep the network
   internal; do not attach it to production. Restore with `--no-owner --no-acl`
   on the rehearsal databases only. Do not run Telegram workers there.
4. Run bot migration 0045 against the restored bot database, providing
   `REMNAWAVE_V3_ID_MAP_PATH` to the exported JSON mounted inside the container.
   The migration validates the entire mapping before any schema change. It
   retains each old UUID in `legacy_remna_uuid`; subscription primary keys,
   ownership, URLs, dates, plans and payments are untouched.
5. Run `python -m checks.remnawave_v3_live_check --snapshot /snapshot` in a
   container on the rehearsal network with the new bot image. The optional
   `--isolated-write-test` requires `REMNAWAVE_V3_ISOLATED_TEST=true` and creates
   only a disposable user. It checks creation, renewal, HWID operations and
   deletion without contacting payment providers.

## Production switch

1. Save the current image IDs with rollback tags. Build the candidate bot image
   before stopping services.
2. Stop bot API, Taskiq worker/scheduler, any other subscription writers, and
   the panel. Leave both databases, proxies, Redis and Docker networks running.
   Refresh both dumps, role backups and identity exports now that writes are
   stopped. Verify the archive lists. This is the coordinated rollback point.
3. Rename `JWT_AUTH_SECRET` to `APP_SECRET` in the panel environment, preserving
   the value. Pin the panel to the tested version (`remnawave/backend:3.4.4`).
   Recreate only the panel service. Do not change the database major version.
4. Keep node `SECRET_KEY` unchanged. Pin the self-managed node to the tested
   compatible version (`remnawave/node:3.4.1`) and recreate only that node.
   Provider-managed nodes need no credential rotation.
5. Mount the fresh identity export using the bot's existing `backups` volume and
   set `REMNAWAVE_V3_ID_MAP_PATH` in the bot environment. Run Alembic `upgrade head`
   once before bringing up bot API, then worker and scheduler.
6. Run the read-only live check against production. Verify API authorization,
   all saved user IDs/VLESS UUIDs/short UUIDs, all subscription mappings and URLs,
   node connections, public Web App/authentication, and service logs. Do not use
   the write-test flag against production. Remove the one-time env setting after
   migration; keep the protected snapshot as a rollback artifact.

## Rollback

Panel v3 deletes columns from its schema. Downgrading an image alone is unsafe.
Stop all writers again, restore **both** coordinated database backups, original
panel/node/bot compose files and environments, then start the saved old images.
Restore missing PostgreSQL roles first if rebuilding databases from scratch.
Do not delete volumes or apply `docker compose down -v` to production.

Migration 0045 can be reversed only while every subscription still has its
legacy UUID. Once new v3 subscriptions exist, it deliberately refuses downgrade;
use the coordinated backup procedure instead. A later migration correction must
not silently guess identities by Telegram ID or erase subscription history.

Local checks: `uv run python -m pytest checks/test_remnawave_v3.py -q`,
`uv run ruff check src checks scripts/remnawave_v3_preflight.py`, `uv run mypy src`.
