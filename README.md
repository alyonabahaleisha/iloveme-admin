# ILovMe Admin - Outfit Creation Dashboard

A web-based admin dashboard for creating and managing outfit combinations. Upload product images, automatically remove backgrounds, arrange them on a canvas, and save to your database.

## Features

- **Image Upload**: Drag-and-drop product images with automatic background removal
- **Canvas Editor**: Interactive canvas with drag-and-drop positioning, rotation, and scaling
- **Template Layouts**: Pre-defined templates for organizing products (top/bottom/shoes)
- **Product Management**: Add product links and categorize items
- **Export**: Save outfits as combined images
- **Gallery**: View and manage all created outfits
- **Database**: Persistent storage with Supabase

## Tech Stack

### Frontend
- React 18 with Vite
- Fabric.js for canvas manipulation
- React Dropzone for file uploads
- React Router for navigation
- Supabase client

### Backend
- Node.js + Express
- Supabase for database and storage
- Multer for file upload handling
- Sharp for image processing

### Background Removal
- Python Flask service
- rembg library for AI-powered background removal

## Project Structure

```
ilovme-admin/
├── backend/
│   ├── config/
│   │   └── supabase.js
│   ├── routes/
│   │   ├── upload.js
│   │   └── outfits.js
│   ├── bg_removal_service.py
│   ├── index.js
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx
│   │   │   └── OutfitCanvas.jsx
│   │   ├── config/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── pages/
│   │   │   ├── OutfitGallery.jsx
│   │   │   └── OutfitBuilder.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── supabase-schema.sql
├── SETUP.md
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account

### 2. Setup Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL from `supabase-schema.sql` in the SQL Editor
3. Create a storage bucket named `outfit-images` with folders: `original`, `processed`, `combined`
4. Get your project URL and API keys

### 3. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 4. Frontend Setup

```bash
cd frontend

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
npm install
```

### 5. Run the Application

You need to run 3 services:

**Terminal 1 - Background Removal Service:**
```bash
cd backend
python bg_removal_service.py
# Runs on http://localhost:5000
```

**Terminal 2 - Backend API:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 6. Access the Dashboard

Open your browser to **http://localhost:5173**

## Usage

### Creating an Outfit

1. Click "Create New Outfit"
2. Enter outfit name and optional description
3. Select a template layout
4. Add products:
   - Enter product name and link
   - Select category (top/bottom/shoes/accessory)
   - Drag and drop product image
   - Wait for background removal
5. Arrange products on canvas:
   - Drag to reposition
   - Use corner handles to resize
   - Rotate with rotation handle
   - Use layer controls (bring to front/send to back)
6. Click "Save Outfit" to export and save to database

### Managing Outfits

- View all outfits in the gallery
- See product thumbnails and links
- Delete outfits when needed
- Export shows combined outfit image

## API Endpoints

### Upload
- `POST /api/upload` - Upload and process product image

### Outfits
- `GET /api/outfits` - Get all outfits
- `GET /api/outfits/:id` - Get single outfit
- `POST /api/outfits` - Create new outfit
- `PUT /api/outfits/:id` - Update outfit
- `DELETE /api/outfits/:id` - Delete outfit

### Background Removal
- `POST /remove-bg` - Remove background from image
- `GET /health` - Health check

## Database Schema

### Outfits Table
- `id` - UUID primary key
- `name` - Outfit name
- `description` - Optional description
- `template_type` - Layout type
- `combined_image_url` - Final exported image
- `canvas_width` / `canvas_height` - Canvas dimensions
- `created_at` / `updated_at` - Timestamps

### Products Table
- `id` - UUID primary key
- `outfit_id` - Foreign key to outfits
- `product_name` - Product name
- `product_link` - Product URL
- `original_image_url` - Original uploaded image
- `processed_image_url` - Background-removed image
- `category` - Product category
- `position_x` / `position_y` - Canvas position
- `scale_x` / `scale_y` - Size scaling
- `rotation` - Rotation angle
- `z_index` - Layer order

## Configuration

### Environment Variables

**Backend (.env):**
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
REMOVE_BG_API_URL=http://localhost:5000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### Background removal not working
- Ensure Python service is running on port 5000
- Check `REMOVE_BG_API_URL` in backend .env
- Verify rembg installation: `pip install rembg`

### Images not loading
- Check Supabase storage bucket is public or has correct policies
- Verify bucket folders exist: `original`, `processed`, `combined`
- Check CORS settings in Supabase

### Canvas not rendering
- Ensure fabric.js is installed: `npm install fabric`
- Check browser console for errors
- Verify image URLs are accessible

## Development

### Adding New Templates

Edit `OutfitCanvas.jsx`:
```javascript
const TEMPLATES = {
  full_outfit: {
    top: { x: 400, y: 250, maxWidth: 400 },
    bottom: { x: 400, y: 550, maxWidth: 400 },
    shoes: { x: 400, y: 850, maxWidth: 300 },
  },
  // Add your template here
};
```

### Customizing Canvas Size

Edit `OutfitCanvas.jsx`:
```javascript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1000;
```

## License

MIT

## Support

For issues and questions, please check the SETUP.md file or create an issue in the repository.
