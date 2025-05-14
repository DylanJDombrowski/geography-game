# Geography Challenge Game

An interactive web-based geography game built with Next.js 15, TypeScript, and real Natural Earth data. Test your knowledge of world countries by clicking on them on an accurate world map!

## 🌟 Features

- **Real Geographic Data**: Uses Natural Earth's 1:10m scale data for accurate country boundaries
- **Multiple Difficulty Levels**:
  - Easy: Large, well-known countries
  - Medium: Medium-sized countries
  - Hard: All countries including small nations
- **Interactive Map**: Hover to see country names, click to select
- **Educational Context**: Includes population data, continents, and regions
- **Responsive Design**: Works great on desktop and mobile devices
- **Real-time Feedback**: Immediate visual feedback with color coding

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed on your system
- A text editor (VS Code recommended)
- Basic familiarity with React and TypeScript

### Installation Steps

1. **Clone or create your Next.js project**

   ```bash
   npx create-next-app@latest geography-game --typescript --tailwind --eslint --app
   cd geography-game
   ```

2. **Install required dependencies**

   ```bash
   npm install d3-geo d3-geo-projection @types/d3-geo @types/d3-geo-projection
   ```

3. **Download Natural Earth Data**

   - Visit [Natural Earth Downloads](https://www.naturalearthdata.com/downloads/10m-cultural-vectors/)
   - Download "Admin 0 – Countries" in GeoJSON format
   - Place the `ne_10m_admin_0_countries.json` file in `public/data/`

4. **Set up the project structure**

   ```
   your-project/
   ├── app/
   │   └── geography/
   │       └── page.tsx
   ├── components/
   │   ├── GeographyGame.tsx
   │   ├── WorldMap.tsx
   │   └── GameControls.tsx
   ├── lib/
   │   ├── types.ts
   │   └── mapUtils.ts
   ├── hooks/
   │   └── useGeographyGame.ts
   └── public/
       └── data/
           └── ne_10m_admin_0_countries.json
   ```

5. **Copy the component files**

   - Copy all the component, hook, and utility files we created above into their respective directories

6. **Start the development server**

   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:3000/geography`
   - Start playing!

## 🎮 How to Play

1. **Choose your difficulty level** - Start with "Easy" if you're new to geography
2. **Click "Start Geography Challenge"** to begin
3. **Read the country name** displayed at the top
4. **Hover over countries** to see their names (helpful for learning!)
5. **Click on the correct country** to score points
6. **Track your accuracy** as you progress

## 🧠 Understanding the Code Structure

### Component Architecture

The game is built using React's component composition pattern:

- **GeographyGame**: The main container that orchestrates everything
- **WorldMap**: Handles the SVG rendering and country interactions
- **GameControls**: Manages UI elements like scoring and difficulty selection

### State Management

We use React's `useReducer` hook with a custom `useGeographyGame` hook to manage complex game state transitions. This pattern makes the game logic predictable and easy to debug.

### Map Projection

The project uses D3's Mercator projection to convert latitude/longitude coordinates into screen pixels. The `mapUtils.ts` file contains all the geographic calculation logic.

### TypeScript Benefits

Strong typing helps catch errors at compile time and makes the codebase more maintainable. See `lib/types.ts` for all the data structures used in the game.

## 🔧 Customization Options

### Adding New Game Modes

You can extend the game by modifying the `useGeographyGame` hook to support features like:

- Capital city questions
- Flag identification
- Population guessing games

### Visual Customization

Modify the color schemes in `WorldMap.tsx` or add animations using Tailwind CSS classes.

### Performance Optimization

For even smoother performance with large datasets:

- Implement country geometry simplification
- Add lazy loading for off-screen countries
- Use React.memo for expensive re-renders

## 📚 Learning Resources

- [Natural Earth Data Documentation](https://www.naturalearthdata.com/about/)
- [D3 Geographic Projections](https://d3js.org/d3-geo)
- [React TypeScript Best Practices](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js App Router Guide](https://nextjs.org/docs/app)

## 🐛 Troubleshooting

**Map not loading?**

- Ensure the JSON file is in the correct `public/data/` directory
- Check the browser console for detailed error messages
- Verify the file name matches exactly: `ne_10m_admin_0_countries.json`

**Performance issues?**

- Try reducing the map detail level (use 1:50m or 1:110m data instead)
- Check if you have other heavy processes running

**TypeScript errors?**

- Make sure all dependencies are installed
- Run `npm run build` to check for type errors

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:

- Add more geographic datasets (states, provinces)
- Implement multiplayer functionality
- Create educational lesson plans around the game
- Add accessibility features for screen readers

## 📄 License

This project uses Natural Earth data, which is in the public domain. The code is available under the MIT license.

---

Built with ❤️ and a love for geography education!
