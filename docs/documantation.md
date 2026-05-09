# 🍃 MongoDB Operators & Queries

A complete practical guide to MongoDB operators using a real-world **Job Portal** dataset. All examples use 20 fake job documents so you can follow along hands-on.

---

## 📋 Table of Contents

- [Setup — Fake Job Data](#-setup--fake-job-data)
- [Comparison Operators](#-comparison-operators----eq-ne-gt-gte-lt-lte)
- [Logical Operators](#-logical-operators----and-or-not-nor)
- [Element & Type Operators](#-element--type-operators----exists-type)
- [Array Query Operators](#-array-query-operators----in-nin-all-size-elemmatch)
- [Update Operators](#-update-operators----set-inc-push-pull)
- [Projection & Sorting](#-projection--sorting)
- [Aggregation Pipeline](#-aggregation-pipeline----match-group-project)
- [Advanced Aggregation](#-advanced-aggregation----lookup-unwind-facet)
- [Capstone Query](#-capstone-query)
- [Cheat Sheet](#-mongodb-operator-cheat-sheet)
- [Next Steps](#-next-steps)

---

## 🌍 Real World Scenario

Imagine you're building a **Job Portal** like Bdjobs or LinkedIn — storing millions of job listings with salary info, required skills, and applicant counts in MongoDB. This entire guide uses a single `jobs` collection so every query is immediately practical.

---

## 🛠 Setup — Fake Job Data

Insert the following 20 documents into a `jobs` collection:
 - [dummy data](./dummydata.md);

### ✅ Verification

```js
db.jobs.countDocuments()  // Should return 20
db.jobs.findOne()         // Shows the first document
```

---

## 🔢 Comparison Operators — `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`

These operators let you filter data by comparing field values — just like searching "show me jobs with salary above 50,000."

| Operator | Meaning |
|----------|---------|
| `$eq` | Equal to |
| `$ne` | Not equal to |
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |

### `$eq` — Equal

```js
// Jobs in Dhaka
db.jobs.find({ location: { $eq: "Dhaka" } })

// Shorthand (same result)
db.jobs.find({ location: "Dhaka" })
```

> **Tip:** `$eq` is MongoDB's default behavior. `{ field: value }` is equivalent.

### `$ne` — Not Equal

```js
// Jobs outside Dhaka
db.jobs.find({ location: { $ne: "Dhaka" } })
```

### `$gt` / `$gte` — Greater Than / Greater Than or Equal

```js
// Salary strictly above 70,000
db.jobs.find({ salary: { $gt: 70000 } })

// Salary 70,000 or above
db.jobs.find({ salary: { $gte: 70000 } })
```

### `$lt` / `$lte` — Less Than / Less Than or Equal

```js
// Entry-level jobs under 50,000
db.jobs.find({ salary: { $lt: 50000 } })

// 50,000 or below
db.jobs.find({ salary: { $lte: 50000 } })
```

### Combining Comparison Operators

```js
// Salary between 50,000 and 90,000
db.jobs.find({ salary: { $gte: 50000, $lte: 90000 } })

// Experience > 3 AND salary > 60,000
db.jobs.find({
  experience: { $gt: 3 },
  salary: { $gt: 60000 }
})
```

---

## 🔗 Logical Operators — `$and`, `$or`, `$not`, `$nor`

### `$and` — All conditions must be true

```js
// Dhaka AND salary above 70,000
db.jobs.find({
  $and: [
    { location: "Dhaka" },
    { salary: { $gt: 70000 } }
  ]
})

// Shorthand (implicit $and for separate fields)
db.jobs.find({ location: "Dhaka", salary: { $gt: 70000 } })
```

> **Note:** You must use explicit `$and` when applying two conditions to the **same** field.

### `$or` — At least one condition must be true

```js
// Jobs in Dhaka OR Chittagong
db.jobs.find({
  $or: [
    { location: "Dhaka" },
    { location: "Chittagong" }
  ]
})

// Salary above 100,000 OR remote job
db.jobs.find({
  $or: [
    { salary: { $gt: 100000 } },
    { isRemote: true }
  ]
})
```

### `$not` — Negates a condition

```js
// Salary NOT above 50,000 (i.e., 50,000 or less)
db.jobs.find({ salary: { $not: { $gt: 50000 } } })
```

> **Note:** `$not` always wraps an operator expression, not a raw value.

### `$nor` — None of the conditions can be true

```js
// Not in Dhaka AND not remote (office jobs outside Dhaka)
db.jobs.find({
  $nor: [
    { location: "Dhaka" },
    { isRemote: true }
  ]
})
```

---

## 🔍 Element & Type Operators — `$exists`, `$type`

These operators don't compare values — they check whether a field **exists** or what **data type** it holds.

### `$exists` — Check if a field is present

```js
// Documents that have a salary field
db.jobs.find({ salary: { $exists: true } })

// Documents missing a salary field
db.jobs.find({ salary: { $exists: false } })
```

**Practice:** Insert a document without `salary` to test:

```js
db.jobs.insertOne({
  title: "Unpaid Intern",
  company: "StartupXYZ",
  location: "Dhaka",
  experience: 0
})

db.jobs.find({ salary: { $exists: false } })  // Returns only this document
```

### `$type` — Check the data type of a field

```js
// salary fields that are numbers
db.jobs.find({ salary: { $type: "number" } })

// skills fields that are arrays
db.jobs.find({ skills: { $type: "array" } })

// posted fields that are dates
db.jobs.find({ posted: { $type: "date" } })
```

**Common BSON types:**

| Type | String Alias |
|------|-------------|
| Double | `"double"` |
| String | `"string"` |
| Object | `"object"` |
| Array | `"array"` |
| Boolean | `"bool"` |
| Date | `"date"` |
| Null | `"null"` |
| Integer | `"int"` |

---

## 📦 Array Query Operators — `$in`, `$nin`, `$all`, `$size`, `$elemMatch`

The `skills` field in our data is an array. These operators let you query inside arrays.

### `$in` — Match any value in a list

```js
// Jobs requiring Python OR JavaScript
db.jobs.find({ skills: { $in: ["Python", "JavaScript"] } })

// Jobs in Dhaka, Chittagong, or Sylhet
db.jobs.find({ location: { $in: ["Dhaka", "Chittagong", "Sylhet"] } })
```

### `$nin` — Match none of the values in a list

```js
// Jobs that don't require Python or JavaScript
db.jobs.find({ skills: { $nin: ["Python", "JavaScript"] } })
```

### `$all` — All specified values must be present

```js
// Jobs requiring BOTH Python AND SQL
db.jobs.find({ skills: { $all: ["Python", "SQL"] } })
```

> **`$in` vs `$all`:** `$in` means "any one of these"; `$all` means "every single one of these."

### `$size` — Match arrays of an exact length

```js
// Jobs with exactly 3 required skills
db.jobs.find({ skills: { $size: 3 } })
```

### `$elemMatch` — Apply multiple conditions to a single array element

Useful when array elements are objects and you need multiple conditions to apply to the **same** element.

**Setup:**

```js
db.jobs.insertOne({
  title: "Senior Developer",
  company: "BigTech",
  interviews: [
    { round: 1, score: 85, passed: true },
    { round: 2, score: 70, passed: false }
  ]
})
```

```js
// Interviews where score > 80 AND passed: true (same round)
db.jobs.find({
  interviews: {
    $elemMatch: {
      score: { $gt: 80 },
      passed: true
    }
  }
})
```

> **Why not just use two separate conditions?** Without `$elemMatch`, MongoDB checks each condition independently across all array elements — they might match different elements. `$elemMatch` ensures both conditions are satisfied by the **same** element.

---

## ✏️ Update Operators — `$set`, `$inc`, `$push`, `$pull`

### `$set` — Set a field value

```js
// Update salary for a specific job
db.jobs.updateOne(
  { title: "Software Engineer", company: "TechCorp Bangladesh" },
  { $set: { salary: 80000 } }
)

// Update multiple fields at once
db.jobs.updateOne(
  { title: "Software Engineer" },
  { $set: { salary: 80000, status: "hiring", updatedAt: new Date() } }
)
```

> **Tip:** `$set` can add new fields or overwrite existing ones.

### `$inc` — Increment or decrement a number

```js
// 10 new applicants added
db.jobs.updateOne(
  { title: "Data Analyst" },
  { $inc: { applicants: 10 } }
)

// Decrease applicants
db.jobs.updateOne(
  { title: "Data Analyst" },
  { $inc: { applicants: -5 } }
)
```

### `$push` — Add an item to an array

```js
// Add TypeScript to a job's skills
db.jobs.updateOne(
  { title: "Frontend Developer" },
  { $push: { skills: "TypeScript" } }
)

// Add multiple items at once
db.jobs.updateOne(
  { title: "Frontend Developer" },
  { $push: { skills: { $each: ["TypeScript", "GraphQL"] } } }
)
```

### `$pull` — Remove an item from an array

```js
// Remove Sketch from UI/UX Designer's skills
db.jobs.updateOne(
  { title: "UI/UX Designer" },
  { $pull: { skills: "Sketch" } }
)
```

---

## 📊 Projection & Sorting

### Projection — Select specific fields

**Include fields** (use `1`):

```js
// Show only title, company, and salary
db.jobs.find({}, { title: 1, company: 1, salary: 1 })

// Exclude _id
db.jobs.find({}, { title: 1, company: 1, salary: 1, _id: 0 })
```

**Exclude fields** (use `0`):

```js
// Show everything except _id and applicants
db.jobs.find({}, { _id: 0, applicants: 0 })
```

> ⚠️ You cannot mix `1` and `0` in the same projection (except for `_id`).

### Sorting

```js
// Sort by salary descending (highest first)
db.jobs.find({}, { title: 1, salary: 1, _id: 0 }).sort({ salary: -1 })

// Sort by location A–Z, then salary descending
db.jobs.find().sort({ location: 1, salary: -1 })
```

| Value | Order |
|-------|-------|
| `1` | Ascending (A→Z, low→high) |
| `-1` | Descending (Z→A, high→low) |

### Pagination with `limit()` and `skip()`

```js
// First 5 results
db.jobs.find().limit(5)

// Page 2 (items 6–10)
db.jobs.find().skip(5).limit(5)

// Full paginated query — active jobs sorted by salary, page 2
db.jobs.find(
  { status: "active" },
  { title: 1, salary: 1, company: 1, _id: 0 }
).sort({ salary: -1 }).skip(5).limit(5)
```

---

## 🔄 Aggregation Pipeline — `$match`, `$group`, `$project`

The Aggregation Pipeline lets you **analyze** data, not just read it. Each stage's output becomes the next stage's input — like an assembly line.

### `$match` — Filter documents

```js
// Only active jobs
db.jobs.aggregate([
  { $match: { status: "active" } }
])
```

> **Tip:** Always put `$match` first to reduce data early and speed up later stages.

### `$group` — Group and calculate

```js
// Count jobs per city
db.jobs.aggregate([
  { $group: {
    _id: "$location",
    totalJobs: { $sum: 1 }
  }}
])

// Average, max, and min salary per city
db.jobs.aggregate([
  { $group: {
    _id: "$location",
    avgSalary: { $avg: "$salary" },
    maxSalary: { $max: "$salary" },
    minSalary: { $min: "$salary" },
    totalJobs: { $sum: 1 }
  }}
])
```

**Accumulator operators:**

| Operator | Purpose |
|----------|---------|
| `$sum` | Total (use `$sum: 1` for count) |
| `$avg` | Average |
| `$max` | Maximum value |
| `$min` | Minimum value |
| `$push` | Collect all values into an array |

### `$project` — Shape the output

```js
// Show only title and company, hide _id
db.jobs.aggregate([
  { $project: { title: 1, company: 1, _id: 0 } }
])

// Create a new calculated field
db.jobs.aggregate([
  { $project: {
    title: 1,
    salary: 1,
    annualSalary: { $multiply: ["$salary", 12] }
  }}
])
```

### Full Pipeline Example

```js
// Active jobs → group by department → sort by average salary
db.jobs.aggregate([
  { $match: { status: "active" } },
  { $group: {
    _id: "$department",
    avgSalary: { $avg: "$salary" },
    jobCount: { $sum: 1 }
  }},
  { $project: {
    department: "$_id",
    avgSalary: { $round: ["$avgSalary", 0] },
    jobCount: 1,
    _id: 0
  }},
  { $sort: { avgSalary: -1 } }
])
```

---

## 🚀 Advanced Aggregation — `$lookup`, `$unwind`, `$facet`

### Setup — Create a `companies` collection

```js
db.companies.insertMany([
  { name: "TechCorp Bangladesh", founded: 2015, employees: 500, industry: "Software" },
  { name: "Digital Solutions",   founded: 2018, employees: 120, industry: "Web" },
  { name: "AIVentures",          founded: 2020, employees: 80,  industry: "AI/ML" },
  { name: "CloudBase Ltd",       founded: 2017, employees: 200, industry: "Cloud" },
  { name: "CreativeMinds",       founded: 2019, employees: 50,  industry: "Design" }
])
```

### `$lookup` — Join two collections (like SQL JOIN)

```js
db.jobs.aggregate([
  {
    $lookup: {
      from: "companies",       // other collection
      localField: "company",   // field in jobs
      foreignField: "name",    // matching field in companies
      as: "companyDetails"     // output array field name
    }
  },
  { $project: { title: 1, salary: 1, companyDetails: 1, _id: 0 } },
  { $limit: 5 }
])
```

> **Note:** `$lookup` returns `companyDetails` as an array. Use `$unwind` to flatten it.

### `$unwind` — Flatten an array field

```js
db.jobs.aggregate([
  {
    $lookup: {
      from: "companies",
      localField: "company",
      foreignField: "name",
      as: "companyDetails"
    }
  },
  { $unwind: "$companyDetails" },
  {
    $project: {
      title: 1,
      salary: 1,
      "companyDetails.industry": 1,
      "companyDetails.employees": 1,
      _id: 0
    }
  }
])
```

### `$facet` — Run multiple pipelines in a single query

Perfect for building analytics dashboards — get all the data you need in one request.

```js
db.jobs.aggregate([
  { $match: { status: "active" } },
  {
    $facet: {
      // Salary range distribution
      salaryBuckets: [
        { $bucket: {
          groupBy: "$salary",
          boundaries: [0, 30000, 60000, 90000, 150000],
          default: "Other",
          output: { count: { $sum: 1 }, avgSalary: { $avg: "$salary" } }
        }}
      ],
      // Jobs per location
      byLocation: [
        { $group: { _id: "$location", total: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ],
      // Top departments by average salary
      byDepartment: [
        { $group: { _id: "$department", avgSalary: { $avg: "$salary" } } },
        { $sort: { avgSalary: -1 } },
        { $limit: 5 }
      ]
    }
  }
])
```

---

## 🏆 Capstone Query

**Scenario:** HR needs a report — active jobs in Dhaka or remote, requiring 3+ years of experience, grouped by department with average salary, job count, and the most-applied-to job title.

```js
db.jobs.aggregate([
  // Step 1: Filter
  { $match: {
    $or: [{ location: "Dhaka" }, { isRemote: true }],
    status: "active",
    experience: { $gte: 3 }
  }},

  // Step 2: Group by department
  { $group: {
    _id: "$department",
    avgSalary: { $avg: "$salary" },
    totalJobs: { $sum: 1 },
    maxApplicants: { $max: "$applicants" },
    topJob: { $first: "$title" }
  }},

  // Step 3: Shape output
  { $project: {
    department: "$_id",
    avgSalary: { $round: ["$avgSalary", 0] },
    totalJobs: 1,
    maxApplicants: 1,
    topJob: 1,
    _id: 0
  }},

  // Step 4: Sort by average salary
  { $sort: { avgSalary: -1 } }
])
```

---

## 📋 MongoDB Operator Cheat Sheet

| Category | Operators |
|----------|-----------|
| **Comparison** | `$eq` `$ne` `$gt` `$gte` `$lt` `$lte` |
| **Logical** | `$and` `$or` `$not` `$nor` |
| **Element** | `$exists` `$type` |
| **Array** | `$in` `$nin` `$all` `$size` `$elemMatch` |
| **Update** | `$set` `$inc` `$push` `$pull` `$addToSet` |
| **Aggregation** | `$match` `$group` `$project` `$sort` `$limit` `$skip` |
| **Advanced Agg.** | `$lookup` `$unwind` `$facet` `$bucket` |

---

## 🎯 Next Steps

After mastering these operators, explore:

- ✅ **MongoDB Indexes** — Speed up queries dramatically
- ✅ **Mongoose ODM** — Use MongoDB with Node.js elegantly
- ✅ **MongoDB Atlas** — Host your database in the cloud
- ✅ **Transactions** — Run multiple operations atomically
- ✅ **Schema Validation** — Enforce data rules at the database level