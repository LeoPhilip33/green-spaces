# Green Spaces Project

![image](https://github.com/user-attachments/assets/fd08d673-c79a-48a1-b420-bfa644e1a289)
![image](https://github.com/user-attachments/assets/cd155b2e-f298-4606-b469-4831238baf62)

## Description

This project visualizes green spaces in Paris using Vue.js and Mapbox GL. It includes various filters to display different types of green spaces and trees, as well as a heatmap for heat zones.

## Project Structure

- **HomeView.vue**: Displays an interactive map with filters to visualize different types of green spaces and trees.
- **StatisticsView.vue**: Displays statistics about green spaces and trees.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/LeoPhilip33/green-spaces
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

## Docker

You can also run the project using Docker. Follow these steps:

1. Build the Docker image:
   ```sh
   docker build -t green-spaces .
   ```
2. Run the Docker container:
   ```sh
   docker run -p 5000:5000 green-spaces
   ```
3. Open your browser and navigate to `http://localhost:5000`.

## Components

### HomeView.vue

- **FilterComponent**: Provides filters to toggle different types of green spaces and trees.
- **Loader**: Displays a loading spinner while data is being fetched.

### StatisticsView.vue

- **StatisticsComponent**: Displays detailed statistics.
- **CardComponent**: Displays individual statistics in card format.
- **LoaderComponent**: Displays a loading spinner while data is being fetched.

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

## Contact

For any inquiries, please contact philipleopro@gmail.com.
