
```
Kirana
├─ kirana-backend
└─ kirana-frontend
   ├─ .cursor
   │  └─ mcp.json
   ├─ .expo
   │  ├─ devices.json
   │  ├─ packager-info.json
   │  ├─ README.md
   │  ├─ settings.json
   │  └─ types
   │     └─ router.d.ts
   ├─ app
   │  ├─ (admin)
   │  ├─ (auth)
   │  ├─ (main)
   │  ├─ index.tsx
   │  └─ _layout.tsx
   ├─ app.json
   ├─ assets
   │  └─ images
   │     ├─ android-icon-background.png
   │     ├─ android-icon-foreground.png
   │     ├─ android-icon-monochrome.png
   │     ├─ favicon.png
   │     ├─ icon.png
   │     ├─ partial-react-logo.png
   │     ├─ react-logo.png
   │     ├─ react-logo@2x.png
   │     ├─ react-logo@3x.png
   │     └─ splash-icon.png
   ├─ babel.config.js
   ├─ eslint.config.js
   ├─ expo-env.d.ts
   ├─ global.css
   ├─ metro.config.js
   ├─ nativewind-env.d.ts
   ├─ package-lock.json
   ├─ package.json
   ├─ README.md
   ├─ tailwind.config.js
   └─ tsconfig.json

```
```
Kirana
├─ .claude
│  └─ settings.local.json
├─ database_schema.sql
├─ kirana-backend
│  ├─ .env
│  ├─ .env.development
│  ├─ .env.example
│  ├─ .env.production
│  ├─ db
│  │  └─ migrations
│  │     ├─ 003_kyc_tables.sql
│  │     └─ rollback_003_kyc_tables.sql
│  ├─ db_query
│  ├─ MIGRATION_README.md
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ scaffold-kirana-backend.ps1
│  ├─ scripts
│  │  ├─ migrate.sh
│  │  └─ seed.sh
│  ├─ src
│  │  ├─ app.js
│  │  ├─ config
│  │  │  ├─ env.js
│  │  │  ├─ index.js
│  │  │  └─ security.js
│  │  ├─ db
│  │  │  ├─ connection.js
│  │  │  └─ migrations
│  │  ├─ events
│  │  │  └─ order.status.js
│  │  ├─ jobs
│  │  │  └─ otp.dispatch.js
│  │  ├─ libs
│  │  │  ├─ cache
│  │  │  │  └─ redis.js
│  │  │  ├─ payments
│  │  │  │  └─ upi.js
│  │  │  ├─ queue
│  │  │  │  └─ bullmq.js
│  │  │  ├─ sms
│  │  │  │  ├─ exotel.js
│  │  │  │  ├─ msg91.js
│  │  │  │  └─ twilio.js
│  │  │  └─ storage
│  │  │     └─ local.js
│  │  ├─ middleware
│  │  │  ├─ auth.js
│  │  │  ├─ kycGate.js
│  │  │  ├─ rateLimit.js
│  │  │  └─ validation.js
│  │  ├─ middlewares
│  │  │  ├─ auth.js
│  │  │  ├─ error.js
│  │  │  └─ rate-limit.js
│  │  ├─ modules
│  │  │  ├─ admin
│  │  │  ├─ auth
│  │  │  │  ├─ controller.js
│  │  │  │  ├─ repository.js
│  │  │  │  ├─ routes.js
│  │  │  │  ├─ service.js
│  │  │  │  ├─ sms_email.js
│  │  │  │  └─ validators.js
│  │  │  ├─ cart
│  │  │  ├─ catalog
│  │  │  ├─ inventory
│  │  │  │  ├─ controller.js
│  │  │  │  ├─ repository.js
│  │  │  │  ├─ routes.js
│  │  │  │  ├─ service.js
│  │  │  │  └─ validators.js
│  │  │  ├─ kyc
│  │  │  │  ├─ controller.js
│  │  │  │  ├─ repository.js
│  │  │  │  ├─ routes.js
│  │  │  │  └─ service.js
│  │  │  ├─ order
│  │  │  ├─ payment
│  │  │  ├─ seller
│  │  │  │  └─ routes.js
│  │  │  ├─ store
│  │  │  ├─ support
│  │  │  └─ user
│  │  ├─ server.js
│  │  └─ utils
│  │     ├─ crypto.js
│  │     ├─ fileUpload.js
│  │     ├─ logger.js
│  │     └─ validation.js
│  ├─ tests
│  │  └─ README.md
│  ├─ uploads
│  │  └─ products
│  │     ├─ product_1758619609640_evy9jpn2v.jpg
│  │     ├─ product_1758619623320_j43wvf5rk.jpg
│  │     ├─ product_1758621397775_vkz6hwlgb.jpeg
│  │     ├─ product_1758621415743_v02r9zcka.jpeg
│  │     ├─ product_1758621421208_fvyxxazp1.jpeg
│  │     ├─ product_1758621971413_dqi9zv3pt.jpeg
│  │     └─ product_1758622087806_uzfi7t4ow.jpeg
│  └─ utils
├─ kirana-frontend
│  ├─ .cursor
│  │  └─ mcp.json
│  ├─ .env
│  ├─ .expo
│  │  ├─ devices.json
│  │  ├─ packager-info.json
│  │  ├─ README.md
│  │  ├─ settings.json
│  │  └─ types
│  │     └─ router.d.ts
│  ├─ app
│  │  ├─ (admin)
│  │  │  ├─ disputes.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ offers.tsx
│  │  │  ├─ sellers.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ (auth)
│  │  │  ├─ forgot-password.tsx
│  │  │  ├─ login.tsx
│  │  │  ├─ onboarding.tsx
│  │  │  ├─ otp.tsx
│  │  │  ├─ signup.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ (customer)
│  │  │  ├─ cart.tsx
│  │  │  ├─ checkout.tsx
│  │  │  ├─ index.tsx
│  │  │  ├─ orders
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ [orderId].tsx
│  │  │  ├─ profile.tsx
│  │  │  ├─ store
│  │  │  │  ├─ [storeId]
│  │  │  │  │  └─ product
│  │  │  │  │     └─ [productId].tsx
│  │  │  │  └─ [storeId].tsx
│  │  │  ├─ support
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ new.tsx
│  │  │  ├─ wallet.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ (main)
│  │  ├─ (seller)
│  │  │  ├─ index.tsx
│  │  │  ├─ inventory
│  │  │  │  ├─ bulk-upload.tsx
│  │  │  │  ├─ edit
│  │  │  │  │  └─ [productId].tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ new.tsx
│  │  │  ├─ kyc.tsx
│  │  │  ├─ orders
│  │  │  │  ├─ index.tsx
│  │  │  │  └─ [orderId].tsx
│  │  │  ├─ reports.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ index.tsx
│  │  └─ _layout.tsx
│  ├─ app.json
│  ├─ assets
│  │  ├─ icons
│  │  │  └─ .keep
│  │  ├─ images
│  │  │  ├─ android-icon-background.png
│  │  │  ├─ android-icon-foreground.png
│  │  │  ├─ android-icon-monochrome.png
│  │  │  ├─ banners
│  │  │  │  └─ .keep
│  │  │  ├─ favicon.png
│  │  │  ├─ icon.png
│  │  │  ├─ logo.png
│  │  │  ├─ partial-react-logo.png
│  │  │  ├─ react-logo.png
│  │  │  ├─ react-logo@2x.png
│  │  │  ├─ react-logo@3x.png
│  │  │  ├─ splash-icon.png
│  │  │  └─ splash.png
│  │  └─ lottie
│  │     └─ .keep
│  ├─ babel.config.js
│  ├─ eslint.config.js
│  ├─ expo-env.d.ts
│  ├─ global.css
│  ├─ metro.config.js
│  ├─ nativewind-env.d.ts
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ scaffold-kirana-frontend.ps1
│  ├─ src
│  │  ├─ api
│  │  │  ├─ admin.api.ts
│  │  │  ├─ auth.api.ts
│  │  │  ├─ cart.api.ts
│  │  │  ├─ client.ts
│  │  │  ├─ inventory.api.ts
│  │  │  ├─ orders.api.ts
│  │  │  ├─ payments.api.ts
│  │  │  ├─ products.api.ts
│  │  │  ├─ seller.api.ts
│  │  │  ├─ stores.api.ts
│  │  │  └─ uploads.api.ts
│  │  ├─ app-config
│  │  │  ├─ colors.ts
│  │  │  ├─ constants.ts
│  │  │  ├─ icons.ts
│  │  │  ├─ theme.ts
│  │  │  └─ typography.ts
│  │  ├─ components
│  │  │  └─ CustomDrawer.tsx
│  │  ├─ constants
│  │  │  └─ drawer.ts
│  │  ├─ context
│  │  │  ├─ AuthContext.tsx
│  │  │  └─ KYCContext.tsx
│  │  ├─ features
│  │  │  ├─ admin
│  │  │  │  ├─ components
│  │  │  │  │  ├─ DisputeRow.tsx
│  │  │  │  │  └─ SellerRow.tsx
│  │  │  │  └─ hooks.ts
│  │  │  ├─ auth
│  │  │  │  ├─ api.ts
│  │  │  │  ├─ hooks.ts
│  │  │  │  ├─ mutations.ts
│  │  │  │  └─ validators.ts
│  │  │  ├─ cart
│  │  │  │  ├─ hooks.ts
│  │  │  │  └─ store.ts
│  │  │  ├─ catalog
│  │  │  │  ├─ components
│  │  │  │  │  ├─ CategoryTile.tsx
│  │  │  │  │  ├─ FiltersSheet.tsx
│  │  │  │  │  └─ ProductCard.tsx
│  │  │  │  └─ hooks.ts
│  │  │  ├─ location
│  │  │  │  ├─ hooks.ts
│  │  │  │  └─ services.ts
│  │  │  ├─ orders
│  │  │  │  ├─ components
│  │  │  │  │  ├─ OrderCard.tsx
│  │  │  │  │  └─ Timeline.tsx
│  │  │  │  └─ hooks.ts
│  │  │  ├─ payments
│  │  │  │  ├─ hooks.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ seller
│  │  │  │  ├─ inventory
│  │  │  │  │  ├─ components
│  │  │  │  │  │  ├─ BulkUploadSheet.tsx
│  │  │  │  │  │  └─ ProductForm.tsx
│  │  │  │  │  └─ hooks.ts
│  │  │  │  ├─ orders
│  │  │  │  │  └─ hooks.ts
│  │  │  │  └─ reports
│  │  │  │     └─ hooks.ts
│  │  │  ├─ support
│  │  │  │  ├─ hooks.ts
│  │  │  │  └─ validators.ts
│  │  │  └─ wallet
│  │  │     └─ hooks.ts
│  │  ├─ hooks
│  │  │  ├─ useDebounce.ts
│  │  │  ├─ usePaginatedList.ts
│  │  │  ├─ useRefetchOnFocus.ts
│  │  │  └─ useUpload.ts
│  │  ├─ i18n
│  │  │  ├─ en.json
│  │  │  ├─ hi.json
│  │  │  └─ index.ts
│  │  ├─ libs
│  │  │  ├─ analytics.ts
│  │  │  ├─ csv.ts
│  │  │  ├─ notifications.ts
│  │  │  ├─ permissions.ts
│  │  │  ├─ query.ts
│  │  │  ├─ role-router.ts
│  │  │  └─ storage.ts
│  │  ├─ store
│  │  │  ├─ app.store.ts
│  │  │  ├─ auth.store.ts
│  │  │  └─ seller.store.ts
│  │  ├─ types
│  │  │  ├─ admin.ts
│  │  │  ├─ auth.ts
│  │  │  ├─ kyc.ts
│  │  │  ├─ order.ts
│  │  │  ├─ payment.ts
│  │  │  ├─ product.ts
│  │  │  ├─ seller.ts
│  │  │  └─ store.ts
│  │  ├─ ui
│  │  │  ├─ charts
│  │  │  │  └─ Spark.tsx
│  │  │  ├─ feedback
│  │  │  │  ├─ Skeleton.tsx
│  │  │  │  ├─ Snackbar.tsx
│  │  │  │  └─ Toast.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Header.tsx
│  │  │  │  └─ Screen.tsx
│  │  │  └─ primitives
│  │  │     ├─ Badge.tsx
│  │  │     ├─ Button.tsx
│  │  │     ├─ Input.tsx
│  │  │     ├─ Select.tsx
│  │  │     ├─ Sheet.tsx
│  │  │     └─ Tabs.tsx
│  │  └─ utils
│  │     ├─ currency.ts
│  │     ├─ debug.ts
│  │     ├─ distance.ts
│  │     ├─ env.ts
│  │     ├─ time.ts
│  │     └─ validator.ts
│  ├─ tailwind.config.js
│  └─ tsconfig.json
├─ PRODUCTION_DEPLOYMENT.md
└─ README.md

```