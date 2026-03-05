# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 🚀 Router System & Pages

This project includes a complete router system with role-based authentication and Croatian localization.

### **Development Server**
```bash
npm run dev
```
The application runs on `http://localhost:5174/` (or another available port)

### **🔐 Authentication & Demo Credentials**

The application uses a mock authentication system. Use any of these email addresses with any password:

- **Student:** `student@example.com`
- **Employer:** `employer@example.com`
- **Admin:** `admin@example.com`

### **📄 Available Pages**

#### **Public Pages**
- `/` - Home page (redirects to dashboard if authenticated)
- `/login` - Login page with demo authentication
- `/register` - Registration page (placeholder)
- `/dashboard` - Role-based dashboard redirect

#### **Student Pages** (requires student role)
- `/student/dashboard` - Student dashboard with statistics and quick actions
- `/student/internships` - Browse available internships with search and filtering
- `/student/applications` - View and manage internship applications
- `/student/profile` - Student profile management

#### **Employer Pages** (requires employer role)
- `/employer/dashboard` - Employer dashboard with company metrics
- `/employer/internships` - Manage posted internships
- `/employer/applications` - Review and manage student applications
- `/employer/profile` - Company profile management

#### **Admin Pages** (requires admin role)
- `/admin/dashboard` - Admin dashboard with system statistics
- `/admin/users` - User management (students, employers, admins)
- `/admin/internships` - Manage all internships in the system
- `/admin/companies` - Company management and approval

#### **Error Pages**
- `/unauthorized` - Access denied page (shown when user lacks required role)
- `404` - Not found page (for invalid routes)

### **🎨 Features**

- **Role-based routing** with protected routes
- **Croatian language** localization throughout the application
- **Responsive design** with Tailwind CSS
- **Modern typography** using Inter font
- **TypeScript support** for type safety
- **Navigation** that adapts based on user role
- **Mock authentication** ready for real backend integration

### **🔧 Technology Stack**

- **React Router v6** - Client-side routing
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool and dev server
- **React Context** - State management for authentication

### **🧪 Testing the Router**

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5174/`
3. Click "Prijava" (Login) and use any demo credential
4. You'll be redirected to the appropriate dashboard based on the role
5. Try accessing different role pages to see the protection in action
6. Use the navigation menu to explore available pages for your role
