# FocusFlow API Documentation

## Base URLs
- **V1**: `https://api.focusflow.com/api/v1/`
- **V2**: `https://api.focusflow.com/api/v2/` (Organization features)
- **WebSocket**: `wss://api.focusflow.com/ws/`

## Authentication
All API requests require authentication via JWT tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

# VERSION 1 APIs (Individual User)

## 1. Authentication

### 1.1 Register User
```http
POST /api/v1/auth/register/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "individual",
  "timezone": "America/New_York",
  "created_at": "2025-01-15T10:30:00Z",
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
  }
}
```

### 1.2 Login
```http
POST /api/v1/auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "user_type": "individual"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbG...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
  }
}
```

### 1.3 Refresh Token
```http
POST /api/v1/auth/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

### 1.4 Logout
```http
POST /api/v1/auth/logout/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

**Response (205):** No content

### 1.5 Get User Profile
```http
GET /api/v1/auth/profile/
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "individual",
  "timezone": "America/New_York",
  "pomodoro_settings": {
    "focus_duration": 25,
    "short_break": 5,
    "long_break": 15,
    "long_break_interval": 4
  },
  "created_at": "2025-01-15T10:30:00Z"
}
```

### 1.6 Update User Profile
```http
PATCH /api/v1/auth/profile/
```

**Request Body:**
```json
{
  "first_name": "John",
  "timezone": "Asia/Kathmandu",
  "pomodoro_settings": {
    "focus_duration": 30,
    "short_break": 5
  }
}
```

**Response (200):** Updated user object

---

## 2. Projects

### 2.1 List Projects
```http
GET /api/v1/projects/
```

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `ordering` (string): Sort by field (e.g., `-created_at`)

