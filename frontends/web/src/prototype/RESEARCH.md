# Quiet the balance, spotlight the BitBox

The 2025–26 leaders share one recipe: **a calm, balance-first home with one-tap hiding; one navigation map drawn as phone tabs and a collapsible sidebar or rail; fees labelled by time; and named, one-line device states.** Ledger Wallet 4.0, Trezor Suite, Bitkey and OneKey show it best, while Ledger, River and Wise layer surfaces by tone around one accent. Liquid Glass and Material 3 Expressive mostly restyle chrome, and BitBoxApp's webviews can fake frosted blur and capsules but not iOS refraction. Five directions follow, from a calmer version of today's layout to device-, history-, attention- and platform-centred ones.

## BitBoxApp is more current than its reputation

The code corrects the brief: phones already have a **floating translucent pill tab bar**, the sidebar is pinned only from 1200 px, tablets (769–1199 px) get a hamburger drawer, and portfolio and history are card lists, not tables. Titles shrink to 16–18 px below 1200 px, in one weight. White on the #5E94BF primary is **3.25:1** and secondary greys 4.1–4.48:1 on most surfaces, all below AA (my calculations); zoom is disabled. Keep its best idea: **receive withholds the real QR until the device check**.

## Eight patterns separate the leaders

| Area | Leading patterns |
|---|---|
| Navigation | Ledger 4.0 mirrors phone tabs in a collapsible desktop sidebar with global Send/Receive ([1](https://github.com/LedgerHQ/ledger-live/blob/develop/apps/ledger-live-mobile/src/mvvm/components/MainTabBar/constants.ts), [2](https://github.com/LedgerHQ/ledger-live/blob/develop/apps/ledger-live-desktop/src/mvvm/components/SideBar/useSideBarViewModel.ts)); OneKey's desktop and web builds switch at 768 px to a 72 px labelled rail, device pinned last ([3](https://raw.githubusercontent.com/OneKeyHQ/app-monorepo/x/packages/components/src/layouts/Navigation/Tab/TabBar/index.tsx), [4](https://raw.githubusercontent.com/OneKeyHQ/app-monorepo/x/packages/components/src/layouts/Navigation/Tab/TabBar/DesktopLeftSideBar.tsx)); Trezor opens Send/Receive before account choice ([5](https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-december-2025)). Phoenix has no tab bar ([6](https://github.com/ACINQ/phoenix/blob/master/phoenix-android/src/main/res/values/strings.xml)); Tangem pairs one main screen with a pull-up sheet ([7](https://tangem.com/en-GB/blog/post/app-update/)). |
| Home | Ledger leads with a large balance, refresh time and tap-to-hide, demoting the chart to Analytics ([8](https://www.ledger.com/blog-ledger-wallet-4-0-redesigning-home-tab)); Bitkey lists five recent items ([9](https://support.bitkey.world/hc/en-us/articles/18799971425172-Where-can-I-find-the-status-of-my-transactions)); Trezor blurs amounts until hover ([10](https://trezor.io/learn/a/discreet-mode-in-trezor-suite-app)), Revolut on a phone flip by default ([11](https://help.revolut.com/en-MX/help/profile-and-plan/security-and-personal-data/why-is-my-balance-blurry/)). |
| Activity | Phoenix groups by Today, Yesterday and Earlier this week, with tap-to-accelerate ([6](https://github.com/ACINQ/phoenix/blob/master/phoenix-android/src/main/res/values/strings.xml)); the Bitcoin Design Guide colours only incoming amounts green, with +/− signs ([12](https://bitcoin.design/guide/daily-spending-wallet/activity/)); Exodus added search, sticky filters, notes and export ([13](https://apps.apple.com/us/app/exodus-crypto-bitcoin-wallet/id1414384820)). |
| Send | Trezor reviews one form on the device, then broadcasts separately ([14](https://trezor.io/learn/a/send-crypto-in-trezor-suite-app)); Wise shows cost and arrival per option first ([15](https://wise.com/help/articles/2977959/how-do-i-send-money-with-wise)). Time-first fees: Bitkey's Priority ~10, Standard ~30, Slow ~60 min ([16](https://support.bitkey.world/hc/en-us/articles/18799931145492-How-much-does-it-cost-to-send-bitcoin)); Muun adds sat/vB and guards manual entry ([17](https://github.com/muun/apollo/blob/master/android/apolloui/src/main/res/values/strings.xml)); Bull flags fees high relative to amount ([18](https://github.com/SatoshiPortal/bullbitcoin-mobile/blob/develop/localization/app_en.arb)); Uniswap adds speed bumps for risky recipients ([19](https://raw.githubusercontent.com/Uniswap/interface/main/packages/wallet/src/components/RecipientSearch/RecipientSelectSpeedBumps.tsx)). |
| Receive | Trezor's 2026 receive starts from asset search and shows the full address at once ([20](https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-september-2026), [21](https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-october-2026)); Envoy word-groups addresses ([22](https://docs.foundation.xyz/envoy/envoy-menu/account/)); Blockstream ends its device check with a user checkmark ([23](https://help.blockstream.com/blockstream-jade/set-up-transact-recover-your-wallet/receive-bitcoin-using-jade.md)); the Guide wants unified BIP21, uppercase bech32 QR and chunked monospace ([24](https://bitcoin.design/guide/daily-spending-wallet/requesting/), [25](https://bitcoin.design/guide/glossary/address/)); Exodus mobile documents no device check ([26](https://www.exodus.com/support/en/articles/9811448-getting-started-with-exodus-and-ledger)). |
| Device states | Bitkey gives each state one line (Ready, Keep holding, Transferring %, Connection lost, Transaction signed) ([27](https://github.com/proto-at-block/bitkey/blob/main/app/ui/features/public/src/commonMain/kotlin/build/wallet/ui/app/nfc/SignTransactionNfcScreen.kt)); Envoy separates paired from connected ([28](https://foundation.xyz/blog/envoy-version-2-3-0-is-now-available)); Exodus marks connected devices green, keeps unplugged ones watch-only, greys Send ([29](https://www.exodus.com/support/en/articles/8598656-getting-started-with-exodus-and-trezor)); Trezor matches pairing codes ([30](https://trezor.io/learn/a/get-started-with-the-trezor-safe-7)). |
| Settings | Bitkey splits Settings from a Security Hub with recommendations ([31](https://support.bitkey.world/hc/en-us/articles/18800308530324-How-do-I-update-my-settings-and-security-preferences), [32](https://bitkey.world/releases)); Trezor groups Application, Device, Networks and Connected apps ([33](https://trezor.io/learn/a/trezor-suite-app-settings)). |
| Visual | Lumen pairs black/white primary fills with one lilac accent, a #000 dark canvas and Inter ([34](https://github.com/LedgerHQ/lumen/blob/main/libs/design-core/src/lib/themes/css/ledger-live/variables.dark.css), [35](https://github.com/LedgerHQ/lumen/blob/main/libs/design-core/src/lib/themes/css/primitives.css)); River and Coinbase lighten dark surfaces as they rise ([36](https://river.com/frontend/assets/foundations-aff7e40a405fe7de14320351008abcc9.css), [37](https://raw.githubusercontent.com/coinbase/cds/master/packages/web/src/themes/coinbaseTheme.ts)); Wise has no shadow tokens ([38](https://unpkg.com/@transferwise/neptune-tokens@8.26.0/themes/personal/tokens.css)); Rainbow fades over 100–500 ms and blurs only on iOS ([39](https://raw.githubusercontent.com/rainbow-me/rainbow/develop/src/components/animations/animationConfigs.ts), [40](https://raw.githubusercontent.com/rainbow-me/rainbow/develop/src/navigation/SwipeNavigator.tsx)). |

## Glass belongs on chrome, and only blur survives webviews

Apple keeps Liquid Glass to floating controls and navigation, **never glass on glass**, tinting only primary actions ([41](https://developer.apple.com/design/human-interface-guidelines/materials), [42](https://developer.apple.com/videos/play/wwdc2025/219/)); tab bars float and shrink on scroll, and corners are capsules or concentric ([43](https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/), [44](https://developer.apple.com/videos/play/wwdc2025/356/)). iOS 27 adds a clear-to-tinted slider ([45](https://www.apple.com/newsroom/2026/09/major-updates-for-apples-software-platforms-are-now-available/)) and ends the opt-out for apps built on its SDK ([46](https://developer.apple.com/documentation/bundleresources/information-property-list/uidesignrequirescompatibility)); Zerion already ships glass navigation ([47](https://apps.apple.com/us/app/zerion-wallet-crypto-web3/id1456732565)). Material 3 Expressive adds springs, corners up to 48 dp, a 64 dp bar and 96 or 220–360 dp rails instead of drawers, by width class at 600, 840 and 1200 dp ([48](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarTokens.kt), [49](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailCollapsedTokens.kt), [50](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailExpandedTokens.kt), [51](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt), [52](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)); removing labels hurt usability in Google's tests ([53](https://design.google/library/expressive-material-design-google-research)). With Compose APIs in beta and Material Web in maintenance, build from tokens ([54](https://developer.android.com/jetpack/androidx/releases/compose-material3), [55](https://github.com/material-components/material-web)).

| Effect | Verdict |
|---|---|
| Frosted blur | **Yes, on small chrome**, WebKit-prefixed through iOS 17 ([56](https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/css-backdrop-filter.json)). One Galaxy A15 report: 3.5 ms GPU per frame for an 18 px blur, BitBox's current radius ([57](https://github.com/Station-Sciences/bot-crossing/issues/74)); BitBox's default software rendering starts Qt 6.8.2's Chromium **without GPU** ([58](https://raw.githubusercontent.com/qt/qtwebengine/v6.8.2/src/core/web_engine_context.cpp)). |
| Refraction | **No**: SVG backdrop filters render only in Chromium; Safari draws nothing yet passes feature tests ([59](https://kube.io/blog/liquid-glass-css-svg/), [60](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07)). |
| Reduce Transparency | **Bridge natively**; the media query exists only in Chromium 118+ ([61](https://chromestatus.com/feature/5191066147356672)). |
| Android insets | Forwarded from WebView M136 (fullscreen) and M144 (all); BitBox also pads natively, risking double spacing ([62](https://chromium.googlesource.com/chromium/src.git/+show/HEAD/android_webview/docs/insets.md)). |
| Keyboard | dvh is safe everywhere but ignores the keyboard; use IME insets ([63](https://api.webstatus.dev/v1/features?q=id:viewport-unit-variants)). |
| Springs, squircles, light-dark | Linear easing needs iOS 17.2 against a 16.0 floor ([64](https://api.webstatus.dev/v1/features?q=id:linear-easing)); WebKit lacks corner-shape ([65](https://api.webstatus.dev/v1/features?q=id:corner-shape)); Qt's Chromium 122 lacks light-dark ([66](https://wiki.qt.io/QtWebEngine/ChromiumVersions), [67](https://api.webstatus.dev/v1/features?q=id:light-dark)). |
| Touch, haptics | 48 px targets satisfy Android, Apple and WCAG 2.2 AA ([68](https://developer.android.com/guide/topics/ui/accessibility/apps), [69](https://developer.apple.com/design/human-interface-guidelines/accessibility), [70](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)); iOS lacks a Vibration API ([71](https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/vibration.json)). |

## Five directions centre home on different things

Values are proposals; every text pair meets AA (my calculations).

**1. Quiet Vault** calms today's structure and keeps its breakpoints: a OneKey-style tablet rail, a Ledger-style balance-first home, Trezor-style Send and Receive without account choice, the chart on a Performance screen, and Lightning as an account. Risk: low; re-base the 10 px root size.

**2. Signer Desk** puts the device first: an Exodus-style device card with live state heads its keystores, accounts carry Envoy-style custody colours, and one persistent pane hosts every confirmation in Bitkey-style one-line states, ending with Blockstream's match checkmark. Risk: the pane must stay undismissable mid-verification; several devices need a switcher.

**3. Swiss Ledger** puts history first, typeset like a printed ledger with Bull's 2 px corners ([72](https://github.com/SatoshiPortal/bullbitcoin-mobile/blob/develop/packages/bull_ui/lib/src/theme/bull_tokens.dart)). Phones swap tabs for a Phoenix-style dated timeline above a Receive · Scan · Send dock; desktops get a sortable table and inspector, like Strike's dashboard ([73](https://strike.me/blog/announcing-cost-basis/)). Swiss red marks the brand only. Risk: cross-account aggregation, virtualised tables, right-to-left mirroring.

**4. Command Center** puts attention first: pending transactions, firmware and backup checks above pinned accounts, like Wise's home tasks ([74](https://www.wise.com/help/articles/2WvlZST6DiDMUBhyl1N4zM/how-do-i-request-money)) and Muun's security cards ([17](https://github.com/muun/apollo/blob/master/android/apolloui/src/main/res/values/strings.xml)). Search replaces tabs: Phantom-style bottom search and a + launcher on phones ([75](https://help.phantom.com/hc/en-us/articles/52002512230035-What-s-new-in-Phantom)), a Rainbow-style ⌘K palette and Blockstream-style shortcuts on desktop ([76](https://rainbow.me/support/extension/cmd-k-and-ctrl-k), [77](https://blog.blockstream.com/blockstream-desktop-app-3-0-0-less-friction-more-clarity/)). Risk: key clashes with Qt or the OS, and commands in 19 locales.

**5. Native Float** runs content edge to edge under per-OS chrome: an iOS frosted capsule beside a separate action button, as in Uniswap ([78](https://raw.githubusercontent.com/Uniswap/interface/main/apps/mobile/src/app/navigation/tabs/CustomTabBar/CustomTabBar.tsx)), or a solid Expressive bar or rail on Android. Home is a full-bleed, performance-coloured chart with Robinhood's colour-blind option ([79](https://www.robinhood.com/eu/en/support/articles/using-charts), [80](https://robinhood.com/gb/en/support/articles/accessibility-options/)); flows run in Family-style trays, from a 2024 essay ([81](https://benji.org/family-values)) about an app Aave is retiring ([82](https://www.theblock.co/post/388342/aave-labs-sunsets-avara-umbrella-brand)). Risk: highest (blur cost, Reduce Transparency bridge, insets, spring fallbacks); glass needs an **80% tint** to hold labels at 8.2:1 and cannot carry muted text (my calculation).

| Direction | Phone | Tablet | Desktop | Home order |
|---|---|---|---|---|
| Quiet Vault | ≤768: floating bar (Home, Accounts, Market, Settings) | 769–1199: 72 px labelled rail | ≥1200: 240 px collapsible sidebar | Balance, actions, coins, recent |
| Signer Desk | <600: device chip; Wallets, Activity, Device tabs | 600–1199: keystore list, content | ≥1200: keystores, content, 360 px signing pane | Device, keystores, activity |
| Swiss Ledger | <840: timeline, dock, menu sheet | 840–1199: timeline, detail | ≥1200: accounts, table, inspector | Balance strip, filters, timeline |
| Command Center | <768: bottom search, launcher | 768–1279: top search bar, launcher | ≥1280: resizable sidebar, ⌘K palette | Attention queue, pinned accounts |
| Native Float | <600: capsule (iOS) or 64 px bar (Android) | 600–1199: top capsule or 96 px rail | ≥1200: inset sidebar | Chart, balance, accounts |

| Light / dark | Canvas | Surface | Text | Muted | Primary fill, label | Accent |
|---|---|---|---|---|---|---|
| Quiet Vault | #F5F5F4 / #0B0B0C | #FFFFFF / #18181A | #161616 / #F2F2F2 | #5E5E5E / #A3A3A8 | #161616, #FFFFFF / #F2F2F2, #161616 | #2B6A9E / #8FBDE3 |
| Signer Desk | #EEF0F3 / #000000 | #FFFFFF / #121418 | #14181D / #F3F4F6 | #565E68 / #9BA3AE | #1E3A5F, #FFFFFF / #C9D8EC, #0E1A2B | #0A7360 / #4CD2B0 |
| Swiss Ledger | #F6F4EF / #121212 | #FFFFFF / #1C1C1C | #111111 / #EEEEEE | #5C5A55 / #A6A6A6 | #111111, #FFFFFF / #EEEEEE, #111111 | #D40A1B / #FF6B6B |
| Command Center | #F7F8FA / #0E1116 | #FFFFFF / #171B22 | #0F1419 / #E8ECF1 | #536170 / #98A2AE | #3B4CCA, #FFFFFF / #8C9EFF, #0E1116 | #8A5A00 / #E3B341 |
| Native Float | #F2F3F7 / #000000 | #FFFFFF / #1C1C1E | #0B0C0F / #F5F5F7 | #5A5F6B / #A1A1A8 | #0062CC, #FFFFFF / #5AA9FF, #001A33 | as primary |

| Direction | Font, scale (px) | Radius (px) | Density | Elevation | Motion |
|---|---|---|---|---|---|
| Quiet Vault | Inter 48/28/20/16/13, weights 400–600 | 12, sheets 24, pill buttons | 64 px rows (56 desktop) | tonal steps | 200 ms ease-out |
| Signer Desk | Inter 32/24/18/16/13; JetBrains Mono (states, addresses) | 8, panes 12 | 56 px rows | hairlines, pane shadow | 500 ms state fades |
| Swiss Ledger | IBM Plex Sans 40/24/18/16/13; Plex Mono (amounts) | 2 | 64 px rows (40 in tables) | none, 1 px rules | fades ≤150 ms |
| Command Center | Geist 32/20/16/15/12; Geist Mono | 6–14 | 56 px rows (44 desktop) | scrimmed palette | 120 ms palette |
| Native Float | Manrope 34/22/20/17/13 | concentric 32 to 20, capsules | 60 px rows | translucent chrome only | ~300 ms springs, no overshoot |

All five faces are OFL and bundle locally. Inter, already shipped, is safest: tabular and slashed-zero figures, ₿, Cyrillic ([83](https://rsms.me/inter/)). JetBrains Mono, Plex, Geist and Manrope also cover Cyrillic ([84](https://github.com/JetBrains/JetBrainsMono), [85](https://github.com/IBM/plex), [86](https://github.com/vercel/geist-font), [87](https://github.com/googlefonts/manrope)); DM Sans, Atkinson Hyperlegible Next, Space Grotesk, Instrument Sans, Figtree and Google Sans Flex do not ([88](https://api.fontsource.org/v1/fonts), [89](https://github.com/floriankarsten/space-grotesk), [90](https://github.com/Instrument/instrument-sans), [91](https://raw.githubusercontent.com/google/fonts/main/ofl/googlesansflex/METADATA.pb)). Geist's ₿ and tabular figures, and Bulgarian letterforms, are unverified.

## Conclusion

The hardware moment is BitBox's unclaimed ground: the Guide pages reviewed give no on-device verification guidance ([92](https://bitcoin.design/guide/how-it-works/private-key-management/external-signers/)), so every direction should **make the on-device check the climax of send and receive**. Desktop has the most room but the oldest engine: **give it layout, not effects**. Quiet Vault plus Signer Desk's signing pane is the safest distinctive pairing.

## Sources

1. Ledger Wallet mobile tab bar constants (code) — https://github.com/LedgerHQ/ledger-live/blob/develop/apps/ledger-live-mobile/src/mvvm/components/MainTabBar/constants.ts
2. Ledger Wallet desktop sidebar view model (code) — https://github.com/LedgerHQ/ledger-live/blob/develop/apps/ledger-live-desktop/src/mvvm/components/SideBar/useSideBarViewModel.ts
3. OneKey tab bar switch rule (code) — https://raw.githubusercontent.com/OneKeyHQ/app-monorepo/x/packages/components/src/layouts/Navigation/Tab/TabBar/index.tsx
4. OneKey desktop left sidebar (code) — https://raw.githubusercontent.com/OneKeyHQ/app-monorepo/x/packages/components/src/layouts/Navigation/Tab/TabBar/DesktopLeftSideBar.tsx
5. Trezor Suite update, December 2025 — https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-december-2025
6. Phoenix Android strings (code) — https://github.com/ACINQ/phoenix/blob/master/phoenix-android/src/main/res/values/strings.xml
7. Tangem app update changelog — https://tangem.com/en-GB/blog/post/app-update/
8. Ledger: Redesigning the Home Tab (2026-04-13) — https://www.ledger.com/blog-ledger-wallet-4-0-redesigning-home-tab
9. Bitkey support: transaction status — https://support.bitkey.world/hc/en-us/articles/18799971425172-Where-can-I-find-the-status-of-my-transactions
10. Trezor: Discreet mode in Trezor Suite — https://trezor.io/learn/a/discreet-mode-in-trezor-suite-app
11. Revolut Help: why is my balance blurry (search-snippet evidence) — https://help.revolut.com/en-MX/help/profile-and-plan/security-and-personal-data/why-is-my-balance-blurry/
12. Bitcoin Design Guide: Activity — https://bitcoin.design/guide/daily-spending-wallet/activity/
13. Exodus App Store listing and release notes — https://apps.apple.com/us/app/exodus-crypto-bitcoin-wallet/id1414384820
14. Trezor: Send crypto in Trezor Suite — https://trezor.io/learn/a/send-crypto-in-trezor-suite-app
15. Wise Help: How do I send money with Wise — https://wise.com/help/articles/2977959/how-do-i-send-money-with-wise
16. Bitkey support: How much does it cost to send bitcoin — https://support.bitkey.world/hc/en-us/articles/18799931145492-How-much-does-it-cost-to-send-bitcoin
17. Muun Android strings (code) — https://github.com/muun/apollo/blob/master/android/apolloui/src/main/res/values/strings.xml
18. Bull Bitcoin app strings (code) — https://github.com/SatoshiPortal/bullbitcoin-mobile/blob/develop/localization/app_en.arb
19. Uniswap recipient speed bumps (code) — https://raw.githubusercontent.com/Uniswap/interface/main/packages/wallet/src/components/RecipientSearch/RecipientSelectSpeedBumps.tsx
20. Trezor Suite update, September 2026 — https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-september-2026
21. Trezor Suite update, October 2026 — https://trezor.io/other/product-updates/trezor-suite-updates/trezor-suite-update-october-2026
22. Foundation docs: Envoy Account — https://docs.foundation.xyz/envoy/envoy-menu/account/
23. Blockstream Help: Receive bitcoin using Jade — https://help.blockstream.com/blockstream-jade/set-up-transact-recover-your-wallet/receive-bitcoin-using-jade.md
24. Bitcoin Design Guide: Requesting — https://bitcoin.design/guide/daily-spending-wallet/requesting/
25. Bitcoin Design Guide: Address — https://bitcoin.design/guide/glossary/address/
26. Exodus: Getting started with Exodus and Ledger — https://www.exodus.com/support/en/articles/9811448-getting-started-with-exodus-and-ledger
27. Bitkey sign-transaction NFC screen (code) — https://github.com/proto-at-block/bitkey/blob/main/app/ui/features/public/src/commonMain/kotlin/build/wallet/ui/app/nfc/SignTransactionNfcScreen.kt
28. Foundation: Envoy 2.3.0 — https://foundation.xyz/blog/envoy-version-2-3-0-is-now-available
29. Exodus: Getting started with Exodus and Trezor — https://www.exodus.com/support/en/articles/8598656-getting-started-with-exodus-and-trezor
30. Trezor: Get started with the Trezor Safe 7 — https://trezor.io/learn/a/get-started-with-the-trezor-safe-7
31. Bitkey support: settings and security preferences — https://support.bitkey.world/hc/en-us/articles/18800308530324-How-do-I-update-my-settings-and-security-preferences
32. Bitkey release notes — https://bitkey.world/releases
33. Trezor: Trezor Suite app settings — https://trezor.io/learn/a/trezor-suite-app-settings
34. Ledger Lumen dark theme variables (code) — https://github.com/LedgerHQ/lumen/blob/main/libs/design-core/src/lib/themes/css/ledger-live/variables.dark.css
35. Ledger Lumen primitives: Inter, palette (code) — https://github.com/LedgerHQ/lumen/blob/main/libs/design-core/src/lib/themes/css/primitives.css
36. River foundations CSS — https://river.com/frontend/assets/foundations-aff7e40a405fe7de14320351008abcc9.css
37. Coinbase Design System theme (code) — https://raw.githubusercontent.com/coinbase/cds/master/packages/web/src/themes/coinbaseTheme.ts
38. Wise Neptune tokens 8.26.0, personal theme — https://unpkg.com/@transferwise/neptune-tokens@8.26.0/themes/personal/tokens.css
39. Rainbow animation configs (code) — https://raw.githubusercontent.com/rainbow-me/rainbow/develop/src/components/animations/animationConfigs.ts
40. Rainbow tab navigator (code) — https://raw.githubusercontent.com/rainbow-me/rainbow/develop/src/navigation/SwipeNavigator.tsx
41. Apple Human Interface Guidelines: Materials — https://developer.apple.com/design/human-interface-guidelines/materials
42. WWDC25 session 219: Meet Liquid Glass — https://developer.apple.com/videos/play/wwdc2025/219/
43. Apple Newsroom: new software design (2025-06-09) — https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
44. WWDC25 session 356 — https://developer.apple.com/videos/play/wwdc2025/356/
45. Apple Newsroom: iOS 27 and platform updates available (2026-09-14) — https://www.apple.com/newsroom/2026/09/major-updates-for-apples-software-platforms-are-now-available/
46. Apple documentation: UIDesignRequiresCompatibility — https://developer.apple.com/documentation/bundleresources/information-property-list/uidesignrequirescompatibility
47. Zerion App Store listing (v4.7.0 release note) — https://apps.apple.com/us/app/zerion-wallet-crypto-web3/id1456732565
48. Material 3 navigation bar tokens (code) — https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationBarTokens.kt
49. Material 3 collapsed navigation rail tokens (code) — https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailCollapsedTokens.kt
50. Material 3 expanded navigation rail tokens (code) — https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/NavigationRailExpandedTokens.kt
51. Material 3 shape tokens (code) — https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt
52. Android Developers: Use window size classes — https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
53. Google Design: Expressive Material Design research — https://design.google/library/expressive-material-design-google-research
54. Jetpack Compose Material3 release notes — https://developer.android.com/jetpack/androidx/releases/compose-material3
55. Material Web components repository — https://github.com/material-components/material-web
56. caniuse data: backdrop-filter — https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/css-backdrop-filter.json
57. GitHub issue: backdrop-filter cost on a Galaxy A15 (search-summary evidence) — https://github.com/Station-Sciences/bot-crossing/issues/74
58. Qt WebEngine 6.8.2 web_engine_context.cpp — https://raw.githubusercontent.com/qt/qtwebengine/v6.8.2/src/core/web_engine_context.cpp
59. kube.io: Liquid Glass in CSS and SVG — https://kube.io/blog/liquid-glass-css-svg/
60. dev.to: Liquid Glass on the web, 6 ways — https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07
61. Chrome Platform Status: prefers-reduced-transparency — https://chromestatus.com/feature/5191066147356672
62. Chromium: Android WebView insets documentation — https://chromium.googlesource.com/chromium/src.git/+show/HEAD/android_webview/docs/insets.md
63. webstatus.dev: viewport unit variants — https://api.webstatus.dev/v1/features?q=id:viewport-unit-variants
64. webstatus.dev: linear easing — https://api.webstatus.dev/v1/features?q=id:linear-easing
65. webstatus.dev: corner-shape — https://api.webstatus.dev/v1/features?q=id:corner-shape
66. Qt wiki: QtWebEngine Chromium versions — https://wiki.qt.io/QtWebEngine/ChromiumVersions
67. webstatus.dev: light-dark — https://api.webstatus.dev/v1/features?q=id:light-dark
68. Android Developers: Make apps more accessible — https://developer.android.com/guide/topics/ui/accessibility/apps
69. Apple Human Interface Guidelines: Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility
70. W3C: Understanding SC 2.5.8 Target Size (Minimum) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
71. caniuse data: Vibration API — https://raw.githubusercontent.com/Fyrd/caniuse/main/features-json/vibration.json
72. Bull Bitcoin design tokens (code) — https://github.com/SatoshiPortal/bullbitcoin-mobile/blob/develop/packages/bull_ui/lib/src/theme/bull_tokens.dart
73. Strike: Announcing Cost Basis — https://strike.me/blog/announcing-cost-basis/
74. Wise Help: How do I request money — https://www.wise.com/help/articles/2WvlZST6DiDMUBhyl1N4zM/how-do-i-request-money
75. Phantom Help: What's new in Phantom (search-snippet evidence) — https://help.phantom.com/hc/en-us/articles/52002512230035-What-s-new-in-Phantom
76. Rainbow support: Cmd-K and Ctrl-K — https://rainbow.me/support/extension/cmd-k-and-ctrl-k
77. Blockstream: Desktop App 3.0.0 — https://blog.blockstream.com/blockstream-desktop-app-3-0-0-less-friction-more-clarity/
78. Uniswap mobile custom tab bar (code) — https://raw.githubusercontent.com/Uniswap/interface/main/apps/mobile/src/app/navigation/tabs/CustomTabBar/CustomTabBar.tsx
79. Robinhood support: Using charts (search-snippet evidence) — https://www.robinhood.com/eu/en/support/articles/using-charts
80. Robinhood support: Accessibility options (search-snippet evidence) — https://robinhood.com/gb/en/support/articles/accessibility-options/
81. Benji Taylor: Family Values (2024) — https://benji.org/family-values
82. The Block: Aave Labs sunsets Avara brand (2026-02-03) — https://www.theblock.co/post/388342/aave-labs-sunsets-avara-umbrella-brand
83. Inter typeface — https://rsms.me/inter/
84. JetBrains Mono — https://github.com/JetBrains/JetBrainsMono
85. IBM Plex — https://github.com/IBM/plex
86. Geist font — https://github.com/vercel/geist-font
87. Manrope — https://github.com/googlefonts/manrope
88. Fontsource API: font script coverage — https://api.fontsource.org/v1/fonts
89. Space Grotesk — https://github.com/floriankarsten/space-grotesk
90. Instrument Sans — https://github.com/Instrument/instrument-sans
91. Google Sans Flex metadata — https://raw.githubusercontent.com/google/fonts/main/ofl/googlesansflex/METADATA.pb
92. Bitcoin Design Guide: External signers — https://bitcoin.design/guide/how-it-works/private-key-management/external-signers/
