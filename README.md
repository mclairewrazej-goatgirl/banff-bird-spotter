# 🏔️ Banff Bird Spotter

A web app for exploring recent bird observations around Vermilion Lakes and Banff National Park, built with React, Mapbox, and the eBird API.

## About

This app was built as a demo project to accompany my application for the Mobile Application Developer position at Birds Canada. I wanted to demonstrate my ability to learn and work with tools directly relevant to the role — specifically Mapbox and web APIs — while building something meaningful to me personally as someone who lives in Banff and works in conservation.

The app pulls live observation data from the eBird API and displays it on an interactive Mapbox map, allowing users to explore recent bird sightings around Vermilion Lakes — one of the best birding spots in Banff National Park and somewhere I spend a lot of time.

I do not have a formal computer science background, but I am self-taught and build tools regularly in my spare time. This project was an opportunity to push into new territory with Mapbox and serverless deployment while working with the kind of ecological observation data I am very familiar with from my work in conservation.

## Features

- Interactive Mapbox map centered on Vermilion Lakes, Banff National Park
- Live bird observation data pulled from the eBird API
- Clickable map markers showing all species observed at each location
- Scrollable sidebar listing all recent observations
- Sort observations by most recent or alphabetical order
- Filter by time range (last 7, 14, or 30 days)

## Tech Stack

- React + Vite
- Mapbox GL JS
- eBird API (Cornell Lab of Ornithology)
- Netlify (deployment + serverless functions)
- Git + GitHub

## Skills Demonstrated

This project was built to demonstrate hands-on experience with several tools and concepts listed in the Birds Canada job posting:

- **Mapbox** — interactive geospatial map rendering and marker management
- **Web APIs** — fetching and handling live data from the eBird API
- **React** — component-based UI, hooks, and state management
- **JavaScript/TypeScript fundamentals** — async/await, array methods, destructuring
- **Git and deployment** — version control via GitHub, deployed via Netlify with serverless functions

## Data Notes

Observation data is sourced from the eBird API, which returns the most recent observation per species per location within the selected time range. This means the app reflects recent birding activity in the area rather than a complete observation log. For more granular biodiversity datasets, platforms like NatureCounts are better suited for research-grade data access — which is part of what makes the work Birds Canada does so valuable.

## Live Demo

https://visionary-souffle-e217e6.netlify.app/