**Response (200):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Personal Development",
      "description": "Self-improvement tasks",
      "color_code": "#FF5733",
      "is_active": true,
      "task_count": 12,
      "total_focus_time": 7200,
      "created_at": "2025-01-10T08:00:00Z"
    }
  ]
}
```

### 2.2 Create Project
```http
POST /api/v1/projects/
```

**Request Body:**
```json
{
  "name": "Freelance Work",
  "description": "Client projects",
  "color_code": "#3498db"
}
```

**Response (201):** Created project object

### 2.3 Get Project Details
```http
GET /api/v1/projects/{id}/
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Personal Development",
  "description": "Self-improvement tasks",
  "color_code": "#FF5733",
  "is_active": true,
  "owner": {
    "id": 1,
    "username": "johndoe"
  },
  "statistics": {
    "total_tasks": 15,
    "completed_tasks": 8,
    "total_focus_hours": 12.5,
    "avg_task_duration": 5625
  },
  "created_at": "2025-01-10T08:00:00Z"
}
```

### 2.4 Update Project
```http
PATCH /api/v1/projects/{id}/
```

**Request Body:**
```json
{
  "name": "Personal Growth",
  "color_code": "#e74c3c"
}
```

**Response (200):** Updated project object

### 2.5 Delete Project
```http
DELETE /api/v1/projects/{id}/
```

**Response (204):** No content

---

## 3. Tasks

### 3.1 List Tasks
```http
GET /api/v1/tasks/
```

**Query Parameters:**
- `status` (string): pending, in_progress, paused, completed
- `project` (int): Filter by project ID
- `date` (date): Filter by creation date (YYYY-MM-DD)
- `ordering` (string): Sort field (e.g., `-created_at`)
- `search` (string): Search in title/description

**Response (200):**
```json
{
  "count": 25,
  "next": "https://api.focusflow.com/api/v1/tasks/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Write blog post",
      "description": "Complete Django tutorial",
      "status": "pending",
      "project": {
        "id": 1,
        "name": "Personal Development",
        "color_code": "#FF5733"
      },
      "estimated_pomodoros": 3,
      "completed_pomodoros": 0,
      "total_focus_seconds": 0,
      "created_at": "2025-01-20T09:00:00Z",
      "started_at": null,
      "ended_at": null
    }
  ]
}
```

### 3.2 Create Task
```http
POST /api/v1/tasks/
```

**Request Body:**
```json
{
  "title": "Review pull requests",
  "description": "Check team's code submissions",
  "project": 2,
  "estimated_pomodoros": 2
}
```

**Response (201):**
```json
{
  "id": 26,
  "title": "Review pull requests",
  "description": "Check team's code submissions",
  "status": "pending",
  "project": {
    "id": 2,
    "name": "Work Projects"
  },
  "estimated_pomodoros": 2,
  "completed_pomodoros": 0,
  "total_focus_seconds": 0,
  "created_at": "2025-01-20T14:30:00Z"
}
```

### 3.3 Get Task Details
```http
GET /api/v1/tasks/{id}/
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Write blog post",
  "description": "Complete Django tutorial",
  "status": "completed",
  "project": {
    "id": 1,
    "name": "Personal Development"
  },
  "estimated_pomodoros": 3,
  "completed_pomodoros": 3,
  "total_focus_seconds": 4500,
  "pomodoro_sessions": [
    {
      "id": 1,
      "started_at": "2025-01-20T10:00:00Z",
      "ended_at": "2025-01-20T10:25:00Z",
      "duration_minutes": 25,
      "actual_duration_seconds": 1500,
      "completed": true
    }
  ],
  "created_at": "2025-01-20T09:00:00Z",
  "started_at": "2025-01-20T10:00:00Z",
  "ended_at": "2025-01-20T11:30:00Z"
}
```

### 3.4 Update Task
```http
PATCH /api/v1/tasks/{id}/
```

**Request Body:**
```json
{
  "title": "Write comprehensive blog post",
  "estimated_pomodoros": 4
}
```

**Response (200):** Updated task object

### 3.5 Delete Task
```http
DELETE /api/v1/tasks/{id}/
```

**Response (204):** No content

### 3.6 Start Task
```http
POST /api/v1/tasks/{id}/start/
```

**Request Body:** Empty or
```json
{
  "pomodoro_duration": 25
}
```

**Response (200):**
```json
{
  "task": {
    "id": 1,
    "title": "Write blog post",
    "status": "in_progress",
    "started_at": "2025-01-20T10:00:00Z"
  },
  "pomodoro_session": {
    "id": 1,
    "started_at": "2025-01-20T10:00:00Z",
    "duration_minutes": 25,
    "ends_at": "2025-01-20T10:25:00Z"
  }
}
```

### 3.7 Pause Task
```http
POST /api/v1/tasks/{id}/pause/
```

**Response (200):**
```json
{
  "id": 1,
  "status": "paused",
  "paused_at": "2025-01-20T10:15:00Z",
  "active_session": {
    "id": 1,
    "paused_duration": 900
  }
}
```

### 3.8 Resume Task
```http
POST /api/v1/tasks/{id}/resume/
```

**Response (200):**
```json
{
  "id": 1,
  "status": "in_progress",
  "resumed_at": "2025-01-20T10:20:00Z",
  "active_session": {
    "id": 1,
    "remaining_seconds": 600
  }
}
```

### 3.9 Complete Task
```http
POST /api/v1/tasks/{id}/complete/
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Write blog post",
  "status": "completed",
  "started_at": "2025-01-20T10:00:00Z",
  "ended_at": "2025-01-20T11:30:00Z",
  "total_focus_seconds": 4500,
  "completed_pomodoros": 3,
  "estimated_pomodoros": 3
}
```

---

## 4. Pomodoro Sessions

### 4.1 Get Active Session
```http
GET /api/v1/pomodoro/active/
```

**Response (200):**
```json
{
  "id": 1,
  "task": {
    "id": 1,
    "title": "Write blog post"
  },
  "started_at": "2025-01-20T10:00:00Z",
  "duration_minutes": 25,
  "is_break": false,
  "elapsed_seconds": 900,
  "remaining_seconds": 600
}
```

**Response (404):** No active session

### 4.2 Start Break
```http
POST /api/v1/pomodoro/break/start/
```

**Request Body:**
```json
{
  "break_type": "short"
}
```

**Response (201):**
```json
{
  "id": 2,
  "is_break": true,
  "break_type": "short",
  "duration_minutes": 5,
  "started_at": "2025-01-20T10:25:00Z",
  "ends_at": "2025-01-20T10:30:00Z"
}
```

### 4.3 Complete Session
```http
POST /api/v1/pomodoro/sessions/{id}/complete/
```

**Response (200):**
```json
{
  "id": 1,
  "completed": true,
  "ended_at": "2025-01-20T10:25:00Z",
  "actual_duration_seconds": 1500
}
```

### 4.4 List My Sessions
```http
GET /api/v1/pomodoro/sessions/
```

**Query Parameters:**
- `date` (date): Filter by date
- `task` (int): Filter by task ID
- `is_break` (boolean): Filter breaks only

**Response (200):**
```json
{
  "count": 15,
  "results": [
    {
      "id": 1,
      "task": {
        "id": 1,
        "title": "Write blog post"
      },
      "started_at": "2025-01-20T10:00:00Z",
      "ended_at": "2025-01-20T10:25:00Z",
      "duration_minutes": 25,
      "actual_duration_seconds": 1500,
      "is_break": false,
      "completed": true
    }
  ]
}
```

---

## 5. Analytics

### 5.1 Daily Summary
```http
GET /api/v1/analytics/daily/
```

**Query Parameters:**
- `date` (date): Specific date (default: today)

**Response (200):**
```json
{
  "date": "2025-01-20",
  "total_tasks": 5,
  "completed_tasks": 3,
  "in_progress_tasks": 1,
  "pending_tasks": 1,
  "total_focus_seconds": 5400,
  "total_focus_hours": 1.5,
  "total_pomodoros": 6,
  "projects_breakdown": [
    {
      "project": {
        "id": 1,
        "name": "Personal Development"
      },
      "focus_seconds": 3600,
      "tasks_completed": 2
    }
  ]
}
```

### 5.2 Weekly Report
```http
GET /api/v1/analytics/weekly/
```

**Query Parameters:**
- `week` (int): Week number (default: current week)
- `year` (int): Year (default: current year)

**Response (200):**
```json
{
  "week": 3,
  "year": 2025,
  "start_date": "2025-01-13",
  "end_date": "2025-01-19",
  "total_focus_hours": 12.5,
  "total_tasks_completed": 18,
  "avg_daily_focus_hours": 1.78,
  "daily_breakdown": [
    {
      "date": "2025-01-13",
      "focus_hours": 2.5,
      "tasks_completed": 4
    }
  ],
  "top_projects": [
    {
      "project": {
        "id": 1,
        "name": "Personal Development"
      },
      "focus_hours": 8.5,
      "percentage": 68
    }
  ]
}
```

### 5.3 Monthly Report
```http
GET /api/v1/analytics/monthly/
```

**Query Parameters:**
- `month` (int): Month (1-12)
- `year` (int): Year

**Response (200):**
```json
{
  "month": 1,
  "year": 2025,
  "total_focus_hours": 45.5,
  "total_tasks_completed": 67,
  "total_pomodoros": 182,
  "avg_daily_focus_hours": 1.5,
  "most_productive_day": "2025-01-15",
  "weekly_breakdown": [
    {
      "week": 1,
      "focus_hours": 10.5
    }
  ],
  "projects_summary": [
    {
      "project": "Personal Development",
      "focus_hours": 25.5,
      "tasks_completed": 32
    }
  ]
}
```

### 5.4 Focus Streaks
```http
GET /api/v1/analytics/streaks/
```

**Response (200):**
```json
{
  "current_streak": 7,
  "longest_streak": 15,
  "streak_start_date": "2025-01-14",
  "total_active_days": 45
}
```

### 5.5 Project Time Breakdown
```http
GET /api/v1/analytics/projects/{project_id}/
```

**Query Parameters:**
- `start_date` (date): Start date
- `end_date` (date): End date

**Response (200):**
```json
{
  "project": {
    "id": 1,
    "name": "Personal Development"
  },
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-20"
  },
  "total_focus_hours": 28.5,
  "total_tasks": 35,
  "completed_tasks": 28,
  "avg_task_duration_minutes": 48,
  "daily_activity": [
    {
      "date": "2025-01-20",
      "focus_hours": 2.5,
      "tasks_completed": 3
    }
  ]
}
```

---

## 6. Export Data

### 6.1 Export All Data
```http
GET /api/v1/export/data/
```

**Query Parameters:**
- `format` (string): json, csv

**Response (200):**
```json
{
  "user": {...},
  "projects": [...],
  "tasks": [...],
  "pomodoro_sessions": [...],
  "exported_at": "2025-01-20T15:00:00Z"
}
```

---

# VERSION 2 APIs (Organization Features)

## 7. Organizations

### 7.1 Create Organization
```http
POST /api/v2/organizations/
```

**Request Body:**
```json
{
  "name": "Acme Startup",
  "slug": "acme-startup",
  "default_pomodoro_duration": 25,
  "require_task_estimates": false
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Acme Startup",
  "slug": "acme-startup",
  "is_active": true,
  "default_pomodoro_duration": 25,
  "require_task_estimates": false,
  "member_count": 1,
  "created_at": "2025-01-20T10:00:00Z",
  "owner": {
    "id": 1,
    "username": "johndoe",
    "email": "john@acme.com"
  }
}
```

### 7.2 Get Organization Details
```http
GET /api/v2/organizations/{slug}/
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Acme Startup",
  "slug": "acme-startup",
  "is_active": true,
  "settings": {
    "default_pomodoro_duration": 25,
    "require_task_estimates": false,
    "working_hours": {
      "start": "09:00",
      "end": "17:00"
    }
  },
  "statistics": {
    "total_members": 5,
    "active_members": 5,
    "total_projects": 8,
    "total_tasks_today": 23,
    "completed_tasks_today": 12
  },
  "created_at": "2025-01-20T10:00:00Z"
}
```

### 7.3 Update Organization
```http
PATCH /api/v2/organizations/{slug}/
```

**Permissions:** Admin only

**Request Body:**
```json
{
  "name": "Acme Inc",
  "require_task_estimates": true
}
```

**Response (200):** Updated organization object

---

## 8. Team Members

### 8.1 List Members
```http
GET /api/v2/organizations/{slug}/members/
```

**Query Parameters:**
- `role` (string): employee, manager, admin
- `is_active` (boolean)

**Response (200):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 2,
      "user": {
        "id": 2,
        "username": "janedoe",
        "email": "jane@acme.com",
        "first_name": "Jane",
        "last_name": "Doe"
      },
      "role": "manager",
      "joined_at": "2025-01-15T08:00:00Z",
      "current_status": "focused",
      "current_task": {
        "id": 45,
        "title": "Code review"
      }
    }
  ]
}
```

