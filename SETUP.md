# ILovMe Admin - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Python 3.8+ (for background removal service)

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### Set up Database
1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL script to create tables and policies

### Create Storage Bucket
1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `outfit-images`
3. Make it public or set up appropriate access policies
4. Create two folders inside: `original` and `processed`

### Get API Credentials
1. Go to Project Settings > API
2. Copy the Project URL and anon/public key
3. You'll also need the service_role key for the backend

## 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
REMOVE_BG_API_URL=http://localhost:5000
```

Install Python dependencies for background removal:
```bash
pip install rembg flask pillow flask-cors
```

Start the backend:
```bash
npm run dev
```

## 3. Background Removal Service

In a separate terminal, start the background removal service:
```bash
cd backend
python bg_removal_service.py
```

This will start a Flask server on port 5000 that handles background removal.

## 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and add your configuration:
```
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the frontend:
```bash
npm run dev
```

## 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Background Removal Service: http://localhost:5000

## Features

- Upload product images with drag & drop
- Automatic background removal using rembg
- Drag-and-drop canvas for outfit creation
- Template-based layouts (top/bottom/shoes)
- Export outfits as combined images
- Save to Supabase database
- Gallery view of all created outfits

## Database Structure

### Outfits Table
- `id`: UUID primary key
- `name`: Outfit name
- `description`: Optional description
- `template_type`: Layout type (e.g., 'full_outfit')
- `combined_image_url`: Final exported image
- `canvas_width/height`: Canvas dimensions
- `created_at/updated_at`: Timestamps

### Products Table
- `id`: UUID primary key
- `outfit_id`: Reference to outfit
- `product_name`: Name of product
- `product_link`: URL to product page
- `original_image_url`: Original uploaded image
- `processed_image_url`: Image with background removed
- `category`: Product type (top/bottom/shoes/accessory)
- `position_x/y`: Canvas position
- `scale_x/y`: Size scaling
- `rotation`: Rotation angle
- `z_index`: Layer order
