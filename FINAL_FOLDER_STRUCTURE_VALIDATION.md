# UNDESIA Platform — Final Folder Structure & Feature Validation

> **Versi**: 1.0.0 (FINAL)  
> **Tanggal**: 10 Juni 2026  
> **Status**: READY FOR PHASE 0  

---

## PART 1: LARAVEL FOLDER STRUCTURE

### 1.1 Root Directory Layout

```
undesia/
├── app/                          # Application code
│   ├── Console/
│   │   ├── Kernel.php           # Scheduled commands
│   │   └── Commands/            # Artisan commands
│   │       ├── domain/
│   │       ├── DomainVerifyPendingCommand.php
│   │       ├── CertificateRenewCommand.php
│   │       ├── PaymentSyncCommand.php
│   │       ├── AnalyticsAggregateCommand.php
│   │       └── AdminCreateUserCommand.php
│   │
│   ├── Events/                  # Event classes (6 events)
│   │   ├── InvitationActivated.php
│   │   ├── PaymentReceived.php
│   │   ├── RsvpSubmitted.php
│   │   └── GenderRevealed.php
│   │
│   ├── Http/
│   │   ├── Controllers/         # 18+ controllers
│   │   │   ├── API/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── InvitationController.php
│   │   │   │   ├── GuestController.php
│   │   │   │   ├── RsvpController.php
│   │   │   │   ├── TransactionController.php
│   │   │   │   ├── PaymentController.php
│   │   │   │   ├── CommentController.php
│   │   │   │   ├── AnalyticsController.php
│   │   │   │   ├── AmplopeController.php
│   │   │   │   ├── GenderPollController.php
│   │   │   │   ├── GalleryController.php
│   │   │   │   ├── StoriesController.php
│   │   │   │   ├── DressCodeController.php
│   │   │   │   ├── LiveStreamController.php
│   │   │   │   ├── InteractiveGameController.php
│   │   │   │   ├── PageBuilderController.php
│   │   │   │   ├── SettingsController.php
│   │   │   │   └── UserProfileController.php
│   │   │   │
│   │   │   └── Admin/           # Admin controllers
│   │   │       ├── AdminController.php
│   │   │       ├── UserManagementController.php
│   │   │       ├── PaymentGatewayController.php
│   │   │       ├── TestimonialController.php
│   │   │       └── AnalyticsAdminController.php
│   │   │
│   │   ├── Requests/            # Form request validation (15+)
│   │   │   ├── Auth/
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   ├── LoginRequest.php
│   │   │   │   └── ResetPasswordRequest.php
│   │   │   ├── Invitations/
│   │   │   │   ├── StoreInvitationRequest.php
│   │   │   │   └── UpdateInvitationRequest.php
│   │   │   ├── Guests/
│   │   │   │   ├── StoreGuestRequest.php
│   │   │   │   └── ImportGuestRequest.php
│   │   │   ├── Payments/
│   │   │   │   ├── CheckoutRequest.php
│   │   │   │   └── SubmitEnvelopeRequest.php
│   │   │   └── ... (more)
│   │   │
│   │   ├── Resources/           # API response formatters (5+)
│   │   │   ├── InvitationResource.php
│   │   │   ├── GuestResource.php
│   │   │   ├── TransactionResource.php
│   │   │   ├── PaymentResource.php
│   │   │   └── CommentResource.php
│   │   │
│   │   └── Middleware/          # Request middleware (5+)
│   │       ├── InvitationOwner.php
│   │       ├── InvitationActive.php
│   │       ├── InvitationPassword.php
│   │       ├── CheckFeatureGate.php
│   │       └── RateLimit.php
│   │
│   ├── Jobs/                    # Queue jobs (7)
│   │   ├── SendWhatsAppInvitation.php
│   │   ├── SendEmailNotification.php
│   │   ├── ProcessPaymentWebhook.php
│   │   ├── GenerateQrCodeJob.php
│   │   ├── TrackPageViewJob.php
│   │   ├── SendWhatsAppRsvpNotification.php
│   │   └── AggregateAnalyticsSummary.php
│   │
│   ├── Listeners/               # Event listeners (6)
│   │   ├── SendActivationEmail.php
│   │   ├── SendActivationWhatsApp.php
│   │   ├── SendPaymentConfirmation.php
│   │   ├── ActivateInvitation.php
│   │   ├── SendRsvpNotification.php
│   │   └── TriggerRevealAnimation.php
│   │
│   ├── Models/                  # Eloquent models (42)
│   │   ├── User.php
│   │   ├── UserProfile.php
│   │   ├── Invitation.php
│   │   ├── InvitationSetting.php
│   │   ├── InvitationEvent.php
│   │   ├── InvitationContent.php
│   │   ├── InvitationPaymentMethod.php
│   │   ├── EventType.php
│   │   ├── EventTypeField.php
│   │   ├── Guest.php
│   │   ├── Rsvp.php
│   │   ├── Comment.php
│   │   ├── GenderPollVote.php
│   │   ├── GalleryPhoto.php
│   │   ├── Story.php
│   │   ├── SliderPhoto.php
│   │   ├── Theme.php
│   │   ├── Transaction.php
│   │   ├── Payment.php
│   │   ├── BankAccount.php
│   │   ├── QrisAccount.php
│   │   ├── Package.php
│   │   ├── PackageFeature.php
│   │   ├── LiveStreamSession.php
│   │   ├── InteractiveGame.php
│   │   ├── GameResponse.php
│   │   ├── InstagramFilter.php
│   │   ├── DressCode.php
│   │   ├── DressCodeItem.php
│   │   ├── DressCodePalette.php
│   │   ├── GiftWishlistItem.php
│   │   ├── PaymentGatewayConfig.php
│   │   ├── PaymentGatewayAuditLog.php
│   │   ├── DigitalEnvelopeTransaction.php
│   │   ├── PageView.php
│   │   ├── ActivityLog.php
│   │   ├── Testimonial.php
│   │   └── AdminUser.php
│   │
│   ├── Policies/                # Authorization policies (4)
│   │   ├── InvitationPolicy.php
│   │   ├── GuestPolicy.php
│   │   ├── TransactionPolicy.php
│   │   └── CommentPolicy.php
│   │
│   ├── Providers/               # Service providers
│   │   ├── AppServiceProvider.php
│   │   ├── AuthServiceProvider.php
│   │   ├── RepositoryServiceProvider.php
│   │   └── EventServiceProvider.php
│   │
│   ├── Repositories/            # Repository pattern (5)
│   │   ├── Contracts/
│   │   │   ├── InvitationRepositoryInterface.php
│   │   │   ├── GuestRepositoryInterface.php
│   │   │   ├── TransactionRepositoryInterface.php
│   │   │   ├── PaymentRepositoryInterface.php
│   │   │   └── PageViewRepositoryInterface.php
│   │   └── Implementations/
│   │       ├── InvitationRepository.php
│   │       ├── GuestRepository.php
│   │       ├── TransactionRepository.php
│   │       ├── PaymentRepository.php
│   │       └── PageViewRepository.php
│   │
│   └── Services/                # Business logic services (14+)
│       ├── InvitationService.php
│       ├── InvitationContentService.php
│       ├── GuestService.php
│       ├── PaymentGatewayManager.php
│       ├── TransactionService.php
│       ├── RsvpService.php
│       ├── GenderPollService.php
│       ├── AnalyticsService.php
│       ├── WhatsAppService.php
│       ├── NotificationService.php
│       ├── InvitationFeatureGate.php
│       ├── PageBuilderService.php
│       ├── QrCodeService.php
│       ├── ThemeService.php
│       │
│       └── Payment/              # Payment gateway implementations
│           ├── PaymentGatewayInterface.php
│           ├── Providers/
│           │   ├── MidtransProvider.php
│           │   ├── XenditProvider.php
│           │   └── ManualTransferProvider.php
│           └── Webhooks/
│               ├── MidtransWebhookHandler.php
│               ├── XenditWebhookHandler.php
│               └── WebhookVerifier.php
│
├── bootstrap/                   # Bootstrap files
│   ├── app.php
│   ├── cache/
│   │   ├── packages.php
│   │   └── services.php
│   └── providers.php
│
├── config/                      # Configuration files
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── filesystems.php
│   ├── logging.php
│   ├── mail.php
│   ├── queue.php
│   ├── services.php
│   ├── session.php
│   ├── undesia.php              # Custom app config
│   └── payment-gateways.php     # Payment provider configs
│
├── database/
│   ├── factories/               # Model factories
│   │   ├── UserFactory.php
│   │   ├── InvitationFactory.php
│   │   ├── GuestFactory.php
│   │   └── ... (20+ factories)
│   │
│   ├── migrations/              # Database migrations (32+)
│   │   ├── 2024_01_01_000001_create_users_table.php
│   │   ├── 2024_01_01_000002_create_user_profiles_table.php
│   │   ├── 2024_01_01_000003_create_event_types_table.php
│   │   ├── 2024_01_01_000004_create_event_type_fields_table.php
│   │   ├── 2024_01_01_000005_create_packages_table.php
│   │   ├── 2024_01_01_000006_create_package_features_table.php
│   │   ├── 2024_01_01_000007_create_invitations_table.php
│   │   ├── 2024_01_01_000008_create_invitation_settings_table.php
│   │   ├── 2024_01_01_000009_create_invitation_events_table.php
│   │   ├── 2024_01_01_000010_create_invitation_contents_table.php
│   │   ├── 2024_01_01_000011_create_invitation_payment_methods_table.php
│   │   ├── 2024_01_01_000012_create_guests_table.php
│   │   ├── 2024_01_01_000013_create_rsvps_table.php
│   │   ├── 2024_01_01_000014_create_comments_table.php
│   │   ├── 2024_01_01_000015_create_gallery_photos_table.php
│   │   ├── 2024_01_01_000016_create_stories_table.php
│   │   ├── 2024_01_01_000017_create_slider_photos_table.php
│   │   ├── 2024_01_01_000018_create_transactions_table.php
│   │   ├── 2024_01_01_000019_create_payments_table.php
│   │   ├── 2024_01_01_000020_create_bank_accounts_table.php
│   │   ├── 2024_01_01_000021_create_qris_accounts_table.php
│   │   ├── 2024_01_01_000022_create_themes_table.php
│   │   ├── 2024_01_01_000023_create_gender_poll_votes_table.php
│   │   ├── 2024_01_01_000024_create_live_stream_sessions_table.php
│   │   ├── 2024_01_01_000025_create_interactive_games_table.php
│   │   ├── 2024_01_01_000026_create_game_responses_table.php
│   │   ├── 2024_01_01_000027_create_instagram_filters_table.php
│   │   ├── 2024_01_01_000028_create_dress_codes_table.php
│   │   ├── 2024_01_01_000029_create_dress_code_items_table.php
│   │   ├── 2024_01_01_000030_create_dress_code_palettes_table.php
│   │   ├── 2024_01_01_000031_create_page_views_table.php
│   │   ├── 2024_01_01_000032_create_activity_logs_table.php
│   │   ├── 2024_01_01_000033_create_payment_gateway_configs_table.php
│   │   ├── 2024_01_01_000034_create_payment_gateway_audit_logs_table.php
│   │   ├── 2024_01_01_000035_create_digital_envelope_transactions_table.php
│   │   ├── 2024_01_01_000036_create_gift_wishlist_items_table.php
│   │   └── 2024_01_01_000037_create_testimonials_table.php
│   │
│   └── seeders/                 # Database seeders
│       ├── DatabaseSeeder.php
│       ├── EventTypeSeeder.php
│       ├── PackageSeeder.php
│       ├── ThemeSeeder.php
│       ├── PermissionSeeder.php
│       ├── UserSeeder.php
│       ├── InvitationSeeder.php
│       └── GuestSeeder.php
│
├── public/                      # Public web root
│   ├── index.php
│   ├── .htaccess
│   └── build/                   # Vite build output
│       ├── manifest.json
│       └── assets/              # Generated JS, CSS
│
├── resources/
│   ├── css/
│   │   ├── app.css              # Global styles
│   │   └── tailwind.css         # Tailwind config import
│   │
│   ├── js/
│   │   ├── app.tsx              # Inertia app entry point
│   │   ├── ssr.jsx              # Server-side rendering
│   │   │
│   │   ├── components/          # React components
│   │   │   ├── Common/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   │
│   │   │   ├── Invitation/
│   │   │   │   ├── InvitationCard.tsx
│   │   │   │   ├── InvitationList.tsx
│   │   │   │   └── InvitationForm.tsx
│   │   │   │
│   │   │   ├── Guest/
│   │   │   │   ├── GuestTable.tsx
│   │   │   │   ├── GuestForm.tsx
│   │   │   │   ├── GuestImportModal.tsx
│   │   │   │   └── GuestSearch.tsx
│   │   │   │
│   │   │   ├── Payment/
│   │   │   │   ├── CheckoutForm.tsx
│   │   │   │   ├── PaymentStatus.tsx
│   │   │   │   └── PaymentHistory.tsx
│   │   │   │
│   │   │   ├── PageBuilder/
│   │   │   │   ├── BuilderCanvas.tsx
│   │   │   │   ├── SectionEditor.tsx
│   │   │   │   ├── PreviewPanel.tsx
│   │   │   │   └── DragDropZone.tsx
│   │   │   │
│   │   │   ├── Analytics/
│   │   │   │   ├── AnalyticsDashboard.tsx
│   │   │   │   ├── VisitorChart.tsx
│   │   │   │   ├── DeviceBreakdown.tsx
│   │   │   │   └── ExportButton.tsx
│   │   │   │
│   │   │   ├── Public/
│   │   │   │   ├── PublicPage.tsx
│   │   │   │   ├── RsvpForm.tsx
│   │   │   │   ├── GuestbookSection.tsx
│   │   │   │   ├── GallerySection.tsx
│   │   │   │   ├── GenderPollSection.tsx
│   │   │   │   └── EnvelopeSection.tsx
│   │   │   │
│   │   │   └── Admin/
│   │   │       ├── UserManagement.tsx
│   │   │       ├── PaymentGatewayConfig.tsx
│   │   │       └── SystemHealth.tsx
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useInvitation.ts
│   │   │   ├── useInvitationFeatureGate.ts
│   │   │   ├── useAnalytics.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useFormValidation.ts
│   │   │   └── useWebSocket.ts  # For real-time features
│   │   │
│   │   ├── layouts/              # Layout components
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── PublicLayout.tsx
│   │   │
│   │   ├── lib/                  # Utility functions
│   │   │   ├── api.ts            # API client configuration
│   │   │   ├── format.ts         # Date, currency formatting
│   │   │   ├── validators.ts     # Input validation
│   │   │   ├── storage.ts        # Local storage helpers
│   │   │   └── constants.ts      # App constants
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── Auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── RegisterPage.tsx
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── InvitationListPage.tsx
│   │   │   │   ├── CreateInvitationPage.tsx
│   │   │   │   ├── EditInvitationPage.tsx
│   │   │   │   └── InvitationDetailsPage.tsx
│   │   │   │
│   │   │   ├── Guest/
│   │   │   │   ├── GuestManagementPage.tsx
│   │   │   │   └── RsvpListPage.tsx
│   │   │   │
│   │   │   ├── PageBuilder/
│   │   │   │   └── PageBuilderPage.tsx
│   │   │   │
│   │   │   ├── Analytics/
│   │   │   │   └── AnalyticsPage.tsx
│   │   │   │
│   │   │   ├── Amplope/
│   │   │   │   ├── EnvelopeDashboard.tsx
│   │   │   │   ├── BankAccountManagement.tsx
│   │   │   │   └── WithdrawalHistory.tsx
│   │   │   │
│   │   │   ├── Public/
│   │   │   │   └── PublicInvitationPage.tsx
│   │   │   │
│   │   │   └── Admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── UserManagementPage.tsx
│   │   │       └── SystemSettingsPage.tsx
│   │   │
│   │   ├── stores/               # Zustand stores
│   │   │   ├── userStore.ts      # User auth state
│   │   │   ├── invitationStore.ts    # Invitation data
│   │   │   ├── uiStore.ts        # UI state (modals, etc)
│   │   │   └── notificationStore.ts  # Toast/alert state
│   │   │
│   │   └── types/                # TypeScript types
│   │       ├── api.types.ts
│   │       ├── models.types.ts
│   │       ├── forms.types.ts
│   │       └── ui.types.ts
│   │
│   └── views/
│       ├── app.blade.php         # Main Blade template
│       └── emails/               # Email templates
│           ├── invitation-activated.blade.php
│           ├── payment-confirmation.blade.php
│           ├── rsvp-reminder.blade.php
│           └── ... (15+ email templates)
│
├── routes/
│   ├── api.php                  # API routes (REST endpoints)
│   ├── web.php                  # Web routes (Inertia pages)
│   ├── auth.php                 # Authentication routes
│   ├── console.php              # Scheduled commands
│   └── settings.php             # Settings routes
│
├── storage/
│   ├── app/
│   │   ├── public/              # Public uploads (symlinked)
│   │   └── private/             # Private files
│   ├── framework/
│   │   ├── cache/
│   │   ├── sessions/
│   │   ├── testing/
│   │   └── views/
│   └── logs/
│       ├── laravel.log
│       └── payment.log
│
├── tests/
│   ├── TestCase.php
│   ├── Pest.php
│   ├── Unit/                    # Unit tests (95%+ coverage)
│   │   ├── Services/
│   │   │   ├── InvitationServiceTest.php
│   │   │   ├── GuestServiceTest.php
│   │   │   ├── RsvpServiceTest.php
│   │   │   ├── PaymentGatewayManagerTest.php
│   │   │   ├── AnalyticsServiceTest.php
│   │   │   └── ... (10+ more)
│   │   ├── Models/
│   │   │   └── ... (relationship tests)
│   │   └── Repositories/
│   │       └── ... (data access tests)
│   │
│   ├── Feature/                 # Integration tests (90%+ coverage)
│   │   ├── Auth/
│   │   │   ├── RegisterTest.php
│   │   │   └── LoginTest.php
│   │   ├── Invitations/
│   │   │   ├── CreateInvitationTest.php
│   │   │   ├── UpdateInvitationTest.php
│   │   │   └── DeleteInvitationTest.php
│   │   ├── Guests/
│   │   │   ├── AddGuestTest.php
│   │   │   └── ImportCsvTest.php
│   │   ├── Payments/
│   │   │   ├── CheckoutTest.php
│   │   │   ├── WebhookHandlingTest.php
│   │   │   └── RefundTest.php
│   │   └── Admin/
│   │       └── ... (admin-only tests)
│   │
│   └── E2E/                     # End-to-end tests (critical flows)
│       └── CriticalUserFlows.spec.ts
│
├── .env.example                 # Example environment file
├── .gitignore
├── artisan                      # Laravel CLI
├── composer.json
├── composer.lock
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
├── prettier.config.js
├── phpunit.xml
├── README.md
└── LICENSE

```

