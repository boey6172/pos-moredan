# POS System - Frontend V2

A modern, professional, and accessible Point of Sale (POS) system frontend built with React and Material-UI.

## Features

- ✨ **Modern UI/UX** - Clean, professional design with smooth animations
- 🌓 **Light/Dark Mode** - Eye-friendly color schemes with automatic system preference detection
- ♿ **Accessibility** - WCAG compliant with ARIA labels, keyboard navigation, and screen reader support
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Eye-Friendly Colors** - Carefully selected color palettes to reduce eye strain
- ⚡ **Performance** - Optimized rendering and efficient state management

## Getting Started

### Prerequisites

- Node.js 14+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (create `.env` file):
```
REACT_APP_API_BASE_URL=https://yggdrasilsolution.com/backend_pos
REACT_APP_HOMEPAGE=https://yggdrasilsolution.com/moredansmv
```

3. Start the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
frontend-v2/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── api/
│   │   └── axios.js          # API configuration
│   ├── components/
│   │   └── Navigation.js     # Main navigation component
│   ├── contexts/
│   │   ├── AuthContext.js    # Authentication context
│   │   └── ThemeContext.js   # Theme (light/dark) context
│   ├── pages/
│   │   ├── Dashboard.js     # Dashboard page
│   │   ├── Login.js          # Login page
│   │   ├── Products.js       # Products management
│   │   ├── Expenses.js       # Expenses tracking
│   │   └── ...               # Other pages
│   ├── App.js                # Main app component
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
└── package.json
```

## Key Features

### Theme System
- Automatic detection of system preference
- Manual toggle between light and dark modes
- Persistent theme preference in localStorage
- Smooth transitions between themes

### Accessibility
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interface
- Adaptive layouts

## Development

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add route in `src/App.js`
3. Add navigation item in `src/components/Navigation.js`

### Theming

The theme system uses Material-UI's theming with custom color palettes. Modify `src/contexts/ThemeContext.js` to customize colors.

### API Integration

All API calls use the axios instance configured in `src/api/axios.js`. It automatically includes authentication tokens and handles errors.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved






