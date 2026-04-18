# IEEE SOU SB Admin Panel - Master Implementation Prompt

## Overview
This prompt provides detailed instructions for implementing changes to the IEEE SOU SB admin panel to match the structure and functionality of the main website.

## Project Structure
```
src/
├── components/
│   ├── Authentication.tsx
│   ├── ProtectedRoute.tsx
│   └── EventsSection.tsx
├── Admin/
│   ├── AdminLayout.tsx
│   ├── Dashboard.tsx
│   ├── AwardModal.tsx
│   ├── AwardPreviewList.tsx
│   ├── EventModal.tsx
│   ├── EventPreviewList.tsx
│   ├── MemberModal.tsx
│   ├── MemberPreviewList.tsx
│   ├── JourneyModal.tsx (NEW)
│   └── JourneyPreviewList.tsx (NEW)
├── pages/
│   ├── Admin.tsx
│   ├── Achievement.tsx
│   ├── Events.tsx
│   ├── TeamFaculty.tsx
│   ├── TeamAdvisory.tsx
│   ├── TeamExecutive.tsx
│   ├── TeamCore.tsx
│   └── IEEESOUSSBJRNYLoop.tsx
├── types/
│   └── content.ts
└── firebase.ts
```

## Required Changes

### CHANGE 1: Achievement Section Bifurcation
**Files to Modify:**
- `src/types/content.ts`
- `src/Admin/AwardModal.tsx`
- `src/Admin/AwardPreviewList.tsx`

**Changes:**
1. Add `category` field to Award interface: `'Student Achievement' | 'Student Branch' | 'Outstanding'`
2. Add category selection dropdown in AwardModal
3. Add category filtering tabs in AwardPreviewList (All Awards, Student Achievement, Student Branch, Outstanding)
4. Display awards grouped by category

### CHANGE 2: Team Section Rename & Restructure
**Files to Modify:**
- `src/Admin/AdminLayout.tsx`
- `src/Admin/Dashboard.tsx`
- `src/Admin/MemberModal.tsx`
- `src/Admin/MemberPreviewList.tsx`
- `src/types/content.ts`

**Changes:**
1. Rename "Members" to "Team" in navigation
2. Update MemberModal to include category selection: `'Faculty Advisor' | 'Advisory Board' | 'Executive Committee' | 'Core Committee'`
3. Add tab structure in MemberPreviewList matching website structure
4. Update types to include category field

### CHANGE 3: Executive Team Year Bifurcation
**Files to Modify:**
- `src/Admin/MemberPreviewList.tsx`
- `src/Admin/MemberModal.tsx`
- `src/types/content.ts`

**Changes:**
1. Add `year` field to TeamMember interface
2. Add year navigation (2017-2026) with arrows for Executive Committee tab
3. Filter executive members by year
4. Add year field to MemberModal for Executive Committee members

### CHANGE 4: Events Section Bifurcation & Dropdown Removal
**Files to Modify:**
- `src/Admin/EventPreviewList.tsx`
- `src/Admin/EventModal.tsx`
- `src/types/content.ts`
- `src/components/EventsSection.tsx`

**Changes:**
1. Add `year` field to EventItem interface
2. Add year tabs in EventPreviewList (All Events, 2026, 2025, 2024, etc.)
3. Add year field to EventModal
4. Remove dropdown interaction from EventsSection.tsx
5. Implement direct navigation to events page when clicking events

### CHANGE 5: Recent Events Tab
**Files to Modify:**
- `src/Admin/EventPreviewList.tsx`

**Changes:**
1. Add "Recent Events" tab to event filtering
2. Define recent as last 30 days
3. Filter events by recency

### CHANGE 6: Our Journey Page Fix & Admin Integration
**Files to Modify:**
- `src/pages/about/IEEESOUSSBJRNYLoop.tsx`
- `src/Admin/AdminLayout.tsx`
- `src/Admin/Dashboard.tsx`
- `src/types/content.ts`
- `firestore.rules`

**Changes:**
1. Fix JourneyLoop page loading issues
2. Add JourneyModal and JourneyPreviewList components
3. Add "Our Journey" navigation to admin panel
4. Add JourneyItem interface to types
5. Update Firestore rules for journey collection
6. Add navigation link to main website

## Implementation Steps

### Step 1: Update Types
```typescript
// In src/types/content.ts
export interface Award {
  id: string;
  title: string;
  year: number;
  description: string;
  imageUrl: string;
  category?: 'Student Achievement' | 'Student Branch' | 'Outstanding';
  people?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  education?: string;
  category: 'Faculty Advisor' | 'Advisory Board' | 'Executive Committee' | 'Core Committee';
  linkedIn?: string;
  imageUrl?: string;
  year?: number;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  speakers?: string[];
  imageUrl: string;
  year?: number;
}

export interface JourneyItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Step 2: Update Award Components
```typescript
// In AwardModal.tsx - Add category field
const [category, setCategory] = useState(award?.category || '');

// In AwardPreviewList.tsx - Add filtering
const [selectedCategory, setSelectedCategory] = useState('all');
const filteredAwards = selectedCategory === 'all' 
  ? awards 
  : awards.filter(award => award.category === selectedCategory);
