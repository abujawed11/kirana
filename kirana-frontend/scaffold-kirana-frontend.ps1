<# 
  scaffold-kirana-frontend.ps1
  Creates empty folder & file structure for Kirana App
#>

param(
  [string]$Root = "kirana-frontend"
)

function New-Dir($Path) {
  New-Item -ItemType Directory -Path $Path -Force -ErrorAction SilentlyContinue | Out-Null
}


function New-File($Path) {
  $dir = Split-Path -Parent $Path
  if ($dir -and -not (Test-Path $dir)) { New-Dir $dir }
  if (-not (Test-Path $Path)) {
    New-Item -ItemType File -Path $Path -Force | Out-Null
  }
}

# -----------------------------
# 1) Directories
# -----------------------------
$dirs = @(
  "$Root/app",
  "$Root/app/(auth)",
  "$Root/app/(customer)/store/[storeId]/product",
  "$Root/app/(customer)/orders",
  "$Root/app/(customer)/support",
  "$Root/app/(seller)/orders",
  "$Root/app/(seller)/inventory/edit",
  "$Root/app/(admin)",
  "$Root/src/app-config",
  "$Root/src/api",
  "$Root/src/features/auth",
  "$Root/src/features/location",
  "$Root/src/features/catalog/components",
  "$Root/src/features/cart",
  "$Root/src/features/orders/components",
  "$Root/src/features/payments",
  "$Root/src/features/seller/inventory/components",
  "$Root/src/features/seller/orders",
  "$Root/src/features/seller/reports",
  "$Root/src/features/admin/components",
  "$Root/src/features/support",
  "$Root/src/features/wallet",
  "$Root/src/ui/primitives",
  "$Root/src/ui/feedback",
  "$Root/src/ui/layout",
  "$Root/src/ui/charts",
  "$Root/src/libs",
  "$Root/src/store",
  "$Root/src/hooks",
  "$Root/src/utils",
  "$Root/src/types",
  "$Root/src/i18n",
  "$Root/assets/images/banners",
  "$Root/assets/icons",
  "$Root/assets/lottie",
  "$Root/env"
)
$dirs | ForEach-Object { New-Dir $_ }