### 8.2 Invite Member
```http
POST /api/v2/organizations/{slug}/invites/
```

**Permissions:** Admin or Manager

**Request Body:**
```json
{
  "email": "newuser@acme.com",
  "role": "employee",
  "message": "Welcome to the team!"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "newuser@acme.com",
  "role": "employee",
  "invite_token": "a7b8c9d0e1f2...",
  "invite_url": "https://focusflow.com/invite/a7b8c9d0e1f2",
  "expires_at": "2025-01-27T10:00:00Z",
  "created_at": "2025-01-20T10:00:00Z"
}
```

### 8.3 Accept Invite
```http
POST /api/v2/invites/accept/
```

**Request Body:**
```json
{
  "token": "a7b8c9d0e1f2..."
}
```

**Response (200):**
```json
{
  "message": "Successfully joined Acme Startup",
  "organization": {
    "id": 1,
    "name": "Acme Startup",
    "slug": "acme-startup"
  },
  "membership": {
    "role": "employee"
  }
}
```

### 8.4 Update Member Role
```http
PATCH /api/v2/organizations/{slug}/members/{user_id}/
```

**Permissions:** Admin only

**Request Body:**
```json
{
  "role": "manager"
}
```

**Response (200):** Updated membership object

### 8.5 Remove Member
```http
DELETE /api/v2/organizations/{slug}/members/{user_id}/
```

