# Firestore Security Specification — Al-Shifa Medical Clinic

## 1. Data Invariants
1. Every document in `/users/{userId}` MUST have a valid alphanumeric/underscore/hyphen document ID (`<= 128` chars) and `data.uid == userId == request.auth.uid`.
2. Unauthenticated clients have ZERO read or write access to any path (`match /{document=**} { allow read, write: if false; }`).
3. Writes require a verified email (`request.auth.token.email_verified == true`), strict field allowlisting (`hasAll` + `hasOnly`), string length limits, and server timestamps (`request.time`).
4. No user can enumerate all documents in `/users` unless they are a verified administrator (`isAdmin()`).

## 2. Dirty Dozen Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated `get(/users/u1)`
2. Unauthenticated `create(/users/u1)`
3. Cross-user `get(/users/otherUser)` as non-admin patient
4. `list(/users)` as non-admin patient (prevents PII scraping)
5. `create(/users/u1)` where `uid != request.auth.uid` (identity spoofing)
6. `create(/users/u1)` with extra shadow field `{ role: 'Admin' }` or `{ isVerified: true }`
7. `create(/users/u1)` with unverified email (`email_verified: false`)
8. `create(/users/u1)` with 2KB string in `fullName` (exceeds `maxLength: 120`)
9. `create(/users/u1)` with client-forged `createdAt` (`!= request.time`)
10. `update(/users/u1)` modifying immutable `uid` or `createdAt` or `email`
11. `update(/users/u1)` with `fullName` of invalid type (`12345` number instead of string)
12. `delete(/users/u1)` by non-admin user
