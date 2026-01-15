# Backlog Components Setup

## Required Dependencies

To use the backlog components with drag-and-drop functionality, you need to install the following dependencies:

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities dayjs
```

## Components Created

1. **BacklogView.tsx** - Main backlog view with drag-and-drop reordering
2. **SortableTaskItem.tsx** - Individual draggable task item
3. **BacklogFilters.tsx** - Filters for epic, assignee, and search
4. **EpicCard.tsx** - Card component for displaying epic information
5. **EpicProgress.tsx** - Progress visualization for epics
6. **EstimationPoker.tsx** - Planning poker component for backlog grooming

## Usage

```tsx
import BacklogView from './components/backlog/BacklogView';

function App() {
  return <BacklogView projectId="your-project-id" />;
}
```

## Features

- Drag-and-drop reordering of backlog items
- Filter by epic, assignee, and search text
- Visual priority indicators
- Epic progress tracking
- Planning poker for estimation sessions
- Responsive design with Ant Design components

## API Endpoints Used

- `GET /api/v1/projects/{projectId}/backlog` - Get backlog items
- `POST /api/v1/backlog/reorder` - Reorder backlog items
- `GET /api/v1/projects/{projectId}/epics` - Get project epics
- `GET /api/v1/projects/{projectId}/members` - Get project members

## Notes

- The drag-and-drop functionality uses @dnd-kit library
- Backlog items are tasks that are not assigned to any sprint
- Reordering updates task priorities automatically
- Epic progress is calculated based on completed tasks
