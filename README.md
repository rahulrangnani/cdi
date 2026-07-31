# TVS Credit Connect

PROJECT OVERVIEW
Create a comprehensive Digital Initiatives Management Platform for TVS Credit's internal stakeholders. This platform will serve as a centralized hub where product teams, operations managers, and other internal users can:

Discover all available digital initiatives and APIs

View partner integrations for each initiative

Review commercial terms, pricing, and documentation

Test API integrations in a sandbox environment

Access implementation details without depending on the Fintech team

CORE FEATURES & REQUIREMENTS
1. CUSTOMER-FACING FRONTEND (Internal Stakeholder Portal)
A. Digital Initiatives Discovery Page

Display all digital initiatives in a card-based grid layout

Each initiative card should show:

Initiative name (e.g., "VKYC")

Brief description

Number of active partners

Status badge (Active/Inactive)

Quick action button to view details

Implement search and filter functionality (by initiative name, status, product category)

Responsive design for desktop and tablet access

B. Initiative Detail Page
When a user clicks on an initiative (e.g., VKYC), display:

Initiative Overview Section

Initiative name and description

Overall purpose and benefits

Integration status across TVS Credit products

Partners Section

Display all partners tied up for this initiative in a structured format

For each partner, show:

Partner name and logo (if available)

Partnership status

Quick link to view partner details

Partner Deep-Dive Card (clickable/expandable)
When user selects a partner (e.g., Hyperverge under VKYC), display:

a. Commercial Details

Pricing model and cost per transaction/call

Billing frequency

Volume-based pricing (if applicable)

SLA and uptime guarantees

Support contact information (email, phone)

b. API Documentation

Clean, formatted documentation view

Key API endpoints summary

Authentication method (API key, OAuth, etc.)

Sample request/response in JSON format

Error codes and handling

Rate limiting details

Downloadable API specification (OpenAPI/Swagger format)

Copy-to-clipboard buttons for quick reference

c. Video Tutorial (if available)

Embedded video player

Video duration and title

Transcript or key points (if available)

d. Products & Features

Multi-select dropdown showing which TVS Credit products use this partner

Available products: Two Wheeler, Used Cars, Consumer Durables, Mobile Loans, Personal Loan, Gold Loan, Used Commercial Loan, Tractor Loan, Loan Against Property, Emerging & Mid Corporate Business Loan, Three Wheeler Loan, Used Construction Equipment Loan

For each product, show: Current usage status, implementation date, transaction volume

e. Input/Output Specifications

Structured table showing:

Input parameters required (name, type, mandatory/optional, description)

Output fields returned (name, type, description, sample values)

Copy-friendly format for reference

f. Support & Contact

Primary contact person

Email and phone

Support hours

Escalation procedure

Known issues or limitations

C. Testing Sandbox (Optional but recommended)

API Testing Tool integrated into the platform

Ability to make test API calls using sample data

Real-time request/response logging

Error handling demonstration

2. ADMIN DASHBOARD & BACKEND
A. Admin Authentication & Access Control

Secure login with role-based access (Admin, Viewer, Editor)

Admin-only section with password-protected access

Session management and timeout

B. Initiatives Management

List View

Table of all digital initiatives

Columns: Initiative ID, Name, Status, Partners Count, Created Date, Last Modified, Actions

Bulk actions: Activate/Deactivate, Bulk edit

Search and sort by any column

Pagination (20 per page)

Create/Edit Initiative

Form fields:

Initiative Name (required, unique)

Description (rich text editor)

Initiative Category (dropdown)

Status (Active/Inactive toggle)

Logo/Image upload

Short overview text

Save & Preview buttons

C. Partners Management

Partners List View

Table: Partner ID, Name, Initiatives Count, Status, Created Date, Actions

Edit and Delete options for each partner

Filter by initiative or status

Create/Edit Partner

Form fields:

Partner Name (required)

Partner Website URL

Partner Logo upload

Partner Type (Technology, Data, Service Provider, etc.)

Status (Active/Inactive)

Contact Person Name

Contact Email

Contact Phone

Support Email

Support Phone

Support Hours (text field)

D. Partner Details for Specific Initiative

For each Partner + Initiative combination:

Commercial Details Management

Pricing per call/transaction (editable number field)

Pricing unit (Per Call, Per Transaction, Monthly, Annual, etc.)

Currency (default INR)

SLA % (Uptime guarantee)

Additional terms and conditions (text area)

Billing contact information

API Documentation Management

Rich text editor or Markdown editor for documentation

File upload for API specification (Swagger/OpenAPI JSON)

Preview before saving

Version control (Version dropdown to save multiple versions)

Last updated timestamp

Video Management

Video URL input field (YouTube, Vimeo, or direct upload)

Video title and description

Video duration auto-detect

Video thumbnail auto-generate or custom upload