**Permissions:** Admin only

**Response (204):** No content

---

## 9. Organization Tasks

### 9.1 List Organization Tasks
```http
GET /api/v2/organizations/{slug}/tasks/
```

**Permissions:** Manager or Admin

**Query Parameters:**
- `owner` (int): Filter by employee ID
- `status` (string): pending, in_progress, paused, completed
- `project` (int): Filter by project
- `date` (date): Filter by date

**Response (200):**
```json
{
  "count": 47,
  "results": [
    {
      "id": 45,
      "title": "Code review",
      "status": "in_progress",
      "owner": {
        "id": 2,
        "username": "janedoe",
        "first_name": "Jane"
      },
      "project": {
        "id": 3,
        "name": "Client Project A"
      },
      "started_at": "2025-01-20T09:15:00Z",
      "estimated_pomodoros": 2,
      "completed_pomodoros": 1
    }
  ]
}
```

### 9.2 Assign Task
```http
POST /api/v2/organizations/{slug}/tasks/assign/
```

**Permissions:** Manager or Admin

**Request Body:**
```json
{
  "task_id": 45,
  "assigned_to": 3,
  "priority": "high"
}
```

**Response (200):**
```json
{
  "id": 45,
  "assigned_to": {
    "id": 3,
    "username": "bobsmith"
  },
  "assigned_by": {
    "id": 2,
    "username": "janedoe"
  },
  "priority": "high",
  "assigned_at": "2025-01-20T10:00:00Z"
}
```

