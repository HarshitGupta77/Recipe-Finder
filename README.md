# 🍽️ Recipe Finder

A responsive web app that lets users search for delicious recipes from around the world by fetching real-time meal data from the **TheMealDB API** based on name or category.
It merges results from multiple endpoints, removes duplicates, and dynamically loads detailed recipe information including cooking instructions, list of ingredients and video tutorials.

---

## ✨ Features

- Search meals by **name** or **category**
- Parallel API requests using `Promise.all` for faster results
- Automatic deduplication of meals returned from multiple endpoints
- Detailed recipe view with:
    - Ingredients and their measurements  
    - Cooking instructions
    - YouTube video links (where available)
- Category and tags display
- Fully responsive layout for mobile and desktop

---

## ❓ How it Works 

- User enters a search term
- The app fetches meals from TheMealDB using both
    - Name search
    - Category search
- Duplicate meals are removed
- Results are displayed as card layouts in a responsive grid
- Clicking a meal loads full recipe details 

