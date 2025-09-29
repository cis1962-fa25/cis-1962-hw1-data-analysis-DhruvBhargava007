Homework 1 AI Synthesis Activity

Activity: You used AI 
I used AI in a limited, task-focused way to speed up routine steps. Core logic and decisions were reviewed and understood by me.

Part 1: Evidence of usage
- Brief prompts I used :
  - "Make a Taskwise list of things to do"
  - "Make sure my AI description section is detailed"
 I verified all outputs locally (`8 passing`).
Link -> https://chatgpt.com/share/68dae142-71d0-8002-835b-b91a30d51623

Part 2: Why I used AI
- Scoping and checklisting: Using a concise task breakdown from Spec, I didn’t miss requirements and used AI to understand JS better.
- Boilerplate acceleration: Confirming syntax and consistent CSV parsing code with `papaparse` options and file I/O setup.

Part 3: Evaluation of AI responses
- Correctness: The implementations passed all tests (parsing count = 2514, cleaned length = 2348, sentiment counts for Duolingo and `es`, and summary stats for Pinterest). This increased my confidence.
- Potential risks: AI could over-filter nulls or mishandle types. I checked that only `user_gender` was allowed to be null and that conversions matched the spec (IDs → int, rating → float, date → Date, boolean parsing for `verified_purchase`).
- Adaptations: I reviewed and kept the logic, focusing on: strict trimming for null-like strings, not auto-typing with papaparse, and rounding average rating to 3 decimals as tests expect.

Part 4: Concepts verified and briefly explained
- papaparse options: `header: true` to map columns to keys; `skipEmptyLines: true` to ignore blank lines.
- Type conversions: `parseInt`, `parseFloat`, `Date` construction, and mapping common truthy/falsey strings to booleans.
- Aggregation patterns: Using `Map` to count sentiments by `app_name` and `review_language`, then converting to arrays.

Overall, AI was used minimally for speed and structure; I validated behavior with tests and confirmed alignment with Spec requirements.
