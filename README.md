# NYC Rent Prices

This project analyzes and forecasts NYC rent prices using hierarchical time series forecasting and provides a web interface for visualization.

## Project Structure

- **`model/`**: Contains the Python code, Jupyter notebooks, and data for analyzing rent prices and training forecasting models.
- **`app/`**: A React web application (built with Bun and Tailwind CSS) to interact with and visualize the data.

## Getting Started

### Prerequisites

- **Node.js / Bun**: [Bun](https://bun.com) is recommended for the web app.
- **Python**: Python 3.13+ is required for the model.
- **uv**: [uv](https://github.com/astral-sh/uv) is used for Python dependency management (optional but recommended).

### Model Setup

1. Navigate to the `model` directory:
   ```bash
   cd model
   ```

2. Install dependencies:
   ```bash
   # Using uv (recommended)
   uv sync
   
   # Or using pip
   pip install .
   ```

3. Run the notebooks:
   You can explore the analysis in `notebooks/train_model.ipynb`.

### App Setup

1. Navigate to the `app` directory:
   ```bash
   cd app
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun dev
   ```

4. Build for production:
   ```bash
   bun run build
   bun start
   ```