# -----------------------------
# 2) Files (empty)
# -----------------------------
$files = @(
  "$Root/app/_layout.tsx",
  "$Root/app/index.tsx",

  "$Root/app/(auth)/_layout.tsx",
  "$Root/app/(auth)/onboarding.tsx",
  "$Root/app/(auth)/login.tsx",
  "$Root/app/(auth)/otp.tsx",
  "$Root/app/(auth)/signup.tsx",

  "$Root/app/(customer)/_layout.tsx",
  "$Root/app/(customer)/index.tsx",
  "$Root/app/(customer)/cart.tsx",
  "$Root/app/(customer)/checkout.tsx",
  "$Root/app/(customer)/wallet.tsx",
  "$Root/app/(customer)/profile.tsx",
  "$Root/app/(customer)/orders/index.tsx",
  "$Root/app/(customer)/orders/[orderId].tsx",
  "$Root/app/(customer)/support/index.tsx",
  "$Root/app/(customer)/support/new.tsx",
  "$Root/app/(customer)/store/[storeId].tsx",
  "$Root/app/(customer)/store/[storeId]/product/[productId].tsx",

  "$Root/app/(seller)/_layout.tsx",
  "$Root/app/(seller)/index.tsx",
  "$Root/app/(seller)/kyc.tsx",
  "$Root/app/(seller)/orders/index.tsx",
  "$Root/app/(seller)/orders/[orderId].tsx",
  "$Root/app/(seller)/inventory/index.tsx",
  "$Root/app/(seller)/inventory/new.tsx",
  "$Root/app/(seller)/inventory/edit/[productId].tsx",
  "$Root/app/(seller)/inventory/bulk-upload.tsx",
  "$Root/app/(seller)/reports.tsx",

  "$Root/app/(admin)/_layout.tsx",
  "$Root/app/(admin)/index.tsx",
  "$Root/app/(admin)/sellers.tsx",
  "$Root/app/(admin)/disputes.tsx",
  "$Root/app/(admin)/offers.tsx",

  "$Root/src/app-config/theme.ts",
  "$Root/src/app-config/colors.ts",
  "$Root/src/app-config/typography.ts",
  "$Root/src/app-config/icons.ts",
  "$Root/src/app-config/constants.ts",

  "$Root/src/api/client.ts",
  "$Root/src/api/auth.api.ts",
  "$Root/src/api/stores.api.ts",
  "$Root/src/api/products.api.ts",
  "$Root/src/api/cart.api.ts",
  "$Root/src/api/orders.api.ts",
  "$Root/src/api/payments.api.ts",
  "$Root/src/api/inventory.api.ts",
  "$Root/src/api/seller.api.ts",
  "$Root/src/api/admin.api.ts",
  "$Root/src/api/uploads.api.ts",

  "$Root/src/features/auth/hooks.ts",
  "$Root/src/features/auth/mutations.ts",
  "$Root/src/features/auth/validators.ts",

  "$Root/src/features/location/hooks.ts",
  "$Root/src/features/location/services.ts",

  "$Root/src/features/catalog/hooks.ts",
  "$Root/src/features/catalog/components/CategoryTile.tsx",
  "$Root/src/features/catalog/components/ProductCard.tsx",
  "$Root/src/features/catalog/components/FiltersSheet.tsx",

  "$Root/src/features/cart/store.ts",
  "$Root/src/features/cart/hooks.ts",

  "$Root/src/features/orders/hooks.ts",
  "$Root/src/features/orders/components/Timeline.tsx",
  "$Root/src/features/orders/components/OrderCard.tsx",

  "$Root/src/features/payments/hooks.ts",
  "$Root/src/features/payments/utils.ts",

  "$Root/src/features/seller/inventory/hooks.ts",
  "$Root/src/features/seller/inventory/components/ProductForm.tsx",
  "$Root/src/features/seller/inventory/components/BulkUploadSheet.tsx",
  "$Root/src/features/seller/orders/hooks.ts",
  "$Root/src/features/seller/reports/hooks.ts",

  "$Root/src/features/admin/hooks.ts",
  "$Root/src/features/admin/components/SellerRow.tsx",
  "$Root/src/features/admin/components/DisputeRow.tsx",

  "$Root/src/features/support/hooks.ts",
  "$Root/src/features/support/validators.ts",

  "$Root/src/features/wallet/hooks.ts",

  "$Root/src/ui/primitives/Button.tsx",
  "$Root/src/ui/primitives/Input.tsx",
  "$Root/src/ui/primitives/Select.tsx",
  "$Root/src/ui/primitives/Sheet.tsx",
  "$Root/src/ui/primitives/Tabs.tsx",
  "$Root/src/ui/primitives/Badge.tsx",

  "$Root/src/ui/feedback/Toast.tsx",
  "$Root/src/ui/feedback/Snackbar.tsx",
  "$Root/src/ui/feedback/Skeleton.tsx",

  "$Root/src/ui/layout/Screen.tsx",
  "$Root/src/ui/layout/Header.tsx",

  "$Root/src/ui/charts/Spark.tsx",

  "$Root/src/libs/query.ts",
  "$Root/src/libs/storage.ts",
  "$Root/src/libs/notifications.ts",
  "$Root/src/libs/analytics.ts",
  "$Root/src/libs/role-router.ts",
  "$Root/src/libs/csv.ts",
  "$Root/src/libs/permissions.ts",

  "$Root/src/store/auth.store.ts",
  "$Root/src/store/app.store.ts",
  "$Root/src/store/seller.store.ts",

  "$Root/src/hooks/useDebounce.ts",
  "$Root/src/hooks/usePaginatedList.ts",
  "$Root/src/hooks/useRefetchOnFocus.ts",
  "$Root/src/hooks/useUpload.ts",

  "$Root/src/utils/currency.ts",
  "$Root/src/utils/distance.ts",
  "$Root/src/utils/time.ts",
  "$Root/src/utils/validator.ts",
  "$Root/src/utils/env.ts",

  "$Root/src/types/auth.ts",
  "$Root/src/types/store.ts",
  "$Root/src/types/product.ts",
  "$Root/src/types/order.ts",
  "$Root/src/types/payment.ts",
  "$Root/src/types/seller.ts",
  "$Root/src/types/admin.ts",

  "$Root/src/i18n/index.ts",
  "$Root/src/i18n/en.json",
  "$Root/src/i18n/hi.json",

  "$Root/assets/images/logo.png",
  "$Root/assets/images/splash.png",
  "$Root/assets/images/banners/.keep",
  "$Root/assets/icons/.keep",
  "$Root/assets/lottie/.keep",

  "$Root/env/.env.example",
  "$Root/env/.env.development",
  "$Root/env/.env.production",

  "$Root/app.config.ts",
  "$Root/tailwind.config.js",
  "$Root/tsconfig.json",
  "$Root/babel.config.js",
  "$Root/eslint.config.js",
  "$Root/metro.config.js",
  "$Root/global.css",
  "$Root/README.md"
)

$files | ForEach-Object { New-File $_ }

Write-Host "✅ Empty scaffold complete at $Root"
