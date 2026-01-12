
## 📂 Final Backend Folder Structure (Industry Standard)

  ```
  backend/
  ├── src/
  │   ├── app.js                 # Express app config
  │   ├── server.js              # Entry point
  │   ├── config/
  │   │   ├── db.js              # MongoDB connection
  │   │   ├── env.js             # Environment config
  │   │   └── razorpay.js        # Payment config
  │   │
  │   ├── modules/               # Feature-based architecture
  │   │   ├── auth/
  │   │   │   ├── auth.controller.js
  │   │   │   ├── auth.routes.js
  │   │   │   └── auth.service.js
  │   │   │
  │   │   ├── user/
  │   │   │   ├── user.model.js
  │   │   │   ├── user.controller.js
  │   │   │   └── user.routes.js
  │   │   │
  │   │   ├── exam/
  │   │   │   ├── exam.model.js
  │   │   │   ├── exam.controller.js
  │   │   │   └── exam.routes.js
  │   │   │
  │   │   ├── question/
  │   │   │   ├── question.model.js
  │   │   │   ├── question.controller.js
  │   │   │   └── question.routes.js
  │   │   │
  │   │   ├── test/
  │   │   │   ├── test.model.js
  │   │   │   ├── test.controller.js
  │   │   │   └── test.routes.js
  │   │   │
  │   │   ├── attempt/
  │   │   │   ├── attempt.model.js
  │   │   │   ├── attempt.controller.js
  │   │   │   └── attempt.routes.js
  │   │   │
  │   │   ├── result/
  │   │   │   ├── result.controller.js
  │   │   │   └── result.routes.js
  │   │   │
  │   │   ├── payment/
  │   │   │   ├── payment.controller.js
  │   │   │   ├── payment.routes.js
  │   │   │   └── webhook.controller.js
  │   │
  │   ├── middlewares/
  │   │   ├── auth.middleware.js
  │   │   ├── admin.middleware.js
  │   │   ├── rateLimiter.js
  │   │   └── errorHandler.js
  │   │
  │   ├── utils/
  │   │   ├── jwt.js
  │   │   ├── calculateScore.js
  │   │   ├── rankCalculator.js
  │   │   └── shuffleQuestions.js
  │   │
  │   ├── routes.js              # Central route loader
  │   └── constants.js
  │
  ├── .env
  ├── package.json
  └── README.md
  ```
---

## 🔐 Authentication Module (Core)

 - Features
 - JWT + Refresh Token
 - Role-based access (user, admin)
 - One-device login (optional)
 - 

---
 
## Auth flow
  ```
    Login → JWT issued → Access protected routes
    Refresh → New JWT → Continue session
  ```
---

## 🧪 Exam & Test Architecture

  -  Exam (SSC, Bank, UPSC)
  -  Category based
  -  Year-wise
  -  Active / Archived
  -  Test
  -  Full mock / Section test
  -  Duration
  -  Question mapping
  -  Free / Paid flag
    
###  Important:

    ❌ Questions are not embedded
    ✅ Questions are referenced (scalable)

---

# ❓ Question Bank Design (Very Important)

    Question Model Must Support:
    Subject (Maths, Reasoning, GK)
    Difficulty (Easy / Medium / Hard)
    Multi-language (future-ready)
    Explanation (text / image)
    This allows:
    Random test generation
    Topic-wise tests
    Adaptive difficulty later
---

### Attempt Lifecycle

  ```
    Copy code
    
    Start Test
      ↓
    Create Attempt Record
      ↓
    Save Answers (Auto-save)
      ↓
    Timer Ends / Submit
      ↓
    Evaluate
      ↓
    Store Result
    
 ```
---

  
### Submit Lifecycle

  ```
    User submits test
       ↓
    Score calculated (already done ✅)
       ↓
    Result stored
       ↓
    All results fetched for same test
       ↓
    Rank calculated
       ↓
    Analytics generated
    
  ```
  
---

### Key Rules

  - Server-side timer validation
  - No re-attempt unless allowed
  - Autosave every question

## 📊 Result & Analytics Layer

  - Score
  -  Accuracy
  -  Time per question
  -  Rank (after test expiry)
  -  Subject-wise strength
  -  Later you can add:
  -  Percentile
  -  AI recommendations

## 💳 Payments & Subscription

  -  Logic
  -  User buys Test / Subscription
  -  Payment verified via webhook
  -  Access unlocked
  -  Never trust frontend payment success

## 🛡️ Security Best Practices

  -  JWT expiry (15 min)
  -  Refresh tokens (7 days)
  -  Rate limiting
  -  Question encryption (optional)
  -  Admin routes protected
  -  Result lock until test window ends
  -  
  