---

## 10. Manager Dashboard

### 10.1 Live Activity Feed
```http
GET /api/v2/organizations/{slug}/dashboard/activity/
```

**Permissions:** Manager or Admin

**Query Parameters:**
- `limit` (int): Number of recent activities (default: 50)

**Response (200):**
```json
{
  "activities": [
    {
      "id": 1,
      "type": "task_started",
      "user": {
        "id": 2,
        "username": "janedoe",
        "first_name": "Jane"
      },
      "task": {
        "id": 45,
        "title": "Code review"
      },
      "timestamp": "2025-01-20T09:15:00Z"
    },
    {
      "id": 2,
      "type": "task_completed",
      "user": {
        "id": 3,
        "username": "bobsmith"
      },
      "task": {
        "id": 42,
        "title": "Bug fix"
      },
      "timestamp": "2025-01-20T09:10:00Z"
    }
  ]
}
```

### 10.2 Team Overview
```http
GET /api/v2/organizations/{slug}/dashboard/overview/
```

**Permissions:** Manager or Admin

**Response (200):**
```json
{
  "date": "2025-01-20",
  "active_employees": 4,
  "currently_focused": 2,
  "total_focus_hours_today": 8.5,
  "tasks_completed_today": 12,
  "tasks_in_progress": 3,
  "employees_status": [
    {
      "user": {
        "id": 2,
        "username": "janedoe"
      },
      "status": "focused",
      "current_task": {
        "id": 45,
        "title": "Code review"
      },
      "focus_time_today": 3.5
    }
  ]
}
```

### 10.3 Employee Detail View
```http
GET /api/v2/organizations/{slug}/employees/{user_id}/
```

**Permissions:** Manager or Admin

**Query Parameters:**
- `start_date` (date)
- `end_date` (date)

**Response (200):**
```json
{
  "user": {
    "id": 2,
    "username": "janedoe",
    "first_name": "Jane",
    "role": "employee"
  },
  "statistics": {
    "total_focus_hours": 45.5,
    "total_tasks_completed": 32,
    "avg_daily_focus_hours": 3.2,
    "current_streak": 5
  },
  "recent_tasks": [
    {
      "id": 45,
      "title": "Code review",
      "status": "in_progress",
      "focus_time_seconds": 1800
    }
  ],
  "productivity_pattern": {
    "peak_hours": ["09:00-11:00", "14:00-16:00"],
    "avg_task_duration_minutes": 45
  }
}
```

---

## 11. Team Analytics

### 11.1 Team Performance
```http
GET /api/v2/organizations/{slug}/analytics/team/
```

**Permissions:** Manager or Admin

**Query Parameters:**
- `start_date` (date)
- `end_date` (date)
- `project` (int): Filter by project

**Response (200):**
```json
{
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-20"
  },
  "team_statistics": {
    "total_focus_hours": 180.5,
    "avg_focus_hours_per_employee": 36.1,
    "total_tasks_completed": 156,
    "avg_task_completion_rate": 0.85
  },
  "employee_breakdown": [
    {
      "user": {
        "id": 2,
        "username": "janedoe"
      },
      "focus_hours": 45.5,
      "tasks_completed": 32,
      "completion_rate": 0.91
    }
  ],
  "peak_productivity_hours": [
    {
      "hour": "09:00",
      "avg_active_employees": 4.2
    }
  ]
}
```

### 11.2 Project Analytics
```http
GET /api/v2/organizations/{slug}/analytics/projects/{project_id}/
```

**Permissions:** Manager or Admin

