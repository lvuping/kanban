# Team Kanban Board

A modern, lightweight Kanban board application built with Next.js, TypeScript, Tailwind CSS, and Chrome storage API. Perfect for internal team collaboration and task management.

## Features

- 📋 **Drag-and-Drop**: Intuitive task management with smooth drag-and-drop between columns
- 💾 **Persistent Storage**: Uses Chrome storage API with localStorage fallback
- 🎨 **Modern UI**: Clean interface built with Tailwind CSS
- ⚡ **Fast & Responsive**: Built with Next.js for optimal performance
- 🏷️ **Task Details**: Priority levels, assignees, due dates, and descriptions
- 🔄 **Real-time Updates**: Instant UI updates when moving or editing tasks

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- Google Chrome (for extension features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kanban-board.git
cd kanban-board
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Running as a Web Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

3. Start creating tasks and organizing your workflow!

### Building for Production

```bash
npm run build
npm start
```

### Using as a Chrome Extension

1. Build the application:
```bash
npm run build
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the `out` directory from your project

5. The Kanban board will now be available as a Chrome extension

## Project Structure

```
kanban-board/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Board.tsx          # Main board component
│   ├── Column.tsx         # Column component
│   ├── TaskCard.tsx       # Task card component
│   └── TaskDialog.tsx     # Task creation/edit dialog
├── lib/                   # Utilities and types
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # Chrome storage utilities
│   └── utils.ts           # Helper functions
├── public/                # Static assets
│   └── manifest.json      # Chrome extension manifest
└── package.json           # Project dependencies
```

## Development

### Key Technologies

- **Next.js 15**: React framework for production
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **@dnd-kit**: Modern drag-and-drop library
- **Chrome Storage API**: Persistent data storage

### Adding New Features

1. **New Task Fields**: Modify the `Task` interface in `lib/types.ts`
2. **New Columns**: Update the default board configuration in `lib/storage.ts`
3. **UI Components**: Add new components in the `components/` directory

## Data Storage

The application uses a hybrid storage approach:
- **Chrome Extension**: Uses `chrome.storage.local` API
- **Web Application**: Falls back to `localStorage`

Data is automatically persisted and synced across sessions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Drag-and-drop powered by [@dnd-kit](https://dndkit.com/)