---

## PART 2: REACT FOLDER STRUCTURE HIERARCHY

```
resources/js/
├── app.tsx                      # Root component
├── ssr.jsx                      # SSR entry point
│
├── components/                  # Reusable components
│   ├── Common/
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
│   │   │   ├── NavbarMenu.tsx
│   │   │   └── UserDropdown.tsx
│   │   ├── Footer/
│   │   │   └── Footer.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── Dialogs/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── AlertDialog.tsx
│   │   │   └── FormDialog.tsx
│   │   └── Loading/
│   │       ├── LoadingSpinner.tsx
│   │       └── SkeletonLoader.tsx
│   │
│   ├── Invitation/
│   │   ├── InvitationCard.tsx
│   │   ├── InvitationGrid.tsx
│   │   ├── InvitationList.tsx
│   │   ├── InvitationForm/
│   │   │   ├── InvitationForm.tsx
│   │   │   ├── EventTypeSelector.tsx
│   │   │   ├── PackageSelector.tsx
│   │   │   └── DetailsForm.tsx
│   │   └── InvitationPreview.tsx
│   │
│   ├── Guest/
│   │   ├── GuestTable.tsx
│   │   ├── GuestRow.tsx
│   │   ├── GuestForm.tsx
│   │   ├── GuestImportModal/
│   │   │   ├── GuestImportModal.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── PreviewTable.tsx
│   │   │   └── MappingForm.tsx
│   │   ├── GuestSearch.tsx
│   │   ├── GuestExporter.tsx
│   │   └── CheckInQRScanner.tsx
│   │
│   ├── Payment/
│   │   ├── CheckoutForm.tsx
│   │   ├── PaymentMethodSelector.tsx
│   │   ├── PaymentGatewayForm/
│   │   │   ├── MidtransForm.tsx
│   │   │   └── XenditForm.tsx
│   │   ├── PaymentStatus.tsx
│   │   ├── PaymentHistory.tsx
│   │   ├── PaymentReceipt.tsx
│   │   └── InvoiceGenerator.tsx
│   │
│   ├── PageBuilder/
│   │   ├── BuilderCanvas.tsx
│   │   ├── BuilderToolbar.tsx
│   │   ├── SectionEditor/
│   │   │   ├── SectionEditor.tsx
│   │   │   ├── SectionSettings.tsx
│   │   │   └── SectionColorPicker.tsx
│   │   ├── PreviewPanel.tsx
│   │   ├── DragDropZone/
│   │   │   ├── DragDropZone.tsx
│   │   │   └── DraggableSection.tsx
│   │   └── ThemeSelector.tsx
│   │
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── AnalyticsWidgets/
│   │   │   ├── TotalVisitorsCard.tsx
│   │   │   ├── VisitorTrendCard.tsx
│   │   │   ├── DeviceBreakdownCard.tsx
│   │   │   ├── ReferrerSourceCard.tsx
│   │   │   └── TopPagesCard.tsx
│   │   ├── Charts/
│   │   │   ├── LineChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── TimeSeriesChart.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ExportButton.tsx
│   │   └── ComparisonView.tsx
│   │
│   ├── Public/
│   │   ├── PublicPage/
│   │   │   ├── PublicPage.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── EventInfoSection.tsx
│   │   │   ├── CountdownSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   ├── RsvpSection.tsx
│   │   │   ├── GuestbookSection.tsx
│   │   │   ├── GenderPollSection.tsx
│   │   │   ├── EnvelopeSection.tsx
│   │   │   ├── LiveStreamSection.tsx
│   │   │   └── FooterSection.tsx
│   │   ├── RsvpForm.tsx
│   │   ├── GuestbookComment.tsx
│   │   ├── GenderPollVoting.tsx
│   │   ├── EnvelopeSubmit.tsx
│   │   ├── PasswordProtect.tsx
│   │   └── LoadingPageGuard.tsx
│   │
│   ├── Admin/
│   │   ├── UserManagement/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── PermissionEditor.tsx
│   │   ├── PaymentGatewayConfig/
│   │   │   ├── GatewayConfigForm.tsx
│   │   │   ├── CredentialEncryption.tsx
│   │   │   └── TestConnection.tsx
│   │   ├── TestimonialModeration/
│   │   │   ├── TestimonialQueue.tsx
│   │   │   └── TestimonialReview.tsx
│   │   └── SystemSettings.tsx
│   │
│   └── shared/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Checkbox.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── Alert.tsx
│       ├── Tooltip.tsx
│       └── Tabs.tsx
│
├── hooks/                       # Custom React hooks
│   ├── useInvitation.ts         # Invitation data fetching
│   ├── useInvitationFeatureGate.ts  # Feature access checking
│   ├── useAnalytics.ts          # Analytics data loading
│   ├── usePagination.ts         # Table pagination logic
│   ├── useFormValidation.ts     # Form validation with Zod
│   ├── useWebSocket.ts          # WebSocket real-time features
│   ├── useLocalStorage.ts       # Local storage management
│   ├── useAuth.ts               # Authentication state
│   ├── useFetch.ts              # API fetching helper
│   └── useDebounce.ts           # Debounce hook
│
├── layouts/                     # Layout wrappers
│   ├── AuthLayout.tsx           # For login/register pages
│   ├── DashboardLayout.tsx      # For authenticated dashboard pages
│   ├── AdminLayout.tsx          # For admin pages
│   ├── PublicLayout.tsx         # For public invitation pages
│   └── BlankLayout.tsx          # Minimal layout
│
├── lib/                         # Utility functions & configuration
│   ├── api.ts                   # Axios instance & API endpoints
│   ├── format.ts                # Date, currency, number formatting
│   ├── validators.ts            # Zod schemas for validation
│   ├── storage.ts               # LocalStorage wrapper
│   ├── constants.ts             # App constants & enums
│   ├── helpers.ts               # General helper functions
│   ├── cn.ts                    # Tailwind className merge
│   └── permissions.ts           # Permission checker utilities
│
├── pages/                       # Page components (route handlers)
│   ├── Auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   │
│   ├── Dashboard/
│   │   ├── DashboardPage.tsx    # Main dashboard
│   │   ├── InvitationListPage.tsx
│   │   ├── CreateInvitationPage.tsx
│   │   ├── EditInvitationPage.tsx
│   │   ├── InvitationDetailsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── Guest/
│   │   ├── GuestManagementPage.tsx
│   │   ├── RsvpListPage.tsx
│   │   └── CheckInPage.tsx
│   │
│   ├── Payment/
│   │   ├── CheckoutPage.tsx
│   │   ├── PaymentStatusPage.tsx
│   │   ├── ReceiptPage.tsx
│   │   └── TransactionHistoryPage.tsx
│   │
│   ├── PageBuilder/
│   │   └── PageBuilderPage.tsx
│   │
│   ├── Analytics/
│   │   └── AnalyticsPage.tsx
│   │
│   ├── Amplope/
│   │   ├── EnvelopeDashboardPage.tsx
│   │   ├── BankAccountManagementPage.tsx
│   │   ├── WithdrawalHistoryPage.tsx
│   │   └── EnvelopeListPage.tsx
│   │
│   ├── Public/
│   │   └── PublicInvitationPage.tsx
│   │
│   ├── Admin/
│   │   ├── AdminDashboardPage.tsx
│   │   ├── UserManagementPage.tsx
│   │   ├── PaymentGatewayConfigPage.tsx
│   │   ├── SystemSettingsPage.tsx
│   │   └── SystemHealthPage.tsx
│   │
│   ├── NotFoundPage.tsx
│   ├── ErrorPage.tsx
│   └── MainPage.tsx             # Landing page
│
├── stores/                      # Zustand state management
│   ├── userStore.ts             # User authentication state
│   │   ├── States: user, isAuthenticated, loading
│   │   └── Actions: login, logout, setUser
│   │
│   ├── invitationStore.ts       # Invitation CRUD state
│   │   ├── States: invitations, currentInvitation, loading
│   │   └── Actions: fetchInvitations, createInvitation, etc.
│   │
│   ├── uiStore.ts               # UI state
│   │   ├── States: sidebarOpen, modals, activeTab
│   │   └── Actions: toggleSidebar, openModal, etc.
│   │
│   └── notificationStore.ts     # Toast/notification state
│       ├── States: notifications
│       └── Actions: showToast, showAlert, etc.
│
└── types/                       # TypeScript type definitions
    ├── api.types.ts             # API request/response types
    ├── models.types.ts          # Domain model types
    │   ├── User, Invitation, Guest, etc.
    │   └── Transaction, Payment, etc.
    ├── forms.types.ts           # Form data types
    ├── ui.types.ts              # UI-specific types
    └── routes.types.ts          # Route params types
```

---

## PART 3: FEATURE VALIDATION — 16 MAJOR FEATURES

### Feature Checklist

| # | Feature | Status | Design Doc | Implementation Path | Comments |
|---|---------|--------|------------|-------------------|----------|
| 1 | **Multi Event System** | ✅ APPROVED | PLATFORM_FULL_DESIGN §2.1 | EAV + EventType model | 6 event types documented |
| 2 | **Multi Invitation** | ✅ APPROVED | PLATFORM_FULL_DESIGN §2.3 | Invitation model (1 user:N invitations) | Unlimited per user |
| 3 | **Multi Transaction** | ✅ APPROVED | PAYMENT_SYSTEM_DESIGN §2 | Transaction model (1 invitation:1 transaction) | Invoice management included |
| 4 | **Payment Gateway (3 Providers)** | ✅ APPROVED | PAYMENT_SYSTEM_DESIGN §3 + DESIGN_GAP_ANALYSIS | PaymentGatewayManager + 3 providers | Midtrans, Xendit, Manual covered |
| 5 | **WhatsApp Gateway** | ⚠️ NEEDS CLARIFICATION | DESIGN_GAP_ANALYSIS GAP-C-001 | WhatsAppService ready, provider TBD | Provider selection pending (Fonnte recommended) |
| 6 | **Custom Domain** | ⚠️ NEEDS CLARIFICATION | DESIGN_GAP_ANALYSIS GAP-C-002 | Domain table + middleware ready | SSL strategy TBD (CloudFlare recommended) |
| 7 | **Page Builder** | ⚠️ NEEDS CLARIFICATION | DESIGN_GAP_ANALYSIS GAP-C-003 | PageBuilderService + level-based access | MVP vs full scope TBD |
| 8 | **Template System** | ✅ APPROVED | PLATFORM_FULL_DESIGN §3.2 | Theme model + asset management | Multiple themes per event type |
| 9 | **Theme Marketplace** | ✅ APPROVED | PLATFORM_FULL_DESIGN §3.3 | Theme model with marketplace metadata | Phase 2 feature |
| 10 | **RSVP System** | ✅ APPROVED | PLATFORM_FULL_DESIGN §2.4 | RSVP + Guest model relationship | Headcount + dietary restrictions |
| 11 | **Buku Tamu (Guestbook)** | ✅ APPROVED | PLATFORM_FULL_DESIGN §2.4 | Comment model + moderation | Slider photos + guest photos |
| 12 | **Amplop Digital** | ✅ APPROVED | PAYMENT_SYSTEM_DESIGN §4 | DigitalEnvelopeTransaction model | Bank account + QRIS support |
| 13 | **Analytics** | ⚠️ NEEDS CLARIFICATION | DESIGN_GAP_ANALYSIS GAP-C-007 | AnalyticsService + level-based | Query performance strategy TBD |
| 14 | **Manual Book** | ❌ MISSING | - | No design specification | Requires detailed design |
| 15 | **Seeder & Demo Data** | ✅ APPROVED | PLATFORM_FULL_DESIGN §5 | Database seeders documented | 10 demo users, varied data |
| 16 | **Testing Strategy** | ✅ APPROVED | PLATFORM_FULL_DESIGN §6 | Pest PHP + 90%+ coverage target | Unit, feature, E2E tests planned |