**Response (200):**
```json
{
  "project": {
    "id": 3,
    "name": "Client Project A"
  },
  "date_range": {
    "start": "2025-01-01",
    "end": "2025-01-20"
  },
  "total_focus_hours": 85.5,
  "total_tasks": 45,
  "completed_tasks": 38,
  "in_progress_tasks": 5,
  "avg_task_duration_hours": 1.9,
  "contributors": [
    {
      "user": {
        "id": 2,
        "username": "janedoe"
      },
      "focus_hours": 45.5,
      "tasks_completed": 20,
      "contribution_percentage": 53.2
    }
  ],
  "timeline": [
    {
      "date": "2025-01-20",
      "focus_hours": 6.5,
      "tasks_completed": 3
    }
  ]
}
```

### 11.3 Export Team Reports
```http
GET /api/v2/organizations/{slug}/analytics/export/
```

**Permissions:** Manager or Admin

**Query Parameters:**
- `format` (string): pdf, csv, excel
- `report_type` (string): team, project, individual
- `start_date` (date)
- `end_date` (date)

**Response (200):** File download

---

## 12. WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.focusflow.com/ws/pomodoro/');
ws.send(JSON.stringify({
  "token": "eyJ0eXAiOiJKV1QiLCJhbG..."
}));
```

### V1 Events (Personal)

#### User Started Task
```json
{
  "type": "task_started",
  "data": {
    "task_id": 1,
    "title": "Write blog post",
    "started_at": "2025-01-20T10:00:00Z",
    "pomodoro_session": {
      "id": 1,
      "duration_minutes": 25
    }
  }
}
```

#### User Paused Task
```json
{
  "type": "task_paused",
  "data": {
    "task_id": 1,
    "paused_at": "2025-01-20T10:15:00Z",
    "elapsed_seconds": 900
  }
}
```

#### User Resumed Task
```json
{
  "type": "task_resumed",
  "data": {
    "task_id": 1,
    "resumed_at": "2025-01-20T10:20:00Z",
    "remaining_seconds": 600
  }
}
```

#### User Completed Task
```json
{
  "type": "task_completed",
  "data": {
    "task_id": 1,
    "title": "Write blog post",
    "completed_at": "2025-01-20T11:30:00Z",
    "total_focus_seconds": 4500,
    "completed_pomodoros": 3
  }
}
```

#### Pomodoro Session Completed
```json
{
  "type": "pomodoro_completed",
  "data": {
    "session_id": 1,
    "task_id": 1,
    "completed_at": "2025-01-20T10:25:00Z",
    "play_sound": true
  }
}
```

#### Break Started
```json
{
  "type": "break_started",
  "data": {
    "session_id": 2,
    "break_type": "short",
    "duration_minutes": 5,
    "started_at": "2025-01-20T10:25:00Z"
  }
}
```

### V2 Events (Organization)

#### Employee Task Started (Manager Channel)
```json
{
  "type": "employee_task_started",
  "data": {
    "user": {
      "id": 2,
      "username": "janedoe",
      "first_name": "Jane"
    },
    "task": {
      "id": 45,
      "title": "Code review",
      "project": "Client Project A"
    },
    "started_at": "2025-01-20T09:15:00Z"
  }
}
```

#### Employee Task Completed (Manager Channel)
```json
{
  "type": "employee_task_completed",
  "data": {
    "user": {
      "id": 2,
      "username": "janedoe"
    },
    "task": {
      "id": 45,
      "title": "Code review"
    },
    "completed_at": "2025-01-20T10:30:00Z",
    "total_focus_seconds": 4500
  }
}
```

#### Employee Idle Alert (Manager Channel)
```json
{
  "type": "employee_idle",
  "data": {
    "user": {
      "id": 3,
      "username": "bobsmith"
    },
    "idle_since": "2025-01-20T08:00:00Z",
    "idle_duration_minutes": 45
  }
}
```

#### Task Assigned (Employee Channel)
```json
{
  "type": "task_assigned",
  "data": {
    "task": {
      "id": 50,
      "title": "Implement feature X",
      "priority": "high"
    },
    "assigned_by": {
      "id": 2,
      "username": "janedoe"
    },
    "assigned_at": "2025-01-20T10:00:00Z"
  }
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This email is already registered"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid request data |
| 401 | AUTHENTICATION_FAILED | Invalid credentials |
| 401 | TOKEN_EXPIRED | JWT token expired |
| 403 | PERMISSION_DENIED | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource conflict (e.g., duplicate) |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

---

## Rate Limiting

### V1 Limits (Individual Users)
- **Standard endpoints**: 100 requests/minute
- **Authentication**: 10 requests/minute
- **Analytics**: 30 requests/minute

### V2 Limits (Organizations)
- **Standard endpoints**: 300 requests/minute per organization
- **Dashboard/Analytics**: 60 requests/minute
- **WebSocket connections**: 50 connections per organization

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

---

## Pagination

### Standard Pagination
All list endpoints support pagination:

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "count": 150,
  "next": "https://api.focusflow.com/api/v1/tasks/?page=3",
  "previous": "https://api.focusflow.com/api/v1/tasks/?page=1",
  "results": [...]
}
```

---

## Webhooks (V2 Only)

### Configure Webhook
```http
POST /api/v2/organizations/{slug}/webhooks/
```

**Request Body:**
```json
{
  "url": "https://your-server.com/webhooks/focusflow",
  "events": ["task_completed", "employee_idle"],
  "secret": "your-webhook-secret"
}
```

### Webhook Payload
```json
{
  "event": "task_completed",
  "organization": {
    "id": 1,
    "slug": "acme-startup"
  },
  "data": {
    "user": {...},
    "task": {...}
  },
  "timestamp": "2025-01-20T10:30:00Z",
  "signature": "sha256=abc123..."
}
```

---

## API Versioning Strategy

### Version Migration Path
- **V1 APIs**: Remain stable, never breaking changes
- **V2 APIs**: Additive only, V1 functionality preserved
- **Deprecation**: 6-month notice before removing any endpoint
- **Version header**: `Accept: application/json; version=2.0`

### Backward Compatibility
- V1 users can access V1 endpoints indefinitely
- V2 users can access both V1 and V2 endpoints
- V1 data automatically compatible with V2 (nullable organization fields)

---

## Development & Testing

### Base URLs
- **Production**: `https://api.focusflow.com`
- **Staging**: `https://staging-api.focusflow.com`
- **Development**: `http://localhost:8000`

