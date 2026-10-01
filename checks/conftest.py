"""Harmless settings for imports that instantiate the task broker at module load."""

import os

for key, value in {
    "APP_DOMAIN": "example.test",
    "APP_CRYPT_KEY": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    "APP_WEB_ENABLED": "false",
    "BOT_TOKEN": "12345:test-token-for-offline-checks",
    "BOT_SECRET_TOKEN": "offline-test-secret",
    "BOT_OWNER_ID": "12345",
    "BOT_SUPPORT_USERNAME": "test_support",
    "REMNAWAVE_TOKEN": "offline-test-token",
    "REMNAWAVE_WEBHOOK_SECRET": "offline-test-secret",
    "DATABASE_PASSWORD": "offline-test-password",
}.items():
    os.environ.setdefault(key, value)