Ability to remove/replace video

Products & Features Mapping

Multi-select checkbox list of all TVS Credit products

Ability to add/remove products dynamically

For each product selected: Status (In Use, Pilot, Planned, etc.), Implementation Date, Notes

CRITICAL: Admin Dropdown Management for Products

Separate admin section to manage available products in the system

Add new product button: Form to enter product name, description, category

Edit existing products (name, description)

Delete products (with confirmation, showing where they're in use)

Reorder products (drag-drop priority)

Enable/Disable product visibility across initiatives

Current product list: Two Wheeler, Used Cars, Consumer Durables, Mobile Loans, Personal Loan, Gold Loan, Used Commercial Loan, Tractor Loan, Loan Against Property, Emerging & Mid Corporate Business Loan, Three Wheeler Loan, Used Construction Equipment Loan

Input/Output Specifications

Dynamic table builder with Add Row button

For Input Parameters:

Column: Parameter Name, Data Type (String, Number, Boolean, Object, Array), Mandatory (Yes/No), Description, Example Value

Ability to add/edit/delete rows

For Output Parameters:

Column: Output Field, Data Type, Description, Example Value

Ability to add/edit/delete rows

Bulk import from JSON (optional advanced feature)

Support & Production Details

Production contact person name

Production contact email

Production contact phone

Sandbox contact (if different)

Known issues or limitations (text area)

FAQ section (add/edit/delete FAQ items)

3. DATA STRUCTURE & DATABASE SCHEMA
Core Collections/Tables:

Initiatives

ID, Name, Description, Status, Logo, Created_At, Updated_At

Partners

ID, Name, Website, Logo, Type, Status, Contact_Name, Contact_Email, Contact_Phone, Support_Email, Support_Phone, Support_Hours, Created_At, Updated_At

Initiative_Partners (Junction table)

ID, Initiative_ID, Partner_ID, Pricing_Per_Call, Pricing_Unit, Currency, SLA_Percentage, Terms_and_Conditions, Billing_Contact, API_Documentation, API_Version, Video_URL, Video_Title, Video_Description, Video_Duration, Created_At, Updated_At

Initiative_Partner_Products (Junction table)

ID, Initiative_Partner_ID, Product_ID, Usage_Status (In Use, Pilot, Planned), Implementation_Date, Notes, Created_At, Updated_At

Products (Managed by admin)

ID, Name, Description, Category, Is_Active, Display_Order, Created_At, Updated_At

API_Specifications (Versioned)

ID, Initiative_Partner_ID, Version, OpenAPI_JSON, Input_Parameters (JSON array), Output_Parameters (JSON array), Created_At, Updated_At

Support_Details

ID, Initiative_Partner_ID, Production_Contact_Name, Production_Contact_Email, Production_Contact_Phone, Sandbox_Contact, Known_Issues, FAQ (JSON array), Created_At, Updated_At

SAMPLE DATA TO POPULATE
Initiative 1: VKYC (Video KYC)

Partner 1: Hyperverge

Pricing: ₹14 per call

API Documentation:

text
Video KYC Generic Webhook - Hyperverge

Events Triggering the Webhook:
-  VCIP_CUSTOMER_SCHEDULED - When a customer schedules a Video KYC call
-  VCIP_CUSTOMER_ASSIGNED - When a customer is assigned to an agent
-  VCIP_CUSTOMER_NOTIFIED - When the agent notifies the customer
-  VCIP_CALL_STARTED - When the call is started
-  VCIP_CALL_COMPLETED - When the call is completed (approved or declined)
-  VCIP_CALL_ENDED - When the call is ended (incomplete)

Subscribe to any one or more events based on requirements.

Authentication: API Key in Header
Rate Limit: 1000 requests/minute
Video: Include a random 2-second sample video (or placeholder video URL)

Products Live With: OMPL (One-stop Mobile Personal Loan)

Support Contact: Gokul, Gokul@hyperverge.co

Input/Output: Leave blank for now (editable from admin)

Partner 2: Perfios

Pricing: ₹10 per call (sample, editable)

API Documentation: Sample documentation (editable from admin)

Video: Sample video (editable)

Products Live With: Multiple products (sample data)

Support Contact: Sample contact (editable)

Input/Output: Sample data (editable)

DESIGN & BRANDING REQUIREMENTS
Color Palette (TVS Credit Colors)

Primary Green: #3AA74E (from website header)

Dark Blue: #003A70 (TVS Credit brand blue - from logo)

Secondary Gray: #666666

Light Gray: #F5F5F5

White: #FFFFFF

Accent Red/Orange (for warnings): #FF5555 (if needed)

Success Green: #3AA74E

Neutral Gray: #808080

Typography

Font Family: Inter, Segoe UI, or system fonts (modern, clean)

Heading: Bold, 24-32px

Body Text: Regular, 14-16px

Monospace for code: Courier New or Fira Code

UI Components

Cards with subtle shadows for initiative/partner listings

Buttons with TVS Credit green background on hover

Navigation breadcrumbs for clarity (Initiative > Partner > Details)

Tabs or accordion for organizing partner information sections

Badge components for status indicators

Modal dialogs for confirmations

Toast notifications for success/error messages

Logo Integration

TVS Credit logo in header (top-left)

Use TVS Credit official SVG logo: https://www.tvscredit.com/wp-content/uploads/2025/03/tvs_credit_logo.svg

Logo dimensions: Auto-scale responsive

Footer with TVS Credit copyright and links

Responsive Design

Desktop-first approach

Mobile-friendly (tablets and phones)

Breakpoints: 1200px, 768px, 480px

TECHNICAL REQUIREMENTS
Frontend Stack (Suggested)

React or Vue.js for UI

Responsive CSS framework (Tailwind CSS or Bootstrap)

Form validation library

State management (Redux, Vuex, or Context API)

API client library (Axios or Fetch)

Backend Stack (Suggested)

Node.js/Express OR Python/FastAPI

PostgreSQL or MongoDB for database

JWT for authentication

REST API with proper HTTP status codes

Input validation and sanitization

Error handling and logging

API Endpoints (Backend)

text
GET    /api/initiatives                      - List all initiatives
GET    /api/initiatives/:id                  - Get initiative details
POST   /api/initiatives                      - Create initiative (admin)
PUT    /api/initiatives/:id                  - Update initiative (admin)
DELETE /api/initiatives/:id                  - Delete initiative (admin)

GET    /api/partners                         - List all partners
GET    /api/partners/:id                     - Get partner details
POST   /api/partners                         - Create partner (admin)
PUT    /api/partners/:id                     - Update partner (admin)
DELETE /api/partners/:id                     - Delete partner (admin)

GET    /api/initiatives/:id/partners         - Get partners for initiative
GET    /api/initiatives/:id/partners/:pid    - Get specific partner details
POST   /api/initiatives/:id/partners         - Add partner to initiative (admin)
PUT    /api/initiatives/:id/partners/:pid    - Update partner details (admin)
DELETE /api/initiatives/:id/partners/:pid    - Remove partner from initiative (admin)

GET    /api/products                         - List all products
POST   /api/products                         - Create product (admin)
PUT    /api/products/:id                     - Update product (admin)
DELETE /api/products/:id                     - Delete product (admin)

GET    /api/documentation/:pid               - Get API documentation
PUT    /api/documentation/:pid               - Update documentation (admin)

GET    /api/admin/dashboard                  - Admin dashboard stats
POST   /api/auth/login                       - Admin login
POST   /api/auth/logout                      - Logout
SECURITY CONSIDERATIONS
HTTPS only

Admin authentication with strong password requirements

Role-based access control (RBAC)

Input validation on all forms

SQL injection prevention

XSS protection

CSRF token implementation

Rate limiting on API endpoints

Audit logs for admin actions (who changed what, when)

Sensitive data encryption (API keys, passwords)

NICE-TO-HAVE FEATURES (Phase 2)
API Testing Sandbox

Integrated API tester with sample requests

Real-time request/response visualization

cURL command generation

Documentation Export

Export API docs as PDF

Generate postman collection automatically

Download as Markdown

Notification System

Email notifications when new initiatives are added

Alerts for documentation updates

Partner contact update notifications

Analytics Dashboard

Most viewed initiatives

Popular partners

Product coverage analysis

User activity logs

Version Control

Track changes to API documentation

Rollback capability

Change history timeline

Search & Discovery

Full-text search across documentation

Tag-based filtering

Related initiatives suggestions

SUCCESS METRICS & ACCEPTANCE CRITERIA
✅ All digital initiatives can be managed via admin panel

✅ Partners can be added/edited/deleted with complete details

✅ Product dropdown is fully customizable by admin (add/remove/reorder)

✅ Stakeholders can view all initiatives and partners on frontend

✅ API documentation is clearly displayed and copyable

✅ Videos can be embedded and played

✅ Input/Output specifications are editable and visible

✅ Support contact information is easily accessible

✅ Design matches TVS Credit branding and website aesthetics

✅ Responsive design works on all devices

✅ Admin authentication is secure

✅ All CRUD operations work smoothly

✅ Forms have proper validation and error handling

TIMELINE & DELIVERY MILESTONES
Phase 1 (MVP): Frontend portal + Admin dashboard for initiatives and partners management

Phase 2: API documentation management and video integration

Phase 3: Product mapping and Input/Output specifications

Phase 4: Testing sandbox and advanced features

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tvscsdi.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f057554-a459-4a51-95f9-687ab9748550).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