### Test Credentials
```
Email: demo@focusflow.com
Password: DemoPass123!
```

### Postman Collection
Available at: `https://documenter.getpostman.com/focusflow-api`

### OpenAPI/Swagger
- V1: `https://api.focusflow.com/api/v1/docs/`
- V2: `https://api.focusflow.com/api/v2/docs/`

---

## SDK Support

### Official SDKs
- **Python**: `pip install focusflow-sdk`
- **JavaScript**: `npm install @focusflow/sdk`
- **React Hooks**: `npm install @focusflow/react-hooks`

### Example Usage (Python)
```python
from focusflow import FocusFlowClient

client = FocusFlowClient(api_key='your-api-key')

# Create task
task = client.tasks.create(
    title="Review documentation",
    project_id=1,
    estimated_pomodoros=2
)

# Start task
session = client.tasks.start(task.id)
print(f"Session ends at: {session.ends_at}")

# Get analytics
report = client.analytics.daily(date='2025-01-20')
print(f"Focus time: {report.total_focus_hours} hours")
```

### Example Usage (JavaScript)
```javascript
import { FocusFlowClient } from '@focusflow/sdk';

const client = new FocusFlowClient({ apiKey: 'your-api-key' });

// Create task
const task = await client.tasks.create({
  title: 'Review documentation',
  projectId: 1,
  estimatedPomodoros: 2
});

// Start task
const session = await client.tasks.start(task.id);
console.log(`Session ends at: ${session.endsAt}`);

// WebSocket connection
client.on('task_started', (data) => {
  console.log(`Started: ${data.task.title}`);
});
```

---

## Support & Resources

- **Documentation**: https://docs.focusflow.com
- **API Status**: https://status.focusflow.com
- **Community Forum**: https://community.focusflow.com
- **Email Support**: api-support@focusflow.com
- **GitHub**: https://github.com/focusflow/api-examples

---

*API Documentation Version: 2.0*  
*Last Updated: January 20, 2025*  
*For questions or feedback: api-support@focusflow.com*