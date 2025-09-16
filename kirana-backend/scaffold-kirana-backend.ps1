param([string]$Root = "kirana-backend")

function New-Dir($Path) {
  New-Item -ItemType Directory -Path $Path -Force -ErrorAction SilentlyContinue | Out-Null
}
function New-File($Path) {
  $parent = Split-Path -Parent $Path
  if ($parent) { New-Dir $parent }
  New-Item -ItemType File -Path $Path -Force -ErrorAction SilentlyContinue | Out-Null
}

$dirs = @(
  "$Root/src/config",
  "$Root/src/db/migrations",
  "$Root/src/libs/sms",
  "$Root/src/libs/cache",
  "$Root/src/libs/queue",
  "$Root/src/libs/storage",
  "$Root/src/libs/payments",
  "$Root/src/middlewares",
  "$Root/src/utils",
  "$Root/src/modules/auth",
  "$Root/src/modules/user",
  "$Root/src/modules/seller",
  "$Root/src/modules/store",
  "$Root/src/modules/catalog",
  "$Root/src/modules/cart",
  "$Root/src/modules/order",
  "$Root/src/modules/payment",
  "$Root/src/modules/inventory",
  "$Root/src/modules/support",
  "$Root/src/modules/admin",
  "$Root/src/jobs",
  "$Root/src/events",
  "$Root/tests",
  "$Root/env",
  "$Root/docker",
  "$Root/scripts"
)
$dirs | ForEach-Object { New-Dir $_ }

$files = @(
  "$Root/src/app.js",
  "$Root/src/server.js",
  "$Root/src/config/index.js",
  "$Root/src/config/env.js",
  "$Root/src/db/connection.js",
  "$Root/src/libs/sms/msg91.js",
  "$Root/src/libs/sms/twilio.js",
  "$Root/src/libs/sms/exotel.js",
  "$Root/src/libs/cache/redis.js",
  "$Root/src/libs/queue/bullmq.js",
  "$Root/src/libs/storage/local.js",
  "$Root/src/libs/payments/upi.js",
  "$Root/src/middlewares/auth.js",
  "$Root/src/middlewares/error.js",
  "$Root/src/middlewares/rate-limit.js",
  "$Root/src/utils/logger.js",
  "$Root/src/utils/crypto.js",
  "$Root/src/utils/validation.js",
  "$Root/src/modules/auth/controller.js",
  "$Root/src/modules/auth/service.js",
  "$Root/src/modules/auth/repository.js",
  "$Root/src/modules/auth/routes.js",
  "$Root/src/modules/auth/validators.js",
  "$Root/src/jobs/otp.dispatch.js",
  "$Root/src/events/order.status.js",
  "$Root/tests/README.md",
  "$Root/env/.env.example",
  "$Root/env/.env.development",
  "$Root/env/.env.production",
  "$Root/docker/Dockerfile",
  "$Root/docker/docker-compose.yml",
  "$Root/scripts/migrate.sh",
  "$Root/scripts/seed.sh",
  "$Root/.gitignore",
  "$Root/.editorconfig",
  "$Root/eslint.config.js",
  "$Root/nodemon.json",
  "$Root/README.md"
)
$files | ForEach-Object { New-File $_ }

Write-Host "✅ Empty JS backend scaffold created at $Root"
