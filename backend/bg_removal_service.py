#!/usr/bin/env python3
"""
Background Removal Service using rembg
This is a simple Flask API that removes backgrounds from images
"""

from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Background removal service is running'
    })

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    """
    Remove background from uploaded image
    Expects: multipart/form-data with 'image' file
    Returns: PNG image with transparent background
    """
    try:
        # Check if image was provided
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided'
            }), 400

        file = request.files['image']

        if file.filename == '':
            return jsonify({
                'error': 'No selected file'
            }), 400

        # Read the image
        input_image = Image.open(file.stream)

        # Remove background using u2net model (best for general products)
        # You can also try: 'u2net_cloth_seg' for clothing-specific removal
        output_image = remove(input_image, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10)

        # Convert to PNG bytes
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)

        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=False,
            download_name='processed.png'
        )

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({
            'error': 'Failed to process image',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting background removal service on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"API endpoint: POST http://localhost:{port}/remove-bg")
    app.run(host='0.0.0.0', port=port, debug=True)
