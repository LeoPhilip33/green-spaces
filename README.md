# Green Spaces Project

## Description

This project visualizes green spaces in Paris using Vue.js and Mapbox GL. It includes various filters to display different types of green spaces and trees, as well as a heatmap for heat zones.

## Project Structure

- **StatisticsView.vue**: Displays statistics about green spaces and trees.
- **HomeView.vue**: Displays an interactive map with filters to visualize different types of green spaces and trees.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/green-spaces.git
   ```
2. Navigate to the project directory:
   ```sh
   cd green-spaces
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Usage

1. Start the development server:
   ```sh
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173`.

## Components

### StatisticsView.vue

- **StatisticsComponent**: Displays detailed statistics.
- **CardComponent**: Displays individual statistics in card format.
- **LoaderComponent**: Displays a loading spinner while data is being fetched.

### HomeView.vue

- **FilterComponent**: Provides filters to toggle different types of green spaces and trees.
- **Loader**: Displays a loading spinner while data is being fetched.

## Data Sources

In the `public/geojson` folder, download and add the GeoJSON files from the following link (too large to be hosted on GitHub): [Download GeoJSON files](https://drive.google.com/file/d/1mdyQqHh7qmUXqjX2bxKiA4ADdvA74raK/view?usp=sharing)

- **Green Spaces**: `./geojson/green_spaces_paris.geojson`
- **Trees**: `./geojson/trees_paris.geojson`
- **Heat Zones**: `./geojson/lst_paris_2022.geojson`

## Mapbox

This project uses Mapbox GL for map rendering. Make sure to set your Mapbox access token in `HomeView.vue`:

```js
mapboxgl.accessToken = 'your_mapbox_access_token'
```

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Contact

For any inquiries, please contact philipleopro@gmail.com.
