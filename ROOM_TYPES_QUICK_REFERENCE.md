# 📚 ROOM TYPES - QUICK REFERENCE

## All Supported Room Types (10 Total)

```
1. Single          (Studio apartment)
2. Shared          (Shared accommodation)
3. PG              (Paying guest room)
4. 1RK             (1 room kitchen - compact)
5. 2RK             (2 room kitchen)
6. 1BHK            (1 Bedroom Hall Kitchen)
7. 2BHK            (2 Bedroom Hall Kitchen)
8. 3BHK            (3 Bedroom Hall Kitchen)
9. 4BHK            (4 Bedroom Hall Kitchen)
10. Independent House (Full house rental)
```

---

## 🛠️ WHERE THEY'RE USED

### Backend
- **Validation:** `src/backend/src/models/Room.ts` → Zod enum
- **Normalization:** `src/backend/src/controllers/RoomController.ts` → ROOM_TYPE_MAP
- **Storage:** PostgreSQL `Room.roomType` column (String type)

### Frontend
- **Type Definition:** `src/types/api.types.ts`
- **Owner Form (Create):** `src/components/AddPropertyModal.tsx` → roomTypeOptions
- **Owner Form (Edit):** `src/components/EditPropertyModal.tsx` → roomTypeOptions
- **Tenant Filters:** `src/components/FilterSidebar.tsx` → ROOM_TYPES array

---

## 🔄 NORMALIZATION MAP (Backend)

```typescript
Case-Insensitive Input → Proper Case
single → Single
shared → Shared
pg → PG
1rk → 1RK
2rk → 2RK
1bhk → 1BHK
2bhk → 2BHK
3bhk → 3BHK
4bhk → 4BHK
independent house → Independent House
```

---

## 🧪 QUICK TEST

### Create Property with New Type
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Luxury 3BHK in Bangalore",
    "roomType": "3BHK",
    "pricePerMonth": 50000,
    "city": "bangalore",
    ...other fields
  }'
```

### Filter by New Type
```bash
curl http://localhost:3000/api/rooms?roomType=3BHK
# or (case-insensitive)
curl http://localhost:3000/api/rooms?roomType=3bhk
```

---

## ✅ VERIFIED FEATURES

| Feature | Status |
|---------|--------|
| Database support | ✅ No migration needed |
| Backend validation | ✅ 10 types validated |
| Type safety | ✅ TypeScript enforced |
| Owner form | ✅ All 10 types available |
| Tenant filters | ✅ All 10 types filterable |
| Backward compatibility | ✅ Old properties work |
| Compilation | ✅ No errors |
| Case normalization | ✅ Works correctly |

---

## 🔗 FILTER SIDEBAR LAYOUT

```
┌─ Room Type ──────────────┐
│ [Single] [Shared]         │
│ [PG]     [1RK]            │
│ [2RK]    [1BHK]           │
│ [2BHK]   [3BHK]           │
│ [4BHK]   [Indep. House]   │
└──────────────────────────┘
```

2×5 Grid Layout (10 buttons total)

---

## 📋 DEPLOYMENT CHECKLIST

- [x] All types added to type definitions
- [x] Validation schema updated
- [x] Filter UI updated
- [x] Owner forms updated
- [x] Backend normalization updated
- [x] No database migration needed
- [x] Backward compatibility verified
- [x] Zero compilation errors
- [x] Ready for production

---

## 💡 USAGE EXAMPLES

### Creating a Property
Owner selects room type from dropdown → Submits → Stored as exact value ("3BHK")

### Filtering Properties
Tenant clicks "3BHK" button → Filter applied → Results show only 3BHK properties

### Displaying Properties  
RoomCard receives room data → Shows `room.roomType` value → Displays "3BHK"

### Editing an Existing Property
Editor loads room data → Current type pre-selected → Can change to new type → Updates DB

---

## ⚠️ IMPORTANT NOTES

1. **Case Matters in Database** - Stored as "3BHK" (not "3bhk")
2. **Query Parameters Normalized** - Frontend can send any case, backend normalizes
3. **No Migration Needed** - Old properties continue to work
4. **Validation on Everyone** - Both creation and updates validate against new enum
5. **Filter Consistency** - Filter UI & owner form use same 10 types

