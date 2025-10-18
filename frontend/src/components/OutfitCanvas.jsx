import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, FabricImage } from 'fabric';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;

const TEMPLATES = {
  full_outfit: {
    top: { x: 200, y: 150, maxWidth: 200 },
    bottom: { x: 200, y: 330, maxWidth: 200 },
    shoes: { x: 200, y: 510, maxWidth: 150 },
    accessory: { x: 75, y: 90, maxWidth: 100 },
  },
};

const OutfitCanvas = ({ products, onCanvasChange, template = 'full_outfit' }) => {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [selectedObject, setSelectedObject] = useState(null);

  // Only trigger re-render when visual properties change, not metadata
  const canvasKey = useMemo(() => {
    return JSON.stringify(products.map(p => ({ url: p.processedUrl, cat: p.category })));
  }, [JSON.stringify(products.map(p => ({ url: p.processedUrl, cat: p.category })))]);

  useEffect(() => {
    // Initialize Fabric canvas
    const canvas = new Canvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#f5f5f5',
    });

    fabricCanvasRef.current = canvas;

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Handle object modifications
    canvas.on('object:modified', () => {
      if (onCanvasChange) {
        onCanvasChange(getCanvasData());
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;

    // Clear existing objects
    canvas.clear();
    canvas.backgroundColor = '#f5f5f5';

    // Add products to canvas
    products.forEach(async (product, index) => {
      const templatePosition = TEMPLATES[template][product.category] || { x: 400, y: 400, maxWidth: 400 };

      try {
        const img = await FabricImage.fromURL(product.processedUrl, {
          crossOrigin: 'anonymous'
        });

        // Calculate scale to fit within template constraints
        const scale = Math.min(
          templatePosition.maxWidth / img.width,
          templatePosition.maxWidth / img.height,
          1 // Don't scale up
        );

        img.set({
          left: product.position_x ?? templatePosition.x,
          top: product.position_y ?? templatePosition.y,
          scaleX: product.scale_x ?? scale,
          scaleY: product.scale_y ?? scale,
          angle: product.rotation ?? 0,
          originX: 'center',
          originY: 'center',
          selectable: true,
          hasControls: true,
          hasBorders: true,
        });

        // Store product data with the image
        img.productData = product;
        img.productIndex = index;

        canvas.add(img);
        canvas.renderAll();
      } catch (error) {
        console.error('Error loading image:', error, product.processedUrl);
      }
    });
  }, [canvasKey, template]);

  const getCanvasData = () => {
    if (!fabricCanvasRef.current) return { products: [] };

    const canvas = fabricCanvasRef.current;
    const objects = canvas.getObjects();

    const updatedProducts = objects.map((obj, index) => ({
      ...obj.productData,
      position_x: obj.left,
      position_y: obj.top,
      scale_x: obj.scaleX,
      scale_y: obj.scaleY,
      rotation: obj.angle,
      width: obj.width,
      height: obj.height,
      z_index: index,
    }));

    return { products: updatedProducts };
  };

  const removeSelected = () => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    const canvas = fabricCanvasRef.current;
    canvas.remove(selectedObject);
    setSelectedObject(null);

    if (onCanvasChange) {
      onCanvasChange(getCanvasData());
    }
  };

  const bringToFront = () => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    const canvas = fabricCanvasRef.current;
    canvas.bringToFront(selectedObject);
    canvas.renderAll();

    if (onCanvasChange) {
      onCanvasChange(getCanvasData());
    }
  };

  const sendToBack = () => {
    if (!fabricCanvasRef.current || !selectedObject) return;

    const canvas = fabricCanvasRef.current;
    canvas.sendToBack(selectedObject);
    canvas.renderAll();

    if (onCanvasChange) {
      onCanvasChange(getCanvasData());
    }
  };

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas ref={canvasRef} />
      </div>

      {selectedObject && (
        <div className="canvas-controls">
          <button onClick={bringToFront} className="btn-control">
            Bring to Front
          </button>
          <button onClick={sendToBack} className="btn-control">
            Send to Back
          </button>
          <button onClick={removeSelected} className="btn-control btn-danger">
            Remove Item
          </button>
        </div>
      )}
    </div>
  );
};

export { CANVAS_WIDTH, CANVAS_HEIGHT };
export default OutfitCanvas;