---

### Feature Detail Verification

**✅ APPROVED (10 features)**:
- Feature #1-4: Core functionality fully designed
- Feature #8-12: Clear specifications with implementation paths
- Feature #15-16: Testing and seeding defined

**⚠️ CLARIFICATION NEEDED (4 features)**:
- Feature #5-7, #13: Detailed in GAP_ANALYSIS, waiting for decisions
- **Action**: Implement decisions from gap analysis recommendations

**❌ NOT YET DESIGNED (1 feature)**:
- Feature #14 (Manual Book): Requires separate design document

---

### Gap Analysis Links to Features

| Gap | Related Features | Resolution Status |
|-----|-----------------|-------------------|
| GAP-C-001 (WA Gateway) | #5 | Requires provider selection |
| GAP-C-002 (Custom Domain) | #6 | Requires SSL strategy |
| GAP-C-003 (Page Builder) | #7 | Requires scope definition |
| GAP-C-004 (Feature Gate) | All features | Requires implementation |
| GAP-C-005 (Amplop Rekening) | #12 | Requires UI/UX design |
| GAP-C-006 (Email Notifications) | All features | Requires email template spec |
| GAP-C-007 (Analytics) | #13 | Requires query optimization spec |

---

## CONCLUSION

**Folder Structure**: ✅ Complete and documented

**Feature Validation**: 
- ✅ 10 features fully approved
- ⚠️ 4 features awaiting clarification (gap analysis decisions)
- ❌ 1 feature requires design
- **Total**: 93.75% feature coverage documented

**Implementation Readiness**: 🟡 Conditional (awaiting 4 gap analysis clarifications)

**Next Action**: Approve GAP_ANALYSIS recommendations → Finalize 4 features → Proceed to Phase 0

---

*Folder Structure & Feature Validation v1.0 — 10 Juni 2026*
*All directories organized and ready for development*
