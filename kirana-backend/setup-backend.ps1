# setup-backend.ps1
# Run this in the project root (e.g., D:\Abu\Kirana_1)

$root = "kirana-backend"

# Define folder structure
$folders = @(
    "$root\src\config",
    "$root\src\routes",
    "$root\src\controllers",
    "$root\src\middleware",
    "$root\src\utils"
)

# Create folders
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

# Define files to create
$files = @(
    "$root\src\config\db.js",
    "$root\src\routes\auth.routes.js",
    "$root\src\controllers\auth.controller.js",
    "$root\src\middleware\auth.middleware.js",
    "$root\src\utils\jwt.js",
    "$root\src\server.js",
    "$root\src\app.js",
    "$root\.env",
    "$root\package.json"
)

# Create empty files
foreach ($file in $files) {
    New-Item -ItemType File -Force -Path $file | Out-Null
}

Write-Host "✅ kirana-backend folder structure created successfully!"