```

### Step 3: Update Team Components
```typescript
// In AdminLayout.tsx - Rename navigation
<button onClick={() => setActiveTab('team')}>
  <Users /> Team
</button>

// In MemberModal.tsx - Add category selection
const [memberType, setMemberType] = useState(member?.category || 'Faculty Advisor');

// In MemberPreviewList.tsx - Add tabs and year filtering
const tabs = ['All Members', 'Faculty Advisor', 'Advisory Board', 'Executive Committee', 'Core Committee'];
```

### Step 4: Update Events Components
```typescript
// In EventPreviewList.tsx - Add year filtering
const [selectedYear, setSelectedYear] = useState('all');
const availableYears = Array.from(new Set(events.map(e => e.year || new Date().getFullYear()))).sort((a, b) => b - a);

// In EventsSection.tsx - Remove dropdown
// Replace onClick handlers with direct navigation
const handleEventClick = (eventId) => {
  window.location.href = `/events?id=${eventId}`;
};
```

### Step 5: Create Journey Components
```typescript
// Create src/Admin/JourneyModal.tsx
// Create src/Admin/JourneyPreviewList.tsx
// Add to AdminLayout.tsx navigation
// Add to Admin.tsx tabs
```

## Testing Checklist

### After Change 1 (Achievements):
- [ ] Category dropdown appears in award modal
- [ ] Awards filter by category in admin panel
- [ ] Website displays achievements grouped by category
- [ ] No console errors

### After Change 2 (Team):
- [ ] "Members" renamed to "Team" in admin sidebar
- [ ] Member modal shows category selection
- [ ] Tab structure matches website (Faculty, Advisory, Executive, Core)
- [ ] Members display under correct categories

### After Change 3 (Executive Year):
- [ ] Year navigation shows 2017-2026
- [ ] Members can be assigned to specific years
- [ ] Website shows year-filtered executive members
- [ ] Year selection works smoothly

### After Change 4 (Events):
- [ ] Event tabs show years (All Events, 2026, 2025, 2024)
- [ ] Events filter by year correctly
- [ ] Dropdown removed from website events
- [ ] Clicking event navigates to detail/all events page

### After Change 5 (Recent Events):
- [ ] Recent Events tab appears in admin
- [ ] Shows only events from last 30 days
- [ ] Filters work correctly

### After Change 6 (Journey):
- [ ] Journey page loads without errors
- [ ] Journey items appear in admin panel
- [ ] Can create/edit/delete journey items
- [ ] Firebase connectivity confirmed
- [ ] Navigation to journey page works from main menu

## Common Issues & Solutions

1. **Firebase Connection Refused**
   - Verify `.env` file has correct Firebase config
   - Check if Firebase emulator is running (if using local)
   - Ensure Firebase project credentials are valid

2. **Route Not Found**
   - Check if route is registered in main router file
   - Verify file paths and imports are correct
   - Test with browser network tab

3. **Data Not Displaying**
   - Check Firebase Firestore collection names match in code
   - Verify Firestore rules allow read/write
   - Check browser console for errors

4. **Styling Issues**
   - Ensure Tailwind CSS is configured
   - Check if CSS classes exist in `tailwind.config.ts`
   - Verify responsive breakpoints work

5. **TypeScript Errors**
   - Run `npm run build` to catch all type issues
   - Update interfaces in types/content.ts
   - Ensure all imports are correct

## File Paths Reference

### Admin Components
- Admin Layout: `src/Admin/AdminLayout.tsx`
- Dashboard: `src/Admin/Dashboard.tsx`
- Award Modal: `src/Admin/AwardModal.tsx`
- Award List: `src/Admin/AwardPreviewList.tsx`
- Event Modal: `src/Admin/EventModal.tsx`
- Event List: `src/Admin/EventPreviewList.tsx`
- Member Modal: `src/Admin/MemberModal.tsx`
- Member List: `src/Admin/MemberPreviewList.tsx`
- Journey Modal: `src/Admin/JourneyModal.tsx` (NEW)
- Journey List: `src/Admin/JourneyPreviewList.tsx` (NEW)

### Main Website Components
- Admin Page: `src/pages/Admin.tsx`
- Achievement Page: `src/pages/Achievement.tsx`
- Events Page: `src/pages/Events.tsx`
- Team Pages: `src/pages/team/`
- Journey Page: `src/pages/about/IEEESOUSSBJRNYLoop.tsx`
- Events Section: `src/components/EventsSection.tsx`

### Configuration
- Types: `src/types/content.ts`
- Firebase: `src/firebase.ts`
- Rules: `firestore.rules`

## Implementation Priority

1. **High Priority**: Fix Journey page functionality and add admin panel integration
2. **High Priority**: Rename "Members" to "Team" and add category structure
3. **Medium Priority**: Add Achievement category bifurcation
4. **Medium Priority**: Add Executive team year filtering
5. **Medium Priority**: Add Events year bifurcation and remove dropdown
6. **Low Priority**: Add Recent Events tab

## Notes

- All changes should maintain responsive design
- Use consistent styling with existing admin panel
- Ensure proper error handling for Firebase operations
- Test all CRUD operations work correctly
- Verify navigation between admin sections works smoothly
- Maintain TypeScript type safety throughout