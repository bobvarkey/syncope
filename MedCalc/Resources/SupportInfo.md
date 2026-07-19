# MedCalc — Support & Compliance URLs

Replace these placeholders with real, working URLs **before** App Store submission.
App Review will reject the build if any of these 404 or redirect to a parked domain.

| Field                    | Where it appears                        | Placeholder                              |
|--------------------------|-----------------------------------------|------------------------------------------|
| Support URL              | App Store Connect + Settings screen     | https://medcalc.example.com/support      |
| Marketing URL (optional) | App Store Connect                       | https://medcalc.example.com              |
| Privacy Policy URL       | App Store Connect + Settings screen     | https://medcalc.example.com/privacy      |
| Support email            | Settings → Contact Support              | support@medcalc.example.com              |

## Privacy Policy — required contents
- Data collected: **none** (all history stored locally via SwiftData).
- Third-party SDKs: **none**.
- Analytics / tracking: **none**.
- Children's data: not collected; app rated 17+ due to medical reference content.
- Data deletion: user can wipe local history from Settings → Clear History; uninstalling the app removes all data.
- Contact for privacy requests: privacy@medcalc.example.com.

## Privacy Nutrition Label — App Store Connect answers
- Data Used to Track You: **None**
- Data Linked to You: **None**
- Data Not Linked to You: **None**

If any of the above changes (e.g. optional Firebase Anonymous Auth is enabled), update
this file, `PrivacyInfo.xcprivacy`, and the App Store Connect privacy answers together.